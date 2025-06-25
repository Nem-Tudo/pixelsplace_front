import { useEffect, useRef } from "react";
import { MdClose } from "react-icons/md";
import Link from "next/link";
import PremiumButton from "@/components/PremiumButton";
import styles from "./PremiumWarning.module.css"; // ou o mesmo 'commandbat.module.css'
import { useLanguage } from '@/context/LanguageContext';

export default function PremiumWarning({ onClose }) {
    const { language } = useLanguage();
    const divRef = useRef(null);

    // Fecha se clicar fora
    useEffect(() => {
        function handleClickOutside(event) {
            if (divRef.current && !divRef.current.contains(event.target)) {
                onClose();
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    return (
        <div ref={divRef} className={styles.div}>
            <div
                style={{
                    position: "fixed",
                    top: "20px",
                    right: "20px",
                    cursor: "pointer",
                    color: "#b3b3b3"
                }}
                onClick={onClose}
            >
                <MdClose />
            </div>
            <span style={{ marginTop: "8px" }}>{language.getString("COMPONENTS.PREMIUMWARNING.FEATURE_PREMIUM_ONLY")}</span>
            <PremiumButton setClass={styles.button} as={Link} redirect={true} href="/premium">
                <span className={styles.span}>{language.getString("COMPONENTS.PREMIUMWARNING.BUY_PREMIUM_HERE")}</span>
            </PremiumButton>
        </div>
    );
}