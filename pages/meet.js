import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import io from "socket.io-client";
import { getWebCamStream, getScreenShareStream } from "../utils/streams";
import { NO_STREAM, WEBCAM, SCREEN_SHARE } from '../utils/constants'
import styles from '../styles/Meet.module.scss'

export default function Meet({ username, meetname, meetid}) {
	const initialUserVideoData = useState({
		stream: null,
		streamType: NO_STREAM,
		peer: null,
	});
	const socketRef = useRef();
	const [userVideoData, updateUserVideoData] = useState(initialUserVideoData);
	const peersRef = useRef([]);
	const [peerStreams, updatePeerStreams] = useState([]);
	const participantsRef = useRef({});
	const [participants, updateParticipants ] = useState([]);
	const showContent = !(!username || !meetname || !meetid);
	const router = useRouter();

	const toggleVideo = () => {
		const streamPromise = userVideoData.streamType === WEBCAM ? getScreenShareStream() : getWebCamStream();
		streamPromise.then((stream) => {
			updateUserVideoData({
				stream,
				streamType: userVideoData.streamType === WEBCAM ? SCREEN_SHARE : WEBCAM
			})
		})
	}

	const addPeer = (peerStream) => {
		const newPeerStreams = [...(peersRef?.current?.value ? peersRef.current.value : [])];
		const exist = (-1 !== newPeerStreams.findIndex((val)=>{
			return val.id === peerStream.id
		}))
		if (!exist) {
			newPeerStreams.push(peerStream);
			peersRef.current.value = newPeerStreams;
			updatePeerStreams(newPeerStreams);
		}
	}

	const addParticipant = (id, name) => {
		participantsRef.current.value = participantsRef.current.value || {};
		participantsRef.current.value[id] = name;
		console.log(participantsRef.current.value);
		updateParticipants(Object.values(participantsRef.current.value || {}));
	}

	const addExistingParticipants = (participants) => {
		participants && participants.map((participant)=>{
			addParticipant(participant.peer_id, participant.username);
		})
	}

	useEffect(() => {
		if (!showContent) {
			alert('Access Denied! Redirecting to home page...');
			router.push('/');
			return;
		}
		const Peer = require('peerjs').default;
		getWebCamStream()
			.then((stream) => {
				const newUserVideoData = {
					...userVideoData,
					stream,
					streamType: WEBCAM,
					peer: new Peer()
				}
				updateUserVideoData(newUserVideoData);

				fetch('/api/')
					.then(() => {
						socketRef.current = io.connect("/");
						newUserVideoData?.peer?.on('open', peerId => {
							socketRef.current.emit('join-room', {
								"username": username,
								"meet_name": meetname,
								"meet_id": meetid,
								"peer_id": peerId
							});
							addParticipant(peerId, username);
							socketRef.current.on('sync-existing-users', existingUsers => {
								addExistingParticipants(existingUsers);
							})
							socketRef.current.on('new-user-connected', peerData => {
								const call = newUserVideoData.peer.call(peerData.peer_id, newUserVideoData.stream)
								call.on('stream', peerStream => addPeer(peerStream));
								addParticipant(peerData.peer_id, peerData.username);
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
	}, []);

	useEffect(()=> {
		return () => {
			let tracks = userVideoData?.stream?.getTracks()
			tracks && tracks?.forEach(track => {
				track.stop();
			});
		}
	}, [userVideoData]);

	const Video = ({stream}) => {
		const videoRef = useRef(null);

		useEffect(async () => {
			if (stream) {
				let video = videoRef.current;
				let tracks = video?.srcObject?.getTracks();
				tracks && tracks.forEach(track => {
					if (track.kind === 'video') track.stop();
				});
				video.srcObject = stream;
				if (video.isPlaying) {
					video.isPlaying = false;
					video.play().then(()=>{
						video.isPlaying = true;
					})
				}
			}
		}, [stream]);

		return <video playsInline autoPlay ref={videoRef} className={styles.video} />
	};

	return showContent && (
		<main className={styles.main}>
			<button onClick={toggleVideo}>Toggle Webcam & Screen Share</button>
			<p>Meet ID: {meetid}</p>
			<div className={styles.videosContainer}>
				<Video stream={userVideoData.stream}/>
				{peerStreams.length > 0 && peerStreams.map((peerStream, id) => {
					return <Video stream={peerStream} key={"peer-video-" + id} />;
				})}
			</div>
			<p>Swipe left/right to view other participants</p>
			<div className={styles.participantsContainer}>
				{
					participants.map((value, id)=>{
						return <div className={styles.participantName} key={"participant-names-" + id}>{value}</div>
					})
				}
			</div>
		</main>
	)
}

Meet.getInitialProps = async ({ query }) => {
	return query;
}