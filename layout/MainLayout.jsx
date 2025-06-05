
import styles from "./MainLayout.module.css";
import Head from "next/head";
import Header from "@/components/Header"

export function MainLayout({ children, user }) {


    return (
        <>
            <Head>
                <title>{`PixelsPlace`}</title>
            </Head>
            <Header user={user} />
            {children}
        </>
    )

}