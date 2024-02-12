import { ContractIds } from '@/deployments/deployments'
import { contractTxWithToast } from '@/utils/contractTxWithToast'
import { Button, Card, FormControl, FormLabel, Input, Textarea, VStack } from '@chakra-ui/react'
import { useInkathon, useRegisteredContract } from '@scio-labs/use-inkathon'
import { FC, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { encrypt } from 'src/utils/crypto'
import 'twin.macro'

type PasswordMappingValues = {
  url: string
  username: string
  password: string
  description: string
}

type DisplayPasswordsProps = { masterPassword: string }

export const KeyVaultContractInteractions: FC<DisplayPasswordsProps> = ({ masterPassword }) => {
  const { api, activeAccount, activeSigner } = useInkathon()
  const { contract, address: contractAddress } = useRegisteredContract(ContractIds.KeyVault)
  const [updateIsLoading, setUpdateIsLoading] = useState<boolean>()
  const { register, reset, handleSubmit } = useForm<PasswordMappingValues>()

  // Add Password
  const addPassword = async (data: PasswordMappingValues) => {
    if (!activeAccount || !contract || !activeSigner || !api) {
      toast.error('Wallet not connected. Try again…')
      return
    }

    const unencrypted = JSON.stringify(data)
    const { encryptedText, iv } = await encrypt(unencrypted, masterPassword)
    const encrypted = `${iv}|${encryptedText}`

    // Send transaction
    setUpdateIsLoading(true)
    try {
      await contractTxWithToast(api, activeAccount.address, contract, 'addPassword', {}, [
        encrypted,
      ])
      reset()
    } catch (e) {
      console.error(e)
    } finally {
      setUpdateIsLoading(false)
    }
  }

  if (!api) return null

  return (
    <>
      <div tw="flex grow flex-col space-y-4 max-w-[20rem]">
        <h2 tw="text-center font-mono text-gray-400">Enter new password</h2>

        {/* Add Password */}
        <Card variant="outline" p={4} bgColor="whiteAlpha.100">
          <form onSubmit={handleSubmit(addPassword)}>
            <VStack spacing={2} align="end">
              <FormControl>
                <FormLabel>URL</FormLabel>
                <Input disabled={updateIsLoading} {...register('url')} />
              </FormControl>
              <FormControl>
                <FormLabel>Username</FormLabel>
                <Input disabled={updateIsLoading} {...register('username')} />
              </FormControl>
              <FormControl>
                <FormLabel>Password</FormLabel>
                <Input
                  disabled={updateIsLoading}
                  type="password"
                  autoComplete="new-password"
                  {...register('password')}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea disabled={updateIsLoading} {...register('description')} />
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
            </VStack>
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
