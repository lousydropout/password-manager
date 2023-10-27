#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod password_manager {
    use ink::prelude::string::String;
    use ink::storage::Mapping;

    #[ink(event)]
    pub struct SetNumber {
        from: AccountId,
        number: u16,
    }

    #[ink(storage)]
    pub struct PasswordManager {
        num_keys: Mapping<AccountId, u16>,
        pw: Mapping<String, String>,
    }

    impl PasswordManager {
        /// Creates a new password manager contract initialized to default.
        #[ink(constructor)]
        pub fn default() -> Self {
            Self {
                num_keys: Mapping::default(),
                pw: Mapping::default(),
            }
        }
        /// Sets number
        #[ink(message)]
        pub fn set_number_of_keys(&mut self, number: u16) {
            let from = self.env().caller();

            self.num_keys.insert(&from, &number);
            self.env().emit_event(SetNumber { from, number })
        }

        /// Returns the current value of `num_keys`.
        #[ink(message)]
        pub fn number_of_keys(&self) -> u16 {
            self.num_keys.get(self.env().caller()).unwrap_or_default()
        }

        /// Returns the current value of `num_keys`.
        #[ink(message)]
        pub fn number_of_keys_of_account(&self, account_id: AccountId) -> u16 {
            self.num_keys.get(account_id).unwrap_or_default()
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;

        #[ink::test]
        fn new_works() {
            let pw_manager = PasswordManager::default();
            assert_eq!(pw_manager.number_of_keys(), 0);
        }
    }
}
