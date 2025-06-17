import { useState } from "react";
import settings from "@/settings";
import { MainLayout } from "@/layout/MainLayout";
import styles from "./UserProfile.module.css";

const userInfo = {
  id: "1299261588326580226",
  avatar: "eb3e418c94d091b214d9b617ab684db8",
  bgUser: "https://commandbat.com.br/homepage/img/projects/imgproject2.png",
  premium: true,
  display_name: "Nem Tudo",
  username: "nemtudo",
  bio: "Eu amo o commandbat",
  pixelQuantity: "10000",
  serverFav: "Casa do Nem Tudo",
};

const userAvatar = settings.avatarURL(userInfo.id, userInfo.avatar);

export default function UserProfile() {
  const [bio, setBio] = useState(userInfo.bio);
  return (
    <MainLayout>
      <main className={styles.profile}>
        <div className={styles.cover}>
          <img src={userInfo.bgUser} alt="background do perfil" />
        </div>

        <div className={styles.avatarCircle}>
          <img src={userAvatar} alt="Avatar do usuário" />
        </div>

        <h1 className={styles.name}>{userInfo.display_name}</h1>

        <p className={styles.handle}>
          @{userInfo.username} {userInfo.premium && <span className={styles.premiumIcon}>✅</span>}
        </p>

        <div className={styles.description}>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
          />
        </div>

        <p className={styles.details}>
          Quantidade de pixel: {userInfo.pixelQuantity} <br />
          Servidor: {userInfo.serverFav}
        </p>
      </main>
    </MainLayout>
  );
}
