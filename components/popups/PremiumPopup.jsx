import { useEffect, useRef } from "react";
import { MdClose } from "react-icons/md";
import Link from "next/link";
import PremiumButton from "@/components/PremiumButton";
import CustomButton from "@/components/CustomButton";
import { useLanguage } from '@/context/LanguageContext';
import styles from "@/components/popups/DisplayPopup.module.css";

export default function PremiumPopup({ closePopup }) {
    const { language } = useLanguage();

    return (
        <>
            <h1 className={styles.title}>{language.getString("POPUPS.PREMIUM_POPUP.TITLE")}</h1>
            <main className={styles.scrollable}>
                <span>{language.getString("POPUPS.PREMIUM_POPUP.DESCRIPTION1")}</span>
                <span>{language.getString("POPUPS.PREMIUM_POPUP.DESCRIPTION2")}</span>
                <img src='https://images2.alphacoders.com/941/thumb-1920-941898.jpg'></img>
            </main>
            <footer className={styles.footer}>
                <CustomButton color={'#636363'} hierarchy={3} label={language.getString("POPUPS.PREMIUM_POPUP.MAYBE_LATER")} onClick={() => closePopup()} />
                <PremiumButton setClass={styles.btn} as={Link} redirect={true} href="/premium">
                    {language.getString("POPUPS.PREMIUM_POPUP.DISCOVER_PREMIUM")}
                </PremiumButton>
            </footer>
        </>
    );
}