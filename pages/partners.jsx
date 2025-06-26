import Link from "next/link";
import styles from "./partners.module.css";
import React, { useEffect, useState } from 'react';
import { BsArrowLeft, BsStar, BsStarHalf, BsFillStarFill } from "react-icons/bs";
import { MainLayout } from "@/layout/MainLayout";
import checkFlags from "@/src/checkFlags";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from '@/context/LanguageContext';
import settings from "@/settings";

// Nao selecionado: bs BsStar
// Hover: bs BsStarHalf
// Selecionado: bs BsFillStarFill

export async function getServerSideProps() {
    try {
        const res = await fetch(`${settings.apiURL}/guilds`, {
            headers: { 'Content-Type': 'application/json' },
        });
        const data = await res.json();
        if (!res.ok) return { props: { error: true, errormessage: data.message } };
        return { props: { guilds: data } };
    } catch (e) {
        return { props: { error: true, errormessage: e.message } };
    }
}

export default function Partners({ guilds, error, errormessage }) {

    const { loggedUser } = useAuth()
    const { language } = useLanguage();

    const [hovered, setHovered] = useState(null);
    const [userServer, setUserServer] = useState(null);

    useEffect(() => {
        setUserServer(loggedUser?.settings.selected_guild)
    }, [loggedUser])

    if (error) return (
        <>
            <div>
                <h1>Erro ao carregar servidores</h1>
                <span>Mensagem: {errormessage}</span>
            </div>
        </>
    )

    return (<>

        <MainLayout>

            <main className={styles.main}>
                <div className={styles.title}>
                    <h1>{language.getString("PAGES.PARTNERS.SERVERS")}</h1>
                    <h5>{language.getString("PAGES.PARTNERS.PARTICIPATING_SERVERS")}</h5>
                    <Link href="/"><BsArrowLeft /> {language.getString("COMMON.BACK")}</Link>
                </div>


                <div className={styles.servers}>
                    {!checkFlags(loggedUser?.flags, "VIEW_PARTNERS") && <span>{language.getString("PAGES.PARTNERS.SECRET")}</span>}
                    {checkFlags(loggedUser?.flags, "VIEW_PARTNERS") && guilds.slice(0, 30).map((guild, index) => (
                        <div key={index} className={styles.guildCard} style={userServer === guild.id ? { background: "linear-gradient(rgb(0 255 81 / 10%), rgb(10 255 115 / 16%)), rgb(34 38 35)" } : {}}>
                            <img
                                className={styles.guildIcon}
                                src={settings.guildIconURL(guild.id, guild.icon)}
                                alt={language.getString("PAGES.PARTNERS.GUILD_ICON_ALT", { guildName: guild.name })}
                            />
                            <div className={styles.guildInfo}>
                                <h2 className={styles.guildName} translate="no">{guild.name}</h2>
                                <a className={styles.guildLink} href={guild.invite} target="_blank" rel="norreferer">{language.getString("PAGES.PARTNERS.JOIN")}</a>
                                <div
                                    onMouseEnter={() => setHovered(guild.id)}
                                    onMouseLeave={() => setHovered(null)}
                                    onClick={() => setUserServer(guild.id)}
                                    style={{ fontSize: '2rem', cursor: 'pointer', position: 'absolute', right: '0' }}
                                >
                                    {userServer === guild.id
                                        ? <BsFillStarFill />
                                        : hovered === guild.id
                                            ? <BsStarHalf />
                                            : <BsStar />
                                    }
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </MainLayout>



    </>)


}