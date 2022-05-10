export const getWebCamStream = (fullScreen = false) => {
	return navigator.mediaDevices.getUserMedia({
		video: {
			frameRate: 60,
			noiseSuppression: true
		},
		audio: true
	});
}

export const getScreenShareStream = () => {
	return navigator.mediaDevices.getDisplayMedia();
}