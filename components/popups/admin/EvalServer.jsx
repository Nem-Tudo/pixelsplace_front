import { useState } from "react";
import CustomButton from "@/components/CustomButton";
import styles from "@/components/popups/DisplayPopup.module.css";
import PixelIcon from "@/components/PixelIcon";
import { usePopup } from '@/context/PopupContext';
import settings from "@/settings.js";
import { useAuth } from "@/context/AuthContext";

/**
 * Pop-up administrativo de eval de servidor
 * @param {Object} properties - Passagem de propriedades pro pop-up
 * @param {() => {}} properties.closePopup - Função de fechamento do pop-up
 */
export default function EvalServer({ closePopup }) {
    const { openPopup } = usePopup();

    const [code, setCode] = useState("");
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
            openPopup("error", {message: `${err.message}`});
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const response = await fetchWithAuth("/admin/evalserver", "POST", {
            content: code
        });
        console.log(response)
        openPopup('generic', {message: JSON.stringify(response.result)})

        closePopup();
    };

    return (
        <form onSubmit={handleSubmit}>
            <h1 className={styles.title}>
                <PixelIcon codename="script-text" />
                {'Executar eval no servidor'}
            </h1>

            <main className={styles.scrollable}>
                <textarea
                    id="adminEvalServer_code"
                    name="code"
                    placeholder="client.db('PixelsPlace').collection('vacas').deleteOne({cow: 'NemTudo'})..."
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                />
            </main>

            <footer className={styles.footer}>
                <CustomButton
                    label="Cancelar"
                    hierarchy={3}
                    color="#636363"
                    onClick={() => closePopup()}
                />
                <CustomButton
                    label="Executar"
                    icon={'play'}
                    type="submit"
                />
            </footer>
        </form>
    );
}
