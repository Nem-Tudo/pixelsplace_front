import Head from "next/head";
import styles from "./credits.module.css";
import Link from "next/link";
import { MainLayout } from "@/layout/MainLayout";

import { useLanguage } from "@/context/LanguageContext";

export default function Credits() {

  const { language } = useLanguage();

  return (
    <>
      <Head>
        <title>PixelsPlace</title>
        <meta name="description" content={language.getString("PAGES.HOME.META_DESCRIPTION")} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
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

            {
              [

                {
                  name: 'Nem Tudo',
                  id: '612651439701098558',
                  role: language.getString("PAGES.CREDITS.CHIEF_COW")
                },
                {
                  name: 'Commandbat',
                  id: '385478022670843904',
                  role: language.getString("PAGES.CREDITS.CHIEF_DRAGGABLE")
                },
                {
                  name: 'Renato',
                  id: '427257953503019017',
                  role: language.getString("PAGES.CREDITS.GOAT")
                },
                {
                  name: 'Kuriel',
                  id: '354233941550694400',
                  role: language.getString("PAGES.CREDITS.CHIEF_EVIL_LINUX")
                }

              ].map((staff) => (
                  <div className={styles.staff} key={staff.id}>
                      <h2>{staff.role}</h2>
                      <Link href={`/user/${staff.id}`}>{staff.name}</Link>
                  </div>
              ))
            }

          </div>
        </main>
      </MainLayout>
    </>
  );
}