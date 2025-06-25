import Link from "next/link";
import styles from "./partners.module.css";
import React, { useState } from 'react';
import { BsArrowLeft, BsStar, BsStarHalf, BsFillStarFill } from "react-icons/bs";
import { MainLayout } from "@/layout/MainLayout";
import checkFlags from "@/src/checkFlags";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from '@/context/LanguageContext';
import settings from "@/settings";

// Nao selecionado: bs BsStar
// Hover: bs BsStarHalf
// Selecionado: bs BsFillStarFill


export default function Partners() {

    const { loggedUser } = useAuth()
    const { language } = useLanguage();

    const guilds = []

    const [hovered, setHovered] = useState(null);
    const [userServer, setUserServer] = useState(null);


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
                        <div key={index} className={styles.guildCard} style={userServer === guild.id ? { background: "linear-gradient(rgb(255 255 0 / 10%), rgb(255 255 0 / 10%)), #141c2f" } : {}}>
                            <img
                                className={styles.guildIcon}
                                src={settings.guildIconURL(guild.id, guild.icon)}
                                alt={language.getString("PAGES.PARTNERS.GUILD_ICON_ALT", { guildName: guild.name })}
                            />
                            <div className={styles.guildInfo}>
                                <h2 className={styles.guildName} translate="no">{guild.name}</h2>
                                <a className={styles.guildLink} href="https://discord.gg/nemtudo" target="_blank" rel="norreferer">{language.getString("PAGES.PARTNERS.JOIN")}</a>
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