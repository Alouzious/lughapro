# LughaPro Soroban Contracts

Four Stellar Soroban smart contracts power the on-chain side of LughaPro:

| Contract | Purpose |
| --- | --- |
| `credit_ledger` | Tracks student learning credits and CEFR level unlocks on-chain. |
| `certificate` | Mints soulbound (non-transferable) CEFR completion certificates. |
| `course_payment` | Escrow for paid course enrollments (releases to tutor minus 15% fee). |
| `session_escrow` | Escrow for live 1-on-1 tutor sessions with 48h auto-refund + disputes. |

## Prerequisites

```bash
rustup target add wasm32-unknown-unknown
cargo install --locked stellar-cli   # provides the `stellar` command
```

## Build

```bash
# From the contracts/ directory
cargo build --target wasm32-unknown-unknown --release
# Optimized .wasm files land in target/wasm32-unknown-unknown/release/
```

Run the unit tests (native target):

```bash
cargo test
```

## Deploy to testnet

```bash
# 1. Create & fund an admin identity
stellar keys generate platform-admin --network testnet
stellar keys fund platform-admin --network testnet

# 2. Deploy each contract (repeat per wasm file)
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/credit_ledger.wasm \
  --network testnet --source-account platform-admin
# -> prints the C... contract address; save to backend/.env

# 3. Initialize each contract with the admin address
stellar contract invoke \
  --id <CREDIT_LEDGER_CONTRACT> --network testnet --source-account platform-admin \
  -- initialize --admin <ADMIN_PUBLIC_KEY>
```

Repeat deploy + `initialize` for `certificate`, `course_payment`, and
`session_escrow`. Put the resulting addresses into:

- `backend/.env` → `CREDIT_LEDGER_CONTRACT`, `CERTIFICATE_CONTRACT`, `COURSE_PAYMENT_CONTRACT`, `SESSION_ESCROW_CONTRACT`, `STELLAR_ADMIN_SECRET_KEY`
- `frontend/.env` → `VITE_*_CONTRACT`

When these are set, the backend `BlockchainService` switches from simulated
transaction hashes to live Soroban calls.
