import { ContractIds } from '@/deployments/deployments'
import { Heading, Text } from '@chakra-ui/react'
import { useInkathon, useRegisteredContract } from '@scio-labs/use-inkathon'
import { useState } from 'react'

export const AccountDashboard = () => {
  const { api, activeAccount, activeChain, activeSigner } = useInkathon()
  const [numEntries, setNumEntries] = useState<number>(0)
  const connected = activeAccount?.address ? true : false
  const { contract } = useRegisteredContract(ContractIds.KeyVault)

  return (
    <>
      <Heading size="2xl" mb={12}>
        Account Dashboard
      </Heading>

      <Text fontSize={'xl'}>Number of entries: {numEntries}</Text>
      {/* <Button onClick={() => postMessage('somekey123', '12312414')}>Post Message</Button> */}
    </>
  )
}
