import { useEffect } from 'react'
import { StateContext, usePostMessages } from './usePostMessages'
import { useSessionStorage } from './useSessionStorage'

type MessageType = 'TO_EXTENSION'

function useFiniteStateMachine<State>(
  defaultState: State,
  calculateNextState: (state: State, action: string, context: Record<string, any>) => State,
): [
  State,
  StateContext,
  (type: MessageType, action: string, context: Record<string, any>) => void,
] {
  const [message, postMessage] = usePostMessages('action', 'INITIALIZATION')
  const [state, setState] = useSessionStorage<State>('state', defaultState)

  useEffect(() => {
    setState((currentState) => calculateNextState(currentState, message.action, message.context))
  }, [message])

  return [state, message, postMessage]
}

export { useFiniteStateMachine }
