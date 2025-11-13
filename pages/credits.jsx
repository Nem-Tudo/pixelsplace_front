import styles from "./credits.module.css";
import Link from "next/link";
import { MainLayout } from "@/layout/MainLayout";
import CustomHead from "@/components/CustomHead";
import { useLanguage } from "@/context/LanguageContext";
import { useEffect, useState } from "react";

export default function Credits() {

  const { language } = useLanguage();


  const CREDITS_NORMAL = [

    {
      name: 'Nem Tudo',
      id: 'i231080212414468619',
      role: "CEO"
    },
    {
      name: 'Commandbat',
      id: 'i231080573990476854',
      role: "Developer frontend"
    },
    {
      name: 'Renato',
      id: '427257953503019017',
      role: "Designer"
    },
    {
      name: 'Ryan',
      id: '370348361460613130',
      role: "Development Supporter"
    }

  ];

  const CREDITS_EASTERGG = [

    {
      name: 'Nem Tudo',
      id: 'i231080212414468619',
      role: language.getString("PAGES.CREDITS.CHIEF_COW")
    },
    {
      name: 'Commandbat',
      id: 'i231080573990476854',
      role: language.getString("PAGES.CREDITS.CHIEF_DRAGGABLE")
    },
    {
      name: 'Renato',
      id: '427257953503019017',
      role: language.getString("PAGES.CREDITS.GOAT")
    },
    {
      name: 'Ryan',
      id: '370348361460613130',
      role: "Voz do Bot"
    }

  ];

  const [credits, setCredits] = useState(CREDITS_NORMAL)

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Shift' || event.key === "Control") {
        setCredits(CREDITS_EASTERGG)
      }
    };

    const handleKeyUp = (event) => {
      if (event.key === 'Shift' || event.key === "Control") {
        setCredits(CREDITS_NORMAL)
      }
    };

    // Adicionar event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Cleanup function para remover os event listeners
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

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
              credits.map((staff) => (
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