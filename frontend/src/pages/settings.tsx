import { ContractIds } from '@/deployments/deployments'
import { useMessageQueue } from '@/hooks/useMessageQueue'
import {
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

const MAX_CALL_WEIGHT = new BN(5_000_000_000_000).isub(BN_ONE)
const PROOFSIZE = new BN(1_000_000)

const Settings: NextPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { api, activeAccount, activeChain, activeSigner } = useInkathon()
  const { contract } = useRegisteredContract(ContractIds.KeyVault)
  const { messages, setListening } = useMessageQueue<string>('exampleVar', 4, false) // Initialize with expected number of responses

  const handleClick = () => {
    // Start listening for messages
    // startListening()
    setListening((prev) => !prev)
  }

  // Render the received messages
  const renderMessages = () => {
    return messages.map((message, index) => <div key={index}>{message}</div>)
  }

  return (
    <>
      <Heading size="2xl" mb={12}>
        Settings
      </Heading>

      <Button backgroundColor={'red.700'} onClick={onOpen} _hover={{ backgroundColor: 'red.800' }}>
        Delete my account
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Account Deletion</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Please note: By &quot;deleting&ldquo; your account, your encrypted passwords will no
            longer be accessible via the KeyVault smart contract. However, copies of your deleted,
            encrypted passwords remains on the blockchain (that said, we don&apos;t know how to
            access them ourselves).
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Nevermind
            </Button>
            <Button
              variant="solid"
              backgroundColor={'red.700'}
              _hover={{ backgroundColor: 'red.800' }}
              onClick={() => alert('deleted')}
            >
              Delete my account
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* print messages */}
      <div>
        <Button border={'1px'} p={4} mt={8} rounded={'lg'} onClick={handleClick}>
          Toggle listening
        </Button>
        <div>{renderMessages()}</div>
      </div>
    </>
  )
}

export default Settings
