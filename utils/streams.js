export const getWebCamStream = (controls = {video: true, audio: true}) => {
	if (!controls.video && !controls.audio) {
		return new Promise((resolve)=> resolve(null));
	}
	return navigator.mediaDevices.getUserMedia({
		video: controls.video ? {
			frameRate: 60,
			noiseSuppression: true
		} : false,
		audio: controls.audio
	});
}

export const getScreenShareStream = () => {
	return navigator.mediaDevices.getDisplayMedia();
}

export const replaceStreams = (ref, updateState, stream) => {
	const participants = ref.current.value || {};
	Object.keys(participants).map((key)=>{
		const participant = participants[key];
		const connection = participant?.call?.peerConnection;
		if (connection) {
			for (const sender of connection.getSenders()) {
				if (sender.track.kind == "audio") {
					if (stream.getAudioTracks().length > 0) {
						sender.replaceTrack(stream.getAudioTracks()[0]);
					}
				}
				if (sender.track.kind == "video") {
					if (stream.getVideoTracks().length > 0) {
						sender.replaceTrack(stream.getVideoTracks()[0]);
					}
				}
			}
			ref.current.value[key].call.peerConnection = connection;
		}
	});
	updateState();
}