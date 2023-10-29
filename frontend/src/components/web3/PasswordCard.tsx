import { Alert, AlertIcon, Card, Divider, Skeleton, Text } from '@chakra-ui/react'
import { FC, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { decrypt } from 'src/utils/crypto'

type DecryptedType = { url: string; username: string; password: string; description: string }
type PasswordCardProps = { masterPassword: string; ciphertext: string; iv: string }

export const PasswordCard: FC<PasswordCardProps> = ({ masterPassword, ciphertext, iv }) => {
  const [decrypted, setDecrypted] = useState<DecryptedType>()
  const [decryptionIsLoading, setDecryptionIsLoading] = useState<boolean>()
  const [decryptionError, setDecryptionError] = useState<boolean>()

  const decryptJson = async (ciphertext: string) => {
    setDecryptionIsLoading(true)
    setDecryptionError(false)
    try {
      const decryptedString = await decrypt(ciphertext, iv, masterPassword)
      const decryptedObject = JSON.parse(decryptedString) as DecryptedType
      setDecrypted(decryptedObject)
    } catch (e) {
      console.error(e)
      toast.error('Error while decrypting password. Try again…')
      setDecryptionError(true)
    } finally {
      setDecryptionIsLoading(false)
    }
  }

  useEffect(() => {
    decryptJson(ciphertext)
  }, [masterPassword])

  return (
    <Card maxW="sm">
      {decryptionError ? (
        <Alert status="error">
          <AlertIcon />
          An error occurred while decryptioning data.
        </Alert>
      ) : decryptionIsLoading ? (
        <Skeleton height="100px" />
      ) : (
        <>
          <Text fontSize="xl" fontWeight="bold">
            {decrypted?.url || 'Missing'}
          </Text>
          <Divider my={2} />
          <Text>
            <strong>Username:</strong> {decrypted?.username || 'Missing'}
          </Text>
          <Text>
            <strong>Password:</strong> {decrypted?.password || 'Missing'}
          </Text>
          <Text>
            <strong>Description:</strong> {decrypted?.description || 'Missing'}
          </Text>
        </>
      )}
    </Card>
  )
}
