import settings from "@/settings"
import styles from "./Header.module.css"
import Tippy from "@tippyjs/react"
import Link from "next/link"

export default function Header({ loggedUser, loading }) {

    return (
        <>
            <header className={styles.header}>
                <nav className={styles.left}>
                    <Link href={"/"}>PixelsPlace</Link>
                    <Link href={"/premium"}>Vantagens</Link>
                </nav>
                <nav className={styles.right}>
                    {
                        !loading && loggedUser?.id ? <>
                            <span>{loggedUser.username}</span>
                            <Tippy trigger="click" interactive={true} content={<>

                                <div className={styles.tippy_disconnect}>
                                    <Link href={"/auth/discord"}>
                                        <span>Desconectar</span>
                                    </Link>
                                </div>

                            </>}>
                                <img src={settings.avatarURL(loggedUser.id, loggedUser.avatar)} alt={loggedUser.username} />
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