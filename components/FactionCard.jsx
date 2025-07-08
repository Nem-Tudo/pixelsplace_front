import styles from "@/components/FactionCard.module.css";
import PixelIcon from "@/components/PixelIcon";
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import CustomButton from "@/components/CustomButton";

/**
 * Cartão de facção
 * @param {Object} properties - Passagem de propriedades pro componente
 * @param {JSON} properties.faction - Facção a ser exibida
 * @param {string} properties.role - O cargo do cidadão na facção
 * @param {any} [properties.props] - Outras propriedades HTML (opcional)
 */
export default function FactionCard({ faction, role, ...props }) {
    const { language } = useLanguage();

    const className = [
        styles.factionCard,
        props.className || ''
    ].join(' ');

    return (
        <div {...props} className={className}>
            <div className={styles.factionIcon}>
                <img
                    src={faction.icon_url || "/assets/avatar.png"}
                    alt={language.getString("COMPONENTS.FACTION_CARD.FACTION_ICON_ALT", { factionName: faction.name })}
                />
            </div>
            <div className={styles.factionInfo}>
                <h2 className={styles.factionName} translate="no">
                    <span>{faction.name}{!faction.public && <PixelIcon codename={'lock'} />}</span>
                    <span>#{faction.handle}</span>
                </h2>
                <span>{faction.stats.membersCount} membros</span>
                <progress value={faction.stats.membersCount} max={faction.memberLimit} />
                <span>{faction.stats.pixelsPlacedCount} pixels</span>
                <footer className={styles.buttonsContainer}>
                    <CustomButton label={language.getString("COMPONENTS.FACTION_CARD.VISIT")} icon={'external-link'} padding={2} href={`/faction/${faction.id}`} />
                </footer>
            </div>
        </div>
    )
}