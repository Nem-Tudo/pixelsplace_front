import settings from "@/settings";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { useLanguage } from '@/context/LanguageContext';

export async function getServerSideProps(context) {
    const { t } = context.query;

    return {
        props: { buildtoken: t || null },
    };
}

export default function BuildOverride({ buildtoken }) {
    const { language } = useLanguage();

    const [pageMessage, setPageMessage] = useState(language.getString("PAGES.BUILD_OVERRIDE.LOADING_BUILD"));
    const [build, setBuild] = useState(null);
    const [tokenSignedBy, setTokenSignedBy] = useState(null);
    const [extraInfo, setExtraInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    let loaded = false;
    useEffect(() => {
        if (loaded) return;
        loaded = true;

        if (buildtoken) {
            fetchBuild(buildtoken);
        } else {
            setPageMessage(language.getString("PAGES.BUILD_OVERRIDE.REMOVING_BUILDS"));
            updateCookies(null);
        }
    }, [])

    async function fetchBuild(token) {
        if (!token || token === "main") {
            setPageMessage(language.getString("PAGES.BUILD_OVERRIDE.REMOVING_BUILDS"));
            return updateCookies(null);
        }
        try {
            const request = await fetch(`${settings.apiURL}/builds/parsetoken/${token}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    authorization: Cookies.get("authorization")
                },
            })
            if (request.status === 404) {
                setTimeout(() => {
                    location.href = "/";
                }, 2000)
                setLoading(false);
                return setPageMessage(language.getString("PAGES.BUILD_OVERRIDE.INVALID_BUILD"))
            };

            const response = await request.json();
            if (request.status != 200) {
                setTimeout(() => {
                    location.href = "/";
                }, 2000)
                setLoading(false);
                return setPageMessage(response.message || language.getString("PAGES.BUILD_OVERRIDE.ERROR_FETCHING_BUILD"));
            }
            setBuild(response.build);
            setTokenSignedBy(response.signedBy);
            setExtraInfo(response.info);
            if (response.build.forceOnLink) return updateCookies(token, response.build);
            setPageMessage("");

        } catch (error) {
            console.error('Error fetching branch:', error)
            setLoading(false);
            setTimeout(() => {
                location.href = "/";
            }, 2000)
            return setPageMessage(language.getString("PAGES.BUILD_OVERRIDE.ERROR_FETCHING_BUILD"));
        }
    }

    async function updateCookies(token, data) {
        console.log("updating build...")
        setLoading(false);
        if (token) {
            await fetch(`${settings.apiURL}/builds/${data.id}/newuse`, { method: "POST" })
            Cookies.set("active-build-token", token, { expires: 365, secure: true, sameSite: 'Lax' });
            Cookies.set("active-build-data", JSON.stringify(data), { expires: 365, secure: true, sameSite: 'Lax' });
        } else {
            Cookies.remove("active-build-token");
            Cookies.remove("active-build-data");
        }
        location.href = '/';
    }


    // ATENÇÃO!!! TODO O CSS DESSA PÁGINA DEVE SER INLINE!!!
    console.log(build)
    return (
        <>
            <span>{pageMessage}</span>
            {
                !loading && !build && <><br /><span>{language.getString("COMMON.REDIRECTING")}</span></>
            }
            {
                build && !build.forceOnLink && <div style={{ margin: "50px" }}>
                    <h1 style={{ fontWeight: "bold" }}>{language.getString("PAGES.BUILD_OVERRIDE.TITLE")}</h1>
                    <br />
                    <span>{language.getString("COMMON.NAME")}: <span style={{ color: "blue" }}>{build.name}</span></span>
                    <br />
                    <span>{language.getString("COMMON.AUTHOR")}: {build.author} ({extraInfo?.authorname})</span>
                    <br />
                    <span>{language.getString("PAGES.BUILD_OVERRIDE.SIGNED_BY")}: {tokenSignedBy} ({extraInfo?.signedByname})</span>
                    <br />
                    <br />
                    <button
                        style={{
                            cursor: "pointer",
                            background: "gray",
                            color: "white",
                            padding: "10px",
                            marginRight: "5px",
                            border: "1px solid hsla(0deg, 0%, 100%, 20%)",
                            borderRadius: "4px",
                            // boxShadow: "2px 2px 7px hsla(0, 0%, 0%, 14.1%)"
                        }}
                        onClick={() => location.href = "/"}>
                        {language.getString("COMMON.CANCEL")}
                    </button>
                    <button
                        style={{
                            cursor: "pointer",
                            background: "green",
                            color: "white",
                            padding: "10px",
                            border: "1px solid hsla(0deg, 0%, 100%, 20%)",
                            borderRadius: "4px",
                            // boxShadow: "2px 2px 7px hsla(0, 0%, 0%, 14.1%)"
                        }}
                        onClick={() => {
                            setPageMessage(language.getString("PAGES.BUILD_OVERRIDE.UPDATING_BUILD"))
                            updateCookies(buildtoken, build)
                        }}>
                        {language.getString("COMMON.USE")}
                    </button>
                    <br />
                    <br />
                    <span>{language.getString("PAGES.BUILD_OVERRIDE.REMOVE_INSTRUCTION")}</span>
                    <br />
                    <img
                        src="/assets/removebuild.png"
                        style={{
                            width: "190px",
                            marginTop: "12px",
                            borderRadius: "12px",
                            boxShadow: "2px 2px 7px hsla(0, 0%, 0%, 14.1%)"
                        }}
                    />
                </div>
            }
        </>
    )
}