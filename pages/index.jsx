import Head from "next/head";
import styles from "./index.module.css";
import Link from "next/link";
import { MainLayout } from "@/layout/MainLayout";

import { useAuth } from '@/context/AuthContext';

import PremiumButton from '@/components/PremiumButton';
import checkFlags from "@/src/checkFlags";

export default function Home() {

  const { loggedUser } = useAuth();

  return (
    <>
      <Head>
        <title>PixelsPlace</title>
        <meta name="description" content="Participe do PixelsPlace!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MainLayout>
        <main className={styles.main}>
          <div className={styles.logo}>
            <img src="/logo.png" alt="logo" />
            <h1>Pixels Place</h1>
          </div>
          <div className={styles.buttons}>

            <Link className={styles.btn} href={"/place"}>Começar</Link>
            {/* <PremiumButton setClass={styles.btn} as={Link} href="/place">Começar</PremiumButton> */}
            <Link className={styles.btn} href="/partners">Servidores</Link>
            {
              checkFlags(loggedUser?.flags, "ADMIN_VIEWPAGE") && <Link className={styles.btn} href="/admin">⚙ Admin</Link>
            }
          </div>
        </main>
      </MainLayout>
    </>
  );
}
