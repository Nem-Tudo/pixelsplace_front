import { useEffect, useRef } from "react";
import { MdClose } from "react-icons/md";
import Link from "next/link";
import PremiumButton from "@/components/PremiumButton";
import CustomButton from "@/components/CustomButton";
import { useLanguage } from '@/context/LanguageContext';
import styles from "@/components/popups/DisplayPopup.module.css";
import PixelIcon from "@/components/PixelIcon";
import { usePopup } from '@/context/PopupContext';

export default function Error({ closePopup, message }) {
    const { language } = useLanguage();
    const { openPopup } = usePopup();

    if(!message) message = language.getString("POPUPS.ERROR.UNKNOWN");

    const audio = new Audio("/sfx/Fail.mp3");
    audio.play().catch((err) => {
        openPopup("error", {message: `${err} tentando tocar o som Fail.mp3`});
    });

    return (
        <>
            <h1 className={styles.title}>
                <PixelIcon codename={'bug'} />
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
        </>
    );
}