import styles from "./premium.module.css";
import { MainLayout } from "@/layout/MainLayout";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import CustomHead from "@/components/CustomHead";

export default function Premium(props) {

    const { loggedUser } = useAuth();
    const { language } = useLanguage();

    return (
        <>
            <CustomHead 
                title={language.getString("PAGES.PREMIUM.META_TITLE")}
                description={language.getString("PAGES.PREMIUM.META_DESCRIPTION")}
                url={"https://pixelsplace.nemtudo.me/premium"}
            />
            <MainLayout>
                <div
                    className={styles.page}
                >
                    <h1>PREMIUM!! :D</h1>
                </div>
            </MainLayout>
        </>
    );
}
