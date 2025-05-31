// Cargo.toml
[package]
name = "loyalty-program"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
soroban-sdk = "20.0.0"

[dev-dependencies]
soroban-sdk = { version = "20.0.0", features = ["testutils"] }

[profile.release]
opt-level = "z"
overflow-checks = true
debug = 0
strip = "symbols"
debug-assertions = false
panic = "abort"
codegen-units = 1
lto = true

[profile.release-with-logs]
inherits = "release"
debug-assertions = true

// src/lib.rs
#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, token, Address, Env, String, Vec, Map
};

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Balance(Address),
    Admin,
    TotalSupply,
    Name,
    Symbol,
    TransactionHistory(Address),
    RewardRates,
    UserStats(Address),
}

#[derive(Clone)]
#[contracttype]
pub struct UserStats {
    pub total_earned: i128,
    pub total_redeemed: i128,
    pub transaction_count: u32,
    pub last_activity: u64,
}

#[derive(Clone)]
#[contracttype]
pub struct Transaction {
    pub amount: i128,
    pub transaction_type: String,
    pub timestamp: u64,
}

#[derive(Clone)]
#[contracttype]
pub struct RewardRates {
    pub earn_rate: i128,    // Her 10 TL için kaç puan
    pub min_purchase: i128, // Minimum alışveriş tutarı
}

#[contract]
pub struct LoyaltyProgram;

#[contractimpl]
impl LoyaltyProgram {
    /// Sözleşmeyi başlat
    pub fn initialize(
        env: Env,
        admin: Address,
        name: String,
        symbol: String,
        earn_rate: i128,
        min_purchase: i128,
    ) -> Result<(), &'static str> {
        // Admin kontrolü
        if env.storage().instance().has(&DataKey::Admin) {
            return Err("Already initialized");
        }

