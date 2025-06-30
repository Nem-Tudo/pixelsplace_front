import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import settings from "@/settings";
import { MainLayout } from "@/layout/MainLayout";
import styles from "./GuildPage.module.css";
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
      <main 
        className={styles.main}
      >

        <div className={styles.wallpaper}>
          {!loading && loggedGuild?.id === guild?.id ? (
            <>
              <PremiumButton
                as="icon"
                icon={
                  <PixelIcon
                    codename={'edit'}
                    className={styles.editPencil}
                    onClick={() => switchEdit("profile_banner_url")}
                  />
                }
              ></PremiumButton>

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </>
          ) : (
            <></>
          )}
          <img
            src={guild?.premium ? (guild.profile.banner_url || 'https://images2.alphacoders.com/941/thumb-1920-941898.jpg') : ''}
            alt={language.getString("PAGES.USER_PROFILE.PROFILE_BACKGROUND_ALT")}
          />
        </div>

        <div className={styles.page}>

          <div className={styles.profile}>
            <div className={styles.avatar}>
              <img src={settings.avatarURL(guild.id, guild.avatar)} alt={language.getString("PAGES.USER_PROFILE.USER_AVATAR_ALT")} />
            </div>

            <div className={styles.name}>
              <h1 className={styles.displayName}>{guild?.display_name} <Verified verified={guild?.premium} /></h1>
              <p className={styles.guildName}>@{guild?.guildname} </p>
            </div>

            {guild && Badges({list: guild?.flags?.map(flag => flag)}) != null &&
              <div className={[styles.badges, styles.infoBox].join(" ")}>
                <Badges list={guild?.flags?.map(flag => flag)}/>
              </div>
            }
          </div>

          <div className={styles.moreInfo}>
            {guild && guild.profile && guild.profile.aboutme &&
              <div className={styles.infoBox} id={styles.description} ref={aboutmeRef}>
                {editStates.profile_aboutme ? (
                  <><textarea
                    value={guild.profile.aboutme}
                    onChange={(e) => {
                      updateStateKey(setGuild, guild, ["profile.aboutme", e.target.value])
                    }}
                    rows={4}
                  />
                  <PremiumButton
                        as="icon"
                        icon={
                          <PixelIcon
                            codename={'save'}
                            className={styles.editPencil}
                            onClick={() => {saveChanges(); switchEdit("profile_aboutme");}}
                          />
                        }
                      />
                      </>
                ) : (
                  <span>
                    {!loading && loggedGuild?.id === guild?.id ? (
                      <PremiumButton
                        as="icon"
                        icon={
                          <PixelIcon
                            codename={'edit'}
                            className={styles.editPencil}
                            onClick={() => switchEdit("profile_aboutme")}
                          />
                        }
                      />
                    ) : (
                      <></>
                    )}
                    {guild.profile.aboutme}
                  </span>
                )}
              </div>
            }
            {guild.settings.selected_guild && (
              <GuildCard guild={guild.settings.selected_guild} id={styles.guildCard} className={styles.infoBox} />
            )}
            <div className={styles.infoBox} id={styles.pixelsInfo}>
              <p className={styles.pixelsText}>
                {language.getString("PAGES.USER_PROFILE.PIXELS_PLACED", { displayName: guild.display_name, pixelQuantity: guild.stats.pixelsPlacedCount })}
              </p>
              <PremiumButton
                color={profileTheme.text}
                onClick={() => openPopup("not_implemented_yet")}
              >
                {language.getString("PAGES.USER_PROFILE.VIEW_PIXELS", { displayName: guild?.display_name })}
              </PremiumButton>
            </div>
          </div>

          {
            loggedGuild?.id === guild?.id && <div className={styles.editGuildColors}>
              <input type="color" id={styles.editPrimaryColor} value={guild.profile.color_primary} onChange={(e) => {
                updateStateKey(setGuild, guild, ["profile.color_primary", e.target.value])
              }} />
              <input type="color" id={styles.editSecondaryColor} value={guild.profile.color_secundary} onChange={(e) => {
                updateStateKey(setGuild, guild, ["profile.color_secundary", e.target.value])
              }} />
              <PixelIcon codename={'paint-bucket'} className={styles.paintIcon} />
            </div>
          }

        </div>

      </main>
    </MainLayout>
  );
}