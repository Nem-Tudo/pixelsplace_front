import { useState } from "react";
import { MdClose } from "react-icons/md";
import Link from "next/link";
import PremiumButton from "@/components/PremiumButton";
import CustomButton from "@/components/CustomButton";
import { useLanguage } from '@/context/LanguageContext';
import styles from "@/components/popups/DisplayPopup.module.css";
import localStyles from "@/components/popups/AdminBuildAdd.module.css";
import PixelIcon from "@/components/PixelIcon";
import ToggleSwitch from "@/components/ToggleSwitch";
import { dateToTimestamp } from "@/src/dateFunctions";
import { usePopup } from '@/context/PopupContext';
import settings from "@/settings.js";
import { useAuth } from "@/context/AuthContext";

export default function AdminBuildAdd({ closePopup }) {
    const { language } = useLanguage();

    const [branch, setBranch] = useState("");
    const [forceOnLink, setForceOnLink] = useState(false);
    const [expiresAt, setExpiresAt] = useState("");
    const [requiredFlags, setRequiredFlags] = useState("");
    const [devices, setDevices] = useState([]);

    const { token, loggedUser } = useAuth();
    const { openPopup } = usePopup();

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

    const handleDeviceChange = (e) => {
        const { value, checked } = e.target;
        if (checked) {
            setDevices((prev) => [...prev, value]);
        } else {
            setDevices((prev) => prev.filter((d) => d !== value));
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!branch.trim()) {
            openPopup("error", { message: "Branch é obrigatória." });
            return;
        }

        let expiresAtTimestamp = null;
        if (expiresAt) {
            // Converte datetime-local (YYYY-MM-DDTHH:MM) para o formato esperado
            const [datePart, timePart] = expiresAt.split("T");
            const [yyyy, mm, dd] = datePart.split("-");
            const dateStr = `${dd}/${mm}/${yyyy} ${timePart}`;
            expiresAtTimestamp = dateToTimestamp(dateStr);
        }

        const payload = {
            branch: branch.trim(),
            forceOnLink,
            expiresAt: expiresAtTimestamp ? new Date(Number(expiresAtTimestamp)) : null,
            required_flags: (requiredFlags || "").split(",").map(flag => flag.trim()).filter(flag => flag),
            devices: (devices || [])
        };

        const res = await fetchWithAuth("/builds", "POST", payload);

        if (res) {
            openPopup('success', { message: "Build criada com sucesso." });
            getBuildsOverride();
            closePopup();
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h1 className={styles.title}>
                <PixelIcon codename={'alert'} />
                {'Nova Build'}
            </h1>

            <main className={[styles.scrollable, localStyles.main].join(' ')}>
                <div>
                    <label htmlFor="adminBuildAdd_branch">Branch do GitHub</label>
                    <input
                        type="text"
                        name="branch"
                        id="adminBuildAdd_branch"
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        required
                    />
                </div>

                <div style={{flexDirection: 'row', alignItems: 'center'}}>
                    <label htmlFor="adminBuildAdd_forceOnLink">Tela de confirmação</label>
                    <ToggleSwitch
                        name="forceOnLink"
                        id="adminBuildAdd_forceOnLink"
                        checked={!forceOnLink}
                        onChange={(e) => setForceOnLink(!e.target.checked)}
                    />
                </div>

                <div>
                    <label htmlFor="adminBuildAdd_expiresAt">Data e hora de expiração</label>
                    <input
                        type="datetime-local"
                        name="expiresAt"
                        id="adminBuildAdd_expiresAt"
                        value={expiresAt}
                        onChange={(e) => setExpiresAt(e.target.value)}
                    />
                </div>

                <div>
                    <label htmlFor="adminBuildAdd_requiredFlags">
                        Flags obrigatórias para selecionar a build (separadas por vírgula) [vazio para todas]
                    </label>
                    <input
                        type="text"
                        name="requiredFlags"
                        id="adminBuildAdd_requiredFlags"
                        value={requiredFlags}
                        onChange={(e) => setRequiredFlags(e.target.value)}
                    />
                </div>

                <div>
                    <label>Dispositivos permitidos</label>
                    <div className={styles.checkboxGroup}>
                        <label>
                            <input
                                type="checkbox"
                                value="DESKTOP"
                                checked={devices.includes("DESKTOP")}
                                onChange={(e) => handleDeviceChange(e)}
                            />
                            DESKTOP
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                value="MOBILE"
                                checked={devices.includes("MOBILE")}
                                onChange={(e) => handleDeviceChange(e)}
                            />
                            MOBILE
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                value="TABLET"
                                checked={devices.includes("TABLET")}
                                onChange={(e) => handleDeviceChange(e)}
                            />
                            TABLET
                        </label>
                    </div>
                </div>
                
            </main>

            <footer className={styles.footer}>
                <CustomButton
                    label={'Cancelar'}
                    hierarchy={3}
                    color={'#636363'}
                    onClick={() => closePopup()}
                />
                <CustomButton
                    label={'Criar'}
                    type="submit"
                />
            </footer>
        </form>
    );
}
