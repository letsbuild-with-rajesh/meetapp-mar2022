import { VIDEO_WIDTH, VIDEO_HEIGHT,
	VIDEO_WIDTH_FULL, VIDEO_HEIGHT_FULL } from "./constants";

export const getWebCamStream = (fullScreen = false) => {
	return navigator.mediaDevices.getUserMedia({
		video: {
			frameRate: 60,
			noiseSuppression: true,
			width: VIDEO_WIDTH,
			height: VIDEO_HEIGHT
		},
		audio: true });
}

export const getScreenShareStream = () => {
	return navigator.mediaDevices.getDisplayMedia({
		video: {
			width: VIDEO_WIDTH,
			height: VIDEO_HEIGHT
		}
	});
}