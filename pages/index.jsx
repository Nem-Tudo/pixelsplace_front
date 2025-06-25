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
            <h1>Pixels Place</h1>
          </div>
          <div className={styles.buttons}>
            {
              checkFlags(loggedUser?.flags, "CHANGE_LANGUAGE_TEST") && <div>
                <span>Trocar idioma (fale o código no prompt)</span>
                <button onClick={() => {
                  const l = prompt("Digite o código do idioma (ex: pt, en)");
                  console.log("Trocando idioma para", l);
                  changeLanguage(l);
                }}>clique</button>
              </div>
            }
            <CustomButton href={"/place"}>
              <PixelIcon codename={"gamepad"} />
              {language.getString("PAGES.HOME.START")}
            </CustomButton>
            {
              checkFlags(loggedUser?.flags, "TIMETRAVEL_VIEW") && <PremiumButton as={Link} href={"/timetravel"}><PixelIcon codename={"hourglass"} />{language.getString("PAGES.HOME.TIME_TRAVEL")}</PremiumButton>
            }
            <CustomButton href={"/partners"} hierarchy={2}>
              <PixelIcon codename={"server"} />
              {language.getString("PAGES.HOME.SERVERS")}
            </CustomButton>
            {
              checkFlags(loggedUser?.flags, "ADMIN_VIEWPAGE") && <CustomButton href={"/admin"} hierarchy={3}><PixelIcon codename={"coffee"} />{language.getString("COMMON.ADMIN")}</CustomButton>
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