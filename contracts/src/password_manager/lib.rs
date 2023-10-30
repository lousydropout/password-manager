#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod password_manager {
    use ink::prelude::{
        string::{String, ToString},
        vec::Vec,
    };
    use ink::storage::Mapping;

    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        /// The requested password does not exist, likely because the user
        /// is requesting password #{n} when there are fewer than {n} passwords
        /// associated with the account id.
        PasswordDoesNotExist,
    }
    // result type
    pub type Result<T> = core::result::Result<T, Error>;

    #[ink(event)]
    pub struct InitializedContract {
        account_id: AccountId,
    }

    #[ink(storage)]
    pub struct PasswordManager {
        password: Mapping<String, String>,
        last_updated: Mapping<AccountId, Vec<u64>>,
    }

    impl PasswordManager {
        /// Creates a new password manager contract initialized to default.
        #[ink(constructor)]
        pub fn default() -> Self {
            Self {
                password: Mapping::default(),
                last_updated: Mapping::default(),
            }
        }

        /// get string of account_id + n
        fn pw_key(&self, account_id: AccountId, num: u16) -> String {
            // key: `${account_id.address}${num}`
            // note: key will start with 0
            let mut key = hex::encode(account_id);
            key.push_str(num.to_string().as_str());
            key
        }

        /// Adds password
        /// Note: Added passwords will be associated with the caller's account id
        #[ink(message)]
        pub fn add_password(&mut self, encrypted: String) -> Result<()> {
            let account_id = self.env().caller();
            let mut last_updated = self.last_updated.get(&account_id).unwrap_or_default();
            let num = last_updated.len() as u16;

            // add password
            let pw_key = self.pw_key(account_id, num);
            self.password.insert(&pw_key, &encrypted);

            // update last_updated
            last_updated.push(self.env().block_timestamp());
            self.last_updated.insert(&account_id, &last_updated);

            Ok(())
        }

        /// Updates password
        /// Note: Callers can only modify password that are already associated with their account id
        #[ink(message)]
        pub fn update_password(&mut self, num: u16, encrypted: String) -> Result<()> {
            let account_id = self.env().caller();
            let mut last_updated = self.last_updated.get(&account_id).unwrap_or_default();
            let num_passwords = last_updated.len() as u16;

            if num_passwords < num {
                return Err(Error::PasswordDoesNotExist);
            }

            // add password
            let pw_key = self.pw_key(account_id, num);
            self.password.insert(&pw_key, &encrypted);

            // update last_updated[num]
            last_updated[num as usize] = self.env().block_timestamp();
            self.last_updated.insert(&account_id, &last_updated);

            Ok(())
        }

        /// Returns the nth encrypted password for account_id
        #[ink(message)]
        pub fn password(&self, account_id: AccountId, num: u16) -> String {
            let pw_key = self.pw_key(account_id, num);
            self.password.get(&pw_key).unwrap_or(String::from(""))
        }

        /// Returns the last_update vec
        #[ink(message)]
        pub fn get_last_updated(&self, account_id: AccountId) -> Vec<u64> {
            self.last_updated.get(&account_id).unwrap_or_default()
        }
    }
}
