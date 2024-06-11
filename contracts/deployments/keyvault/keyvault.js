export const metadata = {
  "source": {
    "hash": "0xbdaafa028bdc0fc9ea2406e52b78b10e237d466baf7a179dcbecc1f388e0cac4",
    "language": "ink! 4.3.0",
    "compiler": "rustc 1.78.0",
    "build_info": {
      "build_mode": "Release",
      "cargo_contract_version": "4.1.1",
      "rust_toolchain": "stable-x86_64-unknown-linux-gnu",
      "wasm_opt_settings": {
        "keep_debug_symbols": false,
        "optimization_passes": "Z"
      }
    }
  },
  "contract": {
    "name": "keyvault",
    "version": "1.0.0",
    "authors": [
      "lousydropout <lousydropout@gmail.com>"
    ]
  },
  "image": null,
  "spec": {
    "constructors": [
      {
        "args": [
          {
            "label": "owner",
            "type": {
              "displayName": [
                "AccountId"
              ],
              "type": 0
            }
          },
          {
            "label": "latest_compatible_browser_extension_version",
            "type": {
              "displayName": [
                "u32"
              ],
              "type": 14
            }
          }
        ],
        "default": false,
        "docs": [],
        "label": "new",
        "payable": false,
        "returnType": {
          "displayName": [
            "ink_primitives",
            "ConstructorResult"
          ],
          "type": 20
        },
        "selector": "0x9bae9d5e"
      }
    ],
    "docs": [],
    "environment": {
      "accountId": {
        "displayName": [
          "AccountId"
        ],
        "type": 0
      },
      "balance": {
        "displayName": [
          "Balance"
        ],
        "type": 3
      },
      "blockNumber": {
        "displayName": [
          "BlockNumber"
        ],
        "type": 14
      },
      "chainExtension": {
        "displayName": [
          "ChainExtension"
        ],
        "type": 44
      },
      "hash": {
        "displayName": [
          "Hash"
        ],
        "type": 42
      },
      "maxEventTopics": 4,
      "staticBufferSize": 16384,
      "timestamp": {
        "displayName": [
          "Timestamp"
        ],
        "type": 43
      }
    },
    "events": [
      {
        "args": [
          {
            "docs": [],
            "indexed": false,
            "label": "user",
            "type": {
              "displayName": [
                "AccountId"
              ],
              "type": 0
            }
          }
        ],
        "docs": [
          "Defines an event that is emitted",
          "when a user registers an account."
        ],
        "label": "Registered",
        "module_path": "keyvault::keyvault",
        "signature_topic": "0xf7076672b177d2dbadbcda2a12026cd8a64083c35cb2117da52929e574c80fa9"
      },
      {
        "args": [
          {
            "docs": [],
            "indexed": false,
            "label": "user",
            "type": {
              "displayName": [
                "AccountId"
              ],
              "type": 0
            }
          },
          {
            "docs": [],
            "indexed": false,
            "label": "num_entries",
            "type": {
              "displayName": [
                "u32"
              ],
              "type": 14
            }
          }
        ],
        "docs": [
          "Defines an event that is emitted",
          "every time an update is made."
        ],
        "label": "AddedEntry",
        "module_path": "keyvault::keyvault",
        "signature_topic": "0x2012e72f84033301d3a501b15893a94055ad0a8a616abb9516a6df0797ecad7c"
      }
    ],
    "lang_error": {
      "displayName": [
        "ink",
        "LangError"
      ],
      "type": 21
    },
    "messages": [
      {
        "args": [
          {
            "label": "latest",
            "type": {
              "displayName": [
                "AccountId"
              ],
              "type": 0
            }
          }
        ],
        "default": false,
        "docs": [
          " Sets the address of the latest KeyVault smart contract, owner-restricted."
        ],
        "label": "set_latest_smart_contract_address",
        "mutates": true,
        "payable": false,
        "returnType": {
          "displayName": [
            "ink",
            "MessageResult"
          ],
          "type": 22
        },
        "selector": "0xdc3f2346"
      },
      {
        "args": [
          {
            "label": "encryption_key_hash",
            "type": {
              "displayName": [
                "Vec"
              ],
              "type": 4
            }
          }
        ],
        "default": false,
        "docs": [
          " Creates account"
        ],
        "label": "create_account",
        "mutates": true,
        "payable": true,
        "returnType": {
          "displayName": [
            "ink",
            "MessageResult"
          ],
          "type": 22
        },
        "selector": "0x470c28ee"
      },
      {
        "args": [
          {
            "label": "account_id",
            "type": {
              "displayName": [
                "AccountId"
              ],
              "type": 0
            }
          }
        ],
        "default": false,
        "docs": [
          " Retrieves the hash of the encryption key of an AccountId"
        ],
        "label": "get_encryption_key_hash",
        "mutates": false,
        "payable": false,
        "returnType": {
          "displayName": [
            "ink",
            "MessageResult"
          ],
          "type": 25
        },
        "selector": "0x279f1ad1"
      },
      {
        "args": [
          {
            "label": "expected_index",
            "type": {
              "displayName": [
                "u32"
              ],
              "type": 14
            }
          },
          {
            "label": "iv",
            "type": {
              "displayName": [
                "Vec"
              ],
              "type": 4
            }
          },
          {
            "label": "ciphertext",
            "type": {
              "displayName": [
                "Vec"
              ],
              "type": 4
            }
          }
        ],
        "default": false,
        "docs": [
          " Adds a new encrypted entry for the caller, ensuring sequential order."
        ],
        "label": "add_entry",
        "mutates": true,
        "payable": false,
        "returnType": {
          "displayName": [
            "ink",
            "MessageResult"
          ],
          "type": 22
        },
        "selector": "0x8cd84b6c"
      },
      {
        "args": [
          {
            "label": "expected_index",
            "type": {
              "displayName": [
                "u32"
              ],
              "type": 14
            }
          },
          {
            "label": "entries",
            "type": {
              "displayName": [
                "Vec"
              ],
              "type": 27
            }
          }
        ],
        "default": false,
        "docs": [
          " Adds new encrypted entries for the caller, ensuring sequential order."
        ],
        "label": "add_entries",
        "mutates": true,
        "payable": false,
        "returnType": {
          "displayName": [
            "ink",
            "MessageResult"
          ],
          "type": 22
        },
        "selector": "0xa70ec9e5"
      },
      {
        "args": [
          {
            "label": "account_id",
            "type": {
              "displayName": [
                "AccountId"
              ],
              "type": 0
            }
          }
        ],
        "default": false,
        "docs": [
          " Retrieves the number of entries for a given account ID."
        ],
        "label": "get_entry_count",
        "mutates": false,
        "payable": false,
        "returnType": {
          "displayName": [
            "ink",
            "MessageResult"
          ],
          "type": 29
        },
        "selector": "0xc280e22d"
      },
      {
        "args": [
          {
            "label": "account_id",
            "type": {
              "displayName": [
                "AccountId"
              ],
              "type": 0
            }
          },
          {
            "label": "index",
            "type": {
              "displayName": [
                "u32"
              ],
              "type": 14
            }
          }
        ],
        "default": false,
        "docs": [
          " Retrieves an encrypted entry by index for a given account ID."
        ],
        "label": "get_entry",
        "mutates": false,
        "payable": false,
        "returnType": {
          "displayName": [
            "ink",
            "MessageResult"
          ],
          "type": 31
        },
        "selector": "0x31bf3920"
      },
      {
        "args": [
          {
            "label": "account_id",
            "type": {
              "displayName": [
                "AccountId"
              ],
              "type": 0
            }
          },
          {
            "label": "start_index",
            "type": {
              "displayName": [
                "u32"
              ],
              "type": 14
            }
          },
          {
            "label": "max_num",
            "type": {
              "displayName": [
                "u32"
              ],
              "type": 14
            }
          }
        ],
        "default": false,
        "docs": [
          " Retrieves the encrypted entries requested for a given account ID."
        ],
        "label": "get_entries",
        "mutates": false,
        "payable": false,
        "returnType": {
          "displayName": [
            "ink",
            "MessageResult"
          ],
          "type": 33
        },
        "selector": "0xacd52579"
      },
      {
        "args": [
          {
            "label": "encryption_key_hash",
            "type": {
              "displayName": [
                "Vec"
              ],
              "type": 4
            }
          }
        ],
        "default": false,
        "docs": [
          " Resets the caller's account, setting their entry count to zero."
        ],
        "label": "reset_account",
        "mutates": true,
        "payable": false,
        "returnType": {
          "displayName": [
            "ink",
            "MessageResult"
          ],
          "type": 22
        },
        "selector": "0xe8db5848"
      },
      {
        "args": [],
        "default": false,
        "docs": [
          " Retrieves the contract owner's account ID."
        ],
        "label": "get_owner",
        "mutates": false,
        "payable": false,
        "returnType": {
          "displayName": [
            "ink",
            "MessageResult"
          ],
          "type": 36
        },
        "selector": "0x07fcd0b1"
      },
      {
        "args": [],
        "default": false,
        "docs": [
          " Retrieves the contract owner's account ID."
        ],
        "label": "get_owner_result",
        "mutates": false,
        "payable": false,
        "returnType": {
          "displayName": [
            "ink",
            "MessageResult"
          ],
          "type": 37
        },
        "selector": "0xaf9e84a8"
      },
      {
        "args": [],
        "default": false,
        "docs": [
          " Retrieves the latest versions for both the KeyVault smart contract and browser extension.",
          "",
          "   returns (",
          "     current smart contract version,",
          "     latest smart contract version,",
          "     latest smart contract address,",
          "     latest compatible browser extension version,",
          "   )"
        ],
        "label": "get_versions",
        "mutates": false,
        "payable": false,
        "returnType": {
          "displayName": [
            "ink",
            "MessageResult"
          ],
          "type": 39
        },
        "selector": "0x2c075632"
      },
      {
        "args": [
          {
            "label": "latest",
            "type": {
              "displayName": [
                "u8"
              ],
              "type": 2
            }
          }
        ],
        "default": false,
        "docs": [
          " Updates the latest KeyVault smart contract version, owner-restricted."
        ],
        "label": "set_latest_smart_contract_version",
        "mutates": true,
        "payable": false,
        "returnType": {
          "displayName": [
            "ink",
            "MessageResult"
          ],
          "type": 22
        },
        "selector": "0x70bae51b"
      },
      {
        "args": [
          {
            "label": "latest",
            "type": {
              "displayName": [
                "u32"
              ],
              "type": 14
            }
          }
        ],
        "default": false,
        "docs": [
          " Updates the latest browser extension version, owner-restricted."
        ],
        "label": "set_latest_compatible_browser_extension_version",
        "mutates": true,
        "payable": false,
        "returnType": {
          "displayName": [
            "ink",
            "MessageResult"
          ],
          "type": 22
        },
        "selector": "0xfc0b8fc5"
      },
      {
        "args": [
          {
            "label": "new_owner",
            "type": {
              "displayName": [
                "AccountId"
              ],
              "type": 0
            }
          }
        ],
        "default": false,
        "docs": [
          " Updates the KeyVault smart contract owner, owner-restricted."
        ],
        "label": "set_owner",
        "mutates": true,
        "payable": false,
        "returnType": {
          "displayName": [
            "ink",
            "MessageResult"
          ],
          "type": 22
        },
        "selector": "0x367facd6"
      },
      {
        "args": [
          {
            "label": "new_fee",
            "type": {
              "displayName": [
                "Balance"
              ],
              "type": 3
            }
          }
        ],
        "default": false,
        "docs": [
          " Updates account creation fee, owner-restricted."
        ],
        "label": "set_account_creation_fee",
        "mutates": true,
        "payable": false,
        "returnType": {
          "displayName": [
            "ink",
            "MessageResult"
          ],
          "type": 22
        },
        "selector": "0xac0488cc"
      },
      {
        "args": [],
        "default": false,
        "docs": [
          " Gets the smart contract's balance."
        ],
        "label": "get_balance",
        "mutates": false,
        "payable": false,
        "returnType": {
          "displayName": [
            "ink",
            "MessageResult"
          ],
          "type": 41
        },
        "selector": "0xea817e65"
      },
      {
        "args": [],
        "default": false,
        "docs": [
          " Withdraws the smart contract's balance"
        ],
        "label": "withdraw",
        "mutates": true,
        "payable": false,
        "returnType": {
          "displayName": [
            "ink",
            "MessageResult"
          ],
          "type": 22
        },
        "selector": "0x410fcc9d"
      }
    ]
  },
  "storage": {
    "root": {
      "layout": {
        "struct": {
          "fields": [
            {
              "layout": {
                "leaf": {
                  "key": "0x00000000",
                  "ty": 0
                }
              },
              "name": "owner"
            },
            {
              "layout": {
                "leaf": {
                  "key": "0x00000000",
                  "ty": 3
                }
              },
              "name": "fee"
            },
            {
              "layout": {
                "root": {
                  "layout": {
                    "leaf": {
                      "key": "0x56a0ea45",
                      "ty": 4
                    }
                  },
                  "root_key": "0x56a0ea45",
                  "ty": 5
                }
              },
              "name": "encryption_key_hash"
            },
            {
              "layout": {
                "root": {
                  "layout": {
                    "struct": {
                      "fields": [
                        {
                          "layout": {
                            "leaf": {
                              "key": "0xe4f7e88d",
                              "ty": 4
                            }
                          },
                          "name": "iv"
                        },
                        {
                          "layout": {
                            "leaf": {
                              "key": "0xe4f7e88d",
                              "ty": 4
                            }
                          },
                          "name": "ciphertext"
                        }
                      ],
                      "name": "EncryptedEntry"
                    }
                  },
                  "root_key": "0xe4f7e88d",
                  "ty": 10
                }
              },
              "name": "entries"
            },
            {
              "layout": {
                "root": {
                  "layout": {
                    "leaf": {
                      "key": "0xd0cf3d29",
                      "ty": 14
                    }
                  },
                  "root_key": "0xd0cf3d29",
                  "ty": 15
                }
              },
              "name": "num_entries"
            },
            {
              "layout": {
                "leaf": {
                  "key": "0x00000000",
                  "ty": 2
                }
              },
              "name": "latest_smart_contract_version"
            },
            {
              "layout": {
                "enum": {
                  "dispatchKey": "0x00000000",
                  "name": "Option",
                  "variants": {
                    "0": {
                      "fields": [],
                      "name": "None"
                    },
                    "1": {
                      "fields": [
                        {
                          "layout": {
                            "leaf": {
                              "key": "0x00000000",
                              "ty": 0
                            }
                          },
                          "name": "0"
                        }
                      ],
                      "name": "Some"
                    }
                  }
                }
              },
              "name": "latest_smart_contract_address"
            },
            {
              "layout": {
                "leaf": {
                  "key": "0x00000000",
                  "ty": 14
                }
              },
              "name": "latest_compatible_browser_extension_version"
            }
          ],
          "name": "KeyVault"
        }
      },
      "root_key": "0x00000000",
      "ty": 18
    }
  },
  "types": [
    {
      "id": 0,
      "type": {
        "def": {
          "composite": {
            "fields": [
              {
                "type": 1,
                "typeName": "[u8; 32]"
              }
            ]
          }
        },
        "path": [
          "ink_primitives",
          "types",
          "AccountId"
        ]
      }
    },
    {
      "id": 1,
      "type": {
        "def": {
          "array": {
            "len": 32,
            "type": 2
          }
        }
      }
    },
    {
      "id": 2,
      "type": {
        "def": {
          "primitive": "u8"
        }
      }
    },
    {
      "id": 3,
      "type": {
        "def": {
          "primitive": "u128"
        }
      }
    },
    {
      "id": 4,
      "type": {
        "def": {
          "sequence": {
            "type": 2
          }
        }
      }
    },
    {
      "id": 5,
      "type": {
        "def": {
          "composite": {}
        },
        "params": [
          {
            "name": "K",
            "type": 0
          },
          {
            "name": "V",
            "type": 4
          },
          {
            "name": "KeyType",
            "type": 6
          }
        ],
        "path": [
          "ink_storage",
          "lazy",
          "mapping",
          "Mapping"
        ]
      }
    },
    {
      "id": 6,
      "type": {
        "def": {
          "composite": {}
        },
        "params": [
          {
            "name": "L",
            "type": 7
          },
          {
            "name": "R",
            "type": 8
          }
        ],
        "path": [
          "ink_storage_traits",
          "impls",
          "ResolverKey"
        ]
      }
    },
    {
      "id": 7,
      "type": {
        "def": {
          "composite": {}
        },
        "path": [
          "ink_storage_traits",
          "impls",
          "AutoKey"
        ]
      }
    },
    {
      "id": 8,
      "type": {
        "def": {
          "composite": {}
        },
        "params": [
          {
            "name": "ParentKey",
            "type": 9
          }
        ],
        "path": [
          "ink_storage_traits",
          "impls",
          "ManualKey"
        ]
      }
    },
    {
      "id": 9,
      "type": {
        "def": {
          "tuple": []
        }
      }
    },
    {
      "id": 10,
      "type": {
        "def": {
          "composite": {}
        },
        "params": [
          {
            "name": "K",
            "type": 4
          },
          {
            "name": "V",
            "type": 11
          },
          {
            "name": "KeyType",
            "type": 12
          }
        ],
        "path": [
          "ink_storage",
          "lazy",
          "mapping",
          "Mapping"
        ]
      }
    },
    {
      "id": 11,
      "type": {
        "def": {
          "composite": {
            "fields": [
              {
                "name": "iv",
                "type": 4,
                "typeName": "Vec<u8>"
              },
              {
                "name": "ciphertext",
                "type": 4,
                "typeName": "Vec<u8>"
              }
            ]
          }
        },
        "path": [
          "keyvault",
          "keyvault",
          "EncryptedEntry"
        ]
      }
    },
    {
      "id": 12,
      "type": {
        "def": {
          "composite": {}
        },
        "params": [
          {
            "name": "L",
            "type": 7
          },
          {
            "name": "R",
            "type": 13
          }
        ],
        "path": [
          "ink_storage_traits",
          "impls",
          "ResolverKey"
        ]
      }
    },
    {
      "id": 13,
      "type": {
        "def": {
          "composite": {}
        },
        "params": [
          {
            "name": "ParentKey",
            "type": 9
          }
        ],
        "path": [
          "ink_storage_traits",
          "impls",
          "ManualKey"
        ]
      }
    },
    {
      "id": 14,
      "type": {
        "def": {
          "primitive": "u32"
        }
      }
    },
    {
      "id": 15,
      "type": {
        "def": {
          "composite": {}
        },
        "params": [
          {
            "name": "K",
            "type": 0
          },
          {
            "name": "V",
            "type": 14
          },
          {
            "name": "KeyType",
            "type": 16
          }
        ],
        "path": [
          "ink_storage",
          "lazy",
          "mapping",
          "Mapping"
        ]
      }
    },
    {
      "id": 16,
      "type": {
        "def": {
          "composite": {}
        },
        "params": [
          {
            "name": "L",
            "type": 7
          },
          {
            "name": "R",
            "type": 17
          }
        ],
        "path": [
          "ink_storage_traits",
          "impls",
          "ResolverKey"
        ]
      }
    },
    {
      "id": 17,
      "type": {
        "def": {
          "composite": {}
        },
        "params": [
          {
            "name": "ParentKey",
            "type": 9
          }
        ],
        "path": [
          "ink_storage_traits",
          "impls",
          "ManualKey"
        ]
      }
    },
    {
      "id": 18,
      "type": {
        "def": {
          "composite": {
            "fields": [
              {
                "name": "owner",
                "type": 0,
                "typeName": "<AccountId as::ink::storage::traits::AutoStorableHint<::ink::\nstorage::traits::ManualKey<2114322686u32, ()>,>>::Type"
              },
              {
                "name": "fee",
                "type": 3,
                "typeName": "<Balance as::ink::storage::traits::AutoStorableHint<::ink::\nstorage::traits::ManualKey<3186155825u32, ()>,>>::Type"
              },
              {
                "name": "encryption_key_hash",
                "type": 5,
                "typeName": "<Mapping<AccountId, Vec<u8>> as::ink::storage::traits::\nAutoStorableHint<::ink::storage::traits::ManualKey<1173004374u32,\n()>,>>::Type"
              },
              {
                "name": "entries",
                "type": 10,
                "typeName": "<Mapping<Vec<u8>, EncryptedEntry> as::ink::storage::traits::\nAutoStorableHint<::ink::storage::traits::ManualKey<2380855268u32,\n()>,>>::Type"
              },
              {
                "name": "num_entries",
                "type": 15,
                "typeName": "<Mapping<AccountId, u32> as::ink::storage::traits::\nAutoStorableHint<::ink::storage::traits::ManualKey<691916752u32, ()\n>,>>::Type"
              },
              {
                "name": "latest_smart_contract_version",
                "type": 2,
                "typeName": "<u8 as::ink::storage::traits::AutoStorableHint<::ink::storage::\ntraits::ManualKey<2283449784u32, ()>,>>::Type"
              },
              {
                "name": "latest_smart_contract_address",
                "type": 19,
                "typeName": "<Option<AccountId> as::ink::storage::traits::AutoStorableHint<::\nink::storage::traits::ManualKey<3864815136u32, ()>,>>::Type"
              },
              {
                "name": "latest_compatible_browser_extension_version",
                "type": 14,
                "typeName": "<u32 as::ink::storage::traits::AutoStorableHint<::ink::storage\n::traits::ManualKey<392863162u32, ()>,>>::Type"
              }
            ]
          }
        },
        "path": [
          "keyvault",
          "keyvault",
          "KeyVault"
        ]
      }
    },
    {
      "id": 19,
      "type": {
        "def": {
          "variant": {
            "variants": [
              {
                "index": 0,
                "name": "None"
              },
              {
                "fields": [
                  {
                    "type": 0
                  }
                ],
                "index": 1,
                "name": "Some"
              }
            ]
          }
        },
        "params": [
          {
            "name": "T",
            "type": 0
          }
        ],
        "path": [
          "Option"
        ]
      }
    },
    {
      "id": 20,
      "type": {
        "def": {
          "variant": {
            "variants": [
              {
                "fields": [
                  {
                    "type": 9
                  }
                ],
                "index": 0,
                "name": "Ok"
              },
              {
                "fields": [
                  {
                    "type": 21
                  }
                ],
                "index": 1,
                "name": "Err"
              }
            ]
          }
        },
        "params": [
          {
            "name": "T",
            "type": 9
          },
          {
            "name": "E",
            "type": 21
          }
        ],
        "path": [
          "Result"
        ]
      }
    },
    {
      "id": 21,
      "type": {
        "def": {
          "variant": {
            "variants": [
              {
                "index": 1,
                "name": "CouldNotReadInput"
              }
            ]
          }
        },
        "path": [
          "ink_primitives",
          "LangError"
        ]
      }
    },
    {
      "id": 22,
      "type": {
        "def": {
          "variant": {
            "variants": [
              {
                "fields": [
                  {
                    "type": 23
                  }
                ],
                "index": 0,
                "name": "Ok"
              },
              {
                "fields": [
                  {
                    "type": 21
                  }
                ],
                "index": 1,
                "name": "Err"
              }
            ]
          }
        },
        "params": [
          {
            "name": "T",
            "type": 23
          },
          {
            "name": "E",
            "type": 21
          }
        ],
        "path": [
          "Result"
        ]
      }
    },
    {
      "id": 23,
      "type": {
        "def": {
          "variant": {
            "variants": [
              {
                "fields": [
                  {
                    "type": 9
                  }
                ],
                "index": 0,
                "name": "Ok"
              },
              {
                "fields": [
                  {
                    "type": 24
                  }
                ],
                "index": 1,
                "name": "Err"
              }
            ]
          }
        },
        "params": [
          {
            "name": "T",
            "type": 9
          },
          {
            "name": "E",
            "type": 24
          }
        ],
        "path": [
          "Result"
        ]
      }
    },
    {
      "id": 24,
      "type": {
        "def": {
          "variant": {
            "variants": [
              {
                "index": 0,
                "name": "AccountNotFound"
              },
              {
                "index": 1,
                "name": "AccountAlreadyExists"
              },
              {
                "index": 2,
                "name": "NotOwner"
              },
              {
                "index": 3,
                "name": "InsufficientPayment"
              },
              {
                "index": 4,
                "name": "IndexMismatch"
              },
              {
                "index": 5,
                "name": "TransferFailed"
              }
            ]
          }
        },
        "path": [
          "keyvault",
          "keyvault",
          "Error"
        ]
      }
    },
    {
      "id": 25,
      "type": {
        "def": {
          "variant": {
            "variants": [
              {
                "fields": [
                  {
                    "type": 26
                  }
                ],
                "index": 0,
                "name": "Ok"
              },
              {
                "fields": [
                  {
                    "type": 21
                  }
                ],
                "index": 1,
                "name": "Err"
              }
            ]
          }
        },
        "params": [
          {
            "name": "T",
            "type": 26
          },
          {
            "name": "E",
            "type": 21
          }
        ],
        "path": [
          "Result"
        ]
      }
    },
    {
      "id": 26,
      "type": {
        "def": {
          "variant": {
            "variants": [
              {
                "fields": [
                  {
                    "type": 4
                  }
                ],
                "index": 0,
                "name": "Ok"
              },
              {
                "fields": [
                  {
                    "type": 24
                  }
                ],
                "index": 1,
                "name": "Err"
              }
            ]
          }
        },
        "params": [
          {
            "name": "T",
            "type": 4
          },
          {
            "name": "E",
            "type": 24
          }
        ],
        "path": [
          "Result"
        ]
      }
    },
    {
      "id": 27,
      "type": {
        "def": {
          "sequence": {
            "type": 28
          }
        }
      }
    },
    {
      "id": 28,
      "type": {
        "def": {
          "tuple": [
            4,
            4
          ]
        }
      }
    },
    {
      "id": 29,
      "type": {
        "def": {
          "variant": {
            "variants": [
              {
                "fields": [
                  {
                    "type": 30
                  }
                ],
                "index": 0,
                "name": "Ok"
              },
              {
                "fields": [
                  {
                    "type": 21
                  }
                ],
                "index": 1,
                "name": "Err"
              }
            ]
          }
        },
        "params": [
          {
            "name": "T",
            "type": 30
          },
          {
            "name": "E",
            "type": 21
          }
        ],
        "path": [
          "Result"
        ]
      }
    },
    {
      "id": 30,
      "type": {
        "def": {
          "variant": {
            "variants": [
              {
                "fields": [
                  {
                    "type": 14
                  }
                ],
                "index": 0,
                "name": "Ok"
              },
              {
                "fields": [
                  {
                    "type": 24
                  }
                ],
                "index": 1,
                "name": "Err"
              }
            ]
          }
        },
        "params": [
          {
            "name": "T",
            "type": 14
          },
          {
            "name": "E",
            "type": 24
          }
        ],
        "path": [
          "Result"
        ]
      }
    },
    {
      "id": 31,
      "type": {
        "def": {
          "variant": {
            "variants": [
              {
                "fields": [
                  {
                    "type": 32
                  }
                ],
                "index": 0,
                "name": "Ok"
              },
              {
                "fields": [
                  {
                    "type": 21
                  }
                ],
                "index": 1,
                "name": "Err"
              }
            ]
          }
        },
        "params": [
          {
            "name": "T",
            "type": 32
          },
          {
            "name": "E",
            "type": 21
          }
        ],
        "path": [
          "Result"
        ]
      }
    },
    {
      "id": 32,
      "type": {
        "def": {
          "variant": {
            "variants": [
              {
                "fields": [
                  {
                    "type": 11
                  }
                ],
                "index": 0,
                "name": "Ok"
              },
              {
                "fields": [
                  {
                    "type": 24
                  }
                ],
                "index": 1,
                "name": "Err"
              }
            ]
          }
        },
        "params": [
          {
            "name": "T",
            "type": 11
          },
          {
            "name": "E",
            "type": 24
          }
        ],
        "path": [
          "Result"
        ]
      }
    },
    {
      "id": 33,
      "type": {
        "def": {
          "variant": {
            "variants": [
              {
                "fields": [
                  {
                    "type": 34
                  }
                ],
                "index": 0,
                "name": "Ok"
              },
              {
                "fields": [
                  {
                    "type": 21
                  }
                ],
                "index": 1,
                "name": "Err"
              }
            ]
          }
        },
        "params": [
          {
            "name": "T",
            "type": 34
          },
          {
            "name": "E",
            "type": 21
          }
        ],
        "path": [
          "Result"
        ]
      }
    },
    {
      "id": 34,
      "type": {
        "def": {
          "variant": {
            "variants": [
              {
                "fields": [
                  {
                    "type": 35
                  }
                ],
                "index": 0,
                "name": "Ok"
              },
              {
                "fields": [
                  {
                    "type": 24
                  }
                ],
                "index": 1,
                "name": "Err"
              }
            ]
          }
        },
        "params": [
          {
            "name": "T",
            "type": 35
          },
          {
            "name": "E",
            "type": 24
          }
        ],
        "path": [
          "Result"
        ]
      }
    },
    {
      "id": 35,
      "type": {
        "def": {
          "sequence": {
            "type": 11
          }
        }
      }
    },
    {
      "id": 36,
      "type": {
        "def": {
          "variant": {
            "variants": [
              {
                "fields": [
                  {
                    "type": 0
                  }
                ],
                "index": 0,
                "name": "Ok"
              },
              {
                "fields": [
                  {
                    "type": 21
                  }
                ],
                "index": 1,
                "name": "Err"
              }
            ]
          }
        },
        "params": [
          {
            "name": "T",
            "type": 0
          },
          {
            "name": "E",
            "type": 21
          }
        ],
        "path": [
          "Result"
        ]
      }
    },
    {
      "id": 37,
      "type": {
        "def": {
          "variant": {
            "variants": [
              {
                "fields": [
                  {
                    "type": 38
                  }
                ],
                "index": 0,
                "name": "Ok"
              },
              {
                "fields": [
                  {
                    "type": 21
                  }
                ],
                "index": 1,
                "name": "Err"
              }
            ]
          }
        },
        "params": [
          {
            "name": "T",
            "type": 38
          },
          {
            "name": "E",
            "type": 21
          }
        ],
        "path": [
          "Result"
        ]
      }
    },
    {
      "id": 38,
      "type": {
        "def": {
          "variant": {
            "variants": [
              {
                "fields": [
                  {
                    "type": 0
                  }
                ],
                "index": 0,
                "name": "Ok"
              },
              {
                "fields": [
                  {
                    "type": 24
                  }
                ],
                "index": 1,
                "name": "Err"
              }
            ]
          }
        },
        "params": [
          {
            "name": "T",
            "type": 0
          },
          {
            "name": "E",
            "type": 24
          }
        ],
        "path": [
          "Result"
        ]
      }
    },
    {
      "id": 39,
      "type": {
        "def": {
          "variant": {
            "variants": [
              {
                "fields": [
                  {
                    "type": 40
                  }
                ],
                "index": 0,
                "name": "Ok"
              },
              {
                "fields": [
                  {
                    "type": 21
                  }
                ],
                "index": 1,
                "name": "Err"
              }
            ]
          }
        },
        "params": [
          {
            "name": "T",
            "type": 40
          },
          {
            "name": "E",
            "type": 21
          }
        ],
        "path": [
          "Result"
        ]
      }
    },
    {
      "id": 40,
      "type": {
        "def": {
          "tuple": [
            2,
            2,
            0,
            14
          ]
        }
      }
    },
    {
      "id": 41,
      "type": {
        "def": {
          "variant": {
            "variants": [
              {
                "fields": [
                  {
                    "type": 3
                  }
                ],
                "index": 0,
                "name": "Ok"
              },
              {
                "fields": [
                  {
                    "type": 21
                  }
                ],
                "index": 1,
                "name": "Err"
              }
            ]
          }
        },
        "params": [
          {
            "name": "T",
            "type": 3
          },
          {
            "name": "E",
            "type": 21
          }
        ],
        "path": [
          "Result"
        ]
      }
    },
    {
      "id": 42,
      "type": {
        "def": {
          "composite": {
            "fields": [
              {
                "type": 1,
                "typeName": "[u8; 32]"
              }
            ]
          }
        },
        "path": [
          "ink_primitives",
          "types",
          "Hash"
        ]
      }
    },
    {
      "id": 43,
      "type": {
        "def": {
          "primitive": "u64"
        }
      }
    },
    {
      "id": 44,
      "type": {
        "def": {
          "variant": {}
        },
        "path": [
          "ink_env",
          "types",
          "NoChainExtension"
        ]
      }
    }
  ],
  "version": 5
};