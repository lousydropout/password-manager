import Image from 'next/image'
import Link from 'next/link'
import inkathonLogo from 'public/brand/inkathon-logo.png'
import { FC } from 'react'
import 'twin.macro'

export const HomePageTitle: FC = () => {
  const title = 'Password Manager'
  const githubHref = 'https://github.com/lousydropout/password-manager'

  return (
    <>
      <div tw="flex flex-col items-center text-center font-mono">
        {/* Logo & Title */}
        <Link
          href={githubHref}
          target="_blank"
          className="group"
          tw="flex cursor-pointer items-center gap-4 rounded-3xl py-1.5 px-3.5 transition-all hover:bg-gray-900"
        >
          <Image src={inkathonLogo} priority width={60} alt="ink!athon Logo" />
          <h1 tw="font-black text-[2.5rem]">{title}</h1>
        </Link>
      </div>
    </>
  )
}
