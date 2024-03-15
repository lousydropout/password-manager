#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod keyvault {
    use ink::prelude::vec::Vec;
    use ink::storage::Mapping;

    const VERSION: u8 = 1;

    /// Defines an event that is emitted
    /// when a user registers an account.
    #[ink(event)]
    pub struct Registered {
        user: AccountId,
    }

    /// Defines an event that is emitted
    /// every time an update is made.
    #[ink(event)]
    pub struct AddedEntry {
        user: AccountId,
        num_entries: u32,
    }

    #[derive(Debug, Clone, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        /// Error for operations on an unregistered account.
        AccountNotFound,
        /// Error for when user attempts to create an account, but it already exists.
        AccountAlreadyExists,
        /// Error for when a non-owner attempts a restricted operation.
        NotOwner,
        /// Error for when caller attempts to create an account with insufficient payment.
        InsufficientPayment,
        /// Error for when an entry is added out of sequence.
        IndexMismatch,
        /// Error for when a transfer fails.
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

        /// Hash of user's encryption key.
        ///
        /// This is so that the browser extension is using the correct encryption key.
        encryption_key_hash: Mapping<AccountId, Vec<u8>>,

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
        latest_compatible_browser_extension_version: u32,
    }

    impl KeyVault {
        #[ink(constructor)]
        pub fn new(owner: AccountId, latest_compatible_browser_extension_version: u32) -> Self {
            Self {
                owner,
                encryption_key_hash: Mapping::new(),
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
        pub fn create_account(&mut self, encryption_key_hash: Vec<u8>) -> Result<()> {
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
                // set hash of encryption key
                self.encryption_key_hash
                    .insert(&caller, &encryption_key_hash);
                self.num_entries.insert(&caller, &0);
            }

            // emit event
            Self::env().emit_event(Registered { user: caller });
            Ok(())
        }

        /// Retrieves the hash of the encryption key of an AccountId
        #[ink(message)]
        pub fn get_encryption_key_hash(&self, account_id: AccountId) -> Result<Vec<u8>> {
            Ok(self
                .encryption_key_hash
                .get(&account_id)
                .ok_or(Error::AccountNotFound)?)
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

            // emit event
            Self::env().emit_event(AddedEntry {
                user: caller,
                num_entries: current_index + 1,
            });
            Ok(())
        }

        /// Adds new encrypted entries for the caller, ensuring sequential order.
        #[ink(message)]
        pub fn add_entries(
            &mut self,
            expected_index: u32,
            entries: Vec<(Vec<u8>, Vec<u8>)>,
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

            let entries_len = entries.len() as u32;

            // `entries` is assumed to be a vector of (iv, ciphertext)
            for (i, (iv, ciphertext)) in entries.into_iter().enumerate() {
                let key = Self::construct_key(caller, current_index + i as u32);
                self.entries
                    .insert(&key, &EncryptedEntry { iv, ciphertext });
            }

            // Update `num_entries` for the caller after all entries have been added
            self.num_entries
                .insert(&caller, &(current_index + entries_len));

            // emit event
            Self::env().emit_event(AddedEntry {
                user: caller,
                num_entries: current_index + entries_len,
            });

            Ok(())
        }

        /// Retrieves the number of entries for a given account ID.
        #[ink(message)]
        pub fn get_entry_count(&self, account_id: AccountId) -> Result<u32> {
            self.num_entries
                .get(&account_id)
                .ok_or(Error::AccountNotFound)
        }

        /// Retrieves an encrypted entry by index for a given account ID.
        #[ink(message)]
        pub fn get_entry(&self, account_id: AccountId, index: u32) -> Result<EncryptedEntry> {
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

        fn min(&self, a: u32, b: u32) -> u32 {
            if a <= b {
                a
            } else {
                b
            }
        }

        /// Retrieves the encrypted entries requested for a given account ID.
        #[ink(message)]
        pub fn get_entries(
            &self,
            account_id: AccountId,
            start_index: u32,
            max_num: u32,
        ) -> Result<Vec<EncryptedEntry>> {
            let num = self
                .num_entries
                .get(&account_id)
                .ok_or(Error::AccountNotFound)?;
            if start_index >= num {
                return Err(Error::IndexMismatch);
            }

            let mut results = Vec::new();
            for index in start_index..self.min(num, start_index + max_num) {
                let key = Self::construct_key(account_id, index);
                let entry = self.entries.get(&key).ok_or(Error::AccountNotFound)?;
                results.push(entry);
            }

            Ok(results)
        }

        /// Resets the caller's account, setting their entry count to zero.
        #[ink(message)]
        pub fn reset_account(&mut self, iv: Vec<u8>, ciphertext: Vec<u8>) -> Result<()> {
            let caller = self.env().caller();

            let _num_entries = self
                .num_entries
                .get(&caller)
                .ok_or(Error::AccountNotFound)?;

            // insert 1st encrypted entry
            // this entry is meant to not contain any particular information
            let key = Self::construct_key(caller, 0);
            self.entries
                .insert(&key, &EncryptedEntry { iv, ciphertext });
            self.num_entries.insert(&caller, &1);
            Ok(())
        }

        /// Retrieves the contract owner's account ID.
        #[ink(message)]
        pub fn get_owner(&self) -> AccountId {
            self.owner
        }

        /// Retrieves the contract owner's account ID.
        #[ink(message)]
        pub fn get_owner_result(&self) -> Result<AccountId> {
            Ok(self.owner)
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
        pub fn get_versions(&self) -> (u8, u8, AccountId, u32) {
            (
                VERSION,
                self.latest_smart_contract_version.clone(),
                self.latest_smart_contract_address
                    .unwrap_or_else(|| self.env().account_id()),
                self.latest_compatible_browser_extension_version,
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
            latest: u32,
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
}
