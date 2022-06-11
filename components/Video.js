import React, { useState, useEffect, useRef } from "react";
import styles from '../styles/Video.module.scss';

const Video = ({ stream }) => {
	const [showNoVideo, setShowNoVideo] = useState(false);
	const videoRef = useRef(null);

	useEffect(() => {
		if (stream) {
			let video = videoRef.current;
			let tracks = video?.srcObject?.getTracks();
			tracks && tracks.forEach(track => {
				if (track.kind === 'video') track.stop();
			});
			video.srcObject = stream;
			if (video.isPlaying) {
				video.isPlaying = false;
				video.play().then(() => {
					video.isPlaying = true;
				})
			}
			video?.srcObject?.getVideoTracks()[0]?.addEventListener('ended', () => {
				setShowNoVideo(true);
			});
		}
	}, [stream]);

	const switchToFullScreen = () => {
		let video = videoRef.current;
		if (video.requestFullscreen) {
			video.requestFullscreen();
		} else if (video.webkitRequestFullscreen) {
			video.webkitRequestFullscreen();
		} else if (video.msRequestFullscreen) {
			video.msRequestFullscreen();
		}
	}

	if (showNoVideo || !stream) {
		return <div className={styles.video}></div>
	}
	return <video playsInline autoPlay ref={videoRef} className={styles.video} onDoubleClick={switchToFullScreen} />
};

export default Video