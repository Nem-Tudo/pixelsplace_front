import styles from "@/components/FactionCard.module.css";
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
 * Cartão de facção
 * @param {Object} properties - Passagem de propriedades pro componente
 * @param {JSON} properties.faction - Facção a ser exibida
 * @param {string} properties.role - O cargo do cidadão na facção
 * @param {any} [properties.props] - Outras propriedades HTML (opcional)
 */
export default function FactionCard({ faction, role, ...props }) {
    const { loggedUser, token, updateUserKey } = useAuth()
    const { language } = useLanguage();

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
        styles.factionCard,
        props.className || ''
    ].join(' ');

    return (
        <div {...props} className={className}>
            <img
                className={styles.factionIcon}
                src={faction.icon_url || "/assets/avatar.png"}
                alt={language.getString("COMPONENTS.FACTION_CARD.FACTION_ICON_ALT", { factionName: faction.name })}
            />
            <div className={styles.factionInfo}>
                <h2 className={styles.factionName} translate="no">
                    <span>{faction.name}{!faction.public && <PixelIcon codename={'lock'} />}</span>
                    <span>#{faction.handle}</span>
                </h2>
                <span>{faction.stats.membersCount} membros</span>
                <span>{faction.stats.pixelsPlacedCount} pixels</span>
                <footer className={styles.buttonsContainer}>
                    <CustomButton label={language.getString("COMPONENTS.FACTION_CARD.VISIT")} icon={'external-link'} padding={2} href={`/faction/${faction.id}`} />
                </footer>
            </div>
        </div>
    )
}