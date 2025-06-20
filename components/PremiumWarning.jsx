import { useEffect, useRef } from "react";
import { MdClose } from "react-icons/md";
import Link from "next/link";
import PremiumButton from "@/components/PremiumButton";
import styles from "./PremiumWarning.module.css"; // ou o mesmo 'commandbat.module.css'

export default function PremiumWarning({ onClose }) {
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
            position: "absolute",
            top: "20px",
            right: "20px",
            cursor: "pointer",
        }}
        onClick={onClose}
        >
        <MdClose />
        </div>
        <span>Essa função é apenas para premium</span>
        <PremiumButton setClass={styles.button} as={Link} redirect={true} href="/premium">
        <span className={styles.span}>compre o premium aqui</span>
        </PremiumButton>
    </div>
    );
}
