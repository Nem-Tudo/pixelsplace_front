import { useEffect, useRef } from "react";
import { MdClose } from "react-icons/md";
import Link from "next/link";
import PremiumButton from "@/components/PremiumButton";
import CustomButton from "@/components/CustomButton";
import { useLanguage } from '@/context/LanguageContext';
import styles from "@/components/popups/DisplayPopup.module.css";
import PixelIcon from "@/components/PixelIcon";

export default function Error({ closePopup, message, timeout }) {
    const { language } = useLanguage();

    if(!message) message = language.getString("POPUPS.ERROR.UNKNOWN");

    return (
        <>
            <h1 className={styles.title}>
                <PixelIcon codename={'close'} />
                {language.getString("POPUPS.ERROR.TITLE")}
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
                timeout && setTimeout(() => {
                    closePopup()
                }, timeout)
            }
        </>
    );
}