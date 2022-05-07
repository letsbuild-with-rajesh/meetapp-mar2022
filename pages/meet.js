import Head from 'next/head'
import { useState, useEffect } from 'react'
import Video from '../components/Video'
import { getWebCamStream, getScreenShareStream } from "../utils/streams";
import { WEBCAM, SCREEENSHARE } from '../utils/constants'
import styles from '../styles/Home.module.scss'

export default function Home() {
	const [ userVideoData, updateUserVideoData ] = useState({
		stream: null,
		videoType: WEBCAM
	});
	const [ peerStreamsList, updatePeerStreamsList ] = useState([]);

  const toggleVideo = () => {
		updateUserVideoData({
			stream: userVideoData.videoType === WEBCAM ? getScreenShareStream() : getWebCamStream(),
			videoType: userVideoData.videoType === WEBCAM ? SCREEENSHARE : WEBCAM
		})
  }

	useEffect(()=> {
		updateUserVideoData({
			...userVideoData,
			stream: getWebCamStream()
		})
	}, [])
  return (
    <div>
      <Head>
        <title>MeetApp</title>
        <meta name="description" content="MeetApp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <button onClick={toggleVideo}>Toggle Webcam & Screen Share</button>
        <Video data={userVideoData}/>
      </main>
    </div>
  )
}
