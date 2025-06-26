import { useEffect, useRef } from "react";
import { MdClose } from "react-icons/md";
import Link from "next/link";
import PremiumButton from "@/components/PremiumButton";
import styles from "./PremiumPopup.module.css";
import CustomButton from "@/components/CustomButton";
import { useLanguage } from '@/context/LanguageContext';

export default function PremiumPopup({ closePopup }) {
    const { language } = useLanguage();

    return (
        <div className={styles.popup}>
            <h1>{language.getString("COMPONENTS.PREMIUMPOPUP.TITLE")}</h1>
            <span>{language.getString("COMPONENTS.PREMIUMPOPUP.DESCRIPTION1")}</span>
            <span>{language.getString("COMPONENTS.PREMIUMPOPUP.DESCRIPTION2")}</span>
            <img src='https://images2.alphacoders.com/941/thumb-1920-941898.jpg'></img>
            <footer>
                <CustomButton label={language.getString("COMPONENTS.PREMIUMPOPUP.MAYBE_LATER")} onClick={() => closePopup()} />
                <PremiumButton setClass={styles.btn} as={Link} redirect={true} href="/premium">
                    {language.getString("COMPONENTS.PREMIUMPOPUP.DISCOVER_PREMIUM")}
                </PremiumButton>
            </footer>
        </div>
    );
}