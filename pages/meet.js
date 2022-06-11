import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import io from "socket.io-client";
import MeetVideos from '../components/MeetVideos';
import MeetChats from '../components/MeetChats';
import { getWebCamStream, getScreenShareStream, replaceStreams } from "../utils/streams";
import { NO_STREAM, WEBCAM, SCREEN_SHARE, ROLE_USER, ROLE_PEER } from '../utils/constants';
import { getParticipantsArray, addParticipant, removeParticipant } from '../utils/participants';
import styles from '../styles/Meet.module.scss';

function Meet({ username, meetname, meetid }) {
	const socketRef = useRef();
	const [userVideoData, updateUserVideoData] = useState({
		stream: null, streamType: NO_STREAM,
		peer: null
	});
	const participantsRef = useRef({});
	const [participants, setParticipants] = useState([]);
	const showContent = !(!username || !(meetname || meetid));
	const [showChat, setShowChat] = useState(false);
	const newChatMessageRef = useRef('');
	const chatMessagesRef = useRef([]);
	const [chatMessages, setChatMessages] = useState([]);
	const router = useRouter();

	const getUserStream = () => {
		const participants = participantsRef.current.value || {};
		for (let key in participants) {
			if (participants[key].role === ROLE_USER) {
				return participants[key].stream;
			}
		}
	}

	const updateUserStream = (stream, streamType) => {
		updateUserVideoData({ stream, streamType });
		participantsRef.current.value[participants[0].id].stream = stream;
		replaceStreamForPeers(stream);
	}

	const toggleWebCamScreenShareVideo = () => {
		const streamPromise = userVideoData.streamType === WEBCAM ? getScreenShareStream() : getWebCamStream();
		streamPromise.then((stream) => updateUserStream(stream, userVideoData.streamType === WEBCAM ? SCREEN_SHARE : WEBCAM));
	}

	const updateParticipantsState = () => {
		setParticipants(getParticipantsArray(participantsRef));
	}

	const replaceStreamForPeers = (stream) => {
		replaceStreams(participantsRef, updateParticipantsState, stream)
	}

	const sendNewMessage = () => {
		const message = { peerid: participants[0].id, username, message: newChatMessageRef.current.value };
		socketRef.current.emit("chat-message", message);
		chatMessagesRef.current = [...chatMessagesRef.current, message];
		setChatMessages(chatMessagesRef.current);
		newChatMessageRef.current.value = '';
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
			addParticipant(participantsRef, updateParticipantsState, null, videoData.stream, peerId, username, ROLE_USER);
			socketRef.current.on('new-user-connected', peerData => {
				const peerObj = { username, peerid: peerId };
				const call = videoData.peer.call(peerData.peer_id, getUserStream(), { metadata: peerObj });
				call.on('stream', peerStream => addParticipant(
					participantsRef,
					updateParticipantsState,
					call,
					peerStream,
					peerData.peer_id,
					peerData.username,
					ROLE_PEER
				));
			})
			socketRef.current.on('user-disconnected', peerData => {
				removeParticipant(participantsRef, updateParticipantsState, peerData.peer_id);
			});
			socketRef.current.on('chat-message', data => {
        chatMessagesRef.current = [...chatMessagesRef.current, data];
        setChatMessages(chatMessagesRef.current);
			});
		})
		videoData?.peer?.on('call', call => {
			call.answer(getUserStream());
			call.on('stream', peerStream => addParticipant(
				participantsRef,
				updateParticipantsState,
				call, peerStream,
				call.metadata.peerid,
				call.metadata.username,
				ROLE_PEER
			));
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
		return () => {
			socketRef.current.disconnect();
			participantsRef.current.value = {};
		}
	}, []);

	useEffect(() => {
		return () => {
			let tracks = userVideoData?.stream?.getTracks()
			tracks && tracks?.forEach(track => {
				track.stop();
			})
		}
	}, [userVideoData]);

	if (!showContent) {
		return null;
	}

	if (showChat) {
		return <MeetChats
			closeChat={()=>setShowChat(!showChat)}
			chatMessages={chatMessages}
			newMessageRef={newChatMessageRef}
			sendNewMessage={sendNewMessage}
			userId={participants[0].id}
			/>
	}

	const showScreenShareOption = typeof window !== 'undefined' && typeof window.navigator !== 'undefined' && !!navigator?.mediaDevices?.getDisplayMedia

	return (
		<main className={styles.main}>
			<div className={styles.meetdescription_container}>
				<div className={styles.meetname_container}>
					<span className={styles.meetname}>{"Meet Name: " + meetname}</span>
				</div>
				<div className={styles.meetid_container}>
					<span className={styles.meetid}>{"Meet ID: " + meetid}</span>
					<button onClick={() => navigator.clipboard.writeText(meetid)}>Copy</button>
				</div>
				{participants.length > 0 && showScreenShareOption ?
					(<div className={styles.switch_btns}>
						<button onClick={toggleWebCamScreenShareVideo}>
							{'Switch to ' + (userVideoData.streamType === WEBCAM ? 'Screen Share' : 'Webcam')}
						</button>
						<button onClick={() => setShowChat(!showChat)}>
							Show Chat
						</button>
					</div>) : null
				}
			</div>
			<MeetVideos	participants={participants} />
		</main>
	)
}

Meet.getInitialProps = async ({ query }) => {
	return query;
}

export default Meet;
