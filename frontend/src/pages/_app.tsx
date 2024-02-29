import { BaseLayout } from '@/components/layout/BaseLayout'
import Footer from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { HotToastConfig } from '@/components/layout/HotToastConfig'
import { env } from '@/config/environment'
import { getDeployments } from '@/deployments/deployments'
import GlobalStyles from '@/styles/GlobalStyles'
import { Box, ChakraProvider, DarkMode } from '@chakra-ui/react'
import { cache } from '@emotion/css'
import { CacheProvider } from '@emotion/react'
import { UseInkathonProvider } from '@scio-labs/use-inkathon'
import { DefaultSeo } from 'next-seo'
import type { AppProps } from 'next/app'
import { Inconsolata } from 'next/font/google'
import Head from 'next/head'

// Google Font(s) via `next/font`
const inconsolata = Inconsolata({ subsets: ['latin'] })

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* TODO SEO */}
      <DefaultSeo
        dangerouslySetAllPagesToNoFollow={!env.isProduction}
        dangerouslySetAllPagesToNoIndex={!env.isProduction}
        defaultTitle="KeyVault"
        titleTemplate="%s | KeyVault"
        description="A blockchain-based password manager"
        openGraph={{
          type: 'website',
          locale: 'en',
          url: env.url,
          site_name: 'KeyVault',
          images: [
            {
              url: `${env.url}/images/cover.jpg`, // TODO
              width: 1200,
              height: 675,
            },
          ],
        }}
      />

      <Head>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />

        {/* Set Font Variables */}
        <style>{`
          :root {
            --font-inconsolata: ${inconsolata.style.fontFamily}, 'Inconsolata';
          }
        `}</style>
      </Head>

      <UseInkathonProvider
        appName="KeyVault"
        connectOnInit={true}
        defaultChain={env.defaultChain}
        deployments={getDeployments()}
      >
        <CacheProvider value={cache}>
          <ChakraProvider>
            <DarkMode>
              <GlobalStyles />

              <BaseLayout>
                <Header />
                <Box height={'50px'}></Box>
                <Box maxWidth={'780px'} mx={'auto'} px={8}>
                  <Component {...pageProps} />
                </Box>
                <Box height={'10rem'}></Box>
                <Footer />
              </BaseLayout>

              <HotToastConfig />
            </DarkMode>
          </ChakraProvider>
        </CacheProvider>
      </UseInkathonProvider>
    </>
  )
}

export default MyApp
