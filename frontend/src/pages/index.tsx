import { HomePageTitle } from '@/components/home/HomePageTitle'
import { CenterBody } from '@/components/layout/CenterBody'
import { ConnectButton } from '@/components/web3/ConnectButton'
import { DisplayPasswords } from '@/components/web3/DisplayPasswords'
import { PasswordManagerContractInteractions } from '@/components/web3/PasswordManagerContractInteractions'
import { Button, Card, Flex, Input, Text } from '@chakra-ui/react'
import { useInkathon } from '@scio-labs/use-inkathon'
import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import 'twin.macro'

const HomePage: NextPage = () => {
  // Display `useInkathon` error messages (optional)
  const { activeAccount, error } = useInkathon()
  const [enteredPassword, setEnteredPassword] = useState<boolean>(false)
  const [masterPassword, setMasterPassword] = useState<string>()

  useEffect(() => {
    if (!error) return
    toast.error(error.message)
  }, [error])

  return (
    <>
      <CenterBody tw="mt-10 mb-10 px-5">
        {/* Title */}
        <HomePageTitle />

        {/* Connect Wallet Button */}
        <ConnectButton />

        {/* Enter Master Password */}
        <Card variant="outline" p={4} my={4} bgColor="whiteAlpha.100">
          <Text mb={2}>Master Password</Text>
          <Flex direction={'row'} gap={2}>
            <Input type="password" onChange={(e) => setMasterPassword(e.target.value)} />
            <Button colorScheme="purple" onClick={(e) => setEnteredPassword(true)}>
              Update
            </Button>
          </Flex>
        </Card>

        <div tw="mt-10 flex w-full flex-wrap items-start justify-center gap-4">
          {/* Password Manager Read/Write Contract Interactions */}
          <PasswordManagerContractInteractions masterPassword={masterPassword ?? ''} />

          {/* Display Passwords */}
          <DisplayPasswords masterPassword={masterPassword ?? ''} />
        </div>
      </CenterBody>
    </>
  )
}

export default HomePage
