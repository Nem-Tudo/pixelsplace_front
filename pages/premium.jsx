import Head from "next/head";
import styles from "./premium.module.css";
import { MainLayout } from "@/layout/MainLayout";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";


export default function Premium(props) {

    const { loggedUser } = useAuth();
    const { language } = useLanguage();

    return (
        <>
            <Head>
                <title>PixelsPlace Premium</title>
                <meta name="description" content="Seja Premium no PixelsPlace!" />
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
                <meta name="theme-color" content="#80bbff" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <MainLayout>
                <div
                    className={styles.page}
                >
                    <h1>PREMIUM!! :D</h1>
                </div>
            </MainLayout>
        </>
    );
}
