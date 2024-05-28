import { ContractIds } from '@/deployments/deployments'
import { contractTxWithToast } from '@/utils/contractTxWithToast'
import { truncateHash } from '@/utils/truncateHash'
import { Box, Button, FormControl, FormLabel, HStack, Heading, Text } from '@chakra-ui/react'
import { encodeAddress } from '@polkadot/util-crypto'
import { useInkathon, useRegisteredContract } from '@scio-labs/use-inkathon'
import { useState } from 'react'
import { AccountName, ConnectButton } from './web3/ConnectButton'

type AccountResetPropsType = {
  context: Record<string, any>
  postMessage: (type: 'TO_EXTENSION', action: string, context: Record<string, any>) => void
}

export const AccountReset = ({ context, postMessage }: AccountResetPropsType) => {
  const { api, activeAccount, activeChain, activeSigner } = useInkathon()
  const connected = activeAccount?.address ? true : false
  const [isLoading, setIsLoading] = useState(false)
  const { contract } = useRegisteredContract(ContractIds.KeyVault)
  const [accountReset, setAccountReset] = useState<boolean>(false)

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (!activeAccount || !contract || !activeSigner || !api) {
      return
    }

    setIsLoading(true)

    let errored = false // used to emulate python's `else` part of try-except-else
    try {
      await contractTxWithToast(api, activeAccount.address, contract, 'resetAccount', {}, [
        context.encryptionKeyHash,
      ])
      // `postMessage` will not be executed until after `await contractTxWithToast` is done
      postMessage('TO_EXTENSION', 'ACCOUNT_RESET_SUCCESS', {})
    } catch (e: unknown) {
      errored = true
      // check if account already exists
      if (
        e &&
        typeof e === 'object' &&
        'errorMessage' in e &&
        e.errorMessage === 'AccountAlreadyExists'
      ) {
        setAccountReset(true)
      } else {
        console.error(e)
      }
      postMessage('TO_EXTENSION', 'ACCOUNT_RESET_FAILURE', {})
    } finally {
      setIsLoading(false)
      if (!errored) {
        setAccountReset(true)
      }
    }
  }

  const TxSubmission = () => (
    <>
      <Box my={4} textAlign="left">
        <form>
          {/* Wallet address */}
          <FormControl my={12}>
            <FormLabel>
              <Heading size="lg">Resetting account with address:</Heading>
            </FormLabel>

            {/* Make sure user is connected to wallet */}
            {activeAccount?.address ? (
              <HStack
                spacing={4}
                borderBottom="1px"
                width={'fit-content'}
                mx={'auto'}
                px={1}
                pt={2}
                alignItems={'center'}
              >
                <AccountName account={activeAccount} />
                <Text fontSize="lg" fontWeight="normal" opacity={0.8}>
                  (
                  {truncateHash(
                    encodeAddress(activeAccount.address, activeChain?.ss58Prefix || 42),
                    8,
                  )}
                  )
                </Text>
              </HStack>
            ) : (
              <>
                <ConnectButton />
                <Text textColor={'gray.200'} opacity={0.75} mt={4}>
                  Note: Before you can reset your account, you must first connect to your preferred
                  substrate wallet.
                </Text>
              </>
            )}
          </FormControl>

          {/* Submission */}
          <Button
            width="full"
            py={4}
            my={8}
            type="submit"
            colorScheme="purple"
            fontSize={'xl'}
            isDisabled={!connected}
            isLoading={isLoading}
            onClick={handleSubmit}
          >
            Reset Account
          </Button>
        </form>
      </Box>
    </>
  )

  return (
    <Box px={12} py={4} border={'1px'} rounded={'2xl'}>
      <TxSubmission />
    </Box>
  )
}
