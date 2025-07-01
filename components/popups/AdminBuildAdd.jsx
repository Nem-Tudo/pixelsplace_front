import { useEffect, useState useRef } from "react";
import { MdClose } from "react-icons/md";
import Link from "next/link";
import PremiumButton from "@/components/PremiumButton";
import CustomButton from "@/components/CustomButton";
import { useLanguage } from '@/context/LanguageContext';
import styles from "@/components/popups/DisplayPopup.module.css";
import PixelIcon from "@/components/PixelIcon";
import ToggleSwitch from "@/components/ToggleSwitch";
import { dateToTimestamp } from "@/src/dateFunctions";
import Form from 'next/form'

export default function AdminBuildAdd({ closePopup }) {
    const { language } = useLanguage();

    return (
        <Form onSubmit={(event) => event.preventDefault()}>
            <h1 className={styles.title}>
                <PixelIcon codename={'alert'} />
                {language.getString("POPUPS.ADMIN_BUILD_ADD.TITLE")}
            </h1>

            <main className={styles.scrollable}>

                <label htmlFor="adminBuildAdd_branch">Branch do GitHub</label>
                <input type="text" name="branch" id="adminBuildAdd_branch" required />

                <label htmlFor="adminBuildAdd_forceOnLink">Tela de confirmação</label>
                <ToggleSwitch name="forceOnLink" id="adminBuildAdd_forceOnLink" checked={useState(true)} required />

                <label htmlFor="adminBuildAdd_expiresAt">Data de expiração</label>
                <input type="date" name="expiresAt" id="adminBuildAdd_expiresAt" />

                <label htmlFor="adminBuildAdd_requiredFlags">{'Flags obrigatórias para selecionar a build (separadas por vírgula) [vazio para todas]'}</label>
                <input type="text" name="requiredFlags" id="adminBuildAdd_requiredFlags" />

                <label htmlFor="adminBuildAdd_devices">{'Dispositivos permitidos (separados por vírgula) (DESKTOP / MOBILE / TABLET) [vazio para todos]'}</label>
                <input type="text" name="devices" id="adminBuildAdd_devices" />

            </main>
            
            <footer className={styles.footer}>
                <CustomButton label={'Cancelar'} hierarchy={3} color={'#636363'} onClick={() => closePopup()} />
                <CustomButton label={'Criar'} formAction={() => {
                    //document.getElementById("idUserSearch").value)
                    //obtem dados: { branch, expiresAt, devices, required_flags, forceOnLink }
                    const branch = prompt("Branch do github");
                    if (!branch) return openPopup("error", {message: "Branch é obrigatória."});
                    const forceOnLink = !confirm("Possui tela de confirmação?");

                    const expiresAtStr = prompt("Data de expiração (formato: dd/mm/aa hh:mm) [vazio para não expirar]");
                    const expiresAt = expiresAtStr ? dateToTimestamp(expiresAtStr) : null;

                    const required_flags = prompt("Flags obrigatórias para selecionar a build (separadas por vírgula) [vazio para todas]").split(",").map(flag => flag.trim()).filter(flag => flag);
                    const devices = prompt("Dispositivos permitidos (separados por vírgula) (DESKTOP / MOBILE / TABLET) [vazio para todos]").split(",").map(device => device.trim()).filter(device => device);

                    fetchWithAuth("/builds", "POST", {
                        branch,
                        forceOnLink,
                        expiresAt: expiresAt ? new Date(Number(expiresAt)) : null,
                        required_flags,
                        devices,
                    }).then((res) => {
                        if (res) {
                        openPopup('success', {message: "Build criada com sucesso."});
                        getBuildsOverride();
                        }
                    });
                }} />
            </footer>
        </Form>
    );
}