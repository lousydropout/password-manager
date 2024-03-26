import { Dispatch, SetStateAction, useEffect } from 'react'
import { usePostMessages } from './usePostMessages'
import { useSessionStorage } from './useSessionStorage'

type MessageType = 'TO_EXTENSION'

function useFiniteStateMachine<State>(
  defaultState: State,
  calculateNextState: (state: State, action: string, context: Record<string, any>) => State,
): [
  State,
  Record<string, any>,
  (type: MessageType, action: string, context: Record<string, any>) => void,
  Dispatch<SetStateAction<State>>,
] {
  const [message, postMessage] = usePostMessages('action', 'INITIALIZATION')
  const [state, setState] = useSessionStorage<State>('state', defaultState)

  useEffect(() => {
    setState((currentState) => calculateNextState(currentState, message.action, message.context))
  }, [message])

  return [state, message.context, postMessage, setState]
}

export { useFiniteStateMachine }
