import { ConnectButton } from '@/components/web3/ConnectButton'
import { ContractIds } from '@/deployments/deployments'
import { useFiniteStateMachine } from '@/hooks/useFiniteStateMachine'
import { Button, Heading, Input, Text, VStack } from '@chakra-ui/react'
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

type States = 'HOME' | 'ACCOUNT_CREATE' | 'ACCOUNT_RESET' | 'ACCOUNT_DASHBOARD'
const calculateNextState = (state: States, action: string) => state

const HomePage: NextPage = () => {
  const { api, activeAccount, activeChain, activeSigner } = useInkathon()
  const { contract } = useRegisteredContract(ContractIds.KeyVault)

  const [keyvault, setKeyvault] = useState<KeyVault>({ createdAccount: false })
  const [keyName, setKeyName] = useState<string>('')

  const [state, message, postMessage] = useFiniteStateMachine('HOME', calculateNextState)

  // useEffect(() => {
  //   const handleMessage = (event: MessageEvent) => {
  //     console.log('[webapp] event: ', event.data)
  //   }
  //   window.addEventListener('message', handleMessage)
  //   return () => {
  //     window.removeEventListener('message', handleMessage)
  //   }
  // })

  useEffect(() => {
    postMessage('TO_EXTENSION', 'REQUEST_CONTEXT', {})
  }, [])

  useEffect(() => {
    if (activeAccount?.address) {
      console.log('address: ', activeAccount.address)
      postMessage('TO_EXTENSION', 'UPDATE_CONTEXT', { walletAddress: activeAccount.address })
    }
  }, [activeAccount])

  // read from sessionStorage
  // useEffect(() => {
  //   const storedData = window.sessionStorage.getItem('keyvault')
  //   if (storedData) {
  //     setKeyvault(JSON.parse(storedData))
  //   }
  // }, [])

  const getEncryptionKeyHash = async () => {
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
      '',
      contract,
      'get_encryption_key_hash',
      options,
      // ['bbnuHav2YekNJM8GVYxzbKtgdq4eBUxyrgXyAJSReWRSzxj'],
      [activeAccount.address],
    )
    // 2nd approach
    const { output, isError, decodedOutput } = decodeOutput(
      result,
      contract,
      'get_encryption_key_hash',
    )
    console.log('[getEncryptionKeyHash] output: ', output)
    if (isError) {
      console.error('Account not found!!!\n', decodedOutput)
    } else {
      const encryptionHash = parseInt(output.Ok as unknown as string)
      console.log('[getEncryptionKeyHash] encryptionHash: ', encryptionHash)
      // setNumEntries(num)
    }
  }

  // useEffect(() => {
  //   if (api && contract && activeAccount?.address) {
  //     getEncryptionKeyHash()
  //   }
  // }, [api, activeAccount, contract])

  useEffect(() => {
    console.log('useEffect message: ', message)
  }, [message])

  return (
    <VStack>
      <Heading fontSize={'3xl'} my={4}>
        Context: {JSON.stringify(message.context)}
      </Heading>
      <Input
        onChange={(e) => {
          setKeyName(e.target.value)
        }}
      />
      <Button
        onClick={() => {
          postMessage('TO_EXTENSION', 'REQUEST', { newVar: keyName })
        }}
      >
        Request random data
      </Button>
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
      {
        // activeAccount && numEntries > -1 && <AccountDashboard />
      }
      {
        // activeAccount && numEntries < 0 && (
        //   <AccountCreation keyvault={keyvault} setKeyvault={setKeyvault} />
        // )
      }
    </VStack>
  )
}

export default HomePage
