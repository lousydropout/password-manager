import { ConnectButton } from '@/components/web3/ConnectButton'
import { usePostMessages } from '@/hooks/usePostMessages'
import { HamburgerIcon } from '@chakra-ui/icons'
import { Link as ChakraLink } from '@chakra-ui/next-js'
import {
  Box,
  CloseButton,
  Divider,
  HStack,
  Heading,
  IconButton,
  VStack,
  useDisclosure,
} from '@chakra-ui/react'
import Image from 'next/image'
import Link from 'next/link'
import inkathonLogo from 'public/icons/icon48.png'

export const Header = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [, postMessage] = usePostMessages('action')
  const title = 'KeyVault'

  return (
    <Box>
      <HStack justifyContent="space-between" px={8} py={4} display={{ base: 'none', sm: 'flex' }}>
        {/* <ChakraLink
          as={Link}
          href="/"
          className="group"
          style={{ alignItems: 'center', gap: '16px' }}
          display={{ base: 'none', md: 'flex' }}
        > */}
        <Heading as={'h1'} color="purple.400" style={{ fontSize: '2.5rem' }}>
          {title}
        </Heading>
        {/* </ChakraLink> */}
        <ChakraLink
          as={Link}
          href="/"
          className="group"
          style={{ alignItems: 'center', gap: '16px' }}
          display={{ base: 'none', sm: 'flex', md: 'none' }}
        >
          <Image src={inkathonLogo} priority width={48} height={48} alt="ink!athon Logo" />
        </ChakraLink>

        <div tw="flex-grow"></div>

        <HStack gap={8}>
          {/* <ChakraLink as={Link} href="/settings" fontSize={'1.25rem'}>
            Settings
          </ChakraLink> */}
          <ConnectButton disconnect={() => postMessage('TO_EXTENSION', 'DISCONNECT_WALLET', {})} />
        </HStack>
      </HStack>

      <Box
        px={8}
        py={4}
        display={{ base: 'flex', sm: 'none' }}
        justifyContent="space-between"
        alignItems={'center'}
      >
        <ChakraLink
          as={Link}
          href="/"
          style={{ display: 'flex', alignItems: 'center', gap: '16px' }}
        >
          <Image src={inkathonLogo} priority width={48} height={48} alt="ink!athon Logo" />
        </ChakraLink>

        <IconButton
          icon={<HamburgerIcon fontSize={'4xl'} />}
          onClick={isOpen ? onClose : onOpen}
          aria-label="Open Menu"
          size={'lg'}
          padding={4}
        />

        {isOpen && (
          <VStack
            pos="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            backgroundColor={'black'}
            zIndex={20}
            spacing={4}
            alignItems="center"
            gap={4}
          >
            <HStack
              display={'flex'}
              justifyContent={'space-between'}
              alignItems={'center'}
              width={'full'}
              px={8}
              py={4}
            >
              <ChakraLink
                as={Link}
                href="/"
                className="group"
                style={{ display: 'flex', alignItems: 'center', gap: '16px' }}
                onClick={onClose}
              >
                <Image src={inkathonLogo} priority width={48} height={48} alt="ink!athon Logo" />
              </ChakraLink>
              <CloseButton
                onClick={onClose}
                color={'white'}
                size={'lg'}
                px={8}
                py={6}
                bgColor={'rgb(20 20 20)'}
                _hover={{ backgroundColor: 'rgb(61 61 61)' }}
              />
            </HStack>
            <Divider m={0} />
            <ConnectButton
              disconnect={() => postMessage('TO_EXTENSION', 'DISCONNECT_WALLET', {})}
            />

            <ChakraLink
              as={Link}
              href="/settings"
              color={'white'}
              _hover={{ backgroundColor: 'rgb(61 61 61)' }}
              px={14}
              rounded={'2xl'}
              py={2}
              border={'1px'}
              borderColor={'black'}
              fontSize={'2xl'}
              onClick={onClose}
            >
              Settings
            </ChakraLink>
          </VStack>
        )}
      </Box>
    </Box>
  )
}
