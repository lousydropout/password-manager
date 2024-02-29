import { Box, Heading, List, ListIcon, ListItem, Text } from '@chakra-ui/react'
import { NextPage } from 'next'
import { MdCheckCircle } from 'react-icons/md'

const TermsAndConditions: NextPage = () => (
  <Box>
    <Heading as="h1" size="2xl" mb={12} textAlign={'center'}>
      Terms and Conditions
    </Heading>
    <Text>
      <strong>Last Updated: 2024-02-18</strong>
    </Text>

    <Heading as="h2" size="lg" mt={5}>
      Version History
    </Heading>
    <List spacing={3} pl={5} mt={2}>
      <ListItem display="flex" alignItems="center">
        <ListIcon as={MdCheckCircle} color="purple.400" />
        <Text as="span">
          <strong>1.0 (Created on 2024-02-18):</strong> Initial release.
        </Text>
      </ListItem>
    </List>

    <Heading as="h2" size="lg" mt={5}>
      Age Requirement and Parental Approval
    </Heading>
    <Text mt={2}>
      You must be at least 13 years old to use KeyVault. If you are under 18, you must have parental
      approval to create an account and use our services. By agreeing to these terms, you confirm
      that you meet these age requirements and that, if under 18, you have obtained the necessary
      parental consent.
    </Text>

    <Heading as="h2" size="lg" mt={5}>
      Encryption and Data Storage
    </Heading>
    <Text mt={2}>
      KeyVault is meant for storing your data in an encrypted format. For security purposes, the
      encryption and decryption process must take place off-chain so that no unencrypted data is
      submitted to the blockchain.
    </Text>
    <Text mt={2}>
      Under correct usage of KeyVault, KeyVault stores only encrypted information on the blockchain.
      You hold the only key capable of decrypting this information. We do not have access to your
      encryption key and, therefore, cannot decrypt your credentials or recover them if you lose
      your key.
    </Text>
    <Text mt={2}>
      Again, you&apos;re responsible for encrypting your data before storing it and managing your
      encryption keys securely. We cannot decrypt or access your data.
    </Text>

    <Heading as="h2" size="lg" mt={5}>
      Privacy and Blockchain Transparency
    </Heading>
    <Text mt={2}>
      KeyVault does not capture or store any personal information off-chain, even for analytics
      purposes. However, it&apos;s important to remember that this is a blockchain-based
      application. Consequently, actions such as creating an account, inserting new credentials, or
      resetting your account are public, recorded on the blockchain, and visible to anyone. While
      all credentials are encrypted (assuming the user is properly using the provided frontend as
      intended) before being stored on-chain, ensuring their privacy, the fact that these actions
      have occurred is public.
    </Text>

    <Heading as="h2" size="lg" mt={5}>
      Immutability of Stored Information
    </Heading>
    <Text mt={2}>
      Due to the immutable nature of blockchain technology, once information is encrypted and stored
      on-chain, it cannot be altered or removed. This ensures the integrity and security of your
      data but also means you should be certain before submitting any information to KeyVault. It is
      your responsibility to manage the data you choose to store securely.
    </Text>

    <Heading as="h2" size="lg" mt={5}>
      Limitation of Liability
    </Heading>
    <Text mt={2}>
      To the fullest extent permitted by law, we, along with our officers, directors, employees,
      agents, or affiliates, will not be liable for any indirect, incidental, special,
      consequential, or punitive damages arising out of or in connection with your use of
      KeyVault...
    </Text>

    <Heading as="h2" size="lg" mt={5}>
      No Warranty
    </Heading>
    <Text mt={2}>
      Due to the public and immutable nature of blockchains, encryption and decryption must occur
      off-chain. As this is impossible for us to enforce, we are unable to provide any warranty...
    </Text>

    <Heading as="h2" size="lg" mt={5}>
      Your Agreement
    </Heading>
    <Text mt={2}>
      By using KeyVault, you agree to these terms and conditions. Your use of our service signifies
      your acceptance of these terms and your commitment to comply with them. If you do not agree
      with any part of these terms, please do not use KeyVault.
    </Text>
  </Box>
)

// const ClientOnlyTermsAndConditions = dynamic(() => Promise.resolve(TermsAndConditions), {
//   ssr: false,
// })
export default TermsAndConditions
