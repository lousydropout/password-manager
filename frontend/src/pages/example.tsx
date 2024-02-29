import { AccountCreation } from '@/components/AccountCreation'
import { AccountDashboard } from '@/components/AccountDashboard'
import { VStack } from '@chakra-ui/react'
import { useInkathon } from '@scio-labs/use-inkathon'
import { useMachine } from '@xstate/react'
import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import 'twin.macro'
import { assign, createMachine } from 'xstate'

interface KeyVault {
  createdAccount: boolean
}

const machine = createMachine(
  {
    types: {} as {
      context: { count: number } & KeyVault
      events: { type: 'TOGGLE' } | { type: 'INITIALIZE'; count: number } | { type: '' }
      actions: { type: 'incr' } | { type: 'decr' } | { type: 'logContext' } | { type: 'logEvent' }
    },
    id: 'machine',
    context: { count: 0, createdAccount: false, chosenPassword: false, enteredAddress: false },
    initial: 'active',
    states: {
      active: {
        on: { TOGGLE: { target: 'inactive', actions: ['incr'] } },
        // entry: ['logContext', 'logEvent'],
      },
      inactive: {
        on: { TOGGLE: { target: 'active', actions: ['incr'] } },
        // entry: ['logContext', 'logEvent'],
      },
    },
    on: {
      INITIALIZE: {
        actions: assign({ count: ({ event }) => event.count }),
        target: '.active',
      },
    },
    always: {
      actions: ['logContext'],
    },
  },
  {
    actions: {
      incr: assign({ count: ({ context }) => context.count + 1 }),
      decr: assign({ count: ({ context }) => context.count - 1 }),
      logContext: ({ context }) => console.log('context: ', context),
      logEvent: ({ event }) => console.log('event: ', event),
    },
  },
)

const HomePage: NextPage = () => {
  const [keyvault, setKeyvault] = useState<KeyVault>({
    createdAccount: false,
    chosenPassword: false,
    enteredAddress: false,
  })
  const [state, send] = useMachine(machine)
  // Display `useInkathon` error messages (optional)
  const { activeAccount, error } = useInkathon()

  useEffect(() => {
    if (!error) return
    toast.error(error.message)
  }, [error])

  useEffect(() => {
    const storedData = window.sessionStorage.getItem('keyvault')
    if (storedData) {
      setKeyvault({ ...JSON.parse(storedData), createdAccount: false })
    }
  }, [])

  return (
    <VStack>
      <h1>Example page</h1>
      {state.value === 'active' && <h2>Active - {state.context.count}</h2>}
      {state.value === 'inactive' && <h2>INACTIVE - {state.context.count}</h2>}
      <button
        onClick={() => {
          send({ type: 'TOGGLE' })
        }}
      >
        increment
      </button>
      <button
        onClick={() => {
          send({ type: 'INITIALIZE', count: 14 })
        }}
      >
        INITIALIZE to 14
      </button>
      <h2>{activeAccount?.address || 'dunno'}</h2>
      {!keyvault?.createdAccount && (
        <>
          <AccountCreation keyvault={keyvault} setKeyvault={setKeyvault} />
        </>
      )}
      {keyvault?.createdAccount && (
        <>
          <AccountDashboard />
        </>
      )}
    </VStack>
  )
}

export default HomePage
