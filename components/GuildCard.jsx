import styles from "@/components/GuildCard.module.css";
import PixelIcon from "@/components/PixelIcon";
import { BsArrowLeft, BsStar, BsStarHalf, BsFillStarFill } from "react-icons/bs";
import React, { useEffect, useState } from 'react';
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from '@/context/LanguageContext';
import settings from "@/settings";
import Verified from "@/components/Verified";
import CustomButton from "@/components/CustomButton";

export default function GuildCard({ guild, index, ...props }) {
    const { loggedUser } = useAuth()
    const { language } = useLanguage();

    const [hovered, setHovered] = useState(null);
    const [userServer, setUserServer] = useState(null);

    useEffect(() => {
        setUserServer(loggedUser?.settings.selected_guild)
    }, [loggedUser])

    const className = [
        styles.guildCard,
        props.className || ''
    ].join(' ');
    
    return (
        <div {...props} key={index || {}} className={className} style={index && userServer === guild.id ? { background: "linear-gradient(rgb(0 255 81 / 10%), rgb(10 255 115 / 16%)), rgb(34 38 35)" } : {}}>
            <img
                className={styles.guildIcon}
                src={settings.guildIconURL(guild.id, guild.icon)}
                alt={language.getString("COMPONENTS.GUILD_CARD.GUILD_ICON_ALT", { guildName: guild.name })}
            />
            <div className={styles.guildInfo}>
                <h2 className={styles.guildName} translate="no">
                    <span>{guild.name}</span>
                    <Verified verified={guild.flags.includes("VERIFIED")}/>
                </h2>
                <footer className={styles.buttonsContainer}>
                    <CustomButton label={language.getString("COMPONENTS.GUILD_CARD.JOIN")} href={guild.invite} target="_blank" rel="norreferer" />
                    <CustomButton label={language.getString("COMPONENTS.GUILD_CARD.VISIT")} color={'#80bbff'} hierarchy={2} href={`/guild/${guild.id}`} />
                </footer>
            </div>
            <div
                onMouseEnter={() => setHovered(guild.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => setUserServer(guild.id)}
                className={styles.guildStar}
            >
                {userServer === guild.id
                    ? <BsFillStarFill />
                    : hovered === guild.id
                        ? <BsStarHalf />
                        : <BsStar />
                }
            </div>
        </div>
    )
}