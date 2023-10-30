# Password Manager

`Password Manager` is a blockchain-based `password manager`. This means that your data are secured by blockchain and cyptographic means rather than by some third party's good will.

## A few details

- **frontend url:** https://password-manager-frontend-578yppkj9-lousydropouts-projects.vercel.app/
- **smart contract address:** VwSS9BGfuHHjMjukTVPWPdoMkJ7TwNxJURSZUBEhGKF1py2 (https://shibuya.subscan.io/account/VwSS9BGfuHHjMjukTVPWPdoMkJ7TwNxJURSZUBEhGKF1py2)
- **network:** Shibuya
- **smart contract code:** https://github.com/lousydropout/password-manager/blob/main/contracts/src/password_manager/lib.rs
- **helper cryptography code:** https://github.com/lousydropout/password-manager/blob/main/frontend/src/utils/crypto.ts

## Introduction

`Password Manager` is a simple password manager deployed on Astar's Shibuya network.

Note: Only the encrypted version of your username/passwords/url are stored on-chain. So, while your encrypted data are public, your secrets remain private.

## How does it work

`Password Manager` uses symmetric encryption (AES with CBC mode) with a user-determined `master password` or passphrase used as the secret key under-the-hood.

In particular, for this project, the data we care to store is, in essence,

```json
{
   "url": <url>,
   "username": <username>,
   "password": <password>,
   "description": <description>
}
```

So, when you tell the frontend to store a new url/username/password/description combination, it encrypts the JSON string using your `master password` and then sends the encrypted JSON string to the smart contract for storage.

Similarly, when you wish to decrypt the data, the encrypted JSON string is retrieved from the smart contract and then decrypted on the frontend.

As such, no body can access your data unless they have your `master password`.

## How to deploy and access the dapp locally

1. Rename `.env.local.example` as `.env.local`:
   ```bash
   mv frontend/.env.local.example frontend/.env.local
   ```
2. `cd` into `contracts/` and run `substrate-nodes` locally (keep this running):
   ```bash
   cd contracts/
   pnpm run node
   ```
3. Open a 2nd terminal to build and deploy (locally) the smart contract:
   ```bash
   cd contracts
   pnpm run build
   pnpm run deploy
   ```
4. Open a 3rd terminal for the frontend:
   ```bash
   cd frontend
   pnpm install
   pnpm run dev
   ```
5. A link should appear, likely `http://localhost:3000`. Open it up in your favorite web browser (one with a polkadot wallet extension installed).

## Future developments

There are 2 main extensions I wish to make in the future:

1. Create chrome/firefox extensions for this dapp so that it can work as a full-fledge password manager that we're all familiar with.
2. Generalize a few features so that `password manager` can also act as a decentralized `secrets/credentials/key manager`.

## Acknowledgement

This repo was forked from [scio-labs/inkathon](https://github.com/scio-labs/inkathon), a boilerplate repo that made developing and deploying `ink!`-based dapps incredibly easy!
