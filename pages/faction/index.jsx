import CustomHead from "@/components/CustomHead";
import { MainLayout } from "@/layout/MainLayout";

import { useAuth } from '@/context/AuthContext';
import { useLanguage } from "@/context/LanguageContext";


export default function factions() {

  const { loggedUser } = useAuth();
  const { language, changeLanguage } = useLanguage();

  return (
    <>
      <CustomHead 
        // title={language.getString("PAGES.INDEX.META_TITLE")}
        // description={language.getString("PAGES.INDEX.META_DESCRIPTION")}
        // url={"https://pixelsplace.nemtudo.me/"}
      />
      <MainLayout>
          <p>Fazer a lista de factions</p>
      </MainLayout>
    </>
  );
}