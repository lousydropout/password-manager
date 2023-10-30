import { RepeatIcon, ViewIcon, ViewOffIcon } from '@chakra-ui/icons'
import {
  Alert,
  AlertIcon,
  Button,
  Card,
  Divider,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Skeleton,
  Stack,
  Text,
  Textarea,
} from '@chakra-ui/react'
import { FC, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { decrypt } from 'src/utils/crypto'

type DecryptedType = { url: string; username: string; password: string; description: string }
type PasswordCardProps = {
  masterPassword: string
  encryptedText: string
  n: number
  refetch: () => void
}

export const PasswordCard: FC<PasswordCardProps> = ({
  masterPassword,
  encryptedText,
  n,
  refetch,
}) => {
  const [decrypted, setDecrypted] = useState<DecryptedType>()
  const [decryptionIsLoading, setDecryptionIsLoading] = useState<boolean>(false)
  const [decryptionError, setDecryptionError] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<boolean>(false)

  const decryptJson = async (encryptedText: string) => {
    if (!encryptedText) return

    setDecryptionIsLoading(true)
    setDecryptionError(false)
    try {
      const [iv, ciphertext] = encryptedText.split('|')
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
    decryptJson(encryptedText)
  }, [masterPassword, encryptedText])

  return (
    <Card maxW="xl" variant="outline" px={8} py={8} bgColor="whiteAlpha.100">
      <Stack>
        <Flex justifyContent="space-between" pb={4}>
          <Text>Password {n + 1}</Text>
          <RepeatIcon
            mr={2}
            fontSize="xl"
            _hover={{ cursor: 'pointer' }}
            onClick={() => refetch()}
          />
        </Flex>
        {decryptionError ? (
          <Alert status="error">
            <AlertIcon />
            An error occurred while decryptioning data.
          </Alert>
        ) : decryptionIsLoading ? (
          <Skeleton height="100px" />
        ) : (
          <>
            <Text display="flex" alignItems="center" justifyContent="space-between" gap={4}>
              <label>URL:</label>
              <Input value={decrypted?.url} readOnly />
            </Text>
            <Divider my={2} />
            <Text display="flex" alignItems="center" justifyContent="space-between" gap={4}>
              <label>Username:</label>
              <Input value={decrypted?.username} readOnly />
            </Text>
            <Text display="flex" alignItems="center" justifyContent="space-between" gap={4}>
              <label>Password:</label>
              <InputGroup size="md">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={decrypted?.password}
                  readOnly
                />
                <InputRightElement>
                  <Button size="sm" onClick={() => setShowPassword((value) => !value)}>
                    {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </Text>
            <Text display="flex" alignItems="center" justifyContent="space-between" gap={4}>
              <label>Description:</label>
              <Textarea value={decrypted?.description} readOnly />
            </Text>
          </>
        )}
      </Stack>
    </Card>
  )
}
