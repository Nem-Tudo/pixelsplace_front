
import styles from "./MainLayout.module.css";
import Head from "next/head";
import Header from "@/components/Header"

import { useAuth } from '../context/AuthContext';

export function MainLayout({ children }) {

    const { loggedUser, loading } = useAuth();

    return (
        <>
            <Head>
                <title>{`PixelsPlace`}</title>
            </Head>
            <Header loggedUser={loggedUser} loading={loading} />
            {children}
        </>
    )

}