import Video from '../components/Video';
import styles from '../styles/MeetVideos.module.scss';

const MeetVideos = (props) => {
	const { participants } = props;
	return <>
		<div className={styles.videos_container}>
			{participants.length > 0 ?
				participants.map((participant) => {
					return <div className={styles.participant_container} key={participant.id} >
						<Video stream={participant.stream} />
						<p className={styles.participant_name}>{participant.name}</p>
					</div>
				})
				: <p className={styles.loading_text}>Loading meet...</p>}
		</div>
		<p>Swipe left/right to view other participants</p>
	</>
}

export default MeetVideos;