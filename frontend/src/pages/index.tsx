import { Heading } from '@chakra-ui/react'
import type { NextPage } from 'next'
import 'twin.macro'

const HomePage: NextPage = () => (
  <>
    <Heading as={'h1'} fontSize={'7xl'} mt={40}>
      Welcome to KeyVault!
    </Heading>
    <Heading textAlign={'center'} my={12} fontSize={'2xl'} maxWidth={'3xl'}>
      KeyVault is a password manager secured by blockchain and military-grade cryptography, meaning
      your passwords are in safe hands!
    </Heading>
  </>
)

export default HomePage
