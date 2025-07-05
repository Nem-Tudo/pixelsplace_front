import { useEffect } from "react";
import CustomButton from "@/components/CustomButton";
import { useLanguage } from '@/context/LanguageContext';
import styles from "@/components/popups/DisplayPopup.module.css";
import PixelIcon from "@/components/PixelIcon";
import playSound from "@/src/playSound";

/**
 * Pop-up de exibição de erro
 * @param {Object} properties - Passagem de propriedades pro pop-up
 * @param {() => {}} properties.closePopup - Função de fechamento do pop-up
 * @param {string} properties.message - Mensagem a ser exibida pro usuário
 */
export default function Error({ closePopup, message }) {
    const { language } = useLanguage();

    if (!message) message = language.getString("POPUPS.ERROR.UNKNOWN");

    useEffect(() => {
        playSound("Fail")
    }, [])

    return (
        <>
            <h1 className={styles.title}>
                <PixelIcon codename={'bug'} />
                {language.getString("POPUPS.ERROR.TITLE")}
            </h1>

            <main className={styles.scrollable}>

                <h2 style={{ fontSize: 'larger' }}>
                    {message}
                </h2>

            </main>

            <footer className={styles.footer}>
                <CustomButton label={language.getString("COMMON.OK")} onClick={() => closePopup()} />
            </footer>
        </>
    );
}