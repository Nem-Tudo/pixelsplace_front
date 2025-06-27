import { setCookie, destroyCookie } from "nookies"
import { useEffect } from "react";
import { useLanguage } from '@/context/LanguageContext';

export async function getServerSideProps(context) {
    return {
        props: {
            token: context.query?.token || null,
            redirectURL: context.query?.redirectURL || "/"
        },
    }
}

export default function DiscordOauth2({ token, redirectURL }) {
    const { language } = useLanguage();

    if (token) {
        setCookie(null, "authorization", token, {
            maxAge: 30 * 24 * 60 * 60,
            path: "/"
        })
    } else {
        setCookie(null, "authorization", null, {
            maxAge: 1,
            path: "/"
        })
    }

    useEffect(() => {
        if (redirectURL) {
            location.href = `/${redirectURL.replace("/", "")}`
        } else {
            location.href = "/"
        }
    }, [])

    return (
        <div style={{
            display: "flex",
            width: "100%",
            height: "100dvh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center"
        }}>
            <h1 style={{
                color: "black",
                fontSize: "1.5rem",
                fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif"
            }}>{token ? language.getString("PAGES.DISCORD_OAUTH2.LOGGED_IN") : language.getString("PAGES.DISCORD_OAUTH2.DISCONNECTED")} {language.getString("PAGES.DISCORD_OAUTH2.SUCCESS_REDIRECTING")}</h1>
        </div>
    )
}