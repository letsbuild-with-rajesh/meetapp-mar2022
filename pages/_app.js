import Head from 'next/head'
import { AppContainer } from '../components/AppContainer'
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  return (<>
    <Head>
      <title>MeetApp</title>
      <meta name="description" content="MeetApp" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <AppContainer>
      <Component {...pageProps} />
    </AppContainer>
  </>)
}

export default MyApp