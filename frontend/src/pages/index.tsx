import { AccountCreation } from '@/components/AccountCreation'
import { AccountDashboard } from '@/components/AccountDashboard'
import { KeyVault, keyvaultDefault } from '@/machines/userflowMachine'
import { VStack } from '@chakra-ui/react'
import { useInkathon } from '@scio-labs/use-inkathon'
import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import 'twin.macro'

const HomePage: NextPage = () => {
  // for preventing premature passing-of-state and rendering
  const [ready, setReady] = useState<boolean>(false)
  const [keyvault, setKeyvault] = useState<KeyVault>(keyvaultDefault)
  const { error } = useInkathon()

  useEffect(() => {
    if (!error) return
    toast.error(error.message)
  }, [error])

  // read from sessionStorage
  useEffect(() => {
    const storedData = window.sessionStorage.getItem('keyvault')
    if (storedData) {
      setKeyvault({
        createdAccount: false,
        chosenPassword: false,
        enteredAddress: false,
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
