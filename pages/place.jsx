import Head from "next/head";
import { useRef, useEffect, useState } from "react";
import { MainLayout } from "@/layout/MainLayout";
import settings from "@/settings";
import styles from "./place.module.css";
import { useAuth } from "@/context/AuthContext";
import { socket } from "@/src/socket";

export default function Place() {

    const { token } = useAuth()

    const canvasRef = useRef(null);
    const wrapperRef = useRef(null);
    const overlayCanvasRef = useRef(null);


    const [canvasConfig, setCanvasConfig] = useState({})

    const [canvasPixels, setCanvasPixels] = useState(new Map());


    const [selectedPixel, setSelectedPixel] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null)

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


    //Inicial: Da fetch no canvas
    useEffect(() => {
        let MIN_SCALE_MULTIPLIER = 0.8;
        let MAX_SCALE_MULTIPLIER = 150;
        async function fetchCanvas() {
            const request = await fetch(`${settings.apiURL}/canvas`);
            const canvasSettings = await request.json();
            setCanvasConfig(canvasSettings)

            const res = await fetch(`${settings.apiURL}/canvas/pixels`);
            const buffer = await res.arrayBuffer();
            const bytes = new Uint8Array(buffer);

            const ctx = canvasRef.current.getContext("2d");

            const pixelsMap = new Map();
            let i = 0;
            for (let y = 0; y < canvasSettings.height; y++) {
                for (let x = 0; x < canvasSettings.width; x++) {
                    const r = bytes[i++];
                    const g = bytes[i++];
                    const b = bytes[i++];
                    const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
                    ctx.fillStyle = hex;
                    ctx.fillRect(x, y, 1, 1); // pixelSize é 1

                    pixelsMap.set(`${x},${y}`, {
                        x,
                        y,
                        c: hexToNumber(hex)
                    });
                }
            }
            setCanvasPixels(pixelsMap);

            // Escala dinâmica
            const viewWidth = window.innerWidth;
            const viewHeight = window.innerHeight - 72;

            const scaleX = viewWidth / canvasSettings.width;
            const scaleY = viewHeight / canvasSettings.height;
            const minScale = Math.min(scaleX, scaleY) * MIN_SCALE_MULTIPLIER;
            const maxScale = MAX_SCALE_MULTIPLIER;

            transform.current.scale = minScale;
            transform.current.minScale = minScale;
            transform.current.maxScale = maxScale;
            applyTransform();
        }

        fetchCanvas();
    }, []);

    //Inicial: inicializa os sockets
    useEffect(() => {
        socket.on("pixel_placed", data => {
            updatePixel(data.x, data.y, data.c)
        })
    }, [])

    //Movimento do canvas
    useEffect(() => {
        const wrapper = wrapperRef.current;
        const zoom = transform.current;

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

        wrapper.addEventListener("mousedown", onMouseDown);
        wrapper.addEventListener("wheel", onWheel, { passive: false });
        window.addEventListener("keypress", onKeyPress);


        return () => {
            wrapper.removeEventListener("mousedown", onMouseDown);
            wrapper.removeEventListener("wheel", onWheel);
            window.removeEventListener("keypress", onKeyPress);

        };
    }, [canvasConfig.width, canvasConfig.height]);


    //Ao atualizar o selectedPixel, atualiza a marcação no canvasOverlay
    useEffect(() => {
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

        window.addEventListener('keydown', handleKeyDown);

        // Limpeza ao desmontar
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedPixel]);


    async function placePixel(x, y, color) {
        const oldpixel = canvasPixels.get(`${x},${y}`)

        updatePixel(x, y, color, true);
        const request = await fetch(`${settings.apiURL}/canvas/pixel`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                authorization: token
            },
            body: JSON.stringify({
                x: Number(x),
                y: Number(y),
                c: color
            })
        })
        const data = await request.json()
        if (!request.ok) {
            if (oldpixel) updatePixel(oldpixel.x, oldpixel.y, oldpixel.c)
            return alert(`Erro ao colocar pixel: ${data.message}`)
        }
    }

    function updatePixel(x, y, color, loading) {
        const ctx = canvasRef.current.getContext("2d");

        ctx.fillStyle = !loading ? numberToHex(color) : `${numberToHex(color)}cf`; //não tá carregando? Cor total : meio transparente
        ctx.fillRect(x, y, 1, 1);

        setCanvasPixels(prev => {
            const newMap = new Map(prev);
            newMap.set(`${x},${y}`, {
                x,
                y,
                c: color
            });
            return newMap;
        });
    }


    return (
        <>
            <Head>
                <title>PixelsPlace</title>
                <meta name="description" content="Participe do PixelsPlace!" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div>
                <button onClick={() => {
                    placePixel(selectedPixel.x, selectedPixel.y, selectedColor)
                }}>Bota pixel</button>
            </div>
            <MainLayout>

                {
                    !canvasConfig.width && <span>Carregando...  </span>
                }


                <section className={styles.overlaygui}>
                    <div className={styles.top}>

                    </div>
                    <div className={styles.bottom}>
                        <div className={styles.colors}>
                            {
                                canvasConfig?.freeColors?.map((color, index) => <>

                                    <div key={index} onClick={() => { setSelectedColor(color) }} className={styles.color} style={{ backgroundColor: numberToHex(color), border: selectedColor === color ? "2px solid white" : "" }} />

                                </>)
                            }
                            <input onChange={(e) => setSelectedColor(hexToNumber(e.target.value))} type="color"/>
                        </div>
                    </div>
                </section>


                <div
                    style={{
                        width: "100vw",
                        height: "calc(100vh - 72px)",
                        overflow: "hidden",
                        position: "relative",
                        background: "#ccc",
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
                            id={styles.canvas}
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                pointerEvents: "none",
                                transformOrigin: "0 0",
                                zIndex: 10,
                                width: "100%"
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