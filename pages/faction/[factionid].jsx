import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import settings from "@/settings";
import { MainLayout } from "@/layout/MainLayout";
import styles from "@/pages/profile.module.css";
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
import CustomHead from "@/components/CustomHead";

export async function getServerSideProps({ req, query }) {
  const cookies = req.headers.cookie || '';

  function getCookie(name) {
    const match = cookies.match(new RegExp('(^|; )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : undefined;
  }

  try {
    const res = await fetch(`${settings.apiURL}/factions/${query.factionid}?parseOwner=true`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: getCookie("authorization"),
      },
    });

    const data = await res.json();

    if (res.status === 404) return { props: { faction: null } };
    if (!res.ok) return { props: { error: true, errormessage: data.message } };

    return { props: { faction: data } };
  } catch (e) {
    return { props: { error: true, errormessage: e.message } };
  }
}

export default function Faction({ faction: factionobject, error, errormessage }) {
  const { token } = useAuth();
  const { language } = useLanguage();
  const { openPopup } = usePopup();

  const [loadingFetch, setLoadingFetch] = useState(false);
  const [faction, setFaction] = useState(factionobject);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (faction?.id) {
      loadFactionMembers(faction.id);
    }
  }, [faction?.id]);

  async function loadFactionMembers(factionId) {
    return;
    try {
      const res = await fetch(`https://apipixelsplace.nemtudo.me/factions/${factionId}/members?parseUser=true`);
      const data = await res.json();
      setMembers(data);
    } catch (err) {
      console.error("Erro ao buscar membros:", err);
    }
  }

  if (error) {
    return (
      <>
        <MainLayout>
          <div>
            <h1>Erro ao carregar faction!</h1>
            <span>Mensagem: {errormessage}</span>
          </div>
        </MainLayout>
      </>
    )
  }

  if (!faction) return (
    <>
      <MainLayout>
        <div>
          <h1>Facção não encontrada</h1>
        </div>
      </MainLayout>
    </>
  )

  return (
    <>
      <CustomHead
        title={language.getString("PAGES.FACTION.META_TITLE", { factionName: faction.name })}
        description={language.getString("PAGES.FACTION.META_DESCRIPTION", { factionName: faction.name, factionUsersCount: faction?.stats?.usersCount })}
        url={`https://pixelsplace.nemtudo.me/faction/${faction?.id}`}
        imageUrl={faction?.icon_url}
      />
      <MainLayout>
        <main className={styles.main}>

          <div className={styles.wallpaper}>
            <img
              src={'https://images2.alphacoders.com/941/thumb-1920-941898.jpg'}
              alt={language.getString("PAGES.FACTION.BACKGROUND_ALT")}
            />
          </div>

          <div className={styles.page}>

            <div className={styles.profile}>
              <div className={styles.iconFac}>
                <img src={faction?.icon_url} alt={language.getString("PAGES.FACTION.ICON_ALT")} />
              </div>

              <div className={styles.name}>
                <h1 className={styles.displayName}>{faction?.name} {faction?.public ? '🔓' : '🔒'}</h1>
                <p className={styles.userName}>#{faction?.handle}</p>
              </div>

              <CustomButton label={language.getString('COMMON.JOIN')} href={faction.invite} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", }}>

              <div className={styles.moreInfo}>

                <div className={styles.infoBox} id={styles.description}>
                  {faction?.description}
                </div>
                <div className={styles.infoBox} id={styles.ownerFac} style={{ justifyContent: 'center', }}>
                  {language.getString("PAGES.GUILD.PIXELS_PLACED")}: {faction.stats.pixelsPlacedCount} <br />
                  <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <img src={settings.avatarURL(faction.owner.id, faction.owner.avatar)} alt="" style={{ width: '15px', borderRadius: '50%', }} />
                    <p>{faction.owner.username}</p>;
                  </div>
                </div>
              </div>

              <div className={styles.moreInfo} >
                <div className={styles.infoBox} id={styles.listUsers} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start !important', }}>
                  <h1 style={{ alignSelf: 'center', }}>Lista De membros   {faction.stats.membersCount}/{faction.stats.membersCount}</h1>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {members.map((member) => {
                      return (
                        <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '10px' }}>
                          <img
                            src={member.user.avatar ? settings.avatarURL(member.user.id, member.user.avatar) : "/assets/avatar.png"}
                            alt=""
                            style={{ width: '15px', borderRadius: '50%' }}
                          />
                          <p>{member.user.username || `User ${member.userId}`}</p>
                          <span style={{background: "#679467", padding: "3px 6px", borderRadius: "3px"}}>{member.role}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className={styles.infoBox} id={styles.previewCanva} style={{ justifyContent: 'center', }}>
                  <h1 style={{ alignSelf: 'center', }}>{faction.stats.pixelsPlacedCount} Pixels colocados</h1>

                  <PremiumButton
                    onClick={() => openPopup("not_implemented_yet")}
                  >
                    {language.getString("PAGES.USER_PROFILE.VIEW_PIXELS", { displayName: faction?.name })}
                  </PremiumButton>
                </div>
              </div>
            </div>
          </div>
        </main>
      </MainLayout>
    </>
  )
}