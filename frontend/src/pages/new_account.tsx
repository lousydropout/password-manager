import { AccountCreation } from '@/components/AccountCreation'
import { ConnectButton } from '@/components/web3/ConnectButton'
import { ContractIds } from '@/deployments/deployments'
import { usePostMessages } from '@/hooks/usePostMessages'
import { useSessionStorage } from '@/hooks/useSessionStorage'
import { Heading, Text, VStack } from '@chakra-ui/react'
import { ContractOptions } from '@polkadot/api-contract/types'
import { WeightV2 } from '@polkadot/types/interfaces'
import { BN, BN_ONE } from '@polkadot/util'
import {
  contractQuery,
  decodeOutput,
  useInkathon,
  useRegisteredContract,
} from '@scio-labs/use-inkathon'
import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import 'twin.macro'

export interface KeyVault {
  createdAccount: boolean
}

const MAX_CALL_WEIGHT = new BN(5_000_000_000_000).isub(BN_ONE)
const PROOFSIZE = new BN(1_000_000)

type States = 'home screen' | 'create or reset' | 'account dashboard'

const HomePage: NextPage = () => {
  const { api, activeAccount, activeChain, activeSigner } = useInkathon()
  const { contract } = useRegisteredContract(ContractIds.KeyVault)
  // for preventing premature passing-of-state and rendering
  const [ready, setReady] = useSessionStorage<boolean>('ready', false)
  const [keyvault, setKeyvault] = useState<KeyVault>({ createdAccount: false })
  const [state, setState] = useState<States>('home screen')
  const [numEntries, setNumEntries] = useSessionStorage<number>('numEntries', -1)
  const [_walletAddress, postWalletAddress] = usePostMessages('walletAddress')
  const [, postAccountCreationStatus] = usePostMessages('accountCreationStatus')

  useEffect(() => {
    if (activeAccount?.address) {
      postWalletAddress('TO_EXTENSION', 'FOUND_ADDRESS', { accountAddress: activeAccount.address })
    }
  }, [activeAccount])

  // read from sessionStorage
  useEffect(() => {
    const storedData = window.sessionStorage.getItem('keyvault')
    if (storedData) {
      setKeyvault(JSON.parse(storedData))
      setReady(true)
    }
  }, [])

  const getNumberOfEntries = async () => {
    if (!api || !contract || !activeAccount) return
    const options: ContractOptions = {
      gasLimit: api.registry.createType('WeightV2', {
        refTime: MAX_CALL_WEIGHT,
        proofSize: PROOFSIZE,
      }) as unknown as WeightV2,
      storageDepositLimit: null,
    }

    const result = await contractQuery(
      api,
      activeAccount.address,
      contract,
      'get_entry_count_by_account_id',
      options,
      // ['bbnuHav2YekNJM8GVYxzbKtgdq4eBUxyrgXyAJSReWRSzxj'],
      [activeAccount.address],
    )
    // 2 approaches to get `num`
    // 1st approach
    // const num = result.output?.toHuman() as unknown as { Ok?: { Ok?: string; Err?: string } }
    // console.log('[getNumberOfEntries] 1 -- num: ', num)
    // if (num?.Ok?.Ok) setNumEntries(parseInt(num?.Ok.Ok))
    // if (num?.Ok?.Err) console.error('Account not found!!!')
    // const num

    // 2nd approach
    const { output, isError, decodedOutput } = decodeOutput(
      result,
      contract,
      'get_entry_count_by_account_id',
    )
    console.log('output: ', output)
    if (isError) {
      console.error('Account not found!!!\n', decodeOutput)
    } else {
      const num = parseInt(output.Ok as unknown as string)
      console.log('[getNumberOfEntries] num: ', num)
      setNumEntries(num)
    }
  }

  useEffect(() => {
    if (api && contract && activeAccount?.address) {
      getNumberOfEntries()
    }
  }, [api, activeAccount, contract])

  useEffect(() => {
    if (activeAccount && numEntries > -1) {
      postAccountCreationStatus('')
    }
  }, [numEntries])

  return (
    <VStack>
      {/* connect wallet */}
      {!activeAccount && (
        <>
          <Heading as={'h1'} fontSize={'7xl'} mt={40}>
            Welcome to KeyVault!
          </Heading>
          <Heading textAlign={'center'} my={12} fontSize={'2xl'} maxWidth={'3xl'}>
            KeyVault is a password manager secured by blockchain and military-grade cryptography,
            meaning your passwords are in safe hands!
          </Heading>
          <Text fontSize={'3xl'} mb={8}>
            Before we begin, please connect to your preferred substrate wallet.
          </Text>
          <ConnectButton />
        </>
      )}
      {activeAccount && numEntries > -1 && (
        <>
          <Heading as={'h2'} fontSize={'5xl'} mt={40}>
            There is already an account associated with ({activeAccount.name}){' '}
            {activeAccount.address}.
          </Heading>
          <Text>Please return to the KeyVault browser extension.</Text>
        </>
      )}
      {activeAccount && numEntries < 0 && (
        <AccountCreation keyvault={keyvault} setKeyvault={setKeyvault} />
      )}
    </VStack>
  )
}

export default HomePage
