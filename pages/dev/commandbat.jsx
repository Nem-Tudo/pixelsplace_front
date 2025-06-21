import Head from "next/head";
import styles from "./commandbat.module.css";
import Link from "next/link";
import { MainLayout } from "@/layout/MainLayout";
import { MdClose } from "react-icons/md";


import PremiumButton from '@/components/PremiumButton';

export default function commandbat() {
  return (
<>
      <Head>
        <title>PixelsPlace</title>
        <meta name="description" content="Participe do PixelsPlace!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MainLayout>

        <div className={styles.div}>
            <div style={{ position: 'absolute', top: '20px',  right: '20px', cursor: "pointer" }}>
            <MdClose></MdClose>
            </div>
            <span>Essa função é apenas para premium</span>
            <PremiumButton setClass={styles.button} as={Link} href={"/premium"}> <span className={styles.span}>compre o premium aqui</span></PremiumButton>
        </div>
        </MainLayout>
        </>
)};