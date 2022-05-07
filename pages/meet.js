import Head from 'next/head'
import { useState, useEffect, useRef } from 'react'
import io from "socket.io-client";
import Video from '../components/Video'
import { getWebCamStream, getScreenShareStream } from "../utils/streams";
import { WEBCAM, SCREEENSHARE } from '../utils/constants'
import styles from '../styles/Home.module.scss'

export default function Home() {
	const [userVideoData, updateUserVideoData] = useState({
		stream: null,
		streamType: WEBCAM,
		peer: null,
	});
	const [peerStreams, updatePeerStreams] = useState([]);
	const socketRef = useRef();

	const toggleVideo = () => {
		const streamPromise = userVideoData.streamType === WEBCAM ? getScreenShareStream() : getWebCamStream();
		streamPromise.then((stream) => {
			updateUserVideoData({
				stream,
				streamType: userVideoData.streamType === WEBCAM ? SCREEENSHARE : WEBCAM
			})
		})
	}

	const addPeer = (peerStream) => {
		const newPeerStreams = [...peerStreams];
		newPeerStreams.push(peerStream);
		updatePeerStreams(newPeerStreams);
	}

	useEffect(() => {
		const Peer = require('peerjs').default
		getWebCamStream()
			.then((stream) => {
				const newUserVideoData = {
					...userVideoData,
					stream,
					peer: new Peer()
				}
				updateUserVideoData(newUserVideoData);

				fetch('/api/').then(() => {
					socketRef.current = io.connect("/");
					newUserVideoData?.peer?.on('open', peerId => {
						socketRef.current.emit('join-room', 'abcd', peerId);
						socketRef.current.on('other-users-in-room', users => {
							console.log(users);
						})
						socketRef.current.on('new-user-connected', peerId => {
							const call = newUserVideoData.peer.call(peerId, newUserVideoData.stream)
							call.on('stream', peerStream => addPeer(peerStream));
						})
					})
					newUserVideoData?.peer?.on('call', call => {
						call.answer(newUserVideoData.stream)
						call.on('stream', peerStream => addPeer(peerStream));
					})
				})
				.catch(err => {
					console.log(err);
				})
			})
			.catch(err => {
				console.log(err);
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
				<Video stream={userVideoData.stream} />
				{peerStreams && peerStreams.map((peerStream, id) => {
					return <Video stream={peerStream} key={"peer-video-" + id} />;
				})}
			</main>
		</div>
	)
}
