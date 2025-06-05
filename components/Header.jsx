import settings from "@/settings"
import styles from "./Header.module.css"
import Tippy from "@tippyjs/react"
import Link from "next/link"

export default function Header({ user }) {

    return (
        <>
            <header className={styles.header}>
                <nav className={styles.left}>
                    <Link href={"/"}>PixelsPlace</Link>
                    <Link href={"/premium"}>Vantagens</Link>
                </nav>
                <nav className={styles.right}>
                    {
                        user?.id ? <>
                            <span>{user.username}</span>
                            <Tippy trigger="click" interactive={true} content={<>

                                <div className={styles.tippy_disconnect}>
                                    <Link href={"/auth/discord"}>
                                        <span>Desconectar</span>
                                    </Link>
                                </div>

                            </>}>
                                <img src={settings.avatarURL(user.id, user.avatar)} alt={user.username} />
                            </Tippy>
                        </> : <>
                            <Link href={"/login"}>
                                <span>Logar</span>
                                <img src="/avatar.png" alt="Deslogado" />
                            </Link>
                        </>
                    }
                </nav>
            </header>
        </>
    )
}