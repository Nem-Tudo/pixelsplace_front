import settings from "@/settings"
import styles from "./Header.module.css"
import Tippy from "@tippyjs/react"
import Link from "next/link"
import checkFlags from "@/src/checkFlags"
import Cookies from "js-cookie";
import { useEffect, useState } from "react"
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from "@/context/AuthContext"

export default function Header() {
    const { language } = useLanguage();
    const { loggedUser, updateUserKey } = useAuth();
    const [usingBuildOverride, setUsingBuildOverride] = useState(false);
    const [realUserFlags, setRealUserFlags] = useState([]);

    useEffect(() => {
        if (Cookies.get("active-build-token")) {
            setUsingBuildOverride(true);
        }
    }, [])

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
                    <Link href={"/premium"}><span id={styles.premium}>{language.getString("COMPONENTS.HEADER.ADVANTAGES")}</span></Link>
                    {
                        checkFlags(loggedUser?.flags, "ADMIN_VIEWPAGE") && <Link href={"/admin"}><span id={styles.admin}>{language.getString("COMMON.ADMIN")}</span></Link>
                    }
                </nav>
                <nav className={styles.right}>
                    {
                        loggedUser?.id ? <>
                            <div className={styles.loggedUser}>
                                <span className={styles.userName + " mobilehidden_500"}>{loggedUser.username}</span>
                                <Tippy theme="transparent" trigger="click" interactive={true} content={<>

                                    <div className={styles.tippy_menu}>
                                        <div className={styles.item}>
                                            <Link href={"/user/" + loggedUser?.id}>
                                                <span>{language.getString("COMPONENTS.HEADER.PROFILE")}</span>
                                            </Link>
                                        </div>
                                        <div className={styles.item + " " + styles.redstyle}>
                                            <Link href={"/auth/discord"}>
                                                <span>{language.getString("COMPONENTS.HEADER.DISCONNECT")}</span>
                                            </Link>
                                        </div>
                                        {
                                            checkFlags(loggedUser?.flags, "CHANGE_VIEW_MODE") && <div className={styles.item + " " + styles.bluestyle} onClick={() => {
                                                if (!loggedUser.flags.includes("CHANGE_VIEW_MODE_VIEWING_AS_USER")) {
                                                    setRealUserFlags(loggedUser.flags)
                                                    updateUserKey(["flags", ["CHANGE_VIEW_MODE", "CHANGE_VIEW_MODE_VIEWING_AS_USER"]])
                                                } else {
                                                    updateUserKey(["flags", realUserFlags])
                                                }
                                            }}>
                                                <div>
                                                    <span>{loggedUser.flags.includes("CHANGE_VIEW_MODE_VIEWING_AS_USER") ? language.getString("COMPONENTS.HEADER.NORMALVIEW") : language.getString("COMPONENTS.HEADER.VIEWASUSER")}</span>
                                                </div>
                                            </div>
                                        }
                                        {
                                            usingBuildOverride && <div className={styles.item}>
                                                <Link href={"/buildoverride?t=main"}>
                                                    <span style={{ color: "red" }}>{language.getString("COMPONENTS.HEADER.REMOVE_BUILD_OVERRIDE")}</span>
                                                </Link>
                                            </div>
                                        }
                                    </div>

                                </>}>
                                    <img src={settings.avatarURL(loggedUser.id, loggedUser.avatar)} alt={loggedUser.username} />
                                </Tippy>
                            </div>
                        </> : <>
                            <div className={styles.loggedUser}>
                                <Link href={"/login"}>
                                    <span className={styles.userName}>{language.getString("COMPONENTS.HEADER.LOGIN")}</span>
                                    <img className="mobilehidden_500" src="/assets/avatar.png" alt={language.getString("COMPONENTS.HEADER.LOGGED_OUT")} />
                                </Link>
                            </div>
                        </>
                    }
                </nav>
            </header>
        </>
    )
}