import { ContractIds } from '@/deployments/deployments'
import { contractTxWithToast } from '@/utils/contractTxWithToast'
import { Button, Card, FormControl, FormLabel, Input, Stack } from '@chakra-ui/react'
import {
  contractQuery,
  decodeOutput,
  useInkathon,
  useRegisteredContract,
} from '@scio-labs/use-inkathon'
import { FC, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import 'twin.macro'

type UpdateNumberValues = { number: number }

export const PasswordManagerContractInteractions: FC = () => {
  const { api, activeAccount, activeSigner } = useInkathon()
  const { contract, address: contractAddress } = useRegisteredContract(ContractIds.PasswordManager)
  const [number, setNumber] = useState<number>()
  const [fetchIsLoading, setFetchIsLoading] = useState<boolean>()
  const [updateIsLoading, setUpdateIsLoading] = useState<boolean>()
  const { register, reset, handleSubmit } = useForm<UpdateNumberValues>()

  // Fetch Number
  const fetchNumber = async () => {
    if (!contract || !api) return

    setFetchIsLoading(true)
    try {
      const result = await contractQuery(api, '', contract, 'numberOfKeysOfAccount', {}, [
        activeAccount?.address,
      ])
      const { output, isError, decodedOutput } = decodeOutput(
        result,
        contract,
        'numberOfKeysOfAccount',
      )
      if (isError) throw new Error(decodedOutput)
      setNumber(output)
    } catch (e) {
      console.error(e)
      toast.error('Error while fetching password manager. Try again…')
      setNumber(-1)
    } finally {
      setFetchIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNumber()
  }, [contract, activeAccount])

  // Update Number
  const updateNumber = async ({ number }: UpdateNumberValues) => {
    if (!activeAccount || !contract || !activeSigner || !api) {
      toast.error('Wallet not connected. Try again…')
      return
    }

    // Send transaction
    setUpdateIsLoading(true)
    try {
      await contractTxWithToast(api, activeAccount.address, contract, 'setNumberOfKeys', {}, [
        number,
      ])
      reset()
    } catch (e) {
      console.error(e)
    } finally {
      setUpdateIsLoading(false)
      fetchNumber()
    }
  }

  if (!api) return null

  return (
    <>
      <div tw="flex grow flex-col space-y-4 max-w-[20rem]">
        <h2 tw="text-center font-mono text-gray-400">Password Manager Smart Contract</h2>

        {/* Fetched Number */}
        <Card variant="outline" p={4} bgColor="whiteAlpha.100">
          <FormControl>
            <FormLabel>Fetched Number</FormLabel>
            <Input
              placeholder={fetchIsLoading || !contract ? 'Loading…' : number?.toString()}
              disabled={true}
            />
          </FormControl>
        </Card>

        {/* Update Number */}
        <Card variant="outline" p={4} bgColor="whiteAlpha.100">
          <form onSubmit={handleSubmit(updateNumber)}>
            <Stack direction="row" spacing={2} align="end">
              <FormControl>
                <FormLabel>Update Number</FormLabel>
                <Input disabled={updateIsLoading} {...register('number')} />
              </FormControl>
              <Button
                type="submit"
                mt={4}
                colorScheme="purple"
                isLoading={updateIsLoading}
                disabled={updateIsLoading}
              >
                Submit
              </Button>
            </Stack>
          </form>
        </Card>

        {/* Contract Address */}
        <p tw="text-center font-mono text-xs text-gray-600">
          {contract ? contractAddress : 'Loading…'}
        </p>
      </div>
    </>
  )
}
