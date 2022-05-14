import { useState } from 'react'
import { useRouter } from 'next/router';
import { v4 as uuidV4 } from 'uuid';
import styles from '../styles/Home.module.scss'

const START_CONVERSATION = "start_conversation";
const JOIN_CONVERSATION = "join_conversation";

export default function Home() {
  const initialMeetInputs = {
    username: '',
    meetname: '',
    meetid: ''
  }
  const [startOrJoinConversation, updateStartOrJoinConversation] = useState(START_CONVERSATION);
  const [meetInputs, setMeetInputs] = useState(initialMeetInputs)
  const router = useRouter();

  const toggleConversationType = () => {
    updateStartOrJoinConversation(startOrJoinConversation === START_CONVERSATION ? JOIN_CONVERSATION : START_CONVERSATION);
    setMeetInputs(initialMeetInputs);
  }

  const updateMeetInput = (e) => {
    let updatedMeetInputs = {...meetInputs};
    updatedMeetInputs[e.target.name] = e.target.value;
    setMeetInputs(updatedMeetInputs);
  }

  const submitHandler = () => {
    let { username, meetid, meetname } = meetInputs;
    if (startOrJoinConversation === START_CONVERSATION) {
      meetid = uuidV4();
      meetid = Buffer.from(meetid.replace(/-/g, ""), 'hex').toString('base64');
    }
    router.push('/meet?meetid='+meetid+'&meetname='+meetname+'&username='+username);
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Hey, Welcome to <p className={styles.app_name}>MeetApp!</p></h1>
      <h3 className={styles.description}>No hassle of Sign Ups! Just get started for a quick conversation!</h3>
      <div className={styles.toggle_btn_container}>
        <button onClick={toggleConversationType}>Click here to {startOrJoinConversation === START_CONVERSATION ? "Join" : "Start"} conversation</button>
      </div>
      <br />
      <div className={styles.input_block}>
        <div className={styles.input_container}>
          <label>Username:&nbsp;</label>
          <input type="text" name="username" onChange={updateMeetInput} value={meetInputs.username} />
        </div>
        <div className={styles.input_container}>
          <label>Meet {startOrJoinConversation === START_CONVERSATION ? "Name" : "Id"}:&nbsp;</label>
          <input
            type="text"
            name={startOrJoinConversation === START_CONVERSATION ? "meetname" : "meetid"}
            onChange={updateMeetInput}
            value={startOrJoinConversation === START_CONVERSATION ? meetInputs.meetname :  meetInputs.meetid}
            />
        </div>
      </div>
      <br />
      <button className={styles.submit} onClick={submitHandler}>{startOrJoinConversation === START_CONVERSATION ? "Start" : "Join"} conversation</button>
    </main>
  )
}
