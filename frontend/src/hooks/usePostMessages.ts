import { useCallback, useEffect, useState } from 'react'
import { v4 as uuid } from 'uuid'

type MessageType = 'ACCOUNT_CREATION' | 'TO_EXTENSION' | 'FROM_EXTENSION' | 'REQUEST'

type Message = {
  type: MessageType
  channelId?: string
  channelName: string
  action: string
  data: Record<string, any>
  overwrite?: boolean
}

export type StateContext = {
  action: string
  context: Record<string, any>
}

type InitialMessage = 'INITIALIZATION' | null

export const usePostMessages = (
  channelName: string,
  initialMessageType: InitialMessage = null,
): [
  messages: StateContext,
  postMessage: (type: MessageType, action: string, data: Record<string, any>) => void,
] => {
  const [context, setContext] = useState<StateContext>({ action: '', context: {} })
  const channelId = uuid()

  const postMessage = useCallback(
    (type: MessageType, action: string, data: Record<string, any>) => {
      const value = { action, data }
      setContext((prev) => ({ ...prev, context: { ...prev.context, ...data } }))
      window.postMessage({ type, channelId, channelName, key: channelName, value }, '*')
    },
    [channelId, channelName],
  )

  useEffect(() => {
    // handler for messages from chrome extension via contentScript
    const handleMessage = (event: MessageEvent) => {
      const { data: message }: { data: Message } = event

      if (
        typeof message === 'object' &&
        message.type === 'FROM_EXTENSION' &&
        message.channelName === channelName
      ) {
        console.debug(`[handleMessage ${channelName}] message: `, message)

        if (message.overwrite) {
          setContext({ action: message.action, context: message.data })
        } else {
          setContext((prevContext) => ({
            action: message.action,
            context: { ...prevContext.context, ...message.data },
          }))
        }
      }
    }

    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [channelName])

  useEffect(() => {
    if (initialMessageType)
      window.postMessage(
        { type: initialMessageType, channelId, channelName, key: channelName },
        '*',
      )
  }, [])

  return [context, postMessage]
}
