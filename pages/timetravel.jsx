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

export default function TimeTravel() {
    const { token, loggedUser } = useAuth()
    const router = useRouter()
    const { language } = useLanguage();

    const canvasRef = useRef(null);

    const [apiError, setApiError] = useState(false);
    const [loading, setLoading] = useState(true);
    const [canvasConfig, setCanvasConfig] = useState({});
    const [percentage, setPercentage] = useState(100);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [includeHistory, setIncludeHistory] = useState(true);

    // Inicializar datas com valores padrão
    useEffect(() => {
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);

        // Definir como 00:00 do dia anterior e 00:00 do dia atual
        yesterday.setHours(0, 0, 0, 0);
        now.setHours(0, 0, 0, 0);

        setStartDate(formatDateForInput(yesterday));
        setEndDate(formatDateForInput(now));
    }, []);

    useEffect(() => {
        fetchInitialDate()
    }, [])

    async function fetchInitialDate() {
        const request = await fetch(`${settings.apiURL}/canvas/timetravel/firstpixel`, {
            headers: {
                "Authorization": Cookies.get("authorization")
            }
        });

        const response = await request.json();

        setStartDate(formatDateForInput(new Date(response.ca)))

    }

    // Função para formatar data para input datetime-local
    const formatDateForInput = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // Função para converter string de input para timestamp
    const dateStringToTimestamp = (dateString) => {
        return new Date(dateString).getTime();
    };

    // Função para calcular a data sendo exibida
    const calculateDisplayedDate = () => {
        if (!startDate || !endDate) return null;

        const start = new Date(startDate);
        const end = new Date(endDate);
        const timeDifference = end.getTime() - start.getTime();
        const targetTime = new Date(start.getTime() + (timeDifference * percentage) / 100);

        return targetTime;
    };

    // Função para formatar data de exibição
    const formatDisplayDate = (date) => {
        if (!date) return '';

        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    // Função para definir "Agora" como endDate
    const setNowAsEndDate = () => {
        const now = new Date();
        setEndDate(formatDateForInput(now));
    };

    async function fetchCanvas(startDateValue, endDateValue, percentageValue, history = false, initializeSettings) {
        try {
            const startTimestamp = dateStringToTimestamp(startDateValue);
            const endTimestamp = dateStringToTimestamp(endDateValue);

            const [settingsRes, pixelsRes] = await Promise.all([
                fetch(`${settings.apiURL}/canvas`),
                fetch(`${settings.apiURL}/canvas/timetravel?startDate=${startTimestamp}&endDate=${endTimestamp}&percentage=${percentageValue}&includeHistory=${history}`, {
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
        if (startDate && endDate) {
            if (firstTime.current) {
                firstTime.current = false;
                fetchCanvas(startDate, endDate, percentage, includeHistory);
            } else {
                fetchCanvas(startDate, endDate, percentage, includeHistory, {
                    renderImageTimeout: 1,
                    changeTransform: false,
                });
            }
        }
    }, [startDate, endDate, percentage, includeHistory]);

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
                    gap: '20px',
                    minWidth: '600px',
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
                        marginBottom: '10px'
                    }}>
                        <div style={{
                            color: 'white',
                            fontSize: '16px',
                            fontWeight: '600',
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            padding: '8px 16px',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            fontFamily: 'monospace',
                            letterSpacing: '0.5px'
                        }}>
                            📅 {formatDisplayDate(calculateDisplayedDate()) || 'Carregando...'}
                        </div>
                    </div>

                    {/* Controle Principal - Inputs de Data */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        justifyContent: 'space-between'
                    }}>

                        {/* Data Inicial */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '5px'
                        }}>
                            <label style={{
                                color: 'rgba(255, 255, 255, 0.8)',
                                fontSize: '12px',
                                fontWeight: '500'
                            }}>
                                Data Inicial
                            </label>
                            <input
                                type="datetime-local"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                style={{
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    color: 'white',
                                    fontSize: '13px',
                                    outline: 'none',
                                    fontFamily: 'monospace'
                                }}
                            />
                        </div>

                        {/* Seta */}
                        <div style={{
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontSize: '20px',
                            marginTop: '15px'
                        }}>
                            →
                        </div>

                        {/* Slider de Porcentagem */}
                        <div style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <div style={{
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: '600',
                                background: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                padding: '4px 12px'
                            }}>
                                {percentage}%
                            </div>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                width: '100%'
                            }}>
                                {/* Botão - */}
                                <button
                                    onClick={() => setPercentage(Math.max(0, percentage - 1))}
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

                                <input
                                    type="range"
                                    min={0}
                                    max={100}
                                    value={percentage}
                                    onChange={(e) => setPercentage(Number(e.target.value))}
                                    style={{
                                        flex: 1,
                                        height: '8px',
                                        borderRadius: '4px',
                                        background: `linear-gradient(to right, 
                                            #4ade80 0%, 
                                            #3b82f6 ${percentage}%, 
                                            #374151 ${percentage}%, 
                                            #374151 100%)`,
                                        appearance: 'none',
                                        cursor: 'pointer',
                                        outline: 'none'
                                    }}
                                />

                                {/* Botão + */}
                                <button
                                    onClick={() => setPercentage(Math.min(100, percentage + 1))}
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
                            </div>
                        </div>

                        {/* Seta */}
                        <div style={{
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontSize: '20px',
                            marginTop: '15px'
                        }}>
                            →
                        </div>

                        {/* Data Final */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '5px'
                        }}>
                            <label style={{
                                color: 'rgba(255, 255, 255, 0.8)',
                                fontSize: '12px',
                                fontWeight: '500'
                            }}>
                                Data Final
                            </label>
                            <div style={{
                                display: 'flex',
                                gap: '5px'
                            }}>
                                <input
                                    type="datetime-local"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        color: 'white',
                                        fontSize: '13px',
                                        outline: 'none',
                                        fontFamily: 'monospace'
                                    }}
                                />
                                <button
                                    onClick={setNowAsEndDate}
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(255, 255, 255, 0.3)',
                                        background: 'rgba(255, 255, 255, 0.15)',
                                        color: 'white',
                                        fontSize: '12px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        transition: 'all 0.2s ease',
                                        whiteSpace: 'nowrap'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = 'rgba(255, 255, 255, 0.25)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                                    }}
                                >
                                    Agora
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Toggle História */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}>
                        <span style={{
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: '500'
                        }}>
                            📚 Incluir Histórico
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