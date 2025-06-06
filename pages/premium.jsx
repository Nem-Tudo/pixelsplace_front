import Head from "next/head";
import styles from "./premium.module.css";
import { MainLayout } from "@/layout/MainLayout";
import { useAuth } from "@/context/AuthContext";


export default function Home(props) {

    const { loggedUser } = useAuth();

    return (
        <>
            <Head>
                <title>PixelsPlace Premium</title>
                <meta name="description" content="Seja Premium no PixelsPlace!" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
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
