import { ApiPromise, Keyring } from '@polkadot/api'
import { IKeyringPair } from '@polkadot/types/types/interfaces'
import { BN } from '@polkadot/util'
import {
  SubstrateChain,
  getSubstrateChain,
  initPolkadotJs as initApi,
} from '@scio-labs/use-inkathon'

/**
 * Initialize Polkadot.js API with given RPC & account from given URI.
 */
export type InitParams = {
  chain: SubstrateChain
  api: ApiPromise
  keyring: Keyring
  account: IKeyringPair
  decimals: number
  prefix: number
  toBNWithDecimals: (_: number | string) => BN
}
export const initPolkadotJs = async (chainId: string, uri: string): Promise<InitParams> => {
  const chain = getSubstrateChain(chainId)
  if (!chain) throw new Error(`Chain '${chainId}' not found`)

  // Initialize api
  const { api } = await initApi(chain)

  // Get decimals & prefix
  const decimals = api.registry.chainDecimals?.[0] || 12
  const prefix = api.registry.chainSS58 || 42
  const toBNWithDecimals = (n: number | string) => new BN(n).mul(new BN(10).pow(new BN(decimals)))

  // Initialize account & set signer
  const keyring = new Keyring({ type: 'sr25519' })
  const account = keyring.addFromUri(uri)

  return { api, chain, keyring, account, decimals, prefix, toBNWithDecimals }
}
