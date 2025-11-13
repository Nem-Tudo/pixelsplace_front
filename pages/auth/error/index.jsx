import { useSearchParams } from "next/navigation";
import styles from "./page.module.css";
import { useEffect, useState } from "react";

export function AuthErrorContent() {
    const searchParams = useSearchParams();
    const reason = searchParams.get("reason");
    const provider = searchParams.get("provider");
    const [isPopup, setIsPopup] = useState(true);

    const messages = {
        'generic': "Ocorreu um erro ao tentar se registrar. Tente novamente mais tarde",
        'email_conflict': `O email associado a este provedor (${provider}) já foi registrado com outro provedor.`
    }

    useEffect(() => {
        if (window.opener) {
            window.opener.postMessage({ type: `oauth_error`, data: { reason, provider } }, window.location.origin);
            setIsPopup(true);
        } else {
            setIsPopup(false);
        }
    }, [])

    const handleBackHome = () => {
        window.location.href = '/';
    }

    return (
        <>
            <header className={styles.header}>
                <h1>Pixelsplace Auth</h1>
            </header>
            <main className={styles.main}>
                <h1 style={{ color: "red" }}>Erro na authenticação com {provider} ({reason})</h1>
                <span>{messages[reason]}</span>
                <br></br>
                <br></br>
                <span>Entre em contato para suporte: <a href={"https://discord.gg/nemtudo"} target="_blank">discord.gg/nemtudo</a></span>

                {!isPopup && (
                    <>
                        <br></br>
                        <br></br>
                        <button onClick={handleBackHome} className={styles.backButton}>
                            Voltar para página principal
                        </button>
                    </>
                )}
            </main>
        </>
    )
}

export default function AuthError() {
    return (
        <>
            <AuthErrorContent />
        </>
    )
}