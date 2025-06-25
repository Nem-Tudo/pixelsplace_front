import settings from "@/settings.js"
import { useLanguage } from '@/context/LanguageContext';

export function getServerSideProps({ req, query }) {
    return {
        redirect: {
            permanent: false,
            destination: `${settings.apiURL}/auth/discord?${query?.redirectURL ? `redirectURL=${query.redirectURL}` : ""}`
        }
    }
}

export default function Login() {
    const { language } = useLanguage();

    return <>
        <h1>{language.getString("COMMON.REDIRECTING")}</h1>
    </>
}