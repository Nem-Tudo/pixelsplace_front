import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import settings from "@/settings";
import { MainLayout } from "@/layout/MainLayout";
import styles from "./UserProfile.module.css";
import Verified from "@/components/Verified";
import { useAuth } from "@/context/AuthContext";
import { MdOutlineModeEditOutline } from "react-icons/md";
import PremiumButton from "@/components/PremiumButton";

// https://cdn.discordapp.com/avatars/385478022670843904/3b1a8bd0e926cab98eeef77f5fcd1c45.webp?size=512
// const userInfo = {
//   id: "385478022670843904",
//   avatar: "3b1a8bd0e926cab98eeef77f5fcd1c45",
//   bgUser: "https://commandbat.com.br/homepage/img/projects/imgproject2.png",
//   premium: false,
//   display_name: "commandbat",
//   username: "commandbat",
//   bio: "Biografia",
//   pixelQuantity: "10000",
//   serverFav: {
//     name: "Casa do Nem Tudo",
//     id: "485738053663457280",
//     icon: "b6e58c4cddd88a18ff3f96ec7f1ec54a",
//     banner: "a2c63426357e55b341f6b6d68aa0e5ac",
//   },
// };

export default function UserProfile() {
  const router = useRouter();
  const { loggedUser, loading, token } = useAuth();
  const { userid } = router.query;
  const [userAvatar, setUserAvatar] = useState(null);

  const [userInfo, setUserInfo] = useState(null);

  async function getUser(id) {
    const res = await fetch(`${settings.apiURL}/users/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: token,
      },
    });
    const data = await res.json();

    //*data
    // avatar: "3b1a8bd0e926cab98eeef77f5fcd1c45"
    // createdAt: "2025-06-05T15:55:59.953Z"
    // flags: ['ADMIN']
    // id: "385478022670843904"
    // lastPaintPixel: "2025-06-20T01:06:08.084Z"
    // premium: true
    // updatedAt: "2025-06-20T01:06:08.085Z"
    // username: "commandbat"

    if (res.status != 200)
      return { error: true, status: res.status, message: data.message };

    setUserInfo(data);
    setUserAvatar(settings.avatarURL(data?.id, data?.avatar));

    console.log(data);
  }

  useEffect(() => {
    if (userid) {
      getUser(userid);
    }
  }, [userid]);

  const [bio, setBio] = useState(userInfo?.bio);
  const [editStates, setEditStates] = useState({
    bio: false,
    bgImg: false,
  });
  const [bgImgSrc, setBgImgSrc] = useState(null);

  const fileInputRef = useRef(null);

  const switchEdit = (key) => {
    setEditStates((prev) => ({
      ...prev,
      [key]: !prev[key], // inverte o valor atual da chave
    }));
  };

  const bioRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        editStates.bio &&
        bioRef.current &&
        !bioRef.current.contains(e.target)
      ) {
        switchEdit("bio");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editStates.bio]);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setBgImgSrc(imageURL);
      console.log("Imagem selecionada:", file);
    }
  };

  useEffect(() => {
    if (editStates.bgImg) {
      handleButtonClick();
    }
  }, [editStates.bgImg]);


  return (
    <MainLayout>
      <main className={styles.profile}>
        <div style={{ height: "100%", width: "100%", position: "relative" }}>
          {!loading && loggedUser?.id === userInfo?.id ? (
            <>
              {/* <MdOutlineModeEditOutline style={{ position: 'absolute',top: "5px", right: '5px', cursor: "pointer"}} onClick={() => switchEdit("bgImg")}/> */}
              <PremiumButton
                as="icon"
                icon={
                  <MdOutlineModeEditOutline
                    style={{
                      position: "absolute",
                      top: "5px",
                      right: "5px",
                      cursor: "pointer",
                    }}
                    onClick={() => switchEdit("bgImg")}
                  />
                }
              ></PremiumButton>

              {/* {showWarning && <PremiumWarning onClose={() => setShowWarning(false)} />} */}
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
            src={bgImgSrc}
            alt="background do perfil"
            className={styles.bgUser}
          />
        </div>

        <div className={styles.divPag}>
          <div className={styles.perfil}>
            <div className={styles.avatarCircle} style={{ zIndex: "1" }}>
              <img src={userAvatar} alt="Avatar do usuário" />
            </div>

            <h1 className={styles.displayName}>{userInfo?.display_name}</h1>

            <p className={styles.username}>
              @{userInfo?.username} <Verified verified={userInfo?.premium} />
            </p>
          </div>
          <div className={styles.moreInfo}>
            {!userInfo?.serverFav && (
              <div className={styles.serverInfo}>
                {
                  <div className={styles.guildCard}>
                    <img
                      className={styles.guildIcon}
                      src={`https://cdn.discordapp.com/icons/${userInfo?.serverFav?.id}/${userInfo?.serverFav?.icon}.webp?size=512`}
                      alt={`Ícone de ${userInfo?.serverFav?.name}`}
                    />
                    <div className={styles.guildInfo}>
                      <h2 className={styles.guildName} translate="no">
                        {userInfo?.serverFav?.name}
                      </h2>
                      <a
                        className={styles.guildLink}
                        href="https://discord.gg/nemtudo"
                        target="_blank"
                        rel="norreferer"
                      >
                        Entrar
                      </a>
                    </div>
                  </div>
                }
              </div>
            )}
            <div className={styles.description} ref={bioRef}>
              {editStates.bio ? (
                <>
                  <div>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span>
                      {!loading && loggedUser?.id === userInfo?.id ? (
                        <>
                          <MdOutlineModeEditOutline
                            style={{
                              position: "absolute",
                              top: "5px",
                              right: "5px",
                              cursor: "pointer",
                            }}
                            onClick={() => switchEdit("bio")}
                          />
                        </>
                      ) : (
                        <></>
                      )}
                      {bio}
                    </span>
                  </div>
                </>
              )}
            </div>
            <div className={styles.pixelsInfo}>
              <p className={styles.pixelsText}>
                O {userInfo?.display_name} inseriu {userInfo?.pixelQuantity}{" "}
                pixels
              </p>
              <PremiumButton
                setClass={styles.viewPixelsButton}
                onClick={() => alert("não feito ainda")}
              >
                Ver os pixels do {userInfo?.display_name}
              </PremiumButton>
            </div>
          </div>
        </div>

        <div className={styles.divPag}></div>
      </main>
    </MainLayout>
  );
}
