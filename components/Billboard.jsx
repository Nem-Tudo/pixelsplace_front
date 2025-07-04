import styles from "./Billboard.module.css"

export default function Billboard({ children }) {

    return (
        <main id={styles.main}>
            {children}
        </main>
    )
}