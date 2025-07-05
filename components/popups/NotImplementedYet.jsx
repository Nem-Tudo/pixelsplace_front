import CustomButton from "@/components/CustomButton";
import { useLanguage } from '@/context/LanguageContext';
import styles from "@/components/popups/DisplayPopup.module.css";

/**
 * Pop-up exibido para indicar que uma funcionalidade do site ainda não está pronta
 * @param {Object} properties - Passagem de propriedades pro pop-up
 * @param {() => {}} properties.closePopup - Função de fechamento do pop-up
 */
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