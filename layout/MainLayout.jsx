import styles from "./MainLayout.module.css";
import Head from "next/head";
import Header from "@/components/Header"

import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import settings from "@/settings";
import { useLanguage } from '@/context/LanguageContext';
import { usePopup } from '@/context/PopupContext';

export function MainLayout({ children }) {
    const { language, lang } = useLanguage();
    const { loggedUser } = useAuth();
    const { openPopup } = usePopup()

    const [ip, setIp] = useState(null);

    let executed = false;
    useEffect(() => {
        if (executed) return;
        executed = true;
        if (Cookies.get("active-build-token")) {
            fetchCurrentBuild()
        }
    }, [])

    async function fetchCurrentBuild() {
        const branchtoken = Cookies.get("active-build-token");
        if (!branchtoken || branchtoken === 'main') return;
        try {
            const request = await fetch(`${settings.apiURL}/builds/parsetoken/${branchtoken}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            const response = await request.json();
            if (!request.ok) {
                console.log(response, request);
                openPopup("error", { message: language.getString("LAYOUTS.MAIN_LAYOUT.INVALID_BUILD_ALERT") });
                location.href = `/buildoverride?t=main`;
                return
            }
            console.log(`RUNNING CUSTOM BUILD`, response);
        } catch (error) {
            console.error('Error fetching current branch:', error)
        }
    }

    useEffect(() => {
        document.querySelector("html").lang = lang || "pt";
    }, [language]);

    if (loggedUser?.flags.includes("BANNED")) {
        fetch("https://api.ipify.org?format=json")
            .then(res => res.json())
            .then(data => setIp(data.ip))
            .catch(err => console.log("Erro ao obter IP:", err));
        return <>
            <main style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh"
            }}>
                <img src="https://i.pinimg.com/564x/0d/ab/ba/0dabbac154edaa9bf08b9bdcbfb993a9.jpg" alt="" style={{ width: "80dvw", maxWidth: "350px" }} />
                <h1 style={{
                    fontSize: "2rem",
                    fontWeight: "bold"
                }}>{language.getString("LAYOUTS.MAIN_LAYOUT.BANNED_TITLE")}</h1>
                <br />
                <span>{language.getString("LAYOUTS.MAIN_LAYOUT.AFFECTED_AREAS")}: DISCORD_ID ({loggedUser.id}), USER_IP ({ip})</span>
                <br />
                <span>{language.getString("LAYOUTS.MAIN_LAYOUT.NO_FANCY_UNBAN_PAGE")}</span>
                <span>{language.getString("LAYOUTS.MAIN_LAYOUT.OPEN_TICKET_INSTRUCTION")} <a className="link" target="_blank" rel="norreferer" style={{ color: "blue" }} href="https://discord.gg/nemtudo">discord.gg/nemtudo</a> {language.getString("LAYOUTS.MAIN_LAYOUT.EXPLAIN_WHAT_HAPPENED")}</span>
                <span>{language.getString("LAYOUTS.MAIN_LAYOUT.MODS_HAVE_RECORDS")}</span>
                <span>{language.getString("LAYOUTS.MAIN_LAYOUT.FAREWELL_MESSAGE")}</span>
            </main>

        </>
    }

    return (
        <>
            <Head>
                <title>{`PixelsPlace`}</title>
                <meta name="theme-color" content="#80bbff" />
            </Head>
            <Header />
            <main className={styles.main}>
                {children}
            </main>
        </>
    )

}