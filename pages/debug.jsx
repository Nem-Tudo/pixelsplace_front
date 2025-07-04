import styles from "./premium.module.css";
import { MainLayout } from "@/layout/MainLayout";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import CustomHead from "@/components/CustomHead";
import BillboardContent from "@/components/BillboardContent";

export default function DebugPage(props) {

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
                <BillboardContent centerscreen={true} type="warn">
                    <span>{language.getString("PAGES.PLACE.WEBSOCKET_KICKED")}</span>
                    <div style={{ display: 'flex', gap: '10px' }}>
                    <CustomButton label={language.getString("COMMON.RELOAD_PAGE")} onClick={() => location.reload()} />
                    </div>
                </BillboardContent>
            </MainLayout>
        </>
    );
}
