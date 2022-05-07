import Head from 'next/head'
import styles from '../styles/Home.module.scss'

export default function Home() {
  return (
    <div>
      <Head>
        <title>MeetApp</title>
        <meta name="description" content="MeetApp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <h1 className={styles.title}>Hey, Welcome to MeetApp!</h1>
        <h2>No hassle of Sign Ups! Just get started for a quick conversation!</h2>
        <div className={styles.content_container}>
          <button>Start a conversation</button>
          <button>Join a conversation</button>
        </div>
      </main>
    </div>
  )
}
