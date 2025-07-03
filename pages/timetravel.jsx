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
import CustomHead from "@/components/CustomHead";
import PixelCanvas from "@/components/pixelCanvas/PixelCanvas";


let durationTimeout;
let multiplierTimeout;

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



    async function fetchCanvas(duration, multiplier, history = false, initializeSettings) {
        try {
            multiplier = Number(multiplier);
            duration = Number(duration);

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
            canvasRef.current.initializeCanvas(bytes, canvasSettings, {}, initializeSettings);
        } catch (e) {
            setApiError(true)
            console.log("Error on fetch canvas", e)
            alert(`Error on fetch canvas`, e)
        }
    }



    const firstTime = useRef(true);
    useEffect(() => {
        if (firstTime.current) {
            firstTime.current = false;
            fetchCanvas(travelDuration, travelMultiplier, includeHistory);
        } else {
            fetchCanvas(travelDuration, travelMultiplier, includeHistory, {
                renderImageTimeout: 1,
                changeTransform: true,
            });
        }
    }, [travelDuration, travelMultiplier, includeHistory]);

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
            <CustomHead 
                title={language.getString("PAGES.TIME_TRAVEL.META_TITLE")}
                description={language.getString("PAGES.TIME_TRAVEL.META_DESCRIPTION")}
                url={"https://pixelsplace.nemtudo.me/timetravel"}
            />
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
                                <input
                                    type="number"
                                    defaultValue={travelDuration}
                                    onChange={(e) => {
                                        clearTimeout(durationTimeout);
                                        durationTimeout = setTimeout(() => {
                                            setTravelDuration(e.target.value);
                                        }, 100);
                                    }}
                                />
                            </div>
                            <span style={{ display: "flex", justifyContent: "center" }}>
                                <span>{language.getString("PAGES.TIME_TRAVEL.MULTIPLIER_LABEL")}</span>
                                <input
                                    min={0}
                                    max={100}
                                    style={{ width: "80dvw" }}
                                    type="range"
                                    defaultValue={travelMultiplier}
                                    onChange={(e) => {
                                        clearTimeout(multiplierTimeout);
                                        multiplierTimeout = setTimeout(() => {
                                            setTravelMultiplier(Number(e.target.value));
                                        }, 100);
                                    }}
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