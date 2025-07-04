import styles from "./premium.module.css";
import { MainLayout } from "@/layout/MainLayout";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import CustomHead from "@/components/CustomHead";
import BillboardContent from "@/components/BillboardContent";
import CustomButton from "@/components/CustomButton";
import Failure from "@/components/Failure";

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
                <Failure details={'n deu certgo algo llol'}>
                    <CustomButton color={'#ffffff54'} hierarchy={2} padding={2} label={'Tentar novamente'} onClick={() => location.reload()} />
                    <CustomButton color={'#ffffff54'} padding={2} icon={'reload'} label={'Recarregar página'} onClick={() => location.reload()} />
                </Failure>
            </MainLayout>
        </>
    );
}
