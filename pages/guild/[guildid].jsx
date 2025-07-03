import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import settings from "@/settings";
import { MainLayout } from "@/layout/MainLayout";
import styles from "./Guild.module.css";
import Verified from "@/components/Verified";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from '@/context/LanguageContext';
import { MdOutlineModeEditOutline } from "react-icons/md";
import PremiumButton from "@/components/PremiumButton";
import Head from "next/head";
import updateStateKey from "@/src/updateStateKey";
import CustomButton from "@/components/CustomButton";
import { getBrightness } from "@/src/colorFunctions";
import PixelIcon from "@/components/PixelIcon";
import GuildCard from "@/components/GuildCard";
import { usePopup } from '@/context/PopupContext';
import Badges from "@/components/Badges";

export async function getServerSideProps({ req, query }) {
  const cookies = req.headers.cookie || '';

  function getCookie(name) {
    const match = cookies.match(new RegExp('(^|; )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : undefined;
  }

  try {
    const res = await fetch(`${settings.apiURL}/guilds/${query.guildid}`, {
      headers: { 'Content-Type': 'application/json', Authorization: getCookie("authorization") },
    });
    const data = await res.json();

    if (res.status === 404) return { props: { guild: null } }

    if (!res.ok) return { props: { error: true, errormessage: data.message } };
    return { props: { guild: data } };
  } catch (e) {
    return { props: { error: true, errormessage: e.message } };
  }
}

export default function Guild({ guild: guildobject, error, errormessage }) {
  const { loggedUser, loading, token } = useAuth();
  const { language } = useLanguage();
  const { openPopup } = usePopup();

  const [guild, setGuild] = useState(guildobject);

  if (error) {
    return (
      <>
        <MainLayout>
          <div>
            <h1>Erro ao carregar perfil de servidor!</h1>
            <span>Mensagem: {errormessage}</span>
          </div>
        </MainLayout>
      </>
    )
  }

  if (!guild) return (
    <>
      <MainLayout>
        <div>
          <h1>Servidor não encontrado</h1>
        </div>
      </MainLayout>
    </>
  )

  return (
    <>
      <Head>
        <title>Página de {guild?.name} no PixelsPlace</title>
        <meta name="description" content={`Veja as estatísticas e se junte aos mais de ${guild?.stats?.usersCount} membros desse servidor participante do PixelsPlace.`} />
        <meta name="author" content={`${guild?.name}`} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#80bbff" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MainLayout>
        <main className={styles.main}>

          <div className={styles.wallpaper}>
            <img
              src={'https://images2.alphacoders.com/941/thumb-1920-941898.jpg'}
              alt={language.getString("PAGES.GUILD.BACKGROUND_ALT")}
            />
          </div>

          <div className={styles.page}>

            <div className={styles.profile}>
              <div className={styles.icon}>
                <img src={settings.guildIconURL(guild?.id, guild?.icon)} alt={language.getString("PAGES.GUILD.ICON_ALT")} />
              </div>

              <div className={styles.name}>
                <h1 className={styles.displayName}>{guild?.name} <Verified verified={guild?.premium} /></h1>
              </div>

              <CustomButton label={language.getString('COMMON.JOIN')} href={guild.invite} />
            </div>

            <div className={styles.moreInfo}>

              <div className={styles.infoBox} id={styles.pixelsInfo}>
                {language.getString("PAGES.GUILD.PIXELS_PLACED")}: {guild.stats.pixelsPlacedCount} <br />
                {language.getString("PAGES.GUILD.MEMBER_COUNT")}: {guild.stats.usersCount}
              </div>

            </div>

          </div>

        </main>
      </MainLayout>
    </>
  )
}