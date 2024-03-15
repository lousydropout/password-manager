import { KeyVault, keyvaultDefault } from '@/machines/userflowMachine'
import { Text } from '@chakra-ui/react'
import { useMachine } from '@xstate/react'
import { Dispatch, SetStateAction, useEffect } from 'react'
import { assign, createMachine } from 'xstate'
import { CreatingPassword } from './accountCreation/CreatingPassword'
import { GettingStarted } from './accountCreation/GettingStarted'
import { InstallingChromeExtension } from './accountCreation/InstallingChromeExtension'
import { ReviewTerms } from './accountCreation/ReviewTerms'

type AccountCreationPropsType = {
  keyvault: KeyVault
  setKeyvault: Dispatch<SetStateAction<KeyVault>>
}

const creationMachine = createMachine(
  {
    types: {} as {
      context: { step: number } & KeyVault
      events:
        | {
            type: 'SET_CONTEXT'
            createdAccount: boolean
            chosenPassword: boolean
            enteredAddress: boolean
          }
        | { type: 'createAccount' }
        | { type: 'importAccout' }
        | { type: 'next' }
      actions:
        | { type: 'logContext' }
        | { type: 'incr' }
        | { type: 'initialize' }
        | { type: 'chosePassword' }
        | { type: 'enterAddress' }
        | { type: 'createAccount' }
    },
    id: 'accountCreation',
    context: { step: 0, ...keyvaultDefault },
    initial: 'gettingStarted',
    states: {
      gettingStarted: {
        on: { next: { target: 'installingExtension', actions: ['incr'] } },
      },
      installingExtension: { on: { next: { target: 'creatingPassword', actions: ['incr'] } } },
      creatingPassword: {
        on: { next: { target: 'reviewingTerms', actions: ['incr', 'chosePassword'] } },
      },
      reviewingTerms: {},
    },
    on: { SET_CONTEXT: { actions: ['initialize'] } },
    always: { actions: 'logContext' },
  },
  {
    actions: {
      logContext: ({ context }) => console.log('[accountCreation] context: ', context),
      incr: assign({ step: ({ context }) => context.step + 1 }),
      initialize: assign({
        createdAccount: ({ event }) =>
          event.type === 'SET_CONTEXT' ? event.createdAccount : false,
        chosenPassword: ({ event }) =>
          event.type === 'SET_CONTEXT' ? event.chosenPassword : false,
        enteredAddress: ({ event }) =>
          event.type === 'SET_CONTEXT' ? event.enteredAddress : false,
      }),
      chosePassword: assign({ chosenPassword: () => true }),
      enterAddress: assign({ enteredAddress: () => true }),
      createAccount: assign({ createdAccount: () => true }),
    },
  },
)

export const AccountCreation = ({ keyvault, setKeyvault }: AccountCreationPropsType) => {
  const [state, send] = useMachine(creationMachine)

  // update
  useEffect(() => send({ type: 'SET_CONTEXT', ...keyvault }), [send])

  // trigger functions
  const next = () => send({ type: 'next' })
  const updateChosenPassword = () => {
    setKeyvault((prev) => ({ ...prev, chosenPassword: true }))
    send({ type: 'next' })
  }

  return (
    <>
      {state.context.step ? (
        <Text my={12} fontSize="2xl">
          Step {state.context.step} / 3
        </Text>
      ) : (
        <></>
      )}

      {/* Prompt use to 'create account' or 'import account' */}
      {state.value === 'gettingStarted' && <GettingStarted next={next} />}

      {/* Flow for creating account */}
      {state.value === 'installingExtension' && <InstallingChromeExtension next={next} />}
      {state.value === 'creatingPassword' && <CreatingPassword next={updateChosenPassword} />}
      {state.value === 'reviewingTerms' && <ReviewTerms agreeAndSubmit={() => {}} />}

      {/* Flow for importing account */}
    </>
  )
}
