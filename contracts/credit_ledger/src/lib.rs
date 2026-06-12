#![no_std]
//! credit_ledger — tracks student learning credits on-chain.
//! Credits are awarded by the platform admin and accumulate toward CEFR level unlocks.

use soroban_sdk::{contract, contracterror, contractimpl, contracttype, symbol_short, Address, Env, Symbol};

#[contracttype]
#[derive(Clone)]
pub struct StudentRecord {
    pub total_credits: u32,
    pub level: Symbol, // "A1", "A2", "B1", "B2", "C1", "C2"
    pub last_updated: u64,
}

#[contracttype]
#[derive(Clone, Copy)]
pub enum CreditReason {
    ModuleComplete,
    QuizPass,
    CourseComplete,
    SessionComplete,
    AiPractice,
    Referral,
    WeeklyStreak,
}

#[contracttype]
pub enum DataKey {
    Admin,
    Student(Address),
}

#[contracterror]
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    NotAuthorized = 3,
}

#[contract]
pub struct CreditLedgerContract;

#[contractimpl]
impl CreditLedgerContract {
    /// One-time setup that records the platform admin address.
    pub fn initialize(env: Env, admin: Address) -> Result<(), Error> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(Error::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        Ok(())
    }

    /// Award credits to a student. Only the platform admin may call this.
    /// Returns the student's new total.
    pub fn award_credits(
        env: Env,
        admin: Address,
        student: Address,
        amount: u32,
        _reason: CreditReason,
    ) -> Result<u32, Error> {
        let stored_admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(Error::NotInitialized)?;
        if admin != stored_admin {
            return Err(Error::NotAuthorized);
        }
        admin.require_auth();

        let key = DataKey::Student(student.clone());
        let mut record: StudentRecord = env
            .storage()
            .persistent()
            .get(&key)
            .unwrap_or(StudentRecord {
                total_credits: 0,
                level: symbol_short!("A1"),
                last_updated: 0,
            });

        record.total_credits = record.total_credits.saturating_add(amount);
        record.level = level_for_credits(record.total_credits);
        record.last_updated = env.ledger().timestamp();

        env.storage().persistent().set(&key, &record);
        Ok(record.total_credits)
    }

    /// Get a student's current credit balance.
    pub fn get_credits(env: Env, student: Address) -> u32 {
        env.storage()
            .persistent()
            .get::<DataKey, StudentRecord>(&DataKey::Student(student))
            .map(|r| r.total_credits)
            .unwrap_or(0)
    }

    /// Get the full student record.
    pub fn get_record(env: Env, student: Address) -> StudentRecord {
        env.storage()
            .persistent()
            .get::<DataKey, StudentRecord>(&DataKey::Student(student))
            .unwrap_or(StudentRecord {
                total_credits: 0,
                level: symbol_short!("A1"),
                last_updated: 0,
            })
    }

    /// Check whether a student has accumulated enough credits to access a level.
    pub fn check_level_unlocked(env: Env, student: Address, level: Symbol) -> bool {
        let credits = Self::get_credits(env, student);
        credits >= threshold_for_level(&level)
    }
}

/// Cumulative credits required to *enter* a level.
/// A1: 0, A2: 150, B1: 300, B2: 500, C1: 800, C2: 1200.
fn threshold_for_level(level: &Symbol) -> u32 {
    if *level == symbol_short!("A2") {
        150
    } else if *level == symbol_short!("B1") {
        300
    } else if *level == symbol_short!("B2") {
        500
    } else if *level == symbol_short!("C1") {
        800
    } else if *level == symbol_short!("C2") {
        1200
    } else {
        0 // A1 and unknown
    }
}

/// Highest level a credit total unlocks.
fn level_for_credits(credits: u32) -> Symbol {
    if credits >= 1200 {
        symbol_short!("C2")
    } else if credits >= 800 {
        symbol_short!("C1")
    } else if credits >= 500 {
        symbol_short!("B2")
    } else if credits >= 300 {
        symbol_short!("B1")
    } else if credits >= 150 {
        symbol_short!("A2")
    } else {
        symbol_short!("A1")
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;

    #[test]
    fn awards_and_levels_up() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, CreditLedgerContract);
        let client = CreditLedgerContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let student = Address::generate(&env);
        client.initialize(&admin);

        let total = client.award_credits(&admin, &student, &150, &CreditReason::ModuleComplete);
        assert_eq!(total, 150);
        assert_eq!(client.get_credits(&student), 150);
        assert!(client.check_level_unlocked(&student, &symbol_short!("A2")));
        assert!(!client.check_level_unlocked(&student, &symbol_short!("B1")));
    }
}
