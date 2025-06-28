import styles from "@/components/GuildCard.module.css";
import PixelIcon from "@/components/PixelIcon";
import { BsArrowLeft, BsStar, BsStarHalf, BsFillStarFill } from "react-icons/bs";
import React, { useEffect, useState } from 'react';
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from '@/context/LanguageContext';

export default function GuildCard({ guild, index }) {
    const { loggedUser } = useAuth()
    const { language } = useLanguage();

    const [hovered, setHovered] = useState(null);
    const [userServer, setUserServer] = useState(null);

    useEffect(() => {
        setUserServer(loggedUser?.settings.selected_guild)
    }, [loggedUser])

    return (
        <div key={index} className={styles.guildCard} style={userServer === guild.id ? { background: "linear-gradient(rgb(0 255 81 / 10%), rgb(10 255 115 / 16%)), rgb(34 38 35)" } : {}}>
            <img
                className={styles.guildIcon}
                src={settings.guildIconURL(guild.id, guild.icon)}
                alt={language.getString("PAGES.PARTNERS.GUILD_ICON_ALT", { guildName: guild.name })}
            />
            <div className={styles.guildInfo}>
                <h2 className={styles.guildName} translate="no">{guild.name} <Verified verified={guild.flags.includes("VERIFIED")}/></h2>
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
    )
}