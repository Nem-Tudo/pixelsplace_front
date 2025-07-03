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
        <title>{language.getString("PAGES.CREDITS.META_TITLE")}</title>
        <meta name="description" content={language.getString("PAGES.CREDITS.META_DESCRIPTION")} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#80bbff" />
        <link rel="icon" href="/favicon.ico" />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://pixelsplace.nemtudo.me/credits" />
        <meta property="og:title" content={language.getString("PAGES.CREDITS.META_TITLE")} />
        <meta property="og:description" content={language.getString("PAGES.CREDITS.META_DESCRIPTION")} />
        <meta property="og:image" content="/logo.png" />

        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://pixelsplace.nemtudo.me/credits" />
        <meta property="twitter:title" content={language.getString("PAGES.CREDITS.META_TITLE")} />
        <meta property="twitter:description" content={language.getString("PAGES.CREDITS.META_DESCRIPTION")}  />
        <meta property="twitter:image" content="/logo.png" />
      </Head>
      <MainLayout>
        <main className={styles.main}>
          <div className={styles.logo}>
            <img src="/logo.png" alt={language.getString("PAGES.INDEX.LOGO_ALT")} />
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