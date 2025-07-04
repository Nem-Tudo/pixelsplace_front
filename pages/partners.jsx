import styles from "./partners.module.css";
import React, { useEffect, useState } from 'react';
import { MainLayout } from "@/layout/MainLayout";
import checkFlags from "@/src/checkFlags";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from '@/context/LanguageContext';
import settings from "@/settings";
import GuildCard from "@/components/GuildCard";
import CustomButton from "@/components/CustomButton";
import CustomHead from "@/components/CustomHead";

export async function getServerSideProps() {
    try {
        const res = await fetch(`${settings.apiURL}/guilds`, {
            headers: { 'Content-Type': 'application/json' },
        });
        const data = await res.json();
        if (!res.ok) return { props: { error: true, errormessage: data.message } };
        return { props: { guilds: data } };
    } catch (e) {
        return { props: { error: true, errormessage: e.message } };
    }
}

export default function Partners({ guilds, error, errormessage }) {

    const { loggedUser } = useAuth()
    const { language } = useLanguage();

    if (error) return (
        <>
            <div>
                <h1>Erro ao carregar servidores</h1>
                <span>Mensagem: {errormessage}</span>
            </div>
        </>
    )

    return (<>
        <CustomHead 
            title={language.getString("PAGES.PARTNERS.META_TITLE")}
            description={language.getString("PAGES.PARTNERS.META_DESCRIPTION")}
            url={"https://pixelsplace.nemtudo.me/partners"}
        />
        <MainLayout>

            <main className={styles.main}>
                <div className={styles.title}>
                    <h1>{language.getString("PAGES.PARTNERS.SERVERS")}</h1>
                    <h5>{language.getString("PAGES.PARTNERS.PARTICIPATING_SERVERS")}</h5>
                    <CustomButton href={"/"} icon={"arrow-left"} label={language.getString("COMMON.BACK")} />
                </div>


                <div className={styles.servers}>
                    {!checkFlags(loggedUser?.flags, "VIEW_PARTNERS") && <span>{language.getString("PAGES.PARTNERS.SECRET")}</span>}
                    {checkFlags(loggedUser?.flags, "VIEW_PARTNERS") && guilds.map((guild, index) => (
                        <GuildCard showStar="ALWAYS" guild={guild} key={index} />
                    ))}
                </div>
            </main>
        </MainLayout>



    </>)


}