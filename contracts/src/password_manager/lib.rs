#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod password_manager {
    use ink::prelude::{
        string::{String, ToString},
        vec::Vec,
    };
    use ink::storage::Mapping;

    #[ink(event)]
    pub struct SetNumber {
        account_id: AccountId,
        number: u16,
    }

    #[ink(storage)]
    pub struct PasswordManager {
        num_passwords: Mapping<AccountId, u16>,
        password: Mapping<String, String>,
        last_updated: Mapping<AccountId, Vec<u64>>,
    }

    impl PasswordManager {
        /// Creates a new password manager contract initialized to default.
        #[ink(constructor)]
        pub fn default() -> Self {
            Self {
                num_passwords: Mapping::default(),
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

        /// Sets number
        #[ink(message)]
        pub fn set_number_of_passwords(&mut self, number: u16) {
            let account_id = self.env().caller();

            self.num_passwords.insert(&account_id, &number);
            self.env().emit_event(SetNumber { account_id, number })
        }

        /// Returns the current value of `num_passwords`.
        #[ink(message)]
        pub fn number_of_passwords(&self) -> u16 {
            self.num_passwords
                .get(self.env().caller())
                .unwrap_or_default()
        }

        /// Returns the current value of `num_passwords`.
        #[ink(message)]
        pub fn number_of_passwords_of_account(&self, account_id: AccountId) -> u16 {
            self.num_passwords.get(account_id).unwrap_or_default()
        }

        /// Adds password
        /// Note: Added passwords will be associated with the caller's account id
        #[ink(message)]
        pub fn add_password(&mut self, encrypted: String) {
            let account_id = self.env().caller();
            let mut last_updated = self.last_updated.get(&account_id).unwrap_or_default();
            let num = last_updated.len() as u16;

            // add password
            let pw_key = self.pw_key(account_id, num);
            self.password.insert(&pw_key, &encrypted);

            // update last_updated
            last_updated.push(self.env().block_timestamp());
            self.last_updated.insert(&account_id, &last_updated);
        }

        /// Updates password
        /// Note: Callers can only modify password that are already associated with their account id
        #[ink(message)]
        pub fn update_password(&mut self, num: u16, encrypted: String) {
            let account_id = self.env().caller();

            match self.num_passwords.get(&account_id) {
                None => {
                    // raise error since no password for caller exist
                }
                Some(n) if n < num => {
                    // raise error since the number of passwords is less than `num`
                }
                Some(n) => {
                    // add password
                    let pw_key = self.pw_key(account_id, num);
                    self.password.insert(&pw_key, &encrypted);

                    // update last_updated[n]
                    let mut last_updated = self.last_updated.get(&account_id).unwrap();
                    last_updated[n as usize] = self.env().block_timestamp();
                    self.last_updated.insert(&account_id, &last_updated);
                }
            }
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

    #[cfg(test)]
    mod tests {
        use super::*;

        #[ink::test]
        fn new_works() {
            let pw_manager = PasswordManager::default();
            assert_eq!(pw_manager.number_of_passwords(), 0);
        }
    }
}
