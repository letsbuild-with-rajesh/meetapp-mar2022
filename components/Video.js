import React, { useEffect, useRef } from "react";

const Video = ({stream}) => {
  const videoRef = useRef(null);

  useEffect(() => {
		if (stream) {
			let video = videoRef.current;
			let tracks = video?.srcObject?.getTracks();
			tracks && tracks.forEach(track => {
				if (track.kind === 'video') track.stop();
			});
			video.srcObject = stream;
			video.play();
		}
  }, [stream]);

  return <video playsInline autoPlay ref={videoRef} />
};

export default Video