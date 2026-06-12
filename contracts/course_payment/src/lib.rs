#![no_std]
//! course_payment — escrow for paid course enrollments.
//! Student funds are locked on enroll and released to the tutor (minus the
//! platform fee) once access is confirmed, or refunded by the admin.

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, token, Address, Env, Symbol,
};

#[contracttype]
#[derive(Clone, Copy, PartialEq, Eq)]
pub enum PaymentStatus {
    Held,
    Released,
    Refunded,
}

#[contracttype]
#[derive(Clone)]
pub struct Payment {
    pub student: Address,
    pub tutor: Address,
    pub course_id: Symbol,
    pub amount: i128,
    pub platform_fee_bps: u32, // basis points, e.g. 1500 = 15%
    pub token: Address,
    pub status: PaymentStatus,
}

#[contracttype]
pub enum DataKey {
    Admin,
    Payment(Symbol, Address), // (course_id, student) -> Payment
}

#[contracterror]
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    NotAuthorized = 3,
    AlreadyEnrolled = 4,
    NotFound = 5,
    NotHeld = 6,
    InvalidAmount = 7,
}

#[contract]
pub struct CoursePaymentContract;

#[contractimpl]
impl CoursePaymentContract {
    pub fn initialize(env: Env, admin: Address) -> Result<(), Error> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(Error::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        Ok(())
    }

    /// Student pays to enroll — funds locked in escrow on this contract.
    pub fn enroll(
        env: Env,
        student: Address,
        tutor: Address,
        course_id: Symbol,
        amount: i128,
        platform_fee_bps: u32,
        token_address: Address,
    ) -> Result<(), Error> {
        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }
        student.require_auth();

        let key = DataKey::Payment(course_id.clone(), student.clone());
        if env.storage().persistent().has(&key) {
            return Err(Error::AlreadyEnrolled);
        }

        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(&student, &env.current_contract_address(), &amount);

        let payment = Payment {
            student,
            tutor,
            course_id,
            amount,
            platform_fee_bps,
            token: token_address,
            status: PaymentStatus::Held,
        };
        env.storage().persistent().set(&key, &payment);
        Ok(())
    }

    /// Platform confirms access was delivered — release funds to tutor minus fee.
    pub fn release(env: Env, course_id: Symbol, student: Address) -> Result<(), Error> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(Error::NotInitialized)?;
        admin.require_auth();

        let key = DataKey::Payment(course_id, student);
        let mut payment: Payment =
            env.storage().persistent().get(&key).ok_or(Error::NotFound)?;
        if payment.status != PaymentStatus::Held {
            return Err(Error::NotHeld);
        }

        let fee = payment.amount * (payment.platform_fee_bps as i128) / 10_000;
        let tutor_amount = payment.amount - fee;
        let token_client = token::Client::new(&env, &payment.token);
        let contract = env.current_contract_address();
        token_client.transfer(&contract, &payment.tutor, &tutor_amount);
        if fee > 0 {
            token_client.transfer(&contract, &admin, &fee);
        }

        payment.status = PaymentStatus::Released;
        env.storage().persistent().set(&key, &payment);
        Ok(())
    }

    /// Admin refund (e.g. course not delivered).
    pub fn refund(env: Env, course_id: Symbol, student: Address) -> Result<(), Error> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(Error::NotInitialized)?;
        admin.require_auth();

        let key = DataKey::Payment(course_id, student);
        let mut payment: Payment =
            env.storage().persistent().get(&key).ok_or(Error::NotFound)?;
        if payment.status != PaymentStatus::Held {
            return Err(Error::NotHeld);
        }

        let token_client = token::Client::new(&env, &payment.token);
        token_client.transfer(
            &env.current_contract_address(),
            &payment.student,
            &payment.amount,
        );

        payment.status = PaymentStatus::Refunded;
        env.storage().persistent().set(&key, &payment);
        Ok(())
    }

    pub fn get_payment(env: Env, course_id: Symbol, student: Address) -> Result<Payment, Error> {
        env.storage()
            .persistent()
            .get(&DataKey::Payment(course_id, student))
            .ok_or(Error::NotFound)
    }
}
