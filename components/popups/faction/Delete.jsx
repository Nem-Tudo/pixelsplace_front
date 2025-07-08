import { useEffect, useRef, useState } from "react";
import { MdClose } from "react-icons/md";
import Link from "next/link";
import PremiumButton from "@/components/PremiumButton";
import CustomButton from "@/components/CustomButton";
import { useLanguage } from '@/context/LanguageContext';
import styles from "@/components/popups/DisplayPopup.module.css";
import PixelIcon from "@/components/PixelIcon";
import { usePopup } from '@/context/PopupContext';
import settings from "@/settings.js";
import { useAuth } from "@/context/AuthContext";

/**
 * Pop-up de confirmação de exclusão de facção
 * @param {Object} properties - Passagem de propriedades pro pop-up
 * @param {() => {}} properties.closePopup - Função de fechamento do pop-up
 * @param {{}} properties.faction - A facção
 */
export default function FactionDelete({ closePopup, faction }) {
    const { language } = useLanguage();
    const [typedHandle, setTypedHandle] = useState("");
    const { openPopup } = usePopup();
    const { token, loggedUser } = useAuth();

    const fetchWithAuth = async (url, method, body) => {
        try {
            const res = await fetch(`${settings.apiURL}${url}`, {
                method,
                headers: {
                "Content-Type": "application/json",
                authorization: token,
                },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Erro na requisição.");
            return data;
        } catch (err) {
            openPopup("error", { message: `${err.message}` });
        }
    };

    return (
        <>
            <h1 className={styles.title}>
                <PixelIcon codename={'alert'} />
                {language.getString("POPUPS.FACTION_DELETE.TITLE", {factionName: faction.name})}
            </h1>

            <main className={styles.scrollable}>
                
                <h2 style={{fontSize: 'larger'}}>
                    {language.getString("POPUPS.FACTION_DELETE.MESSAGE", {factionHandle: faction.handle})}
                </h2>

                <input type="text" value={typedHandle} onChange={(e) => setTypedHandle(e.target.value)} />

            </main>
            
            <footer className={styles.footer}>
                <CustomButton label={language.getString("COMMON.NO")} hierarchy={3} color={'#636363'} onClick={() => closePopup()} />
                <CustomButton label={language.getString("COMMON.CONFIRM")} color={'#ff0000'} onClick={() => {
                    if (typedHandle != faction.handle) return openPopup("error", {message: language.getString("POPUPS.FACTION_DELETE.INCORRECT_HANDLE")})
                    closePopup();
                    fetchWithAuth(`/factions/${faction.id}`, "DELETE").then(() => {
                        openPopup("success", {
                            message: language.getString("POPUPS.FACTION_DELETE.SUCCESS"),
                            timeout: 1000,
                            onTimeout: () => {location.href = "/"}
                        })
                    })
                }} />
            </footer>
        </>
    );
}