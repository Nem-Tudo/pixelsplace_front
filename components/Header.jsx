import settings from "@/settings"
import styles from "./Header.module.css"
import Tippy from "@tippyjs/react"
import Link from "next/link"

export default function Header({ loggedUser, loading }) {

    return (
        <>
            <header className={styles.header}>
                <nav className={styles.left}>
                    <Link href={"/"}>
                        <div className={styles.item}>
                            <img style={{width: "40px"}} src="/logo.png" alt="" />
                            <span>PixelsPlace</span>
                        </div>
                    </Link>
                    <Link href={"/premium"}><span id={styles.premium}>Vantagens</span></Link>
                </nav>
                <nav className={styles.right}>
                    {
                        !loading && loggedUser?.id ? <>
                            <div className={styles.loggedUser}>
                                <span className="mobilehidden_500">{loggedUser.username}</span>
                                <Tippy trigger="click" interactive={true} content={<>

                                    <div className={styles.tippy_disconnect}>
                                        <Link href={"/auth/discord"}>
                                            <span>Desconectar</span>
                                        </Link>
                                    </div>

                                </>}>
                                    <img src={settings.avatarURL(loggedUser.id, loggedUser.avatar)} alt={loggedUser.username} />
                                </Tippy>
                            </div>
                        </> : <>
                            <div className={styles.loggedUser}>
                                <Link href={"/login"}>
                                    <span>Logar</span>
                                    <img className="mobilehidden_500" src="/assets/avatar.png" alt="Deslogado" />
                                </Link>
                            </div>
                        </>
                    }
                </nav>
            </header>
        </>
    )
}