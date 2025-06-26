import settings from "@/settings"
import styles from "./Header.module.css"
import Tippy from "@tippyjs/react"
import Link from "next/link"
import checkFlags from "@/src/checkFlags"
import Cookies from "js-cookie";
import { useEffect, useState } from "react"
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from "@/context/AuthContext"
import CustomButton from "@/components/CustomButton";

export default function Header() {
    const { language, changeLanguage, lang, availableLanguages } = useLanguage();
    const { loggedUser, updateUserKey, stressTestCount } = useAuth();
    const [usingBuildOverride, setUsingBuildOverride] = useState(false);
    const [realUserFlags, setRealUserFlags] = useState([]);

    useEffect(() => {
        if (Cookies.get("active-build-token")) {
            setUsingBuildOverride(true);
        }
    }, [])

    return (
        <>
            <div style={{
                position: "absolute",
                zIndex: "99",
                background: "orange",
                width: "100dvw",
                textAlign: "center",
                padding: "3px"
            }}>
                <span>({loggedUser?.id}:{stressTestCount}) Você está no teste de stress. Mantenha a janela aberta</span>
                <a style={{ marginLeft: "15px", color: "lime" }} href="/buildoverride?t=main">Parar</a>
            </div>
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
                                        <Link href={"/user/" + loggedUser?.id}>
                                            <div className={styles.item}>
                                                <span>{language.getString("COMPONENTS.HEADER.PROFILE")}</span>
                                            </div>
                                        </Link>
                                        <div className={styles.item}>
                                            {/* {language.getString('COMMON.LANGUAGE')} */}
                                            {/* Dont translate */}
                                            {"Language"}
                                            <select
                                                id="language"
                                                value={lang}
                                                style={{ marginLeft: "15px" }}
                                                onChange={(e) => {
                                                    const l = e.target.value;
                                                    console.log("Switching user's language to ", l);
                                                    changeLanguage(l);
                                                }}
                                            >
                                                {
                                                    availableLanguages.map((ling) => (
                                                        <option key={ling} value={ling}>
                                                            {ling.toUpperCase()}
                                                        </option>
                                                    ))
                                                }
                                            </select>
                                        </div>
                                        <Link href={"/auth/discord"}>
                                            <div className={styles.item + " " + styles.redstyle}>
                                                <span>{language.getString("COMPONENTS.HEADER.DISCONNECT")}</span>
                                            </div>
                                        </Link>
                                        {
                                            checkFlags(loggedUser?.flags, "CHANGE_VIEW_MODE") && <Tippy placement="left" trigger="click" appendTo={() => document.body} interactive={true} theme="white" content={(
                                                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                                                    <CustomButton onClick={() => {
                                                        if (!loggedUser.flags.includes("CHANGE_VIEW_MODE_VIEWING_AS_USER")) {
                                                            setRealUserFlags(loggedUser.flags)
                                                            updateUserKey(["flags", ["CHANGE_VIEW_MODE", "CHANGE_VIEW_MODE_VIEWING_AS_USER"]])
                                                        } else {
                                                            updateUserKey(["flags", realUserFlags])
                                                        }
                                                    }}>{loggedUser.flags.includes("CHANGE_VIEW_MODE_VIEWING_AS_USER") ? language.getString("COMPONENTS.HEADER.NORMAL_VIEW") : language.getString("COMPONENTS.HEADER.VIEW_AS_USER")}</CustomButton>
                                                    <CustomButton onClick={() => {
                                                        updateUserKey(["premium", !loggedUser?.premium])
                                                    }}>Premium: {loggedUser?.premium ? "True" : "False"}</CustomButton>
                                                </div>
                                            )}>
                                                <div className={styles.item + " " + styles.bluestyle}>
                                                    <div>
                                                        <span>View Settings</span>
                                                    </div>
                                                </div>
                                            </Tippy>
                                        }
                                        {
                                            usingBuildOverride && <Link href={"/buildoverride?t=main"}>
                                                <div className={styles.item}>
                                                    <span style={{ color: "red" }}>{language.getString("COMPONENTS.HEADER.REMOVE_BUILD_OVERRIDE")}</span>
                                                </div>
                                            </Link>
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