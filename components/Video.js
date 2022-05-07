import React, { useEffect, useRef } from "react";

const Video = ({data: { stream, videoType } }) => {
  const videoRef = useRef(null);

  useEffect(() => {
		stream && stream.then(videoStream => {
			let video = videoRef.current;
			let tracks = video?.srcObject?.getTracks();
			tracks && tracks.forEach(track => {
				if (track.kind === 'video') track.stop();
			});
			video.srcObject = videoStream;
			video.play();
		})
		.catch(err => {
			console.error("error:", err);
		});

  }, [stream, videoType]);

  return <video playsInline autoPlay ref={videoRef} />
};

export default Video