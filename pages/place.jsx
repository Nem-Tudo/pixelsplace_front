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


    const [canvasWidth, setCanvasWidth] = useState(1);
    const [canvasHeight, setCanvasHeight] = useState(1);

    const [canvasPixels, setCanvasPixels] = useState(new Map());
    const [selectedPixel, setSelectedPixel] = useState(null);

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

        const offsetX = (viewWidth - canvasWidth * scale) / 2;
        const offsetY = (viewHeight - canvasHeight * scale) / 2;

        transform.current.pointX = offsetX;
        transform.current.pointY = offsetY;
        applyTransform();
    };


    //Inicial: Da fetch no canvas
    useEffect(() => {
        async function fetchCanvas() {
            const canvasSettings = await fetch(`${settings.apiURL}/canvas`);
            const { width, height } = await canvasSettings.json();
            setCanvasWidth(width);
            setCanvasHeight(height);

            const res = await fetch(`${settings.apiURL}/canvas/pixels`);
            const buffer = await res.arrayBuffer();
            const bytes = new Uint8Array(buffer);

            const ctx = canvasRef.current.getContext("2d");
            const pixelSize = 1;

            const pixelsMap = new Map();
            let i = 0;
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
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

            const scaleX = viewWidth / width;
            const scaleY = viewHeight / height;
            const minScale = Math.min(scaleX, scaleY) * 0.8;
            const maxScale = 100;

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
    }, [canvasWidth, canvasHeight]);


    //Ao atualizar o selectedPixel, atualiza a marcação no canvasOverlay
    useEffect(() => {
        const canvas = overlayCanvasRef.current;
        if (!canvas || !selectedPixel) return;

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const scale = 10; // escala de visualização
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.strokeRect(
            selectedPixel.x * scale,
            selectedPixel.y * scale,
            scale,
            scale
        );
        console.log(selectedPixel, "selectedPixel")
    }, [selectedPixel]);


    async function placePixel(x, y, color) {
        const oldpixel = canvasPixels.get(`${x}:${y}`)

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
            updatePixel(oldpixel.x, oldpixel.y, oldpixel.color)
            return alert(`Erro ao colocar pixel: ${data.message}`)
        }
    }

    function updatePixel(x, y, color) {
        const ctx = canvasRef.current.getContext("2d");

        ctx.fillStyle = numberToHex(color);
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
                    let info = prompt("x:y #hex")
                    if (!info) return;
                    placePixel(info.split(":")[0], info.split(":")[1].split(" ")[0], hexToNumber(`#` + info.split("#")[1]))
                }}>Bota pixel</button>
            </div>
            <MainLayout>
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
                            width={canvasWidth * 10}
                            height={canvasHeight * 10}
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
                            width={canvasWidth}
                            height={canvasHeight}
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