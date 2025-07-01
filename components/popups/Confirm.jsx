import { useEffect, useRef } from "react";
import { MdClose } from "react-icons/md";
import Link from "next/link";
import PremiumButton from "@/components/PremiumButton";
import CustomButton from "@/components/CustomButton";
import { useLanguage } from '@/context/LanguageContext';
import styles from "@/components/popups/DisplayPopup.module.css";
import PixelIcon from "@/components/PixelIcon";

export default function Confirm({ closePopup, message, execute }) {
    const { language } = useLanguage();

    if(!message) message = language.getString("POPUPS.CONFIRM.MESSAGE");

    return (
        <>
            <h1 className={styles.title}>
                <PixelIcon codename={'alert'} />
                {language.getString("POPUPS.CONFIRM.TITLE")}
            </h1>

            <main className={styles.scrollable}>
                
                <h2 style={{fontSize: 'larger'}}>
                    {message}
                </h2>

            </main>
            
            <footer className={styles.footer}>
                <CustomButton label={language.getString("COMMON.NO")} hierarchy={3} color={'#636363'} onClick={() => closePopup()} />
                <CustomButton label={language.getString("COMMON.YES")} onClick={() => {
                    closePopup();
                    execute();
                }} />
            </footer>
        </>
    );
}