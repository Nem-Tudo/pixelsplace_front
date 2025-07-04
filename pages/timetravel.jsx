import { useRef, useEffect, useState } from "react";
import { MainLayout } from "@/layout/MainLayout";
import settings from "@/settings";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from 'next/router'
import BillboardContent from "@/components/BillboardContent";
import Loading from "@/components/Loading";
import Cookies from 'js-cookie'
import { useLanguage } from '@/context/LanguageContext';
import CustomHead from "@/components/CustomHead";
import PixelCanvas from "@/components/pixelCanvas/PixelCanvas";
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import styles from "./timetravel.module.css";
import ToggleSwitch from "@/components/ToggleSwitch"

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
    const [travelMultiplier, setTravelMultiplier] = useState(100);
    const [travelDuration, setTravelDuration] = useState(10);
    const [fakeMultiplier, setFakeMultiplier] = useState(1);
    const [includeHistory, setIncludeHistory] = useState(true);

    // Função para calcular a data sendo exibida
    const calculateDisplayedDate = () => {
        if (!canvasConfig.cooldown_free) return null;
        
        const untilTime = new Date(Date.now() - (canvasConfig.cooldown_free || 5) * 1000);
        const maxMultiplier = 100;
        const invertedMultiplier = maxMultiplier - travelMultiplier;
        const endTime = new Date(untilTime.getTime() - (invertedMultiplier + 1) * travelDuration * 60 * 1000);
        
        return endTime;
    };

    // Função para calcular o período coberto pela duração
    const calculatePeriodRange = () => {
        if (!canvasConfig.cooldown_free) return { min: null, max: null };
        
        const currentTime = new Date(Date.now() - (canvasConfig.cooldown_free || 5) * 1000);
        const totalMinutesBack = 99 * travelDuration; // 99 pontos no slider (100% até 1%)
        const minTime = new Date(currentTime.getTime() - totalMinutesBack * 60 * 1000);
        
        return { min: minTime, max: currentTime };
    };

    const formatDate = (date) => {
        if (!date) return '';
        
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        
        return `${day}/${month} ${hours}:${minutes}`;
    };

    const formatDateFull = (date) => {
        if (!date) return '';
        
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    async function fetchCanvas(duration, multiplier, fakeMultiplier, history = false, initializeSettings) {
        try {
            multiplier = Number(multiplier);
            duration = Number(duration);
            fakeMultiplier = Number(fakeMultiplier);

            const [settingsRes, pixelsRes] = await Promise.all([
                fetch(`${settings.apiURL}/canvas`),
                fetch(`${settings.apiURL}/canvas/timetravel?duration=${duration*fakeMultiplier}&multiplier=${multiplier}&includeHistory=${history}`, {
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
            fetchCanvas(travelDuration, travelMultiplier, fakeMultiplier, includeHistory);
        } else {
            fetchCanvas(travelDuration, travelMultiplier, fakeMultiplier, includeHistory, {
                renderImageTimeout: 1,
                changeTransform: false,
            });
        }
    }, [travelDuration, travelMultiplier, fakeMultiplier, includeHistory]);

    const isAlready = () => !apiError && !loading && canvasConfig.width

    const periodRange = calculatePeriodRange();

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
                {!canvasConfig.width && !apiError && 
                    <BillboardContent centerscreen={true} type="normal-white">
                        <Loading width={"50px"} />
                    </BillboardContent>
                }
                {apiError && 
                    <BillboardContent centerscreen={true} type="warn" expand={String(apiError)}>
                        <span>{language.getString("PAGES.TIME_TRAVEL.API_ERROR")}</span>
                        <button onClick={() => location.reload()}>
                            {language.getString("PAGES.TIME_TRAVEL.RELOAD_BUTTON")}
                        </button>
                    </BillboardContent>
                }

                {/* Controles de viagem no tempo */}
                {!loading && <div className={`${styles.controls} showBottom`}>
                    <input
                        type="number"
                        value={travelDuration}
                        onChange={(e) => {
                            setTravelDuration(Number(e.target.value));
                        }}
                    />
                    <select value={fakeMultiplier} onChange={(e) => setFakeMultiplier(Number(e.target.value))}>
                        <option value="1">
                            minutos
                        </option>
                        <option value="60">
                            horas
                        </option>
                        <option value="1440">
                            dias
                        </option>
                    </select>
                    atrás
                    Apenas mudanças
                    <ToggleSwitch checked={!includeHistory} onChange={(e) => setIncludeHistory(!e.target.checked)}/>
                </div>}

                {/* Canvas */}
                <div id={styles.main}>
                    <PixelCanvas
                        ref={canvasRef}
                        fetchCanvas={fetchCanvas}
                    />
                </div>
            </MainLayout>
        </>
    );
}