import { useEffect, useRef } from "react";
import { MdClose } from "react-icons/md";
import Link from "next/link";
import PremiumButton from "@/components/PremiumButton";
import CustomButton from "@/components/CustomButton";
import { useLanguage } from '@/context/LanguageContext';
import styles from "@/components/popups/DisplayPopup.module.css";

export default function NotImplementedYet({ closePopup }) {
    const { language } = useLanguage();

    return (
        <>
            <h1 className={styles.title}>{language.getString("POPUPS.NOT_IMPLEMENTED_YET.TITLE")}</h1>

            <main className={styles.scrollable}>
                
                <h2 style={{fontSize: 'larger'}}>{language.getString("POPUPS.NOT_IMPLEMENTED_YET.DESCRIPTION")}</h2>

            </main>
            
            <footer className={styles.footer}>
                <CustomButton label={language.getString("COMMON.OK")} onClick={() => closePopup()} />
            </footer>
        </>
    );
}