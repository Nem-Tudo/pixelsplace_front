import { useRef, useEffect, useState } from "react";
import { MainLayout } from "@/layout/MainLayout";
import settings from "@/settings";
import { useAuth } from "@/context/AuthContext";
import { usePopup } from "@/context/PopupContext";
import { useRouter } from 'next/router'
import Billboard from "@/components/Billboard";
import Failure from "@/components/Failure";
import Loading from "@/components/Loading";
import Cookies from 'js-cookie';
import { useLanguage } from '@/context/LanguageContext';
import CustomHead from "@/components/CustomHead";
import PixelCanvas from "@/components/pixelCanvas/PixelCanvas";
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import styles from "./timetravel.module.css";
import ToggleSwitch from "@/components/ToggleSwitch";
import PixelIcon from "@/components/PixelIcon";
import CustomButton from "@/components/CustomButton";

export default function TimeTravel() {
    const { token, loggedUser } = useAuth()
    const { openPopup } = usePopup()
    const router = useRouter()
    const { language } = useLanguage();

    const canvasRef = useRef(null);

    const [apiError, setApiError] = useState('');
    const [loading, setLoading] = useState(true);
    const [canvasConfig, setCanvasConfig] = useState({});
    const [percentage, setPercentage] = useState(100);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [includeHistory, setIncludeHistory] = useState(true);
    const [nerdMode, setNerdMode] = useState(false);

    // Inicializar datas com valores padrão
    useEffect(() => {
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);

        // Definir como 00:00 do dia anterior e 00:00 do dia atual
        yesterday.setHours(0, 0, 0, 0);

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

    //Mostrar informações deu im pixel
    async function showPixelInfo(x, y) {
        const request = await fetch(
            `${settings.apiURL}/canvas/timetravel/pixel?x=${x}&y=${y}&endDate=${calculateDisplayedDate().getTime()}`,
            {
                method: "GET",
                headers: {
                    "Authorization": Cookies.get("authorization")
                }
            }
        ).catch((e) => {
            console.log("Erro ao obter pixel: ", e);
            openPopup('error', {message: `${e}`})
        });
        if (!request.ok) return openPopup("error", {message: `${request.status}`})

        const data = await request.json();
        openPopup('generic', {message: JSON.stringify(data)})
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
                fetch(`${settings.apiURL}/canvas/timetravel/pixels?startDate=${startTimestamp}&endDate=${endTimestamp}&percentage=${percentageValue}&includeHistory=${history}`, {
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
            canvasRef?.current?.initializeCanvas(bytes, canvasSettings, {}, initializeSettings);
        } catch (e) {
            setApiError(`Error on fetch canvas: ${e}`)
            console.log("Error on fetch canvas", e)
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
            <>
                <CustomHead
                    title={language.getString("PAGES.TIME_TRAVEL.META_TITLE")}
                    description={language.getString("PAGES.TIME_TRAVEL.META_DESCRIPTION")}
                    url={"https://pixelsplace.nemtudo.me/timetravel"}
                />
                <MainLayout>
                    <Failure message={language.getString("COMMON.NO_PERMISSION_PAGE")}>
                        <CustomButton color={'#ffffff54'} icon={'home'} padding={2} label={language.getString("PAGES.INDEX.NAME")} href={"/"} />
                    </Failure>
                </MainLayout>
            </>
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
                    <Billboard>
                        <Loading />
                    </Billboard>
                }
                {apiError &&
                    <Failure message={language.getString("PAGES.TIME_TRAVEL.API_ERROR")} details={String(apiError)}>
                        <CustomButton color={'#ffffff54'} icon={'reload'} padding={2} label={language.getString("PAGES.TIME_TRAVEL.RELOAD_BUTTON")} onClick={() => location.reload()} />
                    </Failure>
                }

                {/* Controles de Viagem no Tempo */}
                {!loading && !apiError && <div className={`${styles.controls} showBottom`}>

                    {/* Preview da Data */}
                    <section>
                        {formatDisplayDate(calculateDisplayedDate()) || language.getString('COMMON.LOADING')}
                    </section>

                    {/* Controle Principal - Inputs de Data */}
                    <section style={nerdMode ? {alignItems: 'flex-start'} : {}}>

                        {/* Data Inicial */}
                        {nerdMode && <div className={styles.nerdDate} style={{alignItems: 'flex-end'}}>
                            <label>
                                {language.getString('PAGES.TIME_TRAVEL.STARTING_DATE')}
                            </label>
                            <input
                                type="datetime-local"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>}

                        {/* Slider de Porcentagem */}
                        <div className={styles.sliderWrapper}>
                            {nerdMode && <div>
                                {percentage}%
                            </div>}

                            <div className={styles.slider}>
                                {/* Botão - */}
                                <CustomButton
                                    padding={1}
                                    onClick={() => setPercentage(Math.max(0, percentage - 1))}
                                >
                                    −
                                </CustomButton>

                                <input
                                    type="range"
                                    min={0}
                                    max={100000}
                                    value={percentage*1000}
                                    onChange={(e) => setPercentage(Number(e.target.value)/1000)}
                                />

                                {/* Botão + */}
                                <CustomButton
                                    padding={1}
                                    onClick={() => setPercentage(Math.min(100, percentage + 1))}
                                >
                                    +
                                </CustomButton>
                            </div>
                        </div>

                        {/* Data Final */}
                        {nerdMode && <div className={styles.nerdDate} style={{alignItems: 'flex-start'}}>
                            <label>
                                {language.getString('PAGES.TIME_TRAVEL.ENDING_DATE')}
                            </label>
                            <div>
                                <input
                                    type="datetime-local"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                                <CustomButton
                                    padding={1}
                                    onClick={setNowAsEndDate}
                                    label={language.getString('COMMON.NOW')}
                                />
                            </div>
                        </div>}

                    </section>

                    {/* Controles */}
                    {nerdMode && <section>
                        <span>
                            {language.getString('PAGES.TIME_TRAVEL.HISTORY')}
                        </span>
                        <ToggleSwitch
                            checked={includeHistory}
                            onChange={(e) => setIncludeHistory(e.target.checked)}
                        />
                    </section>}

                    {/* Nerd mode toggle */}
                    <PixelIcon
                        codename={nerdMode ? 'close' : 'plus'}
                        onClick={(e) => setNerdMode(!nerdMode)}
                        className={styles.nerdModeToggle}
                    />
                </div>}

                {/* Canvas */}
                {!loading && !apiError && <main id={styles.main}>
                    <PixelCanvas
                        ref={canvasRef}
                        fetchCanvas={fetchCanvas}
                        onRightClickPixel={(x, y) => showPixelInfo(x, y)}
                    />
                </main>}
            </MainLayout>
        </>
    );
}