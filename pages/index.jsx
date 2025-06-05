import Head from "next/head";
import styles from "./Index.module.css";
import Link from "next/link";
import settings from "@/settings.js";
import { MainLayout } from "@/layout/MainLayout";
import { parseCookies } from "nookies";
import { useState } from "react";


export async function getServerSideProps({ req }) {
  const cookies = parseCookies({ req });
  const token = cookies.authorization;

  if (!token) {
    return { props: { user: null } };
  }

  try {
    const res = await fetch(`${settings.apiURL}/users/@me`, {
      headers: { Authorization: token }
    });

    if (!res.ok) {
      return { props: { user: null } };
    }

    const user = await res.json();
    return { props: { user } };
  } catch (err) {
    console.error("Erro ao buscar usuário:", err);
    return { props: { user: null } };
  }
}




export default function Home(props) {

  const [user, setUser] = useState(props.user);

  return (
    <>
      <Head>
        <title>PixelsPlace</title>
        <meta name="description" content="Participe do PixelsPlace!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MainLayout user={user}>
        <div
          className={styles.page}
        >
          <main className={styles.main}>
            <div className={styles.logo}>
              <img src="/logo.png" alt="logo" />
              <h1>Pixels Place</h1>
            </div>
            <div className={styles.buttons}>
              <Link className={styles.btn} href={user ? "/place" : "/login"}>Começar</Link>
              <Link className={styles.btn} href="/partners">Servidores</Link>
            </div>
          </main>
        </div>
      </MainLayout>
    </>
  );
}
