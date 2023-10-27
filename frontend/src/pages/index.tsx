import { HomePageTitle } from '@/components/home/HomePageTitle'
import { CenterBody } from '@/components/layout/CenterBody'
import { ChainInfo } from '@/components/web3/ChainInfo'
import { ConnectButton } from '@/components/web3/ConnectButton'
import { PasswordManagerContractInteractions } from '@/components/web3/PasswordManagerContractInteractions'
import { useInkathon } from '@scio-labs/use-inkathon'
import type { NextPage } from 'next'
import { useEffect } from 'react'
import { toast } from 'react-hot-toast'
import 'twin.macro'

const HomePage: NextPage = () => {
  // Display `useInkathon` error messages (optional)
  const { activeAccount, error } = useInkathon()
  useEffect(() => {
    if (!error) return
    toast.error(error.message)
  }, [error])

  return (
    <>
      <CenterBody tw="mt-20 mb-10 px-5">
        {/* Title */}
        <HomePageTitle />

        {/* Connect Wallet Button */}
        <ConnectButton />

        <div tw="mt-10 flex w-full flex-wrap items-start justify-center gap-4">
          {/* Chain Metadata Information */}
          <ChainInfo />

          {/* Password Manager Read/Write Contract Interactions */}
          <PasswordManagerContractInteractions />
        </div>
      </CenterBody>
    </>
  )
}

export default HomePage
