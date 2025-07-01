import { useState } from "react";
import { MdClose } from "react-icons/md";
import Link from "next/link";
import PremiumButton from "@/components/PremiumButton";
import CustomButton from "@/components/CustomButton";
import { useLanguage } from '@/context/LanguageContext';
import styles from "@/components/popups/DisplayPopup.module.css";
import PixelIcon from "@/components/PixelIcon";
import ToggleSwitch from "@/components/ToggleSwitch";
import { dateToTimestamp } from "@/src/dateFunctions";

export default function AdminBuildAdd({ closePopup }) {
    const { language } = useLanguage();

    const [branch, setBranch] = useState("");
    const [forceOnLink, setForceOnLink] = useState(true);
    const [expiresAt, setExpiresAt] = useState("");
    const [requiredFlags, setRequiredFlags] = useState("");
    const [devices, setDevices] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!branch.trim()) {
            openPopup("error", { message: "Branch é obrigatória." });
            return;
        }

        const expiresAtTimestamp = expiresAt ? dateToTimestamp(expiresAt) : null;

        const payload = {
            branch: branch.trim(),
            forceOnLink,
            expiresAt: expiresAtTimestamp ? new Date(Number(expiresAtTimestamp)) : null,
            required_flags: requiredFlags
                ? requiredFlags.split(",").map(flag => flag.trim()).filter(flag => flag)
                : [],
            devices: devices
                ? devices.split(",").map(device => device.trim()).filter(device => device)
                : []
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

            <main className={styles.scrollable}>
                <label htmlFor="adminBuildAdd_branch">Branch do GitHub</label>
                <input
                    type="text"
                    name="branch"
                    id="adminBuildAdd_branch"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    required
                />

                <label htmlFor="adminBuildAdd_forceOnLink">Tela de confirmação</label>
                <ToggleSwitch
                    name="forceOnLink"
                    id="adminBuildAdd_forceOnLink"
                    checked={forceOnLink}
                    onChange={(e) => setForceOnLink(e.target.checked)}
                    required
                />

                <label htmlFor="adminBuildAdd_expiresAt">Data de expiração</label>
                <input
                    type="date"
                    name="expiresAt"
                    id="adminBuildAdd_expiresAt"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                />

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

                <label htmlFor="adminBuildAdd_devices">
                    Dispositivos permitidos (separados por vírgula) (DESKTOP / MOBILE / TABLET) [vazio para todos]
                </label>
                <input
                    type="text"
                    name="devices"
                    id="adminBuildAdd_devices"
                    value={devices}
                    onChange={(e) => setDevices(e.target.value)}
                />
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
