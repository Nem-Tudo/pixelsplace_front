import Link from "next/link";
import PremiumButton from "@/components/PremiumButton";
import CustomButton from "@/components/CustomButton";
import { useLanguage } from '@/context/LanguageContext';
import styles from "@/components/popups/DisplayPopup.module.css";
import localStyles from "@/components/popups/PremiumRequired.module.css";

/**
 * Pop-up exibido para indicar que uma funcionalidade do site só pode ser acessada por usuários do Premium
 * @param {Object} properties - Passagem de propriedades pro pop-up
 * @param {() => {}} properties.closePopup - Função de fechamento do pop-up
 */
export default function PremiumRequired({ closePopup }) {
    const { language } = useLanguage();

    return (
        <>
            <h1 className={styles.title}>{language.getString("POPUPS.PREMIUM_REQUIRED.TITLE")}</h1>

            <main className={styles.scrollable}>
                
                <h2 className={localStyles.billboard}>
                    {language.getString("POPUPS.PREMIUM_REQUIRED.TITLE_2")}
                </h2>

                <div className={localStyles.advantageGrid}>

                    <div>
                        {language.getString("POPUPS.PREMIUM_REQUIRED.ADVANTAGE_1")}
                        <img
                            src={'https://images2.alphacoders.com/941/thumb-1920-941898.jpg'}
                        />
                    </div>

                    <div>
                        {language.getString("POPUPS.PREMIUM_REQUIRED.ADVANTAGE_2")}
                        <img
                            src={'https://images2.alphacoders.com/941/thumb-1920-941898.jpg'}
                        />
                    </div>

                    <div>
                        {language.getString("POPUPS.PREMIUM_REQUIRED.ADVANTAGE_3")}
                        <img
                            src={'https://images2.alphacoders.com/941/thumb-1920-941898.jpg'}
                        />
                    </div>

                    <div>
                        {language.getString("POPUPS.PREMIUM_REQUIRED.ADVANTAGE_4")}
                        <img
                            src={'https://images2.alphacoders.com/941/thumb-1920-941898.jpg'}
                        />
                    </div>

                </div>

                <h2 className={localStyles.billboard}>
                    {language.getString("POPUPS.PREMIUM_REQUIRED.CONCLUSION")}
                </h2>

            </main>
            
            <footer className={styles.footer}>
                <CustomButton color={'#636363'} hierarchy={3} label={language.getString("POPUPS.PREMIUM_REQUIRED.MAYBE_LATER")} onClick={() => closePopup()} />
                <PremiumButton onClick={() => closePopup()} setClass={styles.btn} as={Link} redirect={true} href="/premium">
                    {language.getString("POPUPS.PREMIUM_REQUIRED.DISCOVER_PREMIUM")}
                </PremiumButton>
            </footer>
        </>
    );
}