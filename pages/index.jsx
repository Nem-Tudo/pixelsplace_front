import Head from "next/head";
import styles from "./index.module.css";
import Link from "next/link";
import { MainLayout } from "@/layout/MainLayout";

import { useAuth } from '@/context/AuthContext';

import PremiumButton from '@/components/PremiumButton';
import CustomButton from '@/components/CustomButton';
import checkFlags from "@/src/checkFlags";
import BuildSwitcher from "@/components/BuildSwitcher";

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
            <CustomButton href={"/place"}>
              <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M2 5h20v14H2V5zm18 12V7H4v10h16zM8 9h2v2h2v2h-2v2H8v-2H6v-2h2V9zm6 0h2v2h-2V9zm4 4h-2v2h2v-2z" fill="currentColor"/> </svg>
              Começar
            </CustomButton>
            {
              checkFlags(loggedUser?.flags, "TIMETRAVEL_VIEW") && <PremiumButton as={Link} href={"/timetravel"}><svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M18 2H6v6h2v2h2v4H8v2H6v6h12v-6h-2v-2h-2v-4h2V8h2V2zm-2 6h-2v2h-4V8H8V4h8v4zm-2 6v2h2v4H8v-4h2v-2h4z" fill="currentColor"/> </svg>Time Travel</PremiumButton>
            }
            <CustomButton href={"/partners"} hierarchy={2}>
              <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M3 3h18v18H3V3zm2 2v6h14V5H5zm14 8H5v6h14v-6zM7 7h2v2H7V7zm2 8H7v2h2v-2z" fill="currentColor"/> </svg>
              Servidores
            </CustomButton>
            {
              checkFlags(loggedUser?.flags, "ADMIN_VIEWPAGE") && <CustomButton href={"/admin"} hierarchy={3}><svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"> <path d="M4 4h18v7h-4v5H4V4zm14 5h2V6h-2v3zm-2-3H6v8h10V6zm3 14H3v-2h16v2z" fill="currentColor"/> </svg>Admin</CustomButton>
            }
            {
              checkFlags(loggedUser?.flags, "BUILD_OVERRIDE_VIEW") && <BuildSwitcher />
            }
          </div>
        </main>
      </MainLayout>
    </>
  );
}
