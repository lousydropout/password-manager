import { AccountCreation } from '@/components/AccountCreation'
import { AccountReset } from '@/components/AccountReset'
import { State, calculateNextState } from '@/config/stateMachine'
import { ContractIds } from '@/deployments/deployments'
import { useFiniteStateMachine } from '@/hooks/useFiniteStateMachine'
import { truncateHash } from '@/utils/truncateHash'
import { Heading, VStack } from '@chakra-ui/react'
import { ContractOptions } from '@polkadot/api-contract/types'
import { WeightV2 } from '@polkadot/types/interfaces'
import { BN, BN_ONE } from '@polkadot/util'
import { encodeAddress } from '@polkadot/util-crypto'
import {
  contractQuery,
  decodeOutput,
  useInkathon,
  useRegisteredContract,
} from '@scio-labs/use-inkathon'
import type { NextPage } from 'next'
import { useEffect } from 'react'
import 'twin.macro'

const MAX_CALL_WEIGHT = new BN(5_000_000_000_000).isub(BN_ONE)
const PROOFSIZE = new BN(1_000_000)

const HomePage: NextPage = () => {
  const { api, activeAccount, activeChain, activeSigner } = useInkathon()
  const { contract } = useRegisteredContract(ContractIds.KeyVault)
  const [state, context, postMessage, setState] = useFiniteStateMachine<State>(
    'HOME',
    calculateNextState,
  )

  useEffect(() => {
    postMessage('TO_EXTENSION', 'REQUEST_CONTEXT', {})
  }, [])

  useEffect(() => {
    if (context.reset) setState('ACCOUNT_RESET')
  }, [context.reset])

  useEffect(() => {
    if (activeAccount?.address) {
      postMessage('TO_EXTENSION', 'UPDATE_CONTEXT', {
        walletAddress: activeAccount.address,
        truncatedAddress: truncateHash(
          encodeAddress(activeAccount.address, activeChain?.ss58Prefix || 42),
          8,
        ),
      })
      getEncryptionKeyHash()
    }
  }, [activeAccount?.address])

  const getEncryptionKeyHash = async () => {
    if (!api || !contract || !activeAccount) return
    const options: ContractOptions = {
      gasLimit: api.registry.createType('WeightV2', {
        refTime: MAX_CALL_WEIGHT,
        proofSize: PROOFSIZE,
      }) as unknown as WeightV2,
      storageDepositLimit: null,
    }

    const result = await contractQuery(api, '', contract, 'get_encryption_key_hash', options, [
      activeAccount.address,
    ])
    const { output, isError, decodedOutput } = decodeOutput(
      result,
      contract,
      'get_encryption_key_hash',
    )

    if (isError) {
      postMessage('TO_EXTENSION', 'FOUND_NO_ACCOUNT', { createdAccount: false })
      setState('ACCOUNT_CREATE')
    } else {
      const encryptionHash = output.Ok as unknown as string

      let correctKey: boolean
      if ('encryptionKeyHash' in context) {
        correctKey = encryptionHash === context.encryptionKeyHash
        postMessage('TO_EXTENSION', 'FOUND_ACCOUNT', {
          createdAccount: true,
          correctKey,
          oldEncryptionKeyHash: encryptionHash,
        })
      } else {
        postMessage('TO_EXTENSION', 'FOUND_ACCOUNT', {
          createdAccount: true,
          correctKey: true,
          oldEncryptionKeyHash: encryptionHash,
        })
      }
    }
  }

  useEffect(() => {
    if (api && contract && activeAccount?.address) {
      getEncryptionKeyHash()
    }
  }, [api, activeAccount, contract, activeAccount?.address])

  const Welcome = () => (
    <>
      <Heading as={'h1'} fontSize={'7xl'} mt={40}>
        Welcome to KeyVault!
      </Heading>
      <Heading textAlign={'center'} my={12} fontSize={'2xl'} maxWidth={'3xl'}>
        KeyVault is a password manager secured by blockchain and military-grade cryptography,
        meaning your passwords are in safe hands!
      </Heading>
    </>
  )

  const AccountRegistration = () => (
    <>
      <Heading textAlign={'center'} size="3xl">
        Account Registration
      </Heading>

      <Heading my={4} fontSize={'2xl'} maxWidth={'3xl'}>
        It seems that there is no account associated with your address (
        {truncateHash(
          encodeAddress(activeAccount?.address || '', activeChain?.ss58Prefix || 42),
          8,
        )}
        ). Let&apos;s register your address by submitting the transaction below.
      </Heading>

      <AccountCreation context={context} postMessage={postMessage} />
    </>
  )

  const AccountResetPage = () => (
    <>
      <Heading textAlign={'center'} size="3xl">
        Account Reset
      </Heading>

      <Heading my={4} fontSize={'2xl'} maxWidth={'3xl'}>
        Are you sure you want to reset your account (address
        {truncateHash(
          encodeAddress(activeAccount?.address || '', activeChain?.ss58Prefix || 42),
          8,
        )}
        )? This will effectively delete your passwords and reset encryption key.
      </Heading>

      <AccountReset context={context} postMessage={postMessage} />
    </>
  )

  const AccountFound = () => {
    return (
      <>
        <Heading textAlign={'center'} size="2xl" mb={8}>
          Found your account!
        </Heading>
        <Heading my={4} fontSize={'2xl'} maxWidth={'3xl'}>
          To continue, please choose between either &ldquo;importing your encryption key&rdquo; or
          &ldquo;resetting your account&rdquo; via your KeyVault side panel.
        </Heading>
      </>
    )
  }

  return (
    <>
      <Heading as={'h1'} fontSize={'7xl'} mt={40}>
        Welcome to KeyVault!
      </Heading>
      <Heading textAlign={'center'} my={12} fontSize={'2xl'} maxWidth={'3xl'}>
        KeyVault is a password manager secured by blockchain and military-grade cryptography,
        meaning your passwords are in safe hands!
      </Heading>
      <Heading textAlign={'center'} my={12} fontSize={'2xl'} maxWidth={'3xl'}>
        KeyVault is currently undergoing a fairly major refactoring and will be unabilable in the
        meantime. We thank you for your patience and understanding.
      </Heading>
    </>
  )

  return (
    <VStack>
      {/* connect wallet */}
      {state === 'HOME' && <Welcome />}
      {state === 'ACCOUNT_CREATE' && activeAccount && <AccountRegistration />}
      {state === 'ACCOUNT_FOUND' && <AccountFound />}
      {state === 'ACCOUNT_DASHBOARD' && (
        <h1>Your account registration/import was successful. You may close this tab now.</h1>
      )}
      {state === 'ACCOUNT_RESET' && activeAccount && <AccountResetPage />}
    </VStack>
  )
}

export default HomePage
