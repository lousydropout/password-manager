import { Link as ChakraLink } from '@chakra-ui/next-js'
import { Flex, Text } from '@chakra-ui/react'
import Link from 'next/link'

const Footer = () => {
  return (
    <Flex
      justifyContent={'space-between'}
      alignItems={'center'}
      as="footer"
      width="full"
      pb={4}
      px={8}
      backgroundColor="transparent"
      position={'absolute'}
      bottom={0}
      left={0}
      gap={8}
    >
      <Text fontSize="sm" color="gray.600">
        © 2024 KeyVault. All rights reserved.
      </Text>
      <ChakraLink href="/terms" as={Link} color="purple.400" fontSize="sm" fontWeight="medium">
        Terms & Conditions
      </ChakraLink>
    </Flex>
  )
}

export default Footer
