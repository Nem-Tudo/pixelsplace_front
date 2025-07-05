import CustomButton from "@/components/CustomButton";
import { useLanguage } from '@/context/LanguageContext';
import styles from "@/components/popups/DisplayPopup.module.css";
import PixelIcon from "@/components/PixelIcon";

/**
 * Pop-up de exibição de êxito (sucesso)
 * @param {Object} properties - Passagem de propriedades pro pop-up
 * @param {() => {}} properties.closePopup - Função de fechamento do pop-up
 * @param {string} properties.message - Mensagem a ser exibida pro usuário
 */
export default function Success({ closePopup, message }) {
    const { language } = useLanguage();

    if(!message) message = language.getString("POPUPS.SUCCESS.GENERIC");

    return (
        <>
            <h1 className={styles.title}>
                <PixelIcon codename={'check'} />
                {language.getString("POPUPS.SUCCESS.TITLE")}
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