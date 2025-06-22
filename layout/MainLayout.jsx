
import styles from "./MainLayout.module.css";
import Head from "next/head";
import Header from "@/components/Header"

import { useAuth } from '../context/AuthContext';
import { useState } from "react";

export function MainLayout({ children }) {

    const { loggedUser, loading } = useAuth();

    const [ip, setIp] = useState(null);

    if (loggedUser?.flags.includes("BANNED")) {
        fetch("https://api.ipify.org?format=json")
            .then(res => res.json())
            .then(data => setIp(data.ip))
            .catch(err => console.log("Erro ao obter IP:", err));
        return <>
            <main style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh"
            }}>
                <img src="https://i.pinimg.com/564x/0d/ab/ba/0dabbac154edaa9bf08b9bdcbfb993a9.jpg" alt="" style={{width: "80dvw", maxWidth: "350px"}}/>
                <h1 style={{
                    fontSize: "2rem",
                    fontWeight: "bold"
                }}>Você foi banido.</h1>
                <br />
                <span>Áreas afetadas: DISCORD_ID ({loggedUser.id}), USER_IP ({ip})</span>
                <br />
                <span>Não vai ter página bonitinha pra formulário de unban não, é basicamente isso aqui msm agora</span>
                <span>A única coisa que você pode fazer é abrir um ticket em <a className="link" target="_blank" rel="norreferer" style={{ color: "blue" }} href="https://discord.gg/nemtudo">discord.gg/nemtudo</a> e tentar explicar o que houve</span>
                <span>Mas saiba que os mods tem registro de tudo, então eles basicamente são onicientes... Você vai ter que inventar uma desculpa realmente muito boa se quiser algo</span>
                <span>Bom, é isso aí mano tmj</span>
            </main>

        </>
    }

    return (
        <>
            <Head>
                <title>{`PixelsPlace`}</title>
            </Head>
            <Header loggedUser={loggedUser} loading={loading} />
            <main className={styles.main}>
                {children}
            </main>
        </>
    )

}