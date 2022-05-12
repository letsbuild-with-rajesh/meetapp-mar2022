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
	const participantsRef = useRef({});
	const [ participants, setParticipants ] = useState([])
	const showContent = !(!username || !(meetname || meetid));
	const router = useRouter();

	const updateParticipantState = () => {
		const participants = participantsRef.current.value || {};
		const data = Object.keys(participants).map((key)=> {
			return {
				stream: participants[key].stream,
				name: participants[key].name,
				id: key
			}
		});
		setParticipants(data);
	}

	const toggleVideo = () => {
		const streamPromise = userVideoData.streamType === WEBCAM ? getScreenShareStream() : getWebCamStream();
		streamPromise.then((stream) => {
			updateUserVideoData({
				stream,
				streamType: userVideoData.streamType === WEBCAM ? SCREEN_SHARE : WEBCAM
			})
		})
	}

	const addParticipant = (stream, id, name) => {
		participantsRef.current.value = participantsRef.current.value || {};
		if (!participantsRef.current.value[id]) {
			participantsRef.current.value[id] = { name, stream };
		} else {
			participantsRef.current.value[id].stream = stream;
		}
		updateParticipantState();
	}

	const removeParticipant = (id) => {
		delete participantsRef.current.value[id];
		updateParticipantState();
	}

	const updateParticipantStream = (id, stream) => {
		participantsRef.current.value[id].stream = stream;
		updateParticipantState();
	}

	const initializeSocket = (videoData) => {
		socketRef.current = io.connect("/");
		videoData?.peer?.on('open', peerId => {
			socketRef.current.emit('join-room', {
				"username": username,
				"meet_name": meetname,
				"meet_id": meetid,
				"peer_id": peerId
			});
			addParticipant(videoData.stream, peerId, username);
			socketRef.current.on('new-user-connected', peerData => {
				const peerObj = {username, peerid: peerId};
				const call = videoData.peer.call(peerData.peer_id, videoData.stream, {metadata: peerObj})
				call.on('stream', peerStream => addParticipant(peerStream, peerData.peer_id, peerData.username));
			})
			socketRef.current.on('user-disconnected', peerData => {
				removeParticipant(peerData.peer_id);
			})
		})
		videoData?.peer?.on('call', call => {
			call.answer(videoData.stream)
			call.on('stream', peerStream =>  addParticipant(peerStream, call.metadata.peerid, call.metadata.username));
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
						initializeSocket(newUserVideoData);
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
			{false && <button onClick={toggleVideo}>Toggle Webcam & Screen Share</button>}
			<div className={styles.meetid_container}>
				<p className={styles.meetid}>{"Meet ID: " +meetid}</p>
				<button onClick={()=>navigator.clipboard.writeText(meetid)}>Copy</button>
			</div>
			<div className={styles.videosContainer}>
				{participants.length > 0 ?
					participants.map((participant) => {
						return 	<div className={styles.participantContainer}>
							<Video stream={userVideoData.stream} key={participant.id}/>
							<p className={styles.participantName}>{participant.name}</p>
							</div>
					})
				: <p style={styles.loadingText}>Loading meet...</p>}
			</div>
			<p>Swipe left/right to view other participants</p>
		</main>
	)
}

Meet.getInitialProps = async ({ query }) => {
	return query;
}