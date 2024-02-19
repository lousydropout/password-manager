import { AccountCreation } from '@/components/AccountCreation'
import { AccountDashboard } from '@/components/AccountDashboard'
import { VStack } from '@chakra-ui/react'
import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import 'twin.macro'

export interface KeyVault {
  createdAccount: boolean
}

const HomePage: NextPage = () => {
  // for preventing premature passing-of-state and rendering
  const [ready, setReady] = useState<boolean>(false)
  const [keyvault, setKeyvault] = useState<KeyVault>({ createdAccount: false })

  // read from sessionStorage
  useEffect(() => {
    const storedData = window.sessionStorage.getItem('keyvault')
    if (storedData) {
      setKeyvault({
        createdAccount: false,
        // ...JSON.parse(storedData),
      })
      setReady(true)
    }
  }, [])

  return (
    <VStack>
      {ready && (
        <>
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
        </>
      )}
    </VStack>
  )
}

export default HomePage
