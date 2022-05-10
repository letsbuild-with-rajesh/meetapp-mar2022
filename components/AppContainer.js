import styles from '../styles/Home.module.scss'

export function AppContainer(props) {
	return <div className={styles.app_container}>
		{props.children}
	</div>
}