import styles from "./index.module.css";
import { MainLayout } from "@/layout/MainLayout";
import settings from "@/settings";

import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

import { useRef } from "react";

//wehook nt
//https://discord.com/api/webhooks/1445456176593637430/ge8wYdaeacIgWsYgXRf93u0Xn_-YDT9QEW5YmVI4Isy-6katVv5JoO22Mu8EZmuWG8Pu

async function enviarWebhook({ nome, avatar, mensagem }) {
  const webhookUrl =
    "https://discord.com/api/webhooks/1445456176593637430/ge8wYdaeacIgWsYgXRf93u0Xn_-YDT9QEW5YmVI4Isy-6katVv5JoO22Mu8EZmuWG8Pu";

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: nome,
      avatar_url: avatar,
      content: mensagem,
    }),
  });
}

export default function ChatPage() {
  const { language } = useLanguage();
  const { loggedUser } = useAuth();

  const inputRef = useRef(null);

  const handleEnviar = () => {
    const mensagem = inputRef.current.value;

    enviarWebhook({
      nome: loggedUser.username,
      avatar: settings.avatarURL(
        loggedUser.providerId,
        loggedUser.avatar,
        loggedUser.providerType
      ),
      mensagem: mensagem,
    });

    inputRef.current.value = ""; // limpar campo
  };

  return (
    <MainLayout>
      <main className={styles.main}>
        <div className={styles.chat}>
          <img
            src={settings.avatarURL(
              loggedUser.providerId,
              loggedUser.avatar,
              loggedUser.providerType
            )}
            alt={language.getString("PAGES.USER.USER_AVATAR_ALT")}
          />

          <input
            ref={inputRef}
            type="text"
            name="chat_enviar"
            id="chat_enviar"
          />

          <button type="button" onClick={handleEnviar}>
            Enviar
          </button>
        </div>
      </main>
    </MainLayout>
  );
}
