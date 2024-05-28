import { ContractIds } from '@/deployments/deployments'
import { contractTxWithToast } from '@/utils/contractTxWithToast'
import {
  Box,
  Button,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react'
import { BN, BN_ONE } from '@polkadot/util'
import { useInkathon, useRegisteredContract } from '@scio-labs/use-inkathon'
import type { NextPage } from 'next'
import { toast } from 'react-hot-toast'

const MAX_CALL_WEIGHT = new BN(5_000_000_000_000).isub(BN_ONE)
const PROOFSIZE = new BN(1_000_000)

const Settings: NextPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { api, activeAccount, activeChain, activeSigner } = useInkathon()
  const { contract } = useRegisteredContract(ContractIds.KeyVault)

  const onReset = async () => {
    toast.success('Account reset')
    onClose()
  }

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (!activeAccount || !contract || !activeSigner || !api) {
      return
    }

    await contractTxWithToast(api, activeAccount.address, contract, 'createAccount', {}, [
      context.encryptionKeyHash,
    ])
  }

  return (
    <>
      <Box display="flex" flexDirection="column" alignItems="center">
        <Heading size="2xl" mb={12} textAlign={'center'}>
          Settings
        </Heading>

        <Heading size="md" as={'p'} mb={8}>
          Please note: By &quot;deleting&ldquo; your account, your encrypted passwords will no
          longer be accessible via the KeyVault smart contract. However, copies of your deleted,
          encrypted passwords remains on the blockchain (that said, we don&apos;t know how to access
          them ourselves).
        </Heading>

        <Button
          backgroundColor={'red.700'}
          onClick={onOpen}
          _hover={{ backgroundColor: 'red.800' }}
          width="fit-content"
          mx="auto"
        >
          Reset my account
        </Button>

        <Modal isOpen={isOpen} onClose={onClose} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Account Deletion</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              Are you sure you want to delete your account? This action cannot be undone.
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="purple" mr={3} onClick={onClose}>
                Nevermind
              </Button>
              <Button
                variant="solid"
                backgroundColor={'red.700'}
                _hover={{ backgroundColor: 'red.800' }}
                onClick={onReset}
              >
                Reset my account
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </>
  )
}

export default Settings
