import { CustomButton } from '@/components/CustomButton'
import { ContractIds } from '@/deployments/deployments'
import { usePostMessages } from '@/hooks/usePostMessages'
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
  const [numOnChain, setNumOnChain] = useState<number>(-1)
  const [state, setState] = useState<'submitting' | 'submitted' | 'success' | 'failure'>(
    'submitting',
  )
  const [, postMessage] = usePostMessages('action')
  const [sent, setSent] = useState<boolean>(false)

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
    if (isError) {
      console.error('Account not found!!!\n', decodeOutput)
    } else {
      const num = parseInt(output.Ok as unknown as string)
      setNumOnChain(num)
    }
  }

  useEffect(() => {
    if (!(api && contract && activeAccount?.address)) return
    getNumberOfEntries()

    // get encrypted entries from sessionStorage
    let encryptedString: string | Encrypted[] | null = sessionStorage.getItem('encrypted')
    try {
      encryptedString = JSON.parse(encryptedString as string) as Encrypted[]
    } catch (e) {
      encryptedString = encryptedString as Encrypted[]
    }

    if (encryptedString) {
      const encryptedArray = encryptedString.map((entry: Encrypted) => [entry.iv, entry.ciphertext])
      setEncrypted(encryptedArray)
    }
  }, [api, activeAccount, contract])

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (!activeAccount || !contract || !activeSigner || !api) {
      return
    }

    // Assumption: encrypted[0..numOnChain] are already on-chain
    //      and so need to sync encrypted[numOnChain..]
    // TODO: remove this assumption
    if (encrypted.slice(numOnChain).length === 0) {
      setState('success')
      return
    }

    try {
      setSent(true)
      await contractTxWithToast(api, activeAccount.address, contract, 'addEntries', {}, [
        numOnChain,
        encrypted.slice(numOnChain),
      ])
      postMessage('TO_EXTENSION', 'SYNC_SUCCESS', { numOnChain: encrypted.length })
      setState('success')
    } catch (e) {
      console.error('handleSubmit Error: ', e)
      setState('failure')
    }
    setSent(false)
  }

  return (
    <VStack>
      <Heading fontSize={'3xl'} my={4} as={'pre'}>
        Sync credentials
      </Heading>
      <Heading fontSize={'xl'} my={4} as={'pre'}>
        Number of credentials to be synced: {encrypted.length - numOnChain}
      </Heading>

      {state === 'submitting' && (
        <CustomButton
          colorScheme="primary"
          onClick={handleSubmit}
          isDisabled={sent || encrypted.length <= numOnChain}
        >
          {encrypted.length <= numOnChain ? 'Already synced' : 'Sync'}
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
