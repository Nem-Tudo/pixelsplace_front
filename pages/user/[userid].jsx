import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import settings from "@/settings";
import { MainLayout } from "@/layout/MainLayout";
import styles from "./UserProfile.module.css";
import Verified from "@/components/Verified";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from '@/context/LanguageContext';
import { MdOutlineModeEditOutline } from "react-icons/md";
import PremiumButton from "@/components/PremiumButton";

import updateStateKey from "@/src/updateStateKey";
import CustomButton from "@/components/CustomButton";
import { getBrightness } from "@/src/colorFunctions";
import PixelIcon from "@/components/PixelIcon";


export async function getServerSideProps({ req, query }) {
  const cookies = req.headers.cookie || '';

  function getCookie(name) {
    const match = cookies.match(new RegExp('(^|; )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : undefined;
  }

  try {
    const res = await fetch(`${settings.apiURL}/users/${query.userid}?parseGuild=true`, {
      headers: { 'Content-Type': 'application/json', Authorization: getCookie("authorization") },
    });
    const data = await res.json();

    if (res.status === 404) return { props: { user: null } }

    if (!res.ok) return { props: { error: true, errormessage: data.message } };
    return { props: { user: data } };
  } catch (e) {
    return { props: { error: true, errormessage: e.message } };
  }
}

const THEME = { //Ps: não confunda! É o tema do PERFIL, por isso as cores são invertidas! Se o perfil é Dark, as cores devem ser claras
  DARK: { backgroundItem: "#b8b8b81f", text: "white" },
  WHITE: { backgroundItem: "#00000040", text: "black" }
}

export default function UserProfile({ user: userobject, error, errormessage }) {
  const { loggedUser, loading, token } = useAuth();
  const { language } = useLanguage();

  const [user, setUser] = useState(userobject);
  const [savedUser, setSavedUser] = useState(userobject);

  const [editStates, setEditStates] = useState({
    profile_aboutme: false,
    profile_banner_url: false,
  });

  const [profileTheme, setProfileTheme] = useState(THEME.DARK);

  const fileInputRef = useRef(null);

  const [filesToUpload, setFilesToUpload] = useState([])

  const switchEdit = (key) => {
    setEditStates((prev) => ({
      ...prev,
      [key]: !prev[key], // inverte o valor atual da chave
    }));
  };

  const aboutmeRef = useRef(null);

  useEffect(() => {
    if (user.premium) {
      const bright = getBrightness(user.profile.color_primary);
      if (bright > 0.7) { //Cor degradê MUITO clara
        setProfileTheme(THEME.WHITE);
      } else {
        setProfileTheme(THEME.DARK);
      }
    }
  }, [user])


  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        editStates.profile_aboutme &&
        aboutmeRef.current &&
        !aboutmeRef.current.contains(e.target)
      ) {
        switchEdit("profile_aboutme");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editStates.profile_aboutme]);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  useEffect(() => {
    if (editStates.profile_banner_url) {
      handleButtonClick();
    }
  }, [editStates.profile_banner_url]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      updateStateKey(setUser, user, ["profile.banner_url", imageURL])
      setFilesToUpload([...filesToUpload, file])
      console.log("Imagem selecionada:", file);
    }
  };

  async function saveChanges() {
    //TODO: fazer o sistema de upar arquivos pra CDN

    const userprofile = user.profile;
    userprofile.banner_url = null;

    const request = await fetch(`${settings.apiURL}/users/@me/profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token
      },
      body: JSON.stringify(userprofile)
    })
    const response = await request.json();
    if (!request.ok) {
      console.log(response, request)
      return alert(`Erro ao salvar: ${response.message}`)
    }
    updateStateKey(setUser, user, ["profile", response.profile]);
    updateStateKey(setSavedUser, savedUser, ["profile", response.profile]);
  }

  if (error) {
    return (
      <>
        <MainLayout>
          <div>
            <h1>Erro ao carregar perfil de usuário!</h1>
            <span>Mensagem: {errormessage}</span>
          </div>
        </MainLayout>
      </>
    )
  }

  if (!user) return (
    <>
      <MainLayout>
        <div>
          <h1>Usuário não encontrado</h1>
        </div>
      </MainLayout>
    </>
  )

  return (
    <MainLayout>
      <main 
        className={styles.main}
        style={user.premium ? {
          '--user-color-primary': `${user.profile.color_primary}`,
          '--user-color-secondary': `${user.profile.color_secundary}`,
          '--user-color-text': `${profileTheme.text}`,
          '--user-color-background-item': `${profileTheme.backgroundItem}`
        } : {}}
      >

        <div className={styles.wallpaper}>
          {!loading && loggedUser?.id === user?.id ? (
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
            src={user.profile.banner_url || 'https://images2.alphacoders.com/941/thumb-1920-941898.jpg'}
            alt={language.getString("PAGES.USER_PROFILE.PROFILE_BACKGROUND_ALT")}
          />
        </div>

        <div className={styles.page}>

          <div className={styles.profile}>
            <div className={styles.avatar} style={{ zIndex: "1" }}>
              <img src={settings.avatarURL(user.id, user.avatar)} alt={language.getString("PAGES.USER_PROFILE.USER_AVATAR_ALT")} />
            </div>
            <h1 className={styles.displayName}>{user?.display_name} <Verified verified={user?.premium} /></h1>
            <p className={styles.userName}>@{user?.username} </p>
          </div>

          <div className={styles.moreInfo}>
            {user.settings.selected_guild && (
                <div className={styles.guildCard} style={{ background: profileTheme.backgroundItem, color: profileTheme.text }}>
                  <img
                    className={styles.guildIcon}
                    src={settings.guildIconURL(user.settings.selected_guild.id, user.settings.selected_guild.icon)}
                    alt={language.getString("PAGES.USER_PROFILE.GUILD_ICON_ALT", { guildName: user.settings.selected_guild.name })}
                  />
                  <div className={styles.guildInfo}>
                    <h2 className={styles.guildName} translate="no">
                      {user.settings.selected_guild.name}
                      <Verified verified={user.settings.selected_guild.flags.includes("VERIFIED")} />
                    </h2>
                    <a
                      className={styles.guildLink}
                      href={user.settings.selected_guild.invite}
                      target="_blank"
                      rel="norreferer"
                    >
                      {language.getString("PAGES.USER_PROFILE.JOIN_GUILD")}
                    </a>
                  </div>
                </div>
            )}
            <div className={styles.description} ref={aboutmeRef}>
              {editStates.profile_aboutme ? (
                <>
                  <div>
                    <textarea
                      value={user.profile.aboutme}
                      style={{ background: profileTheme.backgroundItem, color: profileTheme.text }}
                      onChange={(e) => {
                        updateStateKey(setUser, user, ["profile.aboutme", e.target.value])
                      }}
                      rows={4}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span style={{ background: profileTheme.backgroundItem, color: profileTheme.text }}>
                      {!loading && loggedUser?.id === user?.id ? (
                        <>
                          <MdOutlineModeEditOutline
                            style={{
                              position: "absolute",
                              top: "5px",
                              right: "5px",
                              cursor: "pointer",
                            }}
                            onClick={() => switchEdit("profile_aboutme")}
                          />
                        </>
                      ) : (
                        <></>
                      )}
                      {user.profile.aboutme}
                    </span>
                  </div>
                </>
              )}
            </div>
            <div className={styles.pixelsInfo} style={{ background: profileTheme.backgroundItem }}>
              <p className={styles.pixelsText}>
                {language.getString("PAGES.USER_PROFILE.PIXELS_PLACED", { displayName: user.display_name, pixelQuantity: user.stats.pixelsPlacedCount })}
              </p>
              <PremiumButton
                onClick={() => alert(language.getString("COMMON.NOT_IMPLEMENTED_YET"))}
              >
                {language.getString("PAGES.USER_PROFILE.VIEW_PIXELS", { displayName: user?.display_name })}
              </PremiumButton>
            </div>
          </div>

          {
            loggedUser?.id === user?.id && <div className={styles.editUserColors}>
              <input type="color" id={styles.editPrimaryColor} value={user.profile.color_primary} onChange={(e) => {
                updateStateKey(setUser, user, ["profile.color_primary", e.target.value])
              }} />
              <input type="color" id={styles.editSecondaryColor} value={user.profile.color_secundary} onChange={(e) => {
                updateStateKey(setUser, user, ["profile.color_secundary", e.target.value])
              }} />
              <PixelIcon codename={'paint-bucket'} className={styles.paintIcon} />
            </div>
          }

        </div>

        {
          JSON.stringify(user) != JSON.stringify(savedUser) && (
            <CustomButton
              className={styles.saveChanges}
              color={"#33b32e"}
              label={"Salvar tema"}
              icon={'save'}
              onClick={() => saveChanges()}
            />
          )
        }

      </main>
    </MainLayout>
  );
}