export type State =
  | 'HOME'
  | 'ACCOUNT_CREATE'
  | 'ACCOUNT_FOUND'
  | 'ACCOUNT_RESET'
  | 'ACCOUNT_DASHBOARD'
type Action =
  | 'UPDATE_CONTEXT'
  | 'FOUND_NO_ACCOUNT'
  | 'FOUND_ACCOUNT'
  | 'ACCOUNT_IMPORT_SUCCESS'
  | 'ACCOUNT_RESET_SUCCESS'
  | 'DISCONNECT_WALLET'
  | 'ACCOUNT_RESET_REQUESTED'

export const calculateNextState = (
  state: State,
  action: string,
  context: Record<string, any>,
): State => {
  let newState: State
  switch (action as Action) {
    case 'DISCONNECT_WALLET':
      console.debug(`[stateMachine] ${action}: ${state} -> HOME`)
      return 'HOME'

    case 'UPDATE_CONTEXT':
      console.debug(`[stateMachine] ${action}: ${state} -> UNCHANGED`)
      return state

    case 'FOUND_NO_ACCOUNT':
      newState = state === 'HOME' ? 'ACCOUNT_CREATE' : state
      console.debug(`[stateMachine] ${action}: ${state} -> ${newState}`)
      return newState

    case 'FOUND_ACCOUNT':
      console.debug(`[stateMachine] ${action}: ${state} -> ACCOUNT_FOUND`)
      return 'ACCOUNT_FOUND'

    case 'ACCOUNT_IMPORT_SUCCESS':
    case 'ACCOUNT_RESET_SUCCESS':
      console.debug(`[stateMachine] ${action}: ${state} -> ACCOUNT_DASHBOARD`)
      return 'ACCOUNT_DASHBOARD'

    case 'ACCOUNT_RESET_REQUESTED':
      console.debug(`[stateMachine] ${action}: ${state} -> ACCOUNT_RESET`)
      return 'ACCOUNT_RESET'

    default:
      console.debug(`[stateMachine] unhandled action : ${state} -> UNCHANGED`)
      return state
  }
}
