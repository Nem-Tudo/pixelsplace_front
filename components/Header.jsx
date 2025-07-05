import settings from "@/settings"
import styles from "./Header.module.css"
import Tippy from "@tippyjs/react"
import Link from "next/link"
import checkFlags from "@/src/checkFlags"
import Cookies from "js-cookie";
import { useEffect, useState } from "react"
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from "@/context/AuthContext"
import PixelIcon from "@/components/PixelIcon"
import ToggleSwitch from "@/components/ToggleSwitch";
import { useTheme } from 'next-themes';

export default function Header() {
    const { language, changeLanguage, lang, availableLanguages } = useLanguage();
    const { loggedUser, updateUserKey } = useAuth();
    const [usingBuildOverride, setUsingBuildOverride] = useState(false);
    const [realUserFlags, setRealUserFlags] = useState([]);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        if (Cookies.get("active-build-token")) {
            setUsingBuildOverride(true);
        }
    }, [])

    const HeaderLinks = {
        pixelsplace: {
            icon: (<img style={{ width: "40px" }} src="/logo.png" alt="" />),
            label: 'PixelsPlace',
            href: '/'
        },
        premium: {
            label: language.getString("COMPONENTS.HEADER.ADVANTAGES"),
            href: '/premium',
            id: (loggedUser?.premium ? '' : styles.premium)
        },
        admin: {
            label: language.getString("COMMON.ADMIN"),
            href: '/admin',
            exclusive: {
                flags: ["ADMIN_VIEWPAGE"] // Flag única (formato atual)
            }
        },
        timetravel: {
            label: language.getString("COMMON.TIME_TRAVEL"),
            href: '/timetravel',
            exclusive: {
                keys: { name: "premium", value: 1 } // Key única (novo formato)
            }
        },
        credits: {
            label: language.getString("COMPONENTS.HEADER.CREDITS"),
            href: '/credits'
        }
    };

    const userValidLinks = Object.entries(HeaderLinks).filter(([_, { exclusive }]) => {
        // Se não tem restrições, permite acesso
        if (!exclusive) return true;

        // Se não tem usuário logado e tem restrições, nega acesso
        if (!loggedUser) return false;

        // Função para verificar uma condição individual
        const checkCondition = (condition) => {
            // Verificação de flags
            if (condition.flags) {
                // Suporte a múltiplas flags com operadores lógicos
                if (Array.isArray(condition.flags)) {
                    // Por padrão usa OR - qualquer flag serve
                    const operator = condition.flagsOperator || 'OR';

                    if (operator === 'AND') {
                        return condition.flags.every(flag => checkFlags(loggedUser?.flags, flag));
                    } else { // OR
                        return condition.flags.some(flag => checkFlags(loggedUser?.flags, flag));
                    }
                } else {
                    // Flag única
                    return checkFlags(loggedUser?.flags, condition.flags);
                }
            }

            // Verificação de keys (propriedades do usuário)
            if (condition.keys) {
                // Suporte a múltiplas keys
                if (Array.isArray(condition.keys)) {
                    const operator = condition.keysOperator || 'OR';

                    if (operator === 'AND') {
                        return condition.keys.every(key =>
                            loggedUser[key.name] === key.value
                        );
                    } else { // OR
                        return condition.keys.some(key =>
                            loggedUser[key.name] === key.value
                        );
                    }
                } else {
                    // Key única (compatibilidade com formato antigo)
                    const key = condition.keys;
                    return loggedUser[key.name] === key.value;
                }
            }
            return false;
        };

        // Se exclusive é um array, trata como múltiplas condições
        if (Array.isArray(exclusive)) {
            const operator = exclusive.operator || 'OR';

            if (operator === 'AND') {
                // Todas as condições devem ser verdadeiras
                return exclusive.every(checkCondition);
            } else { // OR
                // Pelo menos uma condição deve ser verdadeira
                return exclusive.some(checkCondition);
            }
        } else {
            // Condição única
            return checkCondition(exclusive);
        }
    });

    return (
        <>
            <header className={styles.header}>
                {/* Mobile hamburger menu */}
                <div className={[styles.left, 'mobileOnly'].join(' ')}>
                    <Tippy theme="pixelsplace_dropdown" arrow={false} animation="scale-extreme" trigger="click" interactive={true} content={<>

                        {
                            userValidLinks.map(([name, { label, href, id, exclusive }]) => (
                                <Link href={href} key={href}>
                                    <span>{label}</span>
                                </Link>
                            ))
                        }

                    </>}>
                        <PixelIcon codename={'menu'} className={styles.burgerMenu} />
                    </Tippy>
                </div>

                <nav className={[styles.left, 'mobileHidden_720'].join(' ')}>
                    {
                        userValidLinks.map(([name, { icon, label, href, id, exclusive }]) => (
                            <Link id={id || ''} className={styles.item} href={href} key={href}>
                                {
                                    icon && <div className={styles.icon}>{icon}</div>
                                }
                                <span>{label}</span>
                            </Link>
                        ))
                    }
                </nav>

                <p className={'mobileOnly ' + styles.centerTitle}>PixelsPlace</p>

                <nav className={styles.right}>
                    {
                        loggedUser?.id ? <>
                            <Tippy theme="pixelsplace_dropdown" arrow={false} trigger="click" animation="scale-extreme" interactive={true} content={<>

                                <Link href={`/user/${loggedUser?.id}`}>
                                    <span>{language.getString("COMPONENTS.HEADER.PROFILE")}</span>
                                </Link>
                                <section>
                                    {/* {language.getString('COMMON.LANGUAGE')} */}
                                    {/* Dont translate */}
                                    <span>Language</span>
                                    <select
                                        id="language"
                                        value={lang}
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
                                </section>
                                <Tippy theme="pixelsplace_dropdown" arrow={false} placement="left" trigger="click" interactive={true} animation="scale-extreme" content={(
                                    <>
                                        <section>
                                            <span>{language.getString("COMMON.THEME")}</span>
                                            <select
                                                id="theme"
                                                value={theme}
                                                onChange={(e) => {
                                                    setTheme(e.target.value)
                                                }}
                                            >
                                                <option value="DARK">Default</option>
                                                <option value="DARK">True Dark</option>
                                                <option value="LIGHT">Light</option>
                                                <option value="BLACKOUT">Blackout</option>
                                            </select>
                                        </section>
                                        <label htmlFor="PreferenceSfxToggle">
                                            <span>{language.getString("COMMON.SOUND_EFFECTS")}</span>
                                            <ToggleSwitch id="PreferenceSfxToggle" defaultChecked={localStorage.getItem("preferences.sound_effects_disabled") != "true"} onChange={(e) => {
                                                localStorage.setItem("preferences.sound_effects_disabled", !e.target.checked)
                                            }} />
                                        </label>
                                    </>
                                )}>
                                    <div>
                                        <span>{language.getString("COMMON.PREFERENCES")}</span>
                                        <PixelIcon codename={'chevron-right'} />
                                    </div>
                                </Tippy>
                                {
                                    checkFlags(loggedUser?.flags, "CHANGE_VIEW_MODE") && <Tippy theme="pixelsplace_dropdown" arrow={false} placement="left" trigger="click" interactive={true} animation="scale-extreme" content={(
                                        <>
                                            <label htmlFor="ViewAsUserToggle">
                                                <span>{language.getString("COMPONENTS.HEADER.VIEW_AS_USER")}</span>
                                                <ToggleSwitch id="ViewAsUserToggle" checked={loggedUser?.flags?.includes("CHANGE_VIEW_MODE_VIEWING_AS_USER")} onChange={() => {
                                                    if (!loggedUser.flags.includes("CHANGE_VIEW_MODE_VIEWING_AS_USER")) {
                                                        setRealUserFlags(loggedUser.flags)
                                                        updateUserKey(["flags", ["CHANGE_VIEW_MODE", "CHANGE_VIEW_MODE_VIEWING_AS_USER"]])
                                                    } else {
                                                        updateUserKey(["flags", realUserFlags])
                                                    }
                                                }} />
                                            </label>
                                            <label htmlFor="ViewAsPremiumToggle">
                                                <span>{language.getString("COMMON.PREMIUM")}</span>
                                                <ToggleSwitch id="ViewAsPremiumToggle" onChange={() => updateUserKey(["premium", !loggedUser?.premium])} checked={loggedUser?.premium} />
                                            </label>
                                        </>
                                    )}>
                                        <div>
                                            <span>{language.getString("COMPONENTS.HEADER.VIEW_SETTINGS")}</span>
                                            <PixelIcon codename={'chevron-right'} />
                                        </div>
                                    </Tippy>
                                }
                                <Link href={"/auth/discord"} style={{ '--hover-color': '#ff0000', '--hover-color-text': '#ffffff' }}>
                                    <span>{language.getString("COMPONENTS.HEADER.DISCONNECT")}</span>
                                </Link>
                                {
                                    usingBuildOverride && <Link href={"/buildoverride?t=main"} style={{ color: "red", '--hover-color': '#ff0000', '--hover-color-text': '#ffffff' }}>
                                        <span>{language.getString("COMPONENTS.HEADER.REMOVE_BUILD_OVERRIDE")}</span>
                                    </Link>
                                }

                            </>}>
                                <div className={styles.loggedUser}>
                                    <span className={styles.userName + " mobileHidden_720"}>{loggedUser.username}</span>
                                    <img src={settings.avatarURL(loggedUser.id, loggedUser.avatar)} alt={loggedUser.username} />
                                </div>
                            </Tippy>
                        </> : <>
                            <Link href={"/login"} className={styles.loggedUser}>
                                <span className={styles.userName}>{language.getString("COMPONENTS.HEADER.LOGIN")}</span>
                                <img className="mobileHidden_500" src="/assets/avatar.png" alt={language.getString("COMPONENTS.HEADER.LOGGED_OUT")} />
                            </Link>
                        </>
                    }
                </nav>
            </header>
        </>
    )
}