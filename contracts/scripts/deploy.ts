import { deployContract } from '@scio-labs/use-inkathon'
import * as dotenv from 'dotenv'
import { getDeploymentData } from './utils/getDeploymentData'
import { initPolkadotJs } from './utils/initPolkadotJs'
import { writeContractAddresses } from './utils/writeContractAddresses'

// [KEEP THIS] Dynamically load environment from `.env.{chainId}`
const chainId = process.env.CHAIN || 'development'
dotenv.config({
  path: `.env.${chainId}`,
})

/**
 * Script that deploys the password manager contract and writes its address to a file.
 *
 * Parameters:
 *  - `DIR`: Directory to read contract build artifacts (optional, defaults to `./deployments`)
 *  - `CHAIN`: Chain ID (optional, defaults to `development`)
 *
 * Example usage:
 *  - `pnpm run deploy`
 *  - `CHAIN=alephzero-testnet pnpm run deploy`
 */
const main = async () => {
  // [KEEP THIS] Initialization
  const accountUri = process.env.ACCOUNT_URI || '//Alice'
  const { api, chain, account } = await initPolkadotJs(chainId, accountUri)

  // Deploy password manager contract
  const { abi, wasm } = await getDeploymentData('keyvault')
  const keyvault = await deployContract(api, account, abi, wasm, 'new', [account.address, 0])

  // Write contract addresses to `{contract}/{network}.ts` file(s)
  await writeContractAddresses(chain.network, {
    keyvault,
  })
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => process.exit(0))
