import Head from "next/head";
import styles from "./index.module.css";
import Link from "next/link";
import { MainLayout } from "@/layout/MainLayout";

import { useAuth } from '@/context/AuthContext';

import PremiumButton from '@/components/PremiumButton';
import Button from '@/components/Button';
import checkFlags from "@/src/checkFlags";

export default function Home() {

  const { loggedUser } = useAuth();

  return (
    <>
      <Head>
        <title>PixelsPlace</title>
        <meta name="description" content="Participe do PixelsPlace!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#80bbff" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MainLayout>
        <main className={styles.main}>
          <div className={styles.logo}>
            <img src="/logo.png" alt="logo" />
            <h1>Pixels Place</h1>
          </div>
          <div className={styles.buttons}>

            <Button href={"/place"}>Começar</Button>
            {/* <PremiumButton setClass={styles.btn} as={Link} href="/place">Começar</PremiumButton> */}
            <Link className={styles.btn} href="/partners">Servidores</Link>
            {
              checkFlags(loggedUser?.flags, "ADMIN_VIEWPAGE") && <Link className={styles.btn} href="/admin">⚙ Admin</Link>
            }
            {
              checkFlags(loggedUser?.flags, "ADMIN_VIEWPAGE") && <Link className={styles.btn} href="/timetravel">⚙ Time Travel</Link>
            }
          </div>
        </main>
      </MainLayout>
    </>
  );
}
