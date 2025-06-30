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

export default function GuildPage({ guild: guildobject, error, errormessage }) {
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
    <MainLayout>
      {JSON.stringify(guild)}
    </MainLayout>
  );
}