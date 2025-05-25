import styles from "./Header.module.css"

export default function Header({ user }) {

    return (
        <>
            <header className={styles.header}>
                <nav className={styles.nav}>
                    {
                        user ? <>
                            <span>{user.username}</span>
                            <img src="/avatar.png" /*src={user.avatar}*/ alt={user.username} />
                        </> : <>
                            <a href="/login">Logar</a>
                            <img src="/avatar.png" alt="Deslogado" />
                        </>
                    }
                </nav>
            </header>
        </>
    )
}