import { Dispatch, SetStateAction, useEffect, useState } from 'react'

// Define a generic type T for the value to be stored in session storage
function useSessionStorage<T>(key: string, defaultValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(defaultValue)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('useEffect with [key, defaultValue]')
      // Attempt to get the stored value from session storage.
      // Parse the stored JSON string back into a TypeScript value of type T.
      const stored = window.sessionStorage.getItem(key)
      const initial = stored ? JSON.parse(stored) : defaultValue
      setValue(initial)

      const handleStorageChange = (event: StorageEvent) => {
        if (event.key === key) {
          setValue(event.newValue ? JSON.parse(event.newValue) : defaultValue)
        }
      }

      // Subscribe to storage events to handle changes made in other tabs/windows
      window.addEventListener('storage', handleStorageChange)

      return () => {
        // Clean up the subscription to avoid memory leaks
        window.removeEventListener('storage', handleStorageChange)
      }
    }
  }, [key, defaultValue])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Convert the value back into a JSON string for storage in session storage.
      window.sessionStorage.setItem(key, JSON.stringify(value))
    }
  }, [key, value])

  // Return the current value and the setter function, both typed correctly.
  return [value, setValue]
}

export { useSessionStorage }
