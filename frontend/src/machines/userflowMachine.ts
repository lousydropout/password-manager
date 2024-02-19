import { assign, createMachine } from 'xstate'

export interface KeyVault {
  createdAccount: boolean
  chosenPassword: boolean
  enteredAddress: boolean
}

export const keyvaultDefault: KeyVault = {
  createdAccount: false,
  chosenPassword: false,
  enteredAddress: false,
}

export const machine = createMachine(
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
