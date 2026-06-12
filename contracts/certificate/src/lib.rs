#![no_std]
//! certificate — issues non-transferable (soulbound) CEFR completion certificates.
//! Each certificate is unique to a (student, level) pair and admin-controlled.

use soroban_sdk::xdr::ToXdr;
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, Address, BytesN, Env, Symbol, Vec,
};

#[contracttype]
#[derive(Clone)]
pub struct Certificate {
    pub student: Address,
    pub level: Symbol,
    pub issued_at: u64,
    pub metadata_hash: BytesN<32>,
    pub is_valid: bool,
}

#[contracttype]
pub enum DataKey {
    Admin,
    Cert(BytesN<32>),       // certificate_id -> Certificate
    StudentCerts(Address),  // student -> Vec<certificate_id>
}

#[contracterror]
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    NotAuthorized = 3,
    AlreadyIssued = 4,
    NotFound = 5,
}

#[contract]
pub struct CertificateContract;

#[contractimpl]
impl CertificateContract {
    pub fn initialize(env: Env, admin: Address) -> Result<(), Error> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(Error::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        Ok(())
    }

    /// Mint a certificate for a student who completed a level. Admin only.
    /// The certificate id is deterministic over (student, level) so a level
    /// can only ever be certified once.
    pub fn mint_certificate(
        env: Env,
        admin: Address,
        student: Address,
        level: Symbol,
        metadata_hash: BytesN<32>,
    ) -> Result<BytesN<32>, Error> {
        let stored_admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(Error::NotInitialized)?;
        if admin != stored_admin {
            return Err(Error::NotAuthorized);
        }
        admin.require_auth();

        let cert_id = Self::certificate_id(&env, &student, &level);
        if env.storage().persistent().has(&DataKey::Cert(cert_id.clone())) {
            return Err(Error::AlreadyIssued);
        }

        let cert = Certificate {
            student: student.clone(),
            level,
            issued_at: env.ledger().timestamp(),
            metadata_hash,
            is_valid: true,
        };
        env.storage()
            .persistent()
            .set(&DataKey::Cert(cert_id.clone()), &cert);

        let mut list: Vec<BytesN<32>> = env
            .storage()
            .persistent()
            .get(&DataKey::StudentCerts(student.clone()))
            .unwrap_or(Vec::new(&env));
        list.push_back(cert_id.clone());
        env.storage()
            .persistent()
            .set(&DataKey::StudentCerts(student), &list);

        Ok(cert_id)
    }

    /// Verify / fetch a certificate by id.
    pub fn verify_certificate(env: Env, certificate_id: BytesN<32>) -> Result<Certificate, Error> {
        env.storage()
            .persistent()
            .get(&DataKey::Cert(certificate_id))
            .ok_or(Error::NotFound)
    }

    /// All certificates held by a student.
    pub fn get_student_certificates(env: Env, student: Address) -> Vec<Certificate> {
        let ids: Vec<BytesN<32>> = env
            .storage()
            .persistent()
            .get(&DataKey::StudentCerts(student))
            .unwrap_or(Vec::new(&env));
        let mut out = Vec::new(&env);
        for id in ids.iter() {
            if let Some(cert) = env.storage().persistent().get::<DataKey, Certificate>(&DataKey::Cert(id)) {
                out.push_back(cert);
            }
        }
        out
    }

    /// Revoke a certificate (e.g. fraud). Admin only.
    pub fn revoke(env: Env, admin: Address, certificate_id: BytesN<32>) -> Result<(), Error> {
        let stored_admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(Error::NotInitialized)?;
        if admin != stored_admin {
            return Err(Error::NotAuthorized);
        }
        admin.require_auth();

        let key = DataKey::Cert(certificate_id);
        let mut cert: Certificate = env
            .storage()
            .persistent()
            .get(&key)
            .ok_or(Error::NotFound)?;
        cert.is_valid = false;
        env.storage().persistent().set(&key, &cert);
        Ok(())
    }

    fn certificate_id(env: &Env, student: &Address, level: &Symbol) -> BytesN<32> {
        let mut bytes = soroban_sdk::Bytes::new(env);
        bytes.append(&student.clone().to_xdr(env));
        bytes.append(&level.clone().to_xdr(env));
        env.crypto().sha256(&bytes).into()
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;
    use soroban_sdk::symbol_short;

    #[test]
    fn mint_and_verify() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, CertificateContract);
        let client = CertificateContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let student = Address::generate(&env);
        client.initialize(&admin);

        let hash = BytesN::from_array(&env, &[7u8; 32]);
        let cert_id = client.mint_certificate(&admin, &student, &symbol_short!("A1"), &hash);
        let cert = client.verify_certificate(&cert_id);
        assert!(cert.is_valid);
        assert_eq!(client.get_student_certificates(&student).len(), 1);
    }
}
