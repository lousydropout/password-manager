#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod keyvault {
    use ink::prelude::vec::Vec;
    use ink::storage::Mapping;

    const VERSION: u8 = 1;

    #[derive(Debug, Clone, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        /// Error for when caller attempts to create an account without agreeing to terms and conditions.
        UserDoesNotAgreeToTerms,
        /// Error for operations on an unregistered or missing account.
        AccountNotFound,
        /// Error for when user attempts to create an account, but it already exists.
        AccountAlreadyExists,
        /// Error when a non-owner attempts a restricted operation.
        NotOwner,
        /// Error for when caller attempts to create an account with insufficient payment.
        InsufficientPayment,
        /// Error when an entry is added out of sequence.
        IndexMismatch,
        /// Error when attempting to delete an already deleted or non-existent account.
        EntriesAlreadyRemoved,
        /// Error when a transfer fails.
        TransferFailed,
    }

    pub type Result<T> = core::result::Result<T, Error>;

    /// Represents an encrypted data entry.
    ///
    /// Contains encrypted data and its initialization vector (IV), essential for
    /// secure encryption and decryption. Supports encryption schemes that require
    /// both ciphertext and IV.
    #[derive(Debug, Clone, scale::Encode, scale::Decode, PartialEq, Eq)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub struct EncryptedEntry {
        /// The encryption process's initialization vector, typically 12-16 bytes.
        iv: Vec<u8>,
        /// The encrypted data, secure when using a strong algorithm and secret key.
        ciphertext: Vec<u8>,
    }

    #[ink(storage)]
    pub struct KeyVault {
        /// Owner's account ID.
        ///
        /// The owner has exclusive rights to set certain parameters within the contract.
        owner: AccountId,

        /// Fee required to create an account.
        ///
        /// This fee is set by the contract owner.
        fee: Balance,

        /// Mapping from a composite key (`AccountId:index`) to an encrypted entry.
        ///
        /// Each entry consists of an initialization vector (IV) and ciphertext, representing encrypted data.
        entries: Mapping<Vec<u8>, EncryptedEntry>,

        /// Mapping of each account to its number of encrypted entries.
        ///
        /// This helps track the total entries per user.
        num_entries: Mapping<AccountId, u32>,

        /// Version number of the latest smart contract.
        ///
        /// It's used to inform users of new versions of the smart contract.
        latest_smart_contract_version: u8,

        /// Optional account ID of the latest version of the smart contract.
        ///
        /// It's used to redirect or inform users about the most recent contract version.
        /// A value of `None` would suggest that this contract's version is the latest.
        latest_smart_contract_address: Option<AccountId>,

        /// Version number of the latest browser extension that is compatible with this smart contract.
        ///
        /// It ensures users are aware of the necessary software version for optimal interaction.
        latest_compatible_browser_extension_version: Vec<u8>,
    }

    impl KeyVault {
        #[ink(constructor)]
        pub fn new(owner: AccountId, latest_compatible_browser_extension_version: Vec<u8>) -> Self {
            Self {
                owner,
                entries: Mapping::new(),
                num_entries: Mapping::new(),
                latest_smart_contract_version: VERSION,
                latest_smart_contract_address: None,
                latest_compatible_browser_extension_version,
                fee: 0,
            }
        }

        /// Restricts a transaction to the contract owner.
        fn is_owner(&self) -> Result<()> {
            if self.env().caller() != self.owner {
                return Err(Error::NotOwner);
            }
            Ok(())
        }

        /// Sets the address of the latest KeyVault smart contract, owner-restricted.
        #[ink(message)]
        pub fn set_latest_smart_contract_address(&mut self, latest: AccountId) -> Result<()> {
            self.is_owner()?;
            self.latest_smart_contract_address = Some(latest);
            Ok(())
        }

        /// Constructs a unique key for entry mapping from an account ID and index.
        fn construct_key(account_id: AccountId, index: u32) -> Vec<u8> {
            let mut key = Vec::from(account_id.as_ref() as &[u8]);
            key.extend_from_slice(&index.to_le_bytes());
            key
        }

        /// Creates account
        #[ink(message, payable)]
        pub fn create_account(&mut self, agrees_to_terms: bool) -> Result<()> {
            if !agrees_to_terms {
                return Err(Error::UserDoesNotAgreeToTerms);
            }
            let caller = self.env().caller();
            let attached_deposit = self.env().transferred_value();

            // make sure account does not already exist
            if self.num_entries.get(&caller).is_some() {
                return Err(Error::AccountAlreadyExists);
            // make sure sufficient payment is sent
            } else if attached_deposit < self.fee {
                return Err(Error::InsufficientPayment);
            // "create" account
            } else {
                self.num_entries.insert(&caller, &0);
            }

            Ok(())
        }

        /// Adds a new encrypted entry for the caller, ensuring sequential order.
        #[ink(message)]
        pub fn add_entry(
            &mut self,
            expected_index: u32,
            iv: Vec<u8>,
            ciphertext: Vec<u8>,
        ) -> Result<()> {
            let caller = self.env().caller();

            // Check if the account exists
            let current_index = self
                .num_entries
                .get(&caller)
                .ok_or(Error::AccountNotFound)?;

            if expected_index != current_index {
                return Err(Error::IndexMismatch);
            }

            let key = Self::construct_key(caller, expected_index);
            self.entries
                .insert(&key, &EncryptedEntry { iv, ciphertext });
            self.num_entries.insert(&caller, &(current_index + 1));
            Ok(())
        }

        /// Retrieves the number of entries for a given account ID.
        #[ink(message)]
        pub fn get_entry_count_by_account_id(&self, account_id: AccountId) -> Result<u32> {
            self.num_entries
                .get(&account_id)
                .ok_or(Error::AccountNotFound)
        }

        /// Retrieves the entry count for the caller's account.
        #[ink(message)]
        pub fn get_entry_count_for_caller(&self) -> Result<u32> {
            self.get_entry_count_by_account_id(self.env().caller())
        }

        /// Retrieves an encrypted entry by index for a given account ID.
        #[ink(message)]
        pub fn get_entry_by_account_id(
            &self,
            account_id: AccountId,
            index: u32,
        ) -> Result<EncryptedEntry> {
            let num = self
                .num_entries
                .get(&account_id)
                .ok_or(Error::AccountNotFound)?;
            if index >= num {
                return Err(Error::IndexMismatch);
            }

            let key = Self::construct_key(account_id, index);
            self.entries.get(&key).ok_or(Error::AccountNotFound)
        }

        /// Retrieves an encrypted entry by index for the caller's account.
        #[ink(message)]
        pub fn get_entry_for_caller(&self, index: u32) -> Result<EncryptedEntry> {
            self.get_entry_by_account_id(self.env().caller(), index)
        }

        /// Resets the caller's account, setting their entry count to zero.
        #[ink(message)]
        pub fn reset_account(&mut self) -> Result<()> {
            let caller = self.env().caller();

            let num_entries = self
                .num_entries
                .get(&caller)
                .ok_or(Error::AccountNotFound)?;

            if num_entries == 0 {
                return Err(Error::EntriesAlreadyRemoved);
            }

            self.num_entries.insert(caller, &0);
            Ok(())
        }

        /// Retrieves the contract owner's account ID.
        #[ink(message)]
        pub fn get_owner(&self) -> AccountId {
            self.owner
        }

        /// Retrieves the latest versions for both the KeyVault smart contract and browser extension.
        ///
        ///   returns (
        ///     current smart contract version,
        ///     latest smart contract version,
        ///     latest smart contract address,
        ///     latest compatible browser extension version,
        ///   )
        #[ink(message)]
        pub fn get_versions(&self) -> (u8, u8, AccountId, Vec<u8>) {
            (
                VERSION,
                self.latest_smart_contract_version.clone(),
                self.latest_smart_contract_address
                    .unwrap_or_else(|| self.env().account_id()),
                self.latest_compatible_browser_extension_version.clone(),
            )
        }

        /// Updates the latest KeyVault smart contract version, owner-restricted.
        #[ink(message)]
        pub fn set_latest_smart_contract_version(&mut self, latest: u8) -> Result<()> {
            self.is_owner()?;
            self.latest_smart_contract_version = latest;
            Ok(())
        }

        /// Updates the latest browser extension version, owner-restricted.
        #[ink(message)]
        pub fn set_latest_compatible_browser_extension_version(
            &mut self,
            latest: Vec<u8>,
        ) -> Result<()> {
            self.is_owner()?;
            self.latest_compatible_browser_extension_version = latest;
            Ok(())
        }

        /// Updates the KeyVault smart contract owner, owner-restricted.
        #[ink(message)]
        pub fn set_owner(&mut self, new_owner: AccountId) -> Result<()> {
            self.is_owner()?;
            self.owner = new_owner;
            Ok(())
        }

        /// Updates account creation fee, owner-restricted.
        #[ink(message)]
        pub fn set_account_creation_fee(&mut self, new_fee: Balance) -> Result<()> {
            self.is_owner()?;
            self.fee = new_fee;
            Ok(())
        }

        /// Gets the smart contract's balance.
        #[ink(message)]
        pub fn get_balance(&self) -> Balance {
            self.env().balance()
        }

        /// Withdraws the smart contract's balance
        #[ink(message)]
        pub fn withdraw(&mut self) -> Result<()> {
            self.is_owner()?;

            let balance = self.env().balance();
            if balance > 0 {
                self.env()
                    .transfer(self.owner, balance)
                    .map_err(|_| Error::TransferFailed)?;
            }
            Ok(())
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;

        fn default_accounts() -> ink::env::test::DefaultAccounts<ink::env::DefaultEnvironment> {
            ink::env::test::default_accounts::<ink::env::DefaultEnvironment>()
        }

        fn set_next_caller(caller: AccountId) {
            ink::env::test::set_caller::<Environment>(caller);
        }

        fn initialize() -> (
            ink::env::test::DefaultAccounts<ink::env::DefaultEnvironment>,
            KeyVault,
        ) {
            let accounts = default_accounts();
            set_next_caller(accounts.alice);
            let keyvault = KeyVault::new(accounts.alice, vec![2]);

            (accounts, keyvault)
        }

        #[ink::test]
        fn bob_attempts_to_create_account_without_agreeing_to_terms_and_conditions() {
            let (accounts, mut keyvault) = initialize();

            // Attempt to create an account wihtout agreeing to terms and conditions
            set_next_caller(accounts.bob);
            let agrees_to_terms_and_conditions = false;
            let account_creation_response = ink::env::pay_with_call!(
                keyvault.create_account(agrees_to_terms_and_conditions),
                1
            );
            assert_eq!(
                account_creation_response,
                Err(Error::UserDoesNotAgreeToTerms)
            );
        }

        #[ink::test]
        fn bob_creates_account_and_adds_entry() {
            let (accounts, mut keyvault) = initialize();
            assert_eq!(keyvault.get_balance(), 1_000_000);

            // Example data for iv and ciphertext
            let iv = vec![0; 16]; // Example initialization vector
            let ciphertext = vec![1, 2, 3, 4]; // Example encrypted data

            // Adding an encrypted entry with index 0
            set_next_caller(accounts.bob);
            assert_eq!(
                keyvault.add_entry(0, iv.clone(), ciphertext.clone()),
                Err(Error::AccountNotFound)
            );

            // Create an account
            set_next_caller(accounts.bob);
            let account_creation_response =
                ink::env::pay_with_call!(keyvault.create_account(true), 1);
            assert_eq!(account_creation_response, Ok(()));
            assert_eq!(keyvault.get_balance(), 1_000_001);

            // Verify the entry count is zero
            set_next_caller(accounts.bob);
            assert_eq!(keyvault.get_entry_count_for_caller(), Ok(0));
            assert_eq!(keyvault.get_entry_count_by_account_id(accounts.bob), Ok(0));

            // Adding an encrypted entry with index 0
            set_next_caller(accounts.bob);
            assert_eq!(
                keyvault.add_entry(0, iv.clone(), ciphertext.clone()),
                Ok(())
            );

            // Verify the entry count is incremented
            set_next_caller(accounts.bob);
            assert_eq!(keyvault.get_entry_count_for_caller(), Ok(1));
            assert_eq!(keyvault.get_entry_count_by_account_id(accounts.bob), Ok(1));

            // Verify the EncryptedEntry data is correctly stored
            let expected_entry = EncryptedEntry { iv, ciphertext };
            assert_eq!(keyvault.get_entry_for_caller(0), Ok(expected_entry.clone()));
            assert_eq!(
                keyvault.get_entry_by_account_id(accounts.bob, 0),
                Ok(expected_entry.clone())
            );

            // Repeat verfication as another user
            // Verify the entry count is incremented
            set_next_caller(accounts.charlie);
            assert_eq!(keyvault.get_entry_count_by_account_id(accounts.bob), Ok(1));

            // Verify the EncryptedEntry data is accessible by another user
            assert_eq!(
                keyvault.get_entry_by_account_id(accounts.bob, 0),
                Ok(expected_entry)
            );
        }

        #[ink::test]
        fn bob_creates_account_and_adds_entry_at_bad_index() {
            let (accounts, mut keyvault) = initialize();

            // Create an account
            set_next_caller(accounts.bob);
            assert_eq!(
                ink::env::pay_with_call!(keyvault.create_account(true), 1),
                Ok(())
            );

            // Example data for iv and ciphertext, assuming failed operation due to wrong index
            let iv = vec![0; 16];
            let ciphertext = vec![1, 2, 3, 4];

            // Attempt to add an entry at an index other than 0 should fail due to IndexMismatch
            assert_eq!(
                keyvault.add_entry(1, iv, ciphertext),
                Err(Error::IndexMismatch)
            );
        }

        #[ink::test]
        fn bob_attempts_to_get_entry_account_before_creating_account() {
            let (accounts, keyvault) = initialize();

            // Attempt to get entry count for a non-existing account should fail with AccountNotFound
            set_next_caller(accounts.bob);
            assert_eq!(
                keyvault.get_entry_count_for_caller(),
                Err(Error::AccountNotFound)
            );
            assert_eq!(
                keyvault.get_entry_count_by_account_id(accounts.bob),
                Err(Error::AccountNotFound)
            );
        }

        #[ink::test]
        fn bob_attempts_to_set_new_owner_without_being_current_owner() {
            let (accounts, mut keyvault) = initialize();

            // Attempt to set owner using a non-owner account should fail with NotOwner
            set_next_caller(accounts.bob);
            assert_eq!(keyvault.set_owner(accounts.bob), Err(Error::NotOwner));
        }

        #[ink::test]
        fn alice_sets_fee_and_bob_creates_new_account_successfully() {
            let (accounts, mut keyvault) = initialize();

            // Alice sets the account creation fee
            set_next_caller(accounts.alice);
            let new_fee = 100; // Set a new fee
            assert_eq!(
                keyvault.set_account_creation_fee(new_fee),
                Ok(()),
                "Alice should be able to set the fee successfully."
            );

            // Check that the fee was set correctly
            assert_eq!(
                keyvault.fee, new_fee,
                "The fee should be updated to the new value."
            );

            // Bob attempts to create an account by paying the new fee
            set_next_caller(accounts.bob);
            let inital_balance = keyvault.get_balance();
            let account_creation_response =
                ink::env::pay_with_call!(keyvault.create_account(true), new_fee);
            assert_eq!(
                account_creation_response,
                Ok(()),
                "Bob should be able to create an account by paying the correct fee."
            );
            assert_eq!(
                keyvault.get_balance(),
                inital_balance + new_fee,
                "The balance should have increated by the amount Bob paid to create account."
            );

            // Verify Bob's account was created successfully by checking the entry count
            assert_eq!(
                keyvault.get_entry_count_by_account_id(accounts.bob),
                Ok(0),
                "Bob's entry count should be 0 after account creation."
            );
        }

        #[ink::test]
        fn bob_fails_to_create_account_due_to_insufficient_fee() {
            let (accounts, mut keyvault) = initialize();

            // Alice sets the account creation fee
            set_next_caller(accounts.alice);
            let required_fee = 100; // Define a required fee
            assert_eq!(
                keyvault.set_account_creation_fee(required_fee),
                Ok(()),
                "Setting fee should succeed."
            );

            // Bob attempts to create an account with insufficient fee
            set_next_caller(accounts.bob);
            let insufficient_fee = required_fee - 1; // Bob pays less than required

            // Simulate paying the insufficient fee and attempting account creation
            let account_creation_response =
                ink::env::pay_with_call!(keyvault.create_account(true), insufficient_fee);
            assert_eq!(
                account_creation_response,
                Err(Error::InsufficientPayment),
                "Bob's account creation should fail due to insufficient fee."
            );
        }

        #[ink::test]
        fn bob_adds_entries_sequentially_and_retrieves_them_successfully() {
            let (accounts, mut keyvault) = initialize();

            // Bob creates an account.
            set_next_caller(accounts.bob);
            let account_creation_response =
                ink::env::pay_with_call!(keyvault.create_account(true), keyvault.fee);
            assert_eq!(account_creation_response, Ok(()));

            // Here we simulate Bob adding entries sequentially.
            let iv = vec![0; 16]; // Sample initialization vector.
            let mut ciphertext = vec![1, 2, 3, 4]; // Sample encrypted data.

            // Bob adds the first entry.
            assert_eq!(
                keyvault.add_entry(0, iv.clone(), ciphertext.clone()),
                Ok(())
            );

            // Bob adds the second entry.
            ciphertext.push(5);
            ciphertext.push(6);
            assert_eq!(
                keyvault.add_entry(1, iv.clone(), ciphertext.clone()),
                Ok(())
            );

            // Bob retrieves the first entry.
            assert_eq!(
                keyvault.get_entry_for_caller(0),
                Ok(EncryptedEntry {
                    iv: iv.clone(),
                    ciphertext: vec![1, 2, 3, 4],
                })
            );

            // Bob retrieves the second entry.
            assert_eq!(
                keyvault.get_entry_for_caller(1),
                Ok(EncryptedEntry {
                    iv,
                    ciphertext: vec![1, 2, 3, 4, 5, 6]
                })
            );
        }

        #[ink::test]
        fn bob_resets_his_account_and_loses_all_entries() {
            let (accounts, mut keyvault) = initialize();

            // Bob creates an account.
            set_next_caller(accounts.bob);
            let account_creation_response =
                ink::env::pay_with_call!(keyvault.create_account(true), keyvault.fee);
            assert_eq!(account_creation_response, Ok(()));

            // Here we simulate Bob adding entries sequentially.
            // Bob adds the first entry.
            keyvault
                .add_entry(0, vec![0; 16], vec![1, 2, 3, 4])
                .expect("Bob is unable to add new entry.");
            // Bob adds the second entry.
            keyvault
                .add_entry(1, vec![1; 16], vec![1, 2, 3, 4, 5, 6, 7])
                .expect("Bob is unable to add new entry.");

            // Verify Bob has two entries
            assert_eq!(keyvault.get_entry_count_for_caller(), Ok(2));
            assert_eq!(keyvault.get_entry_count_by_account_id(accounts.bob), Ok(2));

            // Verify that Bob is able to access his entries
            assert_eq!(
                keyvault.get_entry_for_caller(0),
                Ok(EncryptedEntry {
                    iv: vec![0; 16],
                    ciphertext: vec![1, 2, 3, 4]
                })
            );
            assert_eq!(
                keyvault.get_entry_for_caller(1),
                Ok(EncryptedEntry {
                    iv: vec![1; 16],
                    ciphertext: vec![1, 2, 3, 4, 5, 6, 7]
                })
            );

            // Here we simulate Bob resetting his account.
            assert_eq!(keyvault.reset_account(), Ok(()));

            // Verify Bob's entries are reset.
            assert_eq!(keyvault.get_entry_count_for_caller(), Ok(0));
            assert_eq!(keyvault.get_entry_count_by_account_id(accounts.bob), Ok(0));

            // Verify that Bob is no longer able to access his previous entries
            assert_eq!(keyvault.get_entry_for_caller(0), Err(Error::IndexMismatch));
            assert_eq!(keyvault.get_entry_for_caller(1), Err(Error::IndexMismatch));
        }

        #[ink::test]
        fn bob_fails_to_withdraw_balance_as_non_owner_until_alice_transfers_ownership() {
            let (accounts, mut keyvault) = initialize();

            // Bob attempts to withdraw balance.
            set_next_caller(accounts.bob);
            assert_eq!(keyvault.withdraw(), Err(Error::NotOwner));

            // Alice transfers ownership
            set_next_caller(accounts.alice);
            assert_eq!(keyvault.set_owner(accounts.bob), Ok(()));

            // Bob attempts to withdraw balance.
            set_next_caller(accounts.bob);
            assert_eq!(keyvault.withdraw(), Ok(()));
        }

        #[ink::test]
        fn alice_updates_latest_smart_contract_address_as_owner() {
            let (accounts, mut keyvault) = initialize();

            // Alice updates the latest smart contract address
            set_next_caller(accounts.alice);
            let new_address = AccountId::from([0x02; 32]); // Sample new address
            assert_eq!(
                keyvault.set_latest_smart_contract_address(new_address),
                Ok(()),
                "Alice should successfully update the latest smart contract address."
            );

            // Verify the update
            let (_, _, latest_address, _) = keyvault.get_versions();
            assert_eq!(
                latest_address, new_address,
                "The latest smart contract address should be updated."
            );
        }

        #[ink::test]
        fn bob_attempts_to_update_versions_and_address_as_non_owner_and_fails_until_alice_transfers_ownership(
        ) {
            let (accounts, mut keyvault) = initialize();
            let new_address = AccountId::from([0x03; 32]); // Sample new address
            let new_contract_version = 12;
            let new_browser_extension_version = vec![79];

            // Verify initial state
            let (_, latest_version, _, latest_browser_version) = keyvault.get_versions();
            assert_eq!(latest_version, 1);
            assert_eq!(latest_browser_version, vec![2]);

            // Attempt to update the latest smart contract address as Bob (non-owner)
            set_next_caller(accounts.bob);
            assert_eq!(
                keyvault.set_latest_smart_contract_address(new_address),
                Err(Error::NotOwner),
                "Bob should not be able to update the latest smart contract address as a non-owner."
            );
            assert_eq!(
                keyvault.set_latest_smart_contract_version(new_contract_version),
                Err(Error::NotOwner),
                "Bob should not be able to update the latest smart contract version as a non-owner."
            );
            assert_eq!(
                keyvault.set_latest_compatible_browser_extension_version(
                    new_browser_extension_version.clone()
                ),
                Err(Error::NotOwner),
                "Bob should not be able to update the latest browser extension as a non-owner."
            );

            // Alice transfers ownership
            set_next_caller(accounts.alice);
            assert_eq!(keyvault.set_owner(accounts.bob), Ok(()));

            // Attempt to update the latest smart contract address as Bob (owner)
            set_next_caller(accounts.bob);
            assert_eq!(
                keyvault.set_latest_smart_contract_address(new_address),
                Ok(()),
            );
            assert_eq!(
                keyvault.set_latest_smart_contract_version(new_contract_version.clone()),
                Ok(())
            );
            assert_eq!(
                keyvault.set_latest_compatible_browser_extension_version(
                    new_browser_extension_version.clone()
                ),
                Ok(())
            );

            // Verify the update
            let (_, latest_version, latest_address, latest_browser_version) =
                keyvault.get_versions();
            assert_eq!(
                latest_version, new_contract_version,
                "The latest smart contract version should be updated."
            );
            assert_eq!(
                latest_address, new_address,
                "The latest smart contract address should be updated."
            );
            assert_eq!(
                latest_browser_version, new_browser_extension_version,
                "The latest compatible browser extension version should be updated."
            );
        }
    }
}
