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
    }, [travelDuration, travelMultiplier, includeHistory]);

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

                {/* Período de Cobertura */}
                {periodRange.min && periodRange.max && (
                    <div style={{
                        position: 'fixed',
                        bottom: '240px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(0, 0, 0, 0.85)',
                        backdropFilter: 'blur(8px)',
                        borderRadius: '16px',
                        padding: '12px 20px',
                        zIndex: 999,
                        boxShadow: '0 6px 25px rgba(0, 0, 0, 0.25)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        maxWidth: '90vw',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: '11px',
                            fontWeight: '500',
                            marginBottom: '4px'
                        }}>
                            Período Disponível
                        </div>
                        <div style={{
                            color: 'white',
                            fontSize: '13px',
                            fontWeight: '600',
                            fontFamily: 'monospace',
                            letterSpacing: '0.3px'
                        }}>
                            {formatDateFull(periodRange.min)} → {formatDateFull(periodRange.max)}
                        </div>
                    </div>
                )}

                {/* Controles de Viagem no Tempo */}
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%) translateY(-45px)',
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
                    
                    {/* Preview da Data */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        marginBottom: '5px'
                    }}>
                        <div style={{
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontSize: '13px',
                            fontWeight: '600',
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            padding: '6px 12px',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            fontFamily: 'monospace',
                            letterSpacing: '0.5px'
                        }}>
                            📅 {formatDate(calculateDisplayedDate()) || 'Carregando...'}
                        </div>
                        
                        {/* Ícone de Ajuda */}
                        <Tippy
                            content={
                                <div style={{
                                    maxWidth: '320px',
                                    padding: '12px',
                                    fontSize: '13px',
                                    lineHeight: '1.5',
                                    color: 'white'
                                }}>
                                    <div style={{ fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
                                        🕐 Como usar a Viagem no Tempo
                                    </div>
                                    <div style={{ marginBottom: '8px' }}>
                                        <strong>Slider de Tempo:</strong><br/>
                                        • <strong>100%</strong> = Momento atual<br/>
                                        • <strong>99%</strong> = [duração] minutos atrás<br/>
                                        • <strong>50%</strong> = [duração × 50] minutos atrás<br/>
                                        • <strong>1%</strong> = [duração × 99] minutos atrás
                                    </div>
                                    <div style={{ marginBottom: '8px' }}>
                                        <strong>Duração:</strong><br/>
                                        • Define o intervalo entre cada ponto<br/>
                                        • Ex: 10 min = cada 1% do slider = 10 min no passado
                                    </div>
                                    <div style={{ marginBottom: '8px' }}>
                                        <strong>Histórico:</strong><br/>
                                        • <strong>Ativado:</strong> Mostra tudo até aquele momento<br/>
                                        • <strong>Desativado:</strong> Apenas mudanças no intervalo
                                    </div>
                                    <div style={{ 
                                        background: 'rgba(255, 255, 255, 0.1)', 
                                        padding: '8px', 
                                        borderRadius: '6px',
                                        fontSize: '12px'
                                    }}>
                                        💡 <strong>Exemplos:</strong><br/>
                                        • Duração 5 min + 80% = 100 min atrás<br/>
                                        • Duração 30 min + 90% = 300 min (5h) atrás
                                    </div>
                                </div>
                            }
                            placement="top"
                            theme="dark"
                            interactive={true}
                            arrow={true}
                            trigger="click"
                            hideOnClick={true}
                        >
                            <button style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.2)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                color: 'white',
                                fontSize: '11px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease',
                                outline: 'none'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                                e.target.style.transform = 'scale(1.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                                e.target.style.transform = 'scale(1)';
                            }}
                            >
                                ?
                            </button>
                        </Tippy>
                    </div>

                    {/* Slider Principal - Viagem no Tempo */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <div style={{
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: '500',
                            minWidth: '55px'
                        }}>
                            🕐 Tempo
                        </div>
                        
                        {/* Botão - do Slider */}
                        <button
                            onClick={() => {
                                const newValue = Math.max(0, travelMultiplier - 1);
                                setTravelMultiplier(newValue);
                            }}
                            style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.15)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                color: 'white',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease',
                                outline: 'none'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'rgba(255, 255, 255, 0.25)';
                                e.target.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                                e.target.style.transform = 'scale(1)';
                            }}
                        >
                            −
                        </button>

                        <div style={{
                            flex: 1,
                            position: 'relative'
                        }}>
                            <input
                                type="range"
                                min={0}
                                max={100}
                                value={travelMultiplier}
                                onChange={(e) => {
                                    clearTimeout(multiplierTimeout);
                                    setTravelMultiplier(Number(e.target.value));
                                    multiplierTimeout = setTimeout(() => {
                                        // Aplicar mudanças após delay se necessário
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

                        {/* Botão + do Slider */}
                        <button
                            onClick={() => {
                                const newValue = Math.min(100, travelMultiplier + 1);
                                setTravelMultiplier(newValue);
                            }}
                            style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.15)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                color: 'white',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease',
                                outline: 'none'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'rgba(255, 255, 255, 0.25)';
                                e.target.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                                e.target.style.transform = 'scale(1)';
                            }}
                        >
                            +
                        </button>

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
                        justifyContent: 'space-between',
                        flexWrap: 'wrap'
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
                            
                            {/* Botão - */}
                            <button
                                onClick={() => {
                                    const newValue = Math.max(1, travelDuration - 1);
                                    setTravelDuration(newValue);
                                }}
                                style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    background: 'rgba(255, 255, 255, 0.15)',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    color: 'white',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s ease',
                                    outline: 'none'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = 'rgba(255, 255, 255, 0.25)';
                                    e.target.style.transform = 'scale(1.05)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                                    e.target.style.transform = 'scale(1)';
                                }}
                            >
                                −
                            </button>

                            <input
                                type="number"
                                min={1}
                                max={1440}
                                value={travelDuration}
                                onChange={(e) => {
                                    setTravelDuration(Number(e.target.value));
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
                            
                            {/* Botão + */}
                            <button
                                onClick={() => {
                                    const newValue = Math.min(1440, travelDuration + 1);
                                    setTravelDuration(newValue);
                                }}
                                style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    background: 'rgba(255, 255, 255, 0.15)',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    color: 'white',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s ease',
                                    outline: 'none'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = 'rgba(255, 255, 255, 0.25)';
                                    e.target.style.transform = 'scale(1.05)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                                    e.target.style.transform = 'scale(1)';
                                }}
                            >
                                +
                            </button>
                            
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
                </div>

                {/* Viagem no tempo desvacada */}
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