        // Admin ve temel bilgileri kaydet
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Name, &name);
        env.storage().instance().set(&DataKey::Symbol, &symbol);
        env.storage().instance().set(&DataKey::TotalSupply, &0i128);

        // Ödül oranlarını ayarla
        let reward_rates = RewardRates {
            earn_rate,
            min_purchase,
        };
        env.storage().instance().set(&DataKey::RewardRates, &reward_rates);

        Ok(())
    }

    /// Alışveriş yaparak puan kazanma
    pub fn earn_points(
        env: Env,
        user: Address,
        purchase_amount: i128,
    ) -> Result<i128, &'static str> {
        user.require_auth();

        if purchase_amount <= 0 {
            return Err("Purchase amount must be positive");
        }

        let reward_rates: RewardRates = env
            .storage()
            .instance()
            .get(&DataKey::RewardRates)
            .ok_or("Reward rates not set")?;

        if purchase_amount < reward_rates.min_purchase {
            return Err("Purchase amount below minimum");
        }

        // Puan hesaplama (her 10 TL için 1 puan)
        let points_earned = purchase_amount / reward_rates.earn_rate;

        if points_earned <= 0 {
            return Err("No points earned");
        }

        // Kullanıcı bakiyesini güncelle
        let current_balance = Self::balance(env.clone(), user.clone());
        let new_balance = current_balance + points_earned;
        env.storage().persistent().set(&DataKey::Balance(user.clone()), &new_balance);

        // Toplam arzı güncelle
        let total_supply: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalSupply)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::TotalSupply, &(total_supply + points_earned));

        // Kullanıcı istatistiklerini güncelle
        Self::update_user_stats(env.clone(), user.clone(), points_earned, 0, "earn".into());

        // İşlem geçmişini kaydet
        Self::add_transaction_history(
            env.clone(),
            user.clone(),
            points_earned,
            "earn_points".into(),
        );

        // Event emit etmek için log
        env.events().publish(
            ("earn_points", user.clone()),
            (purchase_amount, points_earned),
        );

        Ok(points_earned)
    }

    /// Puan kullanma (redeem)
    pub fn redeem_points(
        env: Env,
        user: Address,
        points_to_redeem: i128,
    ) -> Result<(), &'static str> {
        user.require_auth();

        if points_to_redeem <= 0 {
            return Err("Redeem amount must be positive");
        }

        let current_balance = Self::balance(env.clone(), user.clone());

        if current_balance < points_to_redeem {
            return Err("Insufficient balance");
        }

        // Bakiyeden düş
        let new_balance = current_balance - points_to_redeem;
        env.storage().persistent().set(&DataKey::Balance(user.clone()), &new_balance);

        // Toplam arzdan düş
        let total_supply: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalSupply)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::TotalSupply, &(total_supply - points_to_redeem));

        // Kullanıcı istatistiklerini güncelle
        Self::update_user_stats(env.clone(), user.clone(), 0, points_to_redeem, "redeem".into());

        // İşlem geçmişini kaydet
        Self::add_transaction_history(
            env.clone(),
            user.clone(),
            -points_to_redeem,
            "redeem_points".into(),
        );

        // Event emit
        env.events().publish(
            ("redeem_points", user.clone()),
            points_to_redeem,
        );

        Ok(())
    }

    /// Puan transferi
    pub fn transfer(
        env: Env,
        from: Address,
        to: Address,
        amount: i128,
    ) -> Result<(), &'static str> {
        from.require_auth();

        if amount <= 0 {
            return Err("Transfer amount must be positive");
        }

        if from == to {
            return Err("Cannot transfer to self");
        }

        let from_balance = Self::balance(env.clone(), from.clone());

        if from_balance < amount {
            return Err("Insufficient balance");
        }

        // Gönderen bakiyesinden düş
        env.storage().persistent().set(&DataKey::Balance(from.clone()), &(from_balance - amount));

        // Alıcı bakiyesine ekle
        let to_balance = Self::balance(env.clone(), to.clone());
        env.storage().persistent().set(&DataKey::Balance(to.clone()), &(to_balance + amount));

        // İşlem geçmişi kaydet
        Self::add_transaction_history(
            env.clone(),
            from.clone(),
            -amount,
            "transfer_out".into(),
        );
        Self::add_transaction_history(
            env.clone(),
            to.clone(),
            amount,
            "transfer_in".into(),
        );

        // Event emit
        env.events().publish(
            ("transfer", from.clone(), to.clone()),
            amount,
        );

        Ok(())
    }

    /// Bakiye sorgulama
    pub fn balance(env: Env, user: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::Balance(user))
            .unwrap_or(0)
    }

    /// Admin tarafından puan üretimi (mint)
    pub fn mint(env: Env, to: Address, amount: i128) -> Result<(), &'static str> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or("Admin not set")?;

        admin.require_auth();

        if amount <= 0 {
            return Err("Amount must be positive");
        }

        let current_balance = Self::balance(env.clone(), to.clone());
        let new_balance = current_balance + amount;
        env.storage().persistent().set(&DataKey::Balance(to.clone()), &new_balance);

        // Toplam arzı güncelle
        let total_supply: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalSupply)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::TotalSupply, &(total_supply + amount));

        // İşlem geçmişi
        Self::add_transaction_history(env.clone(), to.clone(), amount, "mint".into());

        // Event emit
        env.events().publish(("mint", to.clone()), amount);

        Ok(())
    }

    /// Admin tarafından puan yakma (burn)
    pub fn burn(env: Env, from: Address, amount: i128) -> Result<(), &'static str> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or("Admin not set")?;

        admin.require_auth();

        if amount <= 0 {
            return Err("Amount must be positive");
        }

        let current_balance = Self::balance(env.clone(), from.clone());

        if current_balance < amount {
            return Err("Insufficient balance to burn");
        }

        let new_balance = current_balance - amount;
        env.storage().persistent().set(&DataKey::Balance(from.clone()), &new_balance);

        // Toplam arzdan düş
        let total_supply: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalSupply)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::TotalSupply, &(total_supply - amount));

        // İşlem geçmişi
        Self::add_transaction_history(env.clone(), from.clone(), -amount, "burn".into());

        // Event emit
        env.events().publish(("burn", from.clone()), amount);

        Ok(())
    }

    /// Kullanıcı istatistiklerini getir
    pub fn get_user_stats(env: Env, user: Address) -> UserStats {
        env.storage()
            .persistent()
            .get(&DataKey::UserStats(user))
            .unwrap_or(UserStats {
                total_earned: 0,
                total_redeemed: 0,
                transaction_count: 0,
                last_activity: 0,
            })
    }

    /// İşlem geçmişini getir (son 10 işlem)
    pub fn get_transaction_history(env: Env, user: Address) -> Vec<Transaction> {
        env.storage()
            .persistent()
            .get(&DataKey::TransactionHistory(user))
            .unwrap_or(Vec::new(&env))
    }

    /// Token bilgilerini getir
    pub fn get_token_info(env: Env) -> (String, String, i128) {
        let name: String = env
            .storage()
            .instance()
            .get(&DataKey::Name)
            .unwrap_or("Loyalty Points".into());
        let symbol: String = env
            .storage()
            .instance()
            .get(&DataKey::Symbol)
            .unwrap_or("LP".into());
        let total_supply: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalSupply)
            .unwrap_or(0);

        (name, symbol, total_supply)
    }

    /// Ödül oranlarını güncelle (sadece admin)
    pub fn update_reward_rates(
        env: Env,
        new_earn_rate: i128,
        new_min_purchase: i128,
    ) -> Result<(), &'static str> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or("Admin not set")?;

        admin.require_auth();

        let reward_rates = RewardRates {
            earn_rate: new_earn_rate,
            min_purchase: new_min_purchase,
        };

        env.storage().instance().set(&DataKey::RewardRates, &reward_rates);

        Ok(())
    }

    /// Yardımcı fonksiyon: Kullanıcı istatistiklerini güncelle
    fn update_user_stats(
        env: Env,
        user: Address,
        earned: i128,
        redeemed: i128,
        transaction_type: String,
    ) {
        let mut stats = Self::get_user_stats(env.clone(), user.clone());

        stats.total_earned += earned;
        stats.total_redeemed += redeemed;
        stats.transaction_count += 1;
        stats.last_activity = env.ledger().timestamp();

        env.storage().persistent().set(&DataKey::UserStats(user), &stats);
    }

    /// Yardımcı fonksiyon: İşlem geçmişi ekle
    fn add_transaction_history(
        env: Env,
        user: Address,
        amount: i128,
        transaction_type: String,
    ) {
        let mut history = Self::get_transaction_history(env.clone(), user.clone());

        let transaction = Transaction {
            amount,
            transaction_type,
            timestamp: env.ledger().timestamp(),
        };

        history.push_back(transaction);

        // Son 10 işlemi sakla
        if history.len() > 10 {
            history.pop_front();
        }

        env.storage()
            .persistent()
            .set(&DataKey::TransactionHistory(user), &history);
    }
}

