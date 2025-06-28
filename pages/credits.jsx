import Head from "next/head";
import styles from "./credits.module.css";
import Link from "next/link";
import { MainLayout } from "@/layout/MainLayout";

import { useAuth } from '@/context/AuthContext';
import { useLanguage } from "@/context/LanguageContext";

import PremiumButton from '@/components/PremiumButton';
import CustomButton from '@/components/CustomButton';
import checkFlags from "@/src/checkFlags";
import BuildSwitcher from "@/components/BuildSwitcher";
import PixelIcon from "@/components/PixelIcon";

export default function Credits() {

  const { loggedUser } = useAuth();
  const { language, changeLanguage } = useLanguage();

  return (
    <>
      <Head>
        <title>PixelsPlace</title>
        <meta name="description" content={language.getString("PAGES.HOME.META_DESCRIPTION")} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#80bbff" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MainLayout>
        <main className={styles.main}>
          <div className={styles.logo}>
            <img src="/logo.png" alt={language.getString("PAGES.HOME.LOGO_ALT")} />
            <h1>{language.getString("PAGES.CREDITS.TITLE")}</h1>
          </div>
          <div className={styles.credits}>
            <p>oi</p>
          </div>
        </main>
      </MainLayout>
    </>
  );
}