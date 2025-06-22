import settings from "@/settings"
import styles from "./Header.module.css"
import Tippy from "@tippyjs/react"
import Link from "next/link"
import checkFlags from "@/src/checkFlags"

export default function Header({ loggedUser, loading }) {

    return (
        <>
            <header className={styles.header}>
                <nav className={styles.left}>
                    <Link href={"/"}>
                        <div className={styles.item}>
                            <img style={{ width: "40px" }} src="/logo.png" alt="" />
                            <span id={styles.pixelPlace}>PixelsPlace</span>
                        </div>
                    </Link>
                    <Link href={"/premium"}><span id={styles.premium}>Vantagens</span></Link>
                    {
                        checkFlags(loggedUser?.flags, "ADMIN_VIEWPAGE") && <Link href={"/admin"}><span id={styles.admin}>Admin</span></Link>
                    }
                </nav>
                <nav className={styles.right}>
                    {
                        !loading && loggedUser?.id ? <>
                            <div className={styles.loggedUser}>
                                <span className={styles.userName+" mobilehidden_500"}>{loggedUser.username}</span>
                                <Tippy trigger="click" interactive={true} content={<>

                                    <div className={styles.tippy_menu}>
                                        <Link href={"/user/" + loggedUser?.id}>
                                            <span>Perfil</span>
                                        </Link>
                                        <Link id={styles.tippyDisconnect} href={"/auth/discord"}>
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
                                    <span className={styles.userName}>Logar</span>
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