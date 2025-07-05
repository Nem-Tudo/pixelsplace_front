import styles from "./Verified.module.css"
import Tippy from "@tippyjs/react";
import { useLanguage } from '@/context/LanguageContext';
import { MdVerified } from "react-icons/md";

/**
 * Exibe o ícone de verificado caso a verificação seja true
 * @param {Object} properties - Passagem de propriedades pro componente
 * @param {boolean} properties.verified - Verificação de verificado
 */
export default function Verified({ verified }) {
    const { language } = useLanguage();

    return verified ? 
        <Tippy content={language.getString("COMMON.VERIFIED")} arrow={false} placement="top">
            <MdVerified className={styles.verified} />
        </Tippy>
    : <></>
}