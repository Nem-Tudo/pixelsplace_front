import styles from "@/components/GuildCard.module.css";
import PixelIcon from "@/components/PixelIcon";
import { BsStar, BsStarHalf, BsFillStarFill } from "react-icons/bs";
import React, { useState } from 'react';
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from '@/context/LanguageContext';
import settings from "@/settings";
import Verified from "@/components/Verified";
import CustomButton from "@/components/CustomButton";
import { usePopup } from '@/context/PopupContext';

/**
 * Cartão de servidor
 * @param {Object} properties - Passagem de propriedades pro componente
 * @param {JSON} properties.guild - Servidor a ser exibido
 * @param {'ALWAYS' | 'NEVER' | 'ONLY_IF_SELECTED'} [properties.showStar=ONLY_IF_SELECTED] - Condição em que a estrela de seleção de servidor deve ser exibida
 * @param {any} [properties.props] - Outras propriedades HTML (opcional)
 */
export default function GuildCard({ guild, showStar = "ONLY_IF_SELECTED", ...props }) {
    const { loggedUser, token, updateUserKey } = useAuth()
    const { language } = useLanguage();

    const [hovered, setHovered] = useState(null);

    const { openPopup } = usePopup();

    const fetchWithAuth = async (url, method, body) => {
        try {
            const res = await fetch(`${settings.apiURL}${url}`, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    authorization: token,
                },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Erro na requisição.");
            return data;
        } catch (err) {
            openPopup("error", { message: `${err.message}` });
        } finally {
        }
    };

    const className = [
        styles.guildCard,
        props.className || ''
    ].join(' ');

    async function updateUserGuild(guildid) {
        const response = await fetchWithAuth("/users/@me/settings", "PATCH", {
            selected_guild: guildid
        });

        updateUserKey(["settings.selected_guild", response.settings.selected_guild])

    }

    return (
        <div {...props} className={className} style={loggedUser?.settings.selected_guild === guild.id ? { background: "linear-gradient(rgb(0 255 81 / 10%), rgb(10 255 115 / 16%)), rgb(34 38 35)" } : {}}>
            <img
                className={styles.guildIcon}
                src={settings.guildIconURL(guild.id, guild.icon)}
                alt={language.getString("COMPONENTS.GUILD_CARD.GUILD_ICON_ALT", { guildName: guild.name })}
            />
            <div className={styles.guildInfo}>
                <h2 className={styles.guildName} translate="no">
                    <span>{guild.name}</span>
                    <Verified verified={guild.flags.includes("VERIFIED")} />
                </h2>
                <footer className={styles.buttonsContainer}>
                    <CustomButton label={language.getString("COMPONENTS.GUILD_CARD.JOIN")} icon={'user-plus'} padding={2} href={guild.invite} target="_blank" rel="norreferer" />
                    <CustomButton label={language.getString("COMPONENTS.GUILD_CARD.VISIT")} icon={'external-link'} color={'#80bbff'} hierarchy={2} padding={2} href={`/guild/${guild.id}`} />
                </footer>
            </div>
            <div
                onMouseEnter={() => setHovered(guild.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => { updateUserGuild(guild.id) }
                }
                className={styles.guildStar}
            >
                {
                    showStar != "NEVER" && <>{loggedUser?.settings.selected_guild === guild.id
                        ? <BsFillStarFill />
                        : (showStar != "ONLY_IF_SELECTED") && (hovered === guild.id
                            ? <BsStarHalf />
                            : <BsStar />)
                    }</>
                }
            </div>
        </div>
    )
}