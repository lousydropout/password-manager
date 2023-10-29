import { PasswordCard } from '@/components/web3/PasswordCard'
import { ContractIds } from '@/deployments/deployments'
import {
  contractQuery,
  decodeOutput,
  useInkathon,
  useRegisteredContract,
} from '@scio-labs/use-inkathon'
import { FC, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import 'twin.macro'

type refetchPasswordValues = { n: number }
type DisplayPasswordsProps = { masterPassword: string }

export const DisplayPasswords: FC<DisplayPasswordsProps> = ({ masterPassword }) => {
  const { api, activeAccount, activeSigner } = useInkathon()
  const { contract, address: contractAddress } = useRegisteredContract(ContractIds.PasswordManager)
  const [lastUpdated, setLastUpdated] = useState<number[]>([])
  const [number, setNumber] = useState<number>()
  const [encryptedTexts, setEncryptedTexts] = useState<string[]>([])
  const [fetchIsLoading, setFetchIsLoading] = useState<boolean>()
  const [updateIsLoading, setUpdateIsLoading] = useState<boolean>()

  // Fetch Number
  const fetchNumber = async () => {
    if (!contract || !api) return
    console.info('calling fetchNumber')

    setFetchIsLoading(true)
    try {
      const getLastUpdatedResult = await contractQuery(api, '', contract, 'getLastUpdated', {}, [
        activeAccount?.address,
      ])
      const { output, isError, decodedOutput } = decodeOutput(
        getLastUpdatedResult,
        contract,
        'getLastUpdated',
      )
      if (isError) throw new Error(decodedOutput)
      setLastUpdated(output)
      setNumber(output.length)
    } catch (e) {
      console.error(e)
      toast.error('Error while fetching password manager. Try again…')
      setNumber(-1)
    } finally {
      setFetchIsLoading(false)
    }
  }

  const fetchPasswords = async () => {
    if (!contract || !api) return

    const val = [...Array(lastUpdated.length)].map(() => '')
    setEncryptedTexts(val)

    // query passwords
    for (let number = 0; number < lastUpdated.length; number++) {
      const result = await contractQuery(api, '', contract, 'password', {}, [
        activeAccount?.address,
        number,
      ])
      const { output, isError, decodedOutput } = decodeOutput(result, contract, 'password')
      // if (isError) throw new Error(decodedOutput)
      setEncryptedTexts((value) => {
        const newVal = [...value]
        newVal[number] = output
        return newVal
      })
    }
  }

  useEffect(() => {
    fetchNumber()
  }, [contract, activeAccount])

  useEffect(() => {
    fetchPasswords()
  }, [lastUpdated])

  // Update Number
  const refetchPassword = async ({ n }: refetchPasswordValues) => {
    if (!activeAccount || !contract || !activeSigner || !api) {
      toast.error('Wallet not connected. Try again…')
      return
    }

    // Send transaction
    try {
      const result = await contractQuery(api, '', contract, 'password', {}, [
        activeAccount?.address,
        n,
      ])
      const { output } = decodeOutput(result, contract, 'password')
      // if (isError) throw new Error(decodedOutput)
      setEncryptedTexts((value) => {
        const newValue = [...value]
        newValue[n] = output
        console.log('newValue: ', newValue)
        return newValue
      })
    } catch (e) {
      console.error(e)
    } finally {
      fetchNumber()
    }
  }

  if (!api) return null

  return (
    <>
      <div tw="flex grow flex-col space-y-4 max-w-[40rem]">
        <h2 tw="text-center font-mono text-gray-400">
          # passwords: {!contract ? 'Loading…' : number?.toString()}
        </h2>

        {/* Show passwords */}
        {encryptedTexts?.map((encryptedText, n) => (
          <PasswordCard
            masterPassword={masterPassword}
            encryptedText={encryptedText}
            n={n}
            key={n}
            refetch={() => refetchPassword({ n })}
          />
        ))}
      </div>
    </>
  )
}
