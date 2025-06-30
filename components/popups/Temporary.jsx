import { useEffect, useRef } from "react";
import { MdClose } from "react-icons/md";
import Link from "next/link";
import PremiumButton from "@/components/PremiumButton";
import CustomButton from "@/components/CustomButton";
import { useLanguage } from '@/context/LanguageContext';
import styles from "@/components/popups/DisplayPopup.module.css";
import PixelIcon from "@/components/PixelIcon";

export default function Temporary({ closePopup, message, timeout = 2000 }) {
    const { language } = useLanguage();

    if(!message) message = language.getString("POPUPS.GENERIC.MESSAGE");

    return (
        <>
            <h1 className={styles.title}>
                <PixelIcon codename={'alert'} />
                {language.getString("POPUPS.GENERIC.TITLE")}
            </h1>

            <main className={styles.scrollable}>
                
                <h2 style={{fontSize: 'larger'}}>
                    {message}
                </h2>

            </main>
            
            <footer className={styles.footer}>
                <CustomButton label={language.getString("COMMON.OK")} onClick={() => closePopup()} />
            </footer>

            {
                setTimeout(() => {
                    () => closePopup()
                }, timeout)
            }
        </>
    );
}