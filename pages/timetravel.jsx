import Head from "next/head";
import { useRef, useEffect, useState } from "react";
import { MainLayout } from "@/layout/MainLayout";
import settings from "@/settings";
import styles from "./timetravel.module.css";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from 'next/router'
import MessageDiv from "@/components/MessageDiv";
import Loading from "@/components/Loading";
import Cookies from 'js-cookie'
import checkFlags from "@/src/checkFlags";

export default function Place() {

    const { token, loggedUser } = useAuth()
    const router = useRouter()

    const canvasRef = useRef(null);
    const wrapperRef = useRef(null);
    const overlayCanvasRef = useRef(null);
    const selectedPixelRef = useRef(null);
    const hasFetchedRef = useRef(false);


    const [apiError, setApiError] = useState(false);
    const [loading, setLoading] = useState(true);

    const [canvasConfig, setCanvasConfig] = useState({});

    const [selectedPixel, setSelectedPixel] = useState(null);

    const [travelMultiplier, setTravelMultiplier] = useState(0);
    const [travelDuration, setTravelDuration] = useState(10);
    const [includeHistory, setIncludeHistory] = useState(true);

    const transform = useRef({
        scale: 1,
        pointX: 0,
        pointY: 0,
        startX: 0,
        startY: 0,
        minScale: 1,
        maxScale: 80,
    });

    const applyTransform = () => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;
        const { pointX, pointY, scale } = transform.current;
        wrapper.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
    };

    const centerCanvas = () => {
        const { scale } = transform.current;
        const viewWidth = window.innerWidth;
        const viewHeight = window.innerHeight - 72;

        const offsetX = (viewWidth - canvasConfig.width * scale) / 2;
        const offsetY = (viewHeight - canvasConfig.height * scale) / 2;

        transform.current.pointX = offsetX;
        transform.current.pointY = offsetY;
        applyTransform();
    };



    //selected pixel ref
    useEffect(() => {
        selectedPixelRef.current = selectedPixel;
    }, [selectedPixel]);

    //Inicial: Da fetch no canvas
    useEffect(() => {
        // Ensure router is ready before fetching
        if (router.isReady && !hasFetchedRef.current) {
            hasFetchedRef.current = true;
            fetchCanvas(10, 0);
        } else {
            console.log("Router not ready, waiting...");
        }
    }, [router.isReady]); // Depend on router.isReady

    async function fetchCanvas(duration, multiplier, history) {
        try {
            const MIN_SCALE_MULTIPLIER = 0.5;
            const MAX_SCALE_MULTIPLIER = 150;

            // Paralelize os fetches
            const [settingsRes, pixelsRes] = await Promise.all([
                fetch(`${settings.apiURL}/canvas`),
                fetch(`${settings.apiURL}/canvas/admin/timetravel?duration=${duration}&multiplier=${multiplier}&includeHistory=${history}`, {
                    headers: {
                        authorization: Cookies.get("authorization")
                    }
                })
            ]);
            setLoading(false)
            const canvasSettings = await settingsRes.json();
            setCanvasConfig(canvasSettings);

            const buffer = await pixelsRes.arrayBuffer();
            const bytes = new Uint8Array(buffer);

            const ctx = canvasRef.current?.getContext("2d");
            if (!ctx) {
                console.log("Main canvas context not available");
                setTimeout(() => {
                    fetchCanvas(10, 0)
                }, 500)
                return;
            }

            // Ajusta as dimensões do canvas
            canvasRef.current.width = canvasSettings.width;
            canvasRef.current.height = canvasSettings.height;
            overlayCanvasRef.current.width = canvasSettings.width * 10;
            overlayCanvasRef.current.height = canvasSettings.height * 10;

            // Cria ImageData e preenche diretamente os pixels
            const imageData = ctx.createImageData(canvasSettings.width, canvasSettings.height);
            const data = imageData.data;

            let i = 0;
            for (let j = 0; j < data.length; j += 4) {
                data[j] = bytes[i++];       // R
                data[j + 1] = bytes[i++];   // G
                data[j + 2] = bytes[i++];   // B
                data[j + 3] = 255;          // Alpha totalmente opaco
            }

            // Renderiza a imagem no próximo frame para performance
            requestAnimationFrame(() => {
                ctx.putImageData(imageData, 0, 0);
            });

            // Escala dinâmica do canvas
            const viewWidth = window.innerWidth;
            const viewHeight = window.innerHeight - 72;
            const scaleX = viewWidth / canvasSettings.width;
            const scaleY = viewHeight / canvasSettings.height;
            const minScale = Math.min(scaleX, scaleY) * MIN_SCALE_MULTIPLIER;
            const maxScale = MAX_SCALE_MULTIPLIER;

            transform.current.minScale = minScale;
            transform.current.maxScale = maxScale;

            if (wrapperRef.current) {
                wrapperRef.current.style.transform = `translate(${transform.current.pointX}px, ${transform.current.pointY}px) scale(${transform.current.scale})`;
            } else {
                console.error("wrapperRef not available");
            }

        } catch (e) {
            setApiError(e)
        }
    }

    //Movimento do canvas
    useEffect(() => {
        const wrapper = wrapperRef.current;
        const zoom = transform.current;

        let lastTouchDistance = null;

        const getTouchCenter = (touches) => {
            const x = (touches[0].clientX + touches[1].clientX) / 2;
            const y = (touches[0].clientY + touches[1].clientY) / 2;
            return { x, y };
        };

        const getTouchDistance = (touches) => {
            const dx = touches[0].clientX - touches[1].clientX;
            const dy = touches[0].clientY - touches[1].clientY;
            return Math.sqrt(dx * dx + dy * dy);
        };

        const onMouseDown = (e) => {
            e.preventDefault();
            zoom.startX = e.clientX - zoom.pointX;
            zoom.startY = e.clientY - zoom.pointY;

            const onMouseMove = (e) => {
                zoom.pointX = e.clientX - zoom.startX;
                zoom.pointY = e.clientY - zoom.startY;
                applyTransform();
            };

            const onMouseUp = () => {
                window.removeEventListener("mousemove", onMouseMove);
                window.removeEventListener("mouseup", onMouseUp);
            };

            window.addEventListener("mousemove", onMouseMove);
            window.addEventListener("mouseup", onMouseUp);
        };

        const onTouchStart = (e) => {
            if (e.touches.length === 1) {
                zoom.startX = e.touches[0].clientX - zoom.pointX;
                zoom.startY = e.touches[0].clientY - zoom.pointY;
            } else if (e.touches.length === 2) {
                lastTouchDistance = getTouchDistance(e.touches);
            }
        };

        const onTouchMove = (e) => {
            e.preventDefault();

            if (e.touches.length === 1) {
                zoom.pointX = e.touches[0].clientX - zoom.startX;
                zoom.pointY = e.touches[0].clientY - zoom.startY;
                applyTransform();
            } else if (e.touches.length === 2) {
                const newDistance = getTouchDistance(e.touches);
                const center = getTouchCenter(e.touches);

                if (lastTouchDistance) {
                    const delta = newDistance / lastTouchDistance;
                    let newScale = zoom.scale * delta;
                    newScale = Math.max(zoom.minScale, Math.min(zoom.maxScale, newScale));

                    const xs = (center.x - zoom.pointX) / zoom.scale;
                    const ys = (center.y - zoom.pointY) / zoom.scale;

                    zoom.scale = newScale;
                    zoom.pointX = center.x - xs * newScale;
                    zoom.pointY = center.y - ys * newScale;

                    applyTransform();
                }

                lastTouchDistance = newDistance;
            }
        };

        const onTouchEnd = (e) => {
            if (e.touches.length < 2) {
                lastTouchDistance = null;
            }
        };

        const onWheel = (e) => {
            e.preventDefault();
            const { pointX, pointY, scale, minScale, maxScale } = zoom;

            const xs = (e.clientX - pointX) / scale;
            const ys = (e.clientY - pointY) / scale;
            const delta = e.wheelDelta ? e.wheelDelta : -e.deltaY;

            let newScale = scale * (delta > 0 ? 1.2 : 1 / 1.2);
            newScale = Math.max(minScale, Math.min(maxScale, newScale));

            zoom.scale = newScale;
            zoom.pointX = e.clientX - xs * newScale;
            zoom.pointY = e.clientY - ys * newScale;

            applyTransform();
        };

        const onKeyPress = (e) => {
            if (e.key.toLowerCase() === "r") {
                zoom.scale = zoom.minScale;
                centerCanvas();
            }
        };

        wrapper?.addEventListener("mousedown", onMouseDown);
        wrapper?.addEventListener("wheel", onWheel, { passive: false });

        wrapper?.addEventListener("touchstart", onTouchStart, { passive: false });
        wrapper?.addEventListener("touchmove", onTouchMove, { passive: false });
        wrapper?.addEventListener("touchend", onTouchEnd);

        window?.addEventListener("keypress", onKeyPress);

        return () => {
            wrapper?.removeEventListener("mousedown", onMouseDown);
            wrapper?.removeEventListener("wheel", onWheel);

            wrapper?.removeEventListener("touchstart", onTouchStart);
            wrapper?.removeEventListener("touchmove", onTouchMove);
            wrapper?.removeEventListener("touchend", onTouchEnd);

            window?.removeEventListener("keypress", onKeyPress);
        };
    }, [canvasConfig.width, canvasConfig.height]);


    useEffect(() => {
        fetchCanvas(travelDuration, travelMultiplier, includeHistory)
    }, [travelDuration, travelMultiplier, includeHistory])

    //Ao atualizar o selectedPixel
    useEffect(() => {

        //Atualiza o overlay
        const SCALE = 10; // escala de visualização

        const canvas = overlayCanvasRef.current;
        if (!canvas || !selectedPixel) return;

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        //branco externo
        ctx.fillStyle = "#b3b3b3cf"; //branco transpa
        ctx.fillRect((selectedPixel.x * SCALE) - 2, (selectedPixel.y * SCALE) - 2, 14, 14);

        //limpa o interno
        ctx.clearRect((selectedPixel.x * SCALE) - 1, (selectedPixel.y * SCALE) - 1, 12, 12);

        //preto interno
        ctx.fillStyle = "#05050096";
        ctx.fillRect((selectedPixel.x * SCALE) - 1, (selectedPixel.y * SCALE) - 1, 12, 12);

        //limpa o interior
        ctx.clearRect((selectedPixel.x * SCALE), (selectedPixel.y * SCALE), 10, 10);

        //deixa só os cantos
        ctx.clearRect((selectedPixel.x * SCALE) + 2, (selectedPixel.y * SCALE) - 2, 6, 15);
        ctx.clearRect((selectedPixel.x * SCALE) - 2, (selectedPixel.y * SCALE) + 2, 15, 6);

    }, [selectedPixel]);

    //Mover o selected Pixel
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (!selectedPixel) return;
            switch (event.key) {
                case 'ArrowUp':
                    setSelectedPixel({ x: selectedPixel.x, y: selectedPixel.y - 1 })
                    break;
                case 'ArrowDown':
                    setSelectedPixel({ x: selectedPixel.x, y: selectedPixel.y + 1 })
                    break;
                case 'ArrowLeft':
                    setSelectedPixel({ x: selectedPixel.x - 1, y: selectedPixel.y })
                    break;
                case 'ArrowRight':
                    setSelectedPixel({ x: selectedPixel.x + 1, y: selectedPixel.y })
                    break;
            }
        };

        window?.addEventListener('keydown', handleKeyDown);

        // Limpeza ao desmontar
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedPixel]);



    const isAlready = () => !apiError && !loading && canvasConfig.width

    //verifica se é admin
    if (!checkFlags(loggedUser?.flags, "TIMETRAVEL_VIEW"))
        return (
            <MainLayout>
                <span>Você não tem permissão para acessar essa página.</span>
            </MainLayout>
        );

    return (
        <>
            <Head>
                <title>Timetravel PixelsPlace</title>
                <meta name="description" content="Participe do PixelsPlace!" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="theme-color" content="#80bbff" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <MainLayout>
                {
                    !canvasConfig.width && !apiError && <MessageDiv centerscreen={true} type="normal-white"> <Loading width={"50px"} /> <span style={{ fontSize: "2rem" }}>Carregando...</span></MessageDiv>
                }
                {
                    apiError && <MessageDiv centerscreen={true} type="warn" expand={String(apiError)}><span>Ocorreu um erro ao se conectar com a api principal</span><button onClick={() => location.reload()}>Recarregar</button></MessageDiv>
                }
                <section className={styles.overlaygui}>
                    <div className={styles.top}>
                    </div>
                    <div className={styles.bottom}>
                        <div style={{ display: "flex", justifyContent: "center" }}>

                            <input id={styles.timeModeCheck} type="checkbox" checked={includeHistory} onChange={(e) => {
                                setIncludeHistory(e.target.checked)
                            }} />
                            <label for={styles.timeModeCheck}>Todo o histórico</label>
                            <label for={styles.timeModeCheck}>Apenas as mudanças</label>

                        </div>
                        <div style={{ display: "flex", justifyContent: "center" }}>
                            <div>
                                <span>Marcha (m): </span>
                                <input type="number" value={travelDuration} onChange={(e) => {
                                    setTravelDuration(e.target.value);
                                }} />
                            </div>
                            <span style={{ display: "flex", justifyContent: "center" }}>
                                <span>Multiplicador:</span>
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
                    <div
                        ref={wrapperRef}
                        style={{
                            transformOrigin: "0 0",
                            position: "absolute",
                            top: 0,
                            left: 0,
                        }}
                    >
                        <canvas
                            ref={overlayCanvasRef}
                            width={canvasConfig.width * 10}
                            height={canvasConfig.height * 10}
                            className="pixelate"
                            id={styles.canvas}
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                pointerEvents: "none",
                                transformOrigin: "0 0",
                                zIndex: 10,
                                width: "100%",
                                display: Math.max(canvasConfig.width, canvasConfig.height) > 1500 ? "none" : "unset"
                            }}
                        />


                        <canvas
                            onClick={(e) => {
                                const canvas = canvasRef.current;
                                if (!canvas) return;

                                const rect = canvas.getBoundingClientRect();
                                const scaleX = canvas.width / rect.width;
                                const scaleY = canvas.height / rect.height;

                                const x = Math.floor((e.clientX - rect.left) * scaleX);
                                const y = Math.floor((e.clientY - rect.top) * scaleY);

                                setSelectedPixel({ x, y })
                            }}
                            className="pixelate"
                            id={styles.canvas}
                            ref={canvasRef}
                            width={canvasConfig.width}
                            height={canvasConfig.height}
                        />
                    </div>
                </div>


            </MainLayout>
        </>
    );
}


function hexToNumber(hex) {
    return parseInt(hex.replace('#', ''), 16);
}
function numberToHex(num) {
    return '#' + num.toString(16).padStart(6, '0');
}