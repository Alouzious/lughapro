#![no_std]
//! session_escrow — escrow for live 1-on-1 tutor sessions.
//! Student pays on booking; funds release to the tutor (minus platform fee)
//! when the tutor confirms, or refund on dispute / auto-expiry.

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, token, Address, Env, Symbol,
};

#[contracttype]
#[derive(Clone, Copy, PartialEq, Eq)]
pub enum SessionStatus {
    Booked,
    Confirmed,
    Released,
    Refunded,
    Disputed,
}

#[contracttype]
#[derive(Clone)]
pub struct SessionPayment {
    pub student: Address,
    pub tutor: Address,
    pub session_id: Symbol,
    pub amount: i128,
    pub platform_fee_bps: u32,
    pub token: Address,
    pub status: SessionStatus,
    pub booked_at: u64,
    pub expires_at: u64,
}

#[contracttype]
pub enum DataKey {
    Admin,
    Session(Symbol),
}

#[contracterror]
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    NotAuthorized = 3,
    AlreadyBooked = 4,
    NotFound = 5,
    InvalidState = 6,
    InvalidAmount = 7,
    NotExpired = 8,
}

const EXPIRY_SECONDS: u64 = 48 * 60 * 60; // auto-refund window

#[contract]
pub struct SessionEscrowContract;

#[contractimpl]
impl SessionEscrowContract {
    pub fn initialize(env: Env, admin: Address) -> Result<(), Error> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(Error::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        Ok(())
    }

    /// Student books and pays — funds locked in escrow.
    pub fn book_session(
        env: Env,
        student: Address,
        tutor: Address,
        session_id: Symbol,
        amount: i128,
        platform_fee_bps: u32,
        token_address: Address,
    ) -> Result<(), Error> {
        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }
        student.require_auth();

        let key = DataKey::Session(session_id.clone());
        if env.storage().persistent().has(&key) {
            return Err(Error::AlreadyBooked);
        }

        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(&student, &env.current_contract_address(), &amount);

        let now = env.ledger().timestamp();
        let payment = SessionPayment {
            student,
            tutor,
            session_id,
            amount,
            platform_fee_bps,
            token: token_address,
            status: SessionStatus::Booked,
            booked_at: now,
            expires_at: now + EXPIRY_SECONDS,
        };
        env.storage().persistent().set(&key, &payment);
        Ok(())
    }

    /// Tutor confirms session happened → release funds minus platform fee.
    pub fn confirm_session(env: Env, tutor: Address, session_id: Symbol) -> Result<(), Error> {
        tutor.require_auth();
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(Error::NotInitialized)?;

        let key = DataKey::Session(session_id);
        let mut payment: SessionPayment =
            env.storage().persistent().get(&key).ok_or(Error::NotFound)?;
        if payment.tutor != tutor {
            return Err(Error::NotAuthorized);
        }
        if payment.status != SessionStatus::Booked {
            return Err(Error::InvalidState);
        }

        let fee = payment.amount * (payment.platform_fee_bps as i128) / 10_000;
        let tutor_amount = payment.amount - fee;
        let token_client = token::Client::new(&env, &payment.token);
        let contract = env.current_contract_address();
        token_client.transfer(&contract, &payment.tutor, &tutor_amount);
        if fee > 0 {
            token_client.transfer(&contract, &admin, &fee);
        }

        payment.status = SessionStatus::Released;
        env.storage().persistent().set(&key, &payment);
        Ok(())
    }

    /// Refund: admin at any time, or anyone after the expiry window.
    pub fn refund_session(env: Env, caller: Address, session_id: Symbol) -> Result<(), Error> {
        caller.require_auth();
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(Error::NotInitialized)?;

        let key = DataKey::Session(session_id);
        let mut payment: SessionPayment =
            env.storage().persistent().get(&key).ok_or(Error::NotFound)?;
        if payment.status != SessionStatus::Booked && payment.status != SessionStatus::Disputed {
            return Err(Error::InvalidState);
        }

        let is_admin = caller == admin;
        let is_expired = env.ledger().timestamp() >= payment.expires_at;
        if !is_admin && !is_expired {
            return Err(Error::NotExpired);
        }

        let token_client = token::Client::new(&env, &payment.token);
        token_client.transfer(
            &env.current_contract_address(),
            &payment.student,
            &payment.amount,
        );

        payment.status = SessionStatus::Refunded;
        env.storage().persistent().set(&key, &payment);
        Ok(())
    }

    /// Either party flags a dispute, freezing the funds for admin resolution.
    pub fn raise_dispute(env: Env, caller: Address, session_id: Symbol) -> Result<(), Error> {
        caller.require_auth();
        let key = DataKey::Session(session_id);
        let mut payment: SessionPayment =
            env.storage().persistent().get(&key).ok_or(Error::NotFound)?;
        if caller != payment.student && caller != payment.tutor {
            return Err(Error::NotAuthorized);
        }
        if payment.status != SessionStatus::Booked {
            return Err(Error::InvalidState);
        }
        payment.status = SessionStatus::Disputed;
        env.storage().persistent().set(&key, &payment);
        Ok(())
    }

    pub fn get_session(env: Env, session_id: Symbol) -> Result<SessionPayment, Error> {
        env.storage()
            .persistent()
            .get(&DataKey::Session(session_id))
            .ok_or(Error::NotFound)
    }
}
