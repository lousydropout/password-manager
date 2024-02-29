import { useCallback, useEffect, useState } from 'react'

type Message<T> = {
  type: 'data' | 'reset-index'
  val: T
}

export const useMessageQueue = <T>(
  varName: string,
  expectedNumberOfResponses: number = 0,
  initialListening: boolean = true,
) => {
  const [messages, setMessages] = useState<T[]>([])
  const [idx, setIdx] = useState<number>(0) // Default value is 0
  const [intervalMs, setIntervalMs] = useState<number>(500) // Adjust based on page visibility
  const [listening, setListening] = useState<boolean>(initialListening) // Initially start listening
  const [receivedResponses, setReceivedResponses] = useState<number>(0)

  useEffect(() => {
    // Fetch and set initial value of idx only in the browser environment
    if (typeof window !== 'undefined') {
      const initialIdx = parseInt(sessionStorage.getItem(`${varName}-idx`) || '0', 10)
      setIdx(initialIdx)
    }
  }, [varName])

  // Dynamically adjust polling frequency based on page visibility
  const handleVisibilityChange = useCallback(() => {
    setIntervalMs(document.visibilityState === 'visible' ? 500 : 5000)
  }, [])

  useEffect(() => {
    if (!listening) return // Stop listening if not required

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [listening, handleVisibilityChange])

  useEffect(() => {
    if (!listening) return // Stop listening if not required

    const interval = setInterval(() => {
      console.log(`[${varName}] listening...`)
      const sessionIdx = parseInt(sessionStorage.getItem(`${varName}-idx`) || '0', 10)
      const newMessages: T[] = []
      for (let k = idx; k < sessionIdx; k++) {
        const messageStr = sessionStorage.getItem(`${varName}-${k}`)
        if (messageStr) {
          const message: Message<T> = JSON.parse(messageStr)
          if (message.type === 'data') {
            newMessages.push(message.val)
          }
          // Remove message after processing
          sessionStorage.removeItem(`${varName}-${k}`)
        }
      }
      if (newMessages.length > 0) {
        setMessages((prevMessages) => [...prevMessages, ...newMessages])
        setIdx(sessionIdx)

        // Increment the count of received responses
        setReceivedResponses((prevCount) => prevCount + newMessages.length)

        // Stop listening if the expected number of responses is reached
        if (expectedNumberOfResponses > 0 && receivedResponses >= expectedNumberOfResponses) {
          setListening((prev) => !prev) // Toggle listening state
        }
      }
    }, intervalMs)

    return () => clearInterval(interval)
  }, [varName, idx, intervalMs, listening, expectedNumberOfResponses, receivedResponses])

  // Function to reset the index after consuming all remaining messages
  const resetIndex = useCallback(() => {
    // Consume all remaining messages before resetting
    for (let k = idx; k < parseInt(sessionStorage.getItem(`${varName}-idx`) || '0', 10); k++) {
      sessionStorage.removeItem(`${varName}-${k}`) // Remove each message
    }
    setIdx(0) // Reset the idx state to 0
    sessionStorage.setItem(`${varName}-idx`, '0') // Also reset the idx in sessionStorage
    setMessages([]) // Clear the messages state
    setReceivedResponses(0) // Reset the count of received responses
  }, [varName, idx])

  // Function to manually consume all messages (if needed)
  const consumeAllMessages = useCallback((): T[] => {
    const consumed = [...messages]
    setMessages([])
    return consumed
  }, [messages])

  return { messages, idx, consumeAllMessages, resetIndex, listening, setListening }
}
