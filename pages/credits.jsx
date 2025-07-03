import styles from "./credits.module.css";
import Link from "next/link";
import { MainLayout } from "@/layout/MainLayout";
import CustomHead from "@/components/CustomHead";
import { useLanguage } from "@/context/LanguageContext";

export default function Credits() {

  const { language } = useLanguage();

  return (
    <>
      <CustomHead 
        title={language.getString("PAGES.CREDITS.META_TITLE")}
        description={language.getString("PAGES.CREDITS.META_DESCRIPTION")}
        url={"https://pixelsplace.nemtudo.me/credits"}
      />
      <MainLayout>
        <main className={styles.main}>
          <div className={styles.logo}>
            <img src="/logo.png" alt={language.getString("PAGES.INDEX.LOGO_ALT")} />
            <h1>{language.getString("PAGES.CREDITS.TITLE")}</h1>
          </div>
          <div className={styles.credits}>

            {
              [

                {
                  name: 'Nem Tudo',
                  id: '612651439701098558',
                  role: language.getString("PAGES.CREDITS.CHIEF_COW")
                },
                {
                  name: 'Commandbat',
                  id: '385478022670843904',
                  role: language.getString("PAGES.CREDITS.CHIEF_DRAGGABLE")
                },
                {
                  name: 'Renato',
                  id: '427257953503019017',
                  role: language.getString("PAGES.CREDITS.GOAT")
                },
                {
                  name: 'Kuriel',
                  id: '354233941550694400',
                  role: language.getString("PAGES.CREDITS.CHIEF_EVIL_LINUX")
                }

              ].map((staff) => (
                  <div className={styles.staff} key={staff.id}>
                      <h2>{staff.role}</h2>
                      <Link href={`/user/${staff.id}`}>{staff.name}</Link>
                  </div>
              ))
            }

          </div>
        </main>
      </MainLayout>
    </>
  );
}