// Test modülü
#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Env};

    #[test]
    fn test_initialize() {
        let env = Env::default();
        let admin = Address::generate(&env);
        let contract_id = env.register_contract(None, LoyaltyProgram);
        let client = LoyaltyProgramClient::new(&env, &contract_id);

        client.initialize(
            &admin,
            &"Loyalty Points".into(),
            &"LP".into(),
            &10i128,
            &50i128,
        );

        let (name, symbol, total_supply) = client.get_token_info();
        assert_eq!(name, "Loyalty Points".to_string());
        assert_eq!(symbol, "LP".to_string());
        assert_eq!(total_supply, 0);
    }

    #[test]
    fn test_earn_and_redeem_points() {
        let env = Env::default();
        let admin = Address::generate(&env);
        let user = Address::generate(&env);
        let contract_id = env.register_contract(None, LoyaltyProgram);
        let client = LoyaltyProgramClient::new(&env, &contract_id);

        client.initialize(
            &admin,
            &"Loyalty Points".into(),
            &"LP".into(),
            &10i128,
            &50i128,
        );

        // 100 TL alışveriş yap, 10 puan kazanmalı
        env.mock_all_auths();
        let points_earned = client.earn_points(&user, &100i128);
        assert_eq!(points_earned, 10);

        let balance = client.balance(&user);
        assert_eq!(balance, 10);

        // 5 puan kullan
        client.redeem_points(&user, &5i128);
        let new_balance = client.balance(&user);
        assert_eq!(new_balance, 5);
    }

    #[test]
    fn test_transfer() {
        let env = Env::default();
        let admin = Address::generate(&env);
        let user1 = Address::generate(&env);
        let user2 = Address::generate(&env);
        let contract_id = env.register_contract(None, LoyaltyProgram);
        let client = LoyaltyProgramClient::new(&env, &contract_id);

        client.initialize(
            &admin,
            &"Loyalty Points".into(),
            &"LP".into(),
            &10i128,
            &50i128,
        );

        env.mock_all_auths();

        // User1'e puan ver
        client.earn_points(&user1, &100i128);
        assert_eq!(client.balance(&user1), 10);

        // User1'den User2'ye 3 puan transfer et
        client.transfer(&user1, &user2, &3i128);

        assert_eq!(client.balance(&user1), 7);
        assert_eq!(client.balance(&user2), 3);
    }
}

// build.rs
fn main() {
    println!("cargo:rerun-if-changed=src/lib.rs");
}
