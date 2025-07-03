import Head from "next/head";
import styles from "./index.module.css";
import Link from "next/link";
import { MainLayout } from "@/layout/MainLayout";

import { useAuth } from '@/context/AuthContext';
import { useLanguage } from "@/context/LanguageContext";

import PremiumButton from '@/components/PremiumButton';
import CustomButton from '@/components/CustomButton';
import checkFlags from "@/src/checkFlags";
import BuildSwitcher from "@/components/BuildSwitcher";
import PixelIcon from "@/components/PixelIcon";

export default function Home() {

  const { loggedUser } = useAuth();
  const { language, changeLanguage } = useLanguage();

  return (
    <>
      <Head>
        <title>{language.getString("PAGES.INDEX.META_TITLE")}</title>
        <meta name="description" content={language.getString("PAGES.INDEX.META_DESCRIPTION")} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#80bbff" />
        <link rel="icon" href="/favicon.ico" />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://pixelsplace.nemtudo.me/" />
        <meta property="og:title" content={language.getString("PAGES.INDEX.META_TITLE")} />
        <meta property="og:description" content={language.getString("PAGES.INDEX.META_DESCRIPTION")} />
        <meta property="og:image" content="/logo.png" />

        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://pixelsplace.nemtudo.me/" />
        <meta property="twitter:title" content={language.getString("PAGES.INDEX.META_TITLE")} />
        <meta property="twitter:description" content={language.getString("PAGES.INDEX.META_DESCRIPTION")}  />
        <meta property="twitter:image" content="/logo.png" />
      </Head>
      <MainLayout>
        <main className={styles.main}>
          <div className={styles.logo}>
            <img src="/logo.png" alt={language.getString("PAGES.INDEX.LOGO_ALT")} />
            <h1>Pixels Place</h1>
          </div>
          <div className={styles.buttons}>
            <CustomButton label={language.getString("PAGES.INDEX.START")} icon={'image'} href={"/place"} style={{fontFamily: 'Dogica Pixel, Arial, Helvetica, sans-serif', fontSize: 'small'}} />
            <CustomButton label={language.getString("PAGES.INDEX.SERVERS")} icon={'server'} href={"/partners"} hierarchy={2} />
            <PremiumButton as={Link} href={"/timetravel"}><PixelIcon codename={"hourglass"} />{language.getString("COMMON.TIME_TRAVEL")}</PremiumButton>
            {
              checkFlags(loggedUser?.flags, "ADMIN_VIEWPAGE") && <CustomButton label={language.getString("COMMON.ADMIN")} icon={'coffee'} href={"/admin"} hierarchy={3} />
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