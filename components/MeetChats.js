import styles from '../styles/MeetChats.module.scss';

const MeetChats = (props) => {
	const { closeChat, chatMessages, newMessageRef, sendNewMessage, userId } = props;
	return <main className={`${styles.main} ${styles.chat_main}`}>
		<button className={styles.close_chat_Btn} onClick={closeChat}>
			Close Chat
		</button>
		<div className={styles.topcontainer}>
			<div className={styles.messages_container}>
				{chatMessages.length === 0 ?
					<span className={styles.no_message_text}>No messages yet!</span>
					:
					chatMessages.map((val, id) => {
						return (
							<div
							 	key={`chat-message-${id}-${val.peerid}`}
								className={`${styles.message} ${(val.peerid === userId ? styles.align_message_right : '')}`}>
								<div className={styles.message_username}>
									{val.username}
								</div>
								<div className={styles.message_content}>
									{val.message}
								</div>
							</div>
						)
					})}
			</div>
			<div className={styles.new_message_container}>
				<input type="text"
					ref={newMessageRef}
					className={styles.new_message_input}
					onKeyPress={(e) => {
						if (e.key === 'Enter') {
							sendNewMessage();
						}
					}}
					onChange={(e) => {
						newMessageRef.current.value = e.target.value;
					}}
					/>
				<button className={styles.send_message_btn} onClick={sendNewMessage}>Send</button>
			</div>
		</div>
	</main>
}

export default MeetChats;