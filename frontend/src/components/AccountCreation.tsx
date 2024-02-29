import { ContractIds } from '@/deployments/deployments'
import { KeyVault } from '@/pages'
import { contractTxWithToast } from '@/utils/contractTxWithToast'
import { truncateHash } from '@/utils/truncateHash'
import { Link as ChakraLink } from '@chakra-ui/next-js'
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  Text,
} from '@chakra-ui/react'
import { encodeAddress } from '@polkadot/util-crypto'
import { useInkathon, useRegisteredContract } from '@scio-labs/use-inkathon'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { AccountName, ConnectButton } from './web3/ConnectButton'

type AccountCreationPropsType = {
  keyvault: KeyVault
  setKeyvault: Dispatch<SetStateAction<KeyVault>>
}

export const AccountCreation = ({ keyvault, setKeyvault }: AccountCreationPropsType) => {
  const { api, activeAccount, activeChain, activeSigner } = useInkathon()
  const connected = activeAccount?.address ? true : false
  const [termsContent, setTermsContent] = useState('')
  const [isAgreed, setIsAgreed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { contract } = useRegisteredContract(ContractIds.KeyVault)
  const [accountCreated, setAccountCreated] = useState<boolean>(false)

  // get terms and conditions
  useEffect(() => {
    fetch('/terms.md')
      .then((res) => res.text())
      .then((text) => setTermsContent(text))
  }, [])

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (!activeAccount || !contract || !activeSigner || !api) {
      return
    }

    setIsLoading(true)

    let errored = false // used to emulate python's `else` part of try-except-else
    try {
      await contractTxWithToast(api, activeAccount.address, contract, 'createAccount', {}, [true])
    } catch (e: unknown) {
      errored = true
      // check if account already exists
      if (
        e &&
        typeof e === 'object' &&
        'errorMessage' in e &&
        e.errorMessage === 'AccountAlreadyExists'
      ) {
        setAccountCreated(true)
      } else {
        console.error(e)
      }
    } finally {
      setIsLoading(false)
      if (!errored) {
        setAccountCreated(true)
      }
    }
  }

  const gotoDashboard = () => {
    window.postMessage(
      { type: 'ACCOUNT_CREATED', address: activeAccount?.address },
      window.location.origin,
    )
    setKeyvault((prev) => ({ ...prev, createdAccount: true }))
  }

  const TxSubmission = () => (
    <>
      <Box textAlign="center" mb={16}>
        <Heading size="3xl">Account Creation</Heading>
      </Box>
      <Box my={4} textAlign="left">
        <form>
          {/* Wallet address */}
          <FormControl my={12}>
            <FormLabel>
              <Heading size="lg">Creating an account for address:</Heading>
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
                  Note: Before you can submit a &ldquo;Create Account&rdquo; transaction, you must
                  first connect to your preferred substrate wallet.
                </Text>
              </>
            )}
          </FormControl>

          {/* Terms and Conditions */}
          <HStack alignItems={'center'} mb={4}>
            <Checkbox
              isChecked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
              colorScheme="purple"
            ></Checkbox>
            <Text>
              I agree to the{' '}
              <ChakraLink href="/terms" target="_blank" colorScheme="purple" color={'purple.300'}>
                Terms and Conditions
              </ChakraLink>
            </Text>
          </HStack>
          {/* Submission */}
          <Button
            width="full"
            py={4}
            my={8}
            type="submit"
            colorScheme="purple"
            fontSize={'xl'}
            isDisabled={!(connected && isAgreed)}
            isLoading={isLoading}
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </form>
      </Box>
    </>
  )

  const CreationSuccessful = () => (
    <>
      <Box textAlign="center" mb={16}>
        <Heading size="3xl">Your account has been successfully created!</Heading>
      </Box>
      <Button
        width="full"
        py={4}
        my={8}
        type="submit"
        colorScheme="purple"
        fontSize={'xl'}
        onClick={gotoDashboard}
      >
        Go to dashboard
      </Button>
    </>
  )

  return (
    <Box p={12} border={'1px'} rounded={'2xl'}>
      {accountCreated ? <CreationSuccessful /> : <TxSubmission />}
    </Box>
  )
}
