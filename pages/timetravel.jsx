import Head from "next/head";
import { useRef, useEffect, useState } from "react";
import { MainLayout } from "@/layout/MainLayout";
import settings from "@/settings";
import styles from "./timetravel.module.css";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from 'next/router'
import BillboardContent from "@/components/BillboardContent";
import Loading from "@/components/Loading";
import Cookies from 'js-cookie'
import { useLanguage } from '@/context/LanguageContext';
import PixelCanvas from "@/components/pixelCanvas/PixelCanvas";

export default function Place() {

    const { token, loggedUser } = useAuth()
    const router = useRouter()
    const { language } = useLanguage();

    const canvasRef = useRef(null);


    const [apiError, setApiError] = useState(false);
    const [loading, setLoading] = useState(true);

    const [canvasConfig, setCanvasConfig] = useState({});

    const [travelMultiplier, setTravelMultiplier] = useState(0);
    const [travelDuration, setTravelDuration] = useState(10);
    const [includeHistory, setIncludeHistory] = useState(true);



    async function fetchCanvas(duration, multiplier, history = false) {
        try {

            // Paralelize os fetches
            const [settingsRes, pixelsRes] = await Promise.all([
                fetch(`${settings.apiURL}/canvas`),
                fetch(`${settings.apiURL}/canvas/timetravel?duration=${duration}&multiplier=${multiplier}&includeHistory=${history}`, {
                    headers: {
                        "Authorization": Cookies.get("authorization")
                    }
                }),
            ]);
            setLoading(false);
            const canvasSettings = await settingsRes.json();
            setCanvasConfig(canvasSettings);

            const buffer = await pixelsRes.arrayBuffer();
            const bytes = new Uint8Array(buffer);
            canvasRef.current.initializeCanvas(bytes, canvasSettings, router.query);
        } catch (e) {
            setApiError(true)
            console.log("Error on fetch canvas", e)
            alert(`Error on fetch canvas`, e)
        }
    }



    useEffect(() => {
        fetchCanvas(travelDuration, travelMultiplier, includeHistory)
    }, [travelDuration, travelMultiplier, includeHistory])

    const isAlready = () => !apiError && !loading && canvasConfig.width

    //verifica se é premium
    if (!loggedUser?.premium)
        return (
            <MainLayout>
                <span>{language.getString("COMMON.NO_PERMISSION")}</span>
            </MainLayout>
        );

    return (
        <>
            <Head>
                <title>{language.getString("COMMON.TIME_TRAVEL")}</title>
                <meta name="description" content={language.getString("PAGES.TIME_TRAVEL.META_DESCRIPTION")} />
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
                <meta name="theme-color" content="#80bbff" />
                <link rel="icon" href="/favicon.ico" />

                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://pixelsplace.nemtudo.me/timetravel" />
                <meta property="og:title" content={language.getString("COMMON.TIME_TRAVEL")} />
                <meta property="og:description" content={language.getString("PAGES.TIME_TRAVEL.META_DESCRIPTION")} />
                <meta property="og:image" content="/logo.png" />

                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:url" content="https://pixelsplace.nemtudo.me/timetravel" />
                <meta property="twitter:title" content={language.getString("COMMON.TIME_TRAVEL")} />
                <meta property="twitter:description" content={language.getString("PAGES.TIME_TRAVEL.META_DESCRIPTION")} />
                <meta property="twitter:image" content="/logo.png" />
            </Head>
            <MainLayout>
                {
                    !canvasConfig.width && !apiError && <BillboardContent centerscreen={true} type="normal-white"> <Loading width={"50px"} /></BillboardContent>
                }
                {
                    apiError && <BillboardContent centerscreen={true} type="warn" expand={String(apiError)}><span>{language.getString("PAGES.TIME_TRAVEL.API_ERROR")}</span><button onClick={() => location.reload()}>{language.getString("PAGES.TIME_TRAVEL.RELOAD_BUTTON")}</button></BillboardContent>
                }
                <section className={styles.overlaygui}>
                    <div className={styles.top}>
                    </div>
                    <div className={styles.bottom}>
                        <div style={{ display: "flex", justifyContent: "center" }}>

                            <input id={styles.timeModeCheck} type="checkbox" checked={includeHistory} onChange={(e) => {
                                setIncludeHistory(e.target.checked)
                            }} />
                            <label htmlFor={styles.timeModeCheck}>{language.getString("PAGES.TIME_TRAVEL.FULL_HISTORY")}</label>
                            <label htmlFor={styles.timeModeCheck}>{language.getString("PAGES.TIME_TRAVEL.CHANGES_ONLY")}</label>

                        </div>
                        <div style={{ display: "flex", justifyContent: "center" }}>
                            <div>
                                <span>{language.getString("PAGES.TIME_TRAVEL.MARCH_LABEL")} </span>
                                <input type="number" value={travelDuration} onChange={(e) => {
                                    setTravelDuration(e.target.value);
                                }} />
                            </div>
                            <span style={{ display: "flex", justifyContent: "center" }}>
                                <span>{language.getString("PAGES.TIME_TRAVEL.MULTIPLIER_LABEL")}</span>
                                <input
                                    min={0}
                                    max={100}
                                    style={{ width: "80dvw" }}
                                    type="range"
                                    defaultValue={travelMultiplier}
                                    onMouseUp={(e) => setTravelMultiplier(e.target.value)}
                                    onTouchEnd={(e) => setTravelMultiplier(e.target.value)}
                                // onChange={(e) => setTravelMultiplier(Number(e.target.value))}
                                />
                                <span>({travelMultiplier}x)</span>
                            </span>

                        </div>
                    </div>
                </section>
                <div
                    style={{
                        width: "100dvw",
                        height: "calc(100dvh - 72px)",
                        overflow: "hidden",
                        position: "relative",
                        background: "whitesmoke",
                        display: isAlready() ? "unset" : "none"
                    }}
                >
                    <PixelCanvas
                        ref={canvasRef}
                    />
                </div>


            </MainLayout>
        </>
    );
}