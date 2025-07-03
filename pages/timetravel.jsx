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
                changeTransform: false,
            });
        }
    }, [travelDuration, travelMultiplier, includeHistory]);

    const isAlready = () => !apiError && !loading && canvasConfig.width

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

                {/* Controles de Viagem no Tempo */}
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0, 0, 0, 0.9)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '20px',
                    padding: '20px 30px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px',
                    minWidth: '320px',
                    maxWidth: '90vw',
                    zIndex: 1000,
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    
                    {/* Slider Principal - Viagem no Tempo */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px'
                    }}>
                        <div style={{
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: '500',
                            minWidth: '60px'
                        }}>
                            🕐 Tempo
                        </div>
                        <div style={{
                            flex: 1,
                            position: 'relative'
                        }}>
                            <input
                                type="range"
                                min={0}
                                max={100}
                                defaultValue={travelMultiplier}
                                onChange={(e) => {
                                    clearTimeout(multiplierTimeout);
                                    multiplierTimeout = setTimeout(() => {
                                        setTravelMultiplier(Number(e.target.value));
                                    }, 100);
                                }}
                                className="time-travel-slider"
                                style={{
                                    width: '100%',
                                    height: '8px',
                                    borderRadius: '4px',
                                    background: `linear-gradient(to right, 
                                        #4ade80 0%, 
                                        #3b82f6 ${travelMultiplier}%, 
                                        #374151 ${travelMultiplier}%, 
                                        #374151 100%)`,
                                    appearance: 'none',
                                    cursor: 'pointer',
                                    outline: 'none'
                                }}
                            />

                        </div>
                        <div style={{
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: '600',
                            minWidth: '45px',
                            textAlign: 'center',
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            padding: '4px 8px'
                        }}>
                            {travelMultiplier}%
                        </div>
                    </div>

                    {/* Controles Secundários */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        justifyContent: 'space-between'
                    }}>
                        
                        {/* Duração */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <span style={{
                                color: 'white',
                                fontSize: '12px',
                                fontWeight: '500'
                            }}>
                                ⏱️ Duração
                            </span>
                            <input
                                type="number"
                                min={1}
                                max={1440}
                                defaultValue={travelDuration}
                                onChange={(e) => {
                                    clearTimeout(durationTimeout);
                                    durationTimeout = setTimeout(() => {
                                        setTravelDuration(Number(e.target.value));
                                    }, 100);
                                }}
                                style={{
                                    width: '60px',
                                    padding: '6px 8px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    color: 'white',
                                    fontSize: '12px',
                                    textAlign: 'center',
                                    outline: 'none'
                                }}
                            />
                            <span style={{
                                color: 'rgba(255, 255, 255, 0.7)',
                                fontSize: '12px'
                            }}>
                                min
                            </span>
                        </div>

                        {/* Toggle História */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <span style={{
                                color: 'white',
                                fontSize: '12px',
                                fontWeight: '500'
                            }}>
                                📚 Histórico
                            </span>
                            <label style={{
                                position: 'relative',
                                display: 'inline-block',
                                width: '44px',
                                height: '24px',
                                cursor: 'pointer'
                            }}>
                                <input
                                    type="checkbox"
                                    checked={includeHistory}
                                    onChange={(e) => setIncludeHistory(e.target.checked)}
                                    style={{
                                        opacity: 0,
                                        width: 0,
                                        height: 0
                                    }}
                                />
                                <span style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: includeHistory ? '#4ade80' : '#374151',
                                    borderRadius: '12px',
                                    transition: 'all 0.3s ease',
                                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)'
                                }}>
                                    <span style={{
                                        position: 'absolute',
                                        content: '""',
                                        height: '18px',
                                        width: '18px',
                                        left: includeHistory ? '23px' : '3px',
                                        bottom: '3px',
                                        background: 'white',
                                        borderRadius: '50%',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                                    }} />
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Indicador de Status */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        paddingTop: '8px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                        <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: loading ? '#f59e0b' : '#4ade80',
                            animation: loading ? 'pulse 2s infinite' : 'none'
                        }} />
                        <span style={{
                            color: 'rgba(255, 255, 255, 0.8)',
                            fontSize: '11px',
                            fontWeight: '500'
                        }}>
                            {loading ? 'Carregando...' : 'Viagem no Tempo Ativa'}
                        </span>
                    </div>
                </div>

                {/* Canvas */}
                <div style={{
                    width: "100dvw",
                    height: "calc(100dvh - 72px)",
                    overflow: "hidden",
                    position: "relative",
                    background: "whitesmoke",
                    display: isAlready() ? "unset" : "none"
                }}>
                    <PixelCanvas
                        ref={canvasRef}
                        fetchCanvas={fetchCanvas}
                    />
                </div>

                <style jsx global>{`
                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.5; }
                    }
                    
                    .time-travel-slider::-webkit-slider-thumb {
                        appearance: none;
                        width: 20px;
                        height: 20px;
                        border-radius: 50%;
                        background: white;
                        cursor: pointer;
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                        transition: all 0.2s ease;
                    }
                    
                    .time-travel-slider::-webkit-slider-thumb:hover {
                        transform: scale(1.1);
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
                    }
                    
                    .time-travel-slider::-moz-range-thumb {
                        width: 20px;
                        height: 20px;
                        border-radius: 50%;
                        background: white;
                        cursor: pointer;
                        border: none;
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                    }
                `}</style>
            </MainLayout>
        </>
    );
}