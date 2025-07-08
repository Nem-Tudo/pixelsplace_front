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
import Tippy from "@tippyjs/react";
import Link from "next/link";

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
  const { token, loggedUser } = useAuth();
  const { language } = useLanguage();
  const { openPopup } = usePopup();
  const router = useRouter();

  const [faction, setFaction] = useState(factionobject);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (faction?.id) {
      loadFactionMembers(faction.id);
    }
  }, [faction?.id]);

  useEffect(() => {
    if (router.query.factionid && factionobject) {
      setFaction(factionobject);
      console.log(factionobject);

      // Só faz replace se a URL atual for diferente da desejada
      const currentPath = router.asPath;
      const desiredPath = `/faction/${factionobject.handle}`;

      if (!currentPath.includes(factionobject.handle)) {
        router.replace(desiredPath, undefined, { shallow: true });
      }
    }
  }, [router.query.userid, factionobject]);

  const fetchWithAuth = async (url, method, body) => {
    try {
      const res = await fetch(`${settings.apiURL}${url}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          authorization: token,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erro na requisição.");
      return data;
    } catch (err) {
      openPopup("error", { message: `${err.message}` });
    }
  };

  async function loadFactionMembers(factionId) {
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
                <img src={faction?.icon_url || "/assets/avatar.png"} alt={language.getString("PAGES.FACTION.ICON_ALT")} />
              </div>

              <div className={styles.name}>
                <h1 className={styles.displayName}>{faction?.name} {!faction?.public && <PixelIcon codename={'lock'} />}</h1>
                <p className={styles.userName}>#{faction?.handle}</p>
              </div>

              {/* Apenas um deles é exibido. Usar ternary seria o mais "correto", mas deixaria mais confuso. ENTRAR / SAIR / PEDIR PRA ENTRAR / (Teoricamente teria o Deletar, mas é melhor ficar em outra parte) */}
              {
                (!loggedUser) && <CustomButton label={"Logue para entrar"} href="/login" />
              }
              {
                (loggedUser && loggedUser.factionId != faction.id) && faction.public && <Tippy arrow={false} content={loggedUser.factionId ? language.getString("PAGES.FACTION.ALREADY_HAS_FACTION") : language.getString("PAGES.FACTION.JOIN_TIPPY")}><div><CustomButton disabled={loggedUser.factionId} label={language.getString('COMMON.JOIN')} onClick={() => fetchWithAuth(`/factions/${faction.id}/join`, "POST")} /></div></Tippy>
              }
              {
                (loggedUser && loggedUser.factionId != faction.id) && !faction.public && <Tippy arrow={false} content={loggedUser.factionId ? language.getString("PAGES.FACTION.ALREADY_HAS_FACTION") : language.getString("PAGES.FACTION.JOIN_TIPPY")}><div><CustomButton disabled={loggedUser.factionId} label={language.getString('COMMON.ASK_TO_JOIN')} onClick={() => fetchWithAuth(`/factions/${faction.id}/join`, "POST")} /></div></Tippy>
              }
              {
                (loggedUser && loggedUser.factionId === faction.id) && (faction.ownerId != loggedUser.id) && <Tippy arrow={false} content={language.getString("PAGES.FACTION.LEAVE")}><div><CustomButton color="#ff0000" label={language.getString('COMMON.LEAVE')} onClick={() => fetchWithAuth(`/factions/${faction.id}/leave`, "POST")} /></div></Tippy>
              }
              {
                (loggedUser && loggedUser.factionId === faction.id) && (faction.ownerId == loggedUser.id) && <Tippy arrow={false} content={language.getString("PAGES.FACTION.DELETE_TIPPY")}><div><CustomButton color="#ff0000" label={language.getString('PAGES.FACTION.DELETE')} onClick={async () => {
                  const handle = prompt(`Você tem CERTEZA que quer apagar a facção ${faction.name}? Digite aqui o handle dela (${faction.handle})`);
                  if (!handle) return;
                  if (handle != faction.handle) return alert("Handle incorreto!");
                  fetchWithAuth(`/factions/${faction.id}`, "DELETE").then(() => {
                    alert("Facção excluída com sucesso! Foi bom ela conosco :(")
                    location.href = "/"
                  })
                }} /></div></Tippy>
              }

            </div>
            <div className={styles.moreInfo}>

              <div className={styles.infoBox} id={styles.description}>
                {faction?.description}
              </div>
              <div className={styles.infoBox} id={styles.ownerFac}>
                <p>{language.getString("PAGES.FACTION.OWNER")}</p>
                <img src={settings.avatarURL(faction.owner.id, faction.owner.avatar)} alt="" />
                <Link href={"/user/"+faction.owner.username}>{faction.owner.username}</Link>
              </div>

              <div className={styles.infoBox} id={styles.previewCanvas}>
                <h1>{language.getString("PAGES.GUILD.PIXELS_PLACED")}: {faction.stats.pixelsPlacedCount}</h1>

                <PremiumButton
                  onClick={() => openPopup("not_implemented_yet")}
                >
                  {language.getString("PAGES.USER_PROFILE.VIEW_PIXELS", { displayName: faction?.name })}
                </PremiumButton>
              </div>

              <div className={styles.infoBox} id={styles.memberList}>
                <h1>{language.getString("PAGES.FACTION.MEMBER_LIST")} {'('+faction.stats.membersCount}/{faction.memberLimit+')'}</h1>
                <div>
                  {members.map((member) => {
                    return (
                      <Link href={"/user/"+member.user.username} key={member.id}>
                        <span className={styles.identity}>
                          <img
                            src={member.user.avatar ? settings.avatarURL(member.user.id, member.user.avatar) : "/assets/avatar.png"}
                            alt=""
                          />
                          <p>{member.user.username || `User ${member.userId}`}</p>
                        </span>
                        {member.role != "MEMBER" && <span className={styles.role}>{member.role}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </main>
      </MainLayout>
    </>
  )
}