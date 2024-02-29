import { Link as ChakraLink } from '@chakra-ui/next-js'
import Image from 'next/image'
import Link from 'next/link'
import inkathonLogo from 'public/brand/inkathon-logo.png'
import { FC } from 'react'
import 'twin.macro'

export const HomePageTitle: FC = () => {
  const title = 'KeyVault'
  const githubHref = 'https://github.com/lousydropout/password-manager'

  return <h2>Home page</h2>

  return (
    <>
      <div tw="flex flex-col items-center text-center font-mono">
        {/* Logo & Title */}
        <ChakraLink href={githubHref} target="_blank" as={Link}>
          <Image src={inkathonLogo} priority width={60} alt="ink!athon Logo" />
          <h1 tw="font-black text-[2.5rem]">{title}</h1>
        </ChakraLink>
      </div>
    </>
  )
}
