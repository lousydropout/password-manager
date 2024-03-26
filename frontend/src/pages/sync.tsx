import { CustomButton } from '@/components/CustomButton'
import { ContractIds } from '@/deployments/deployments'
import { contractTxWithToast } from '@/utils/contractTxWithToast'
import { Heading, VStack } from '@chakra-ui/react'
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

const MAX_CALL_WEIGHT = new BN(5_000_000_000_000).isub(BN_ONE)
const PROOFSIZE = new BN(1_000_000)

type Encrypted = {
  iv: string
  ciphertext: string
}

const HomePage: NextPage = () => {
  const { api, activeAccount, activeChain, activeSigner } = useInkathon()
  const { contract } = useRegisteredContract(ContractIds.KeyVault)
  const [encrypted, setEncrypted] = useState<string[][]>([])
  const [numEntries, setNumEntries] = useState<number>(-1)
  const [numOnChain, setNumOnChain] = useState<number>(-1)
  const [state, setState] = useState<'submitting' | 'submitted' | 'success' | 'failure'>(
    'submitting',
  )

  const getNumberOfEntries = async () => {
    if (!api || !contract || !activeAccount) return
    const options: ContractOptions = {
      gasLimit: api.registry.createType('WeightV2', {
        refTime: MAX_CALL_WEIGHT,
        proofSize: PROOFSIZE,
      }) as unknown as WeightV2,
      storageDepositLimit: null,
    }

    const result = await contractQuery(api, '', contract, 'get_entry_count', options, [
      activeAccount.address,
    ])

    const { output, isError, decodedOutput } = decodeOutput(result, contract, 'get_entry_count')
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
    if (!(api && contract && activeAccount?.address)) return

    getNumberOfEntries()

    // get numOnChain from sessionStorage
    const numOnChainString = sessionStorage.getItem('numOnChain')
    if (numOnChainString) {
      setNumOnChain(parseInt(numOnChainString))
    }
    console.log('numOnChain:', numOnChain)

    // get encrypted entries from sessionStorage
    let encryptedString: string | Encrypted[] | null = sessionStorage.getItem('encrypted')
    try {
      encryptedString = JSON.parse(encryptedString as string) as Encrypted[]
    } catch (e) {
      encryptedString = encryptedString as Encrypted[]
    }

    if (encryptedString) {
      console.log('encryptedString:', typeof encryptedString, encryptedString)
      const encryptedArray = encryptedString.map((entry: Encrypted) => [entry.iv, entry.ciphertext])
      setEncrypted(encryptedArray)
      console.log('encryptedArray:', encryptedArray)
    }
  }, [api, activeAccount, contract])

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (!activeAccount || !contract || !activeSigner || !api) {
      return
    }

    if (encrypted.slice(numOnChain).length === 0) {
      console.log('No new entries to sync')
      setState('success')
      return
    }

    try {
      console.log('numOnChain:', numOnChain, encrypted.slice(numOnChain))
      await contractTxWithToast(api, activeAccount.address, contract, 'addEntries', {}, [
        numOnChain,
        encrypted.slice(numOnChain),
      ])
      setState('success')
    } catch (e) {
      console.error('handleSubmit Error: ', e)
      setState('failure')
    }
  }

  return (
    <VStack>
      <Heading fontSize={'3xl'} my={4} as={'pre'}>
        Sync credentials
      </Heading>

      {state === 'submitting' && (
        <CustomButton colorScheme="primary" onClick={handleSubmit}>
          Sync
        </CustomButton>
      )}

      {state === 'submitted' && (
        <CustomButton colorScheme="primary" disabled>
          Sync (submitted)
        </CustomButton>
      )}

      {state === 'success' && (
        <Heading fontSize={'3xl'} my={4} as={'pre'}>
          Sync successful. You can close this browser now
        </Heading>
      )}

      {state === 'failure' && (
        <>
          <Heading fontSize={'3xl'} my={4} as={'pre'}>
            Sync failed.
          </Heading>
          <CustomButton colorScheme="primary" onClick={handleSubmit}>
            Try again.
          </CustomButton>
        </>
      )}
    </VStack>
  )
}

export default HomePage
