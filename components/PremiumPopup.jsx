import { useEffect, useRef } from "react";
import { MdClose } from "react-icons/md";
import Link from "next/link";
import PremiumButton from "@/components/PremiumButton";
import styles from "./PremiumPopup.module.css";
import CustomButton from "@/components/CustomButton";

export default function PremiumPopup({ onClose }) {
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
        <div ref={divRef} className={styles.popup}>
            <h1>Você precisa ser Premium!</h1>
            <span>Imagine que você pode selecionar qualquer cor do UNIVERSO pra pintar... Você pode!</span>
            <span>Consiga isso e muito mais com PixelsPlace Premium</span>
            <img src='https://images2.alphacoders.com/941/thumb-1920-941898.jpg'></img>
            <footer>
                <CustomButton label={'Talvez depois'} onClick={() => onClose()} />
                <PremiumButton setClass={styles.btn} as={Link} redirect={true} href="/premium">
                    Conheça o Premium!
                </PremiumButton>
            </footer>
        </div>
    );
}
