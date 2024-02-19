import { ConnectButton } from '@/components/web3/ConnectButton'
import { HStack } from '@chakra-ui/react'
import Image from 'next/image'
import Link from 'next/link'
import inkathonLogo from 'public/brand/inkathon-logo.png'
import 'twin.macro'

export const Header = () => {
  const title = 'KeyVault'
  return (
    <HStack tw="flex justify-between px-8 py-4">
      {/* Logo & Title */}
      <Link
        href="/"
        className="group"
        tw="flex cursor-pointer gap-4 rounded-3xl py-1.5 px-3.5 transition-all hover:bg-gray-900"
      >
        <Image src={inkathonLogo} priority width={60} alt="ink!athon Logo" tw="inline" />
        <h1 tw="inline font-black text-[2.5rem]">{title}</h1>
      </Link>
      <ConnectButton tw="inline" />
    </HStack>
  )
}
