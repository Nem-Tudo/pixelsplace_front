import Head from "next/head";
import styles from "./place.module.css";
import { MainLayout } from "@/layout/MainLayout";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import settings from "@/settings";

export default function Home() {
    const searchParams = useSearchParams();

    const [selectedPixel, setSelectedPixel] = useState({
        x: Number.isInteger(searchParams.get("x")) ? Number(searchParams.get("x")) : 0,
        y: Number.isInteger(searchParams.get("y")) ? Number(searchParams.get("y")) : 0
    });

    const [currentZoom, setCurrentZoom] = useState(
        Number.isInteger(searchParams.get("zoom")) ? Number(searchParams.get("zoom")) : 1
    );

    const canvasRef = useRef(null);

    const [canvasMap, setCanvasMap] = useState(new Map());
    const [canvasWidth, setCanvasWidth] = useState(1);
    const [canvasHeight, setCanvasHeight] = useState(1);
    const pixelSize = 1;

    useEffect(() => {
        async function fetchCanvas() {
            try {
                // Primeiro, busca as dimensões do canvas
                const canvasSettings = await fetch(`${settings.apiURL}/canvas`);
                const { width, height } = await canvasSettings.json();
                setCanvasWidth(width);
                setCanvasHeight(height);

                // Agora busca os dados binários
                const res = await fetch(`${settings.apiURL}/canvas/pixels`);
                const buffer = await res.arrayBuffer();
                const bytes = new Uint8Array(buffer);

                const map = new Map();
                let i = 0;
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        const r = bytes[i++];
                        const g = bytes[i++];
                        const b = bytes[i++];
                        const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
                        map.set(`${x},${y}`, { c: hex });
                    }
                }

                setCanvasMap(map);
                drawCanvas(map, width, height);
            } catch (err) {
                console.error("Erro ao buscar canvas:", err);
                alert("Erro ao buscar canvas: " + err);
            }
        }

        function drawCanvas(map, width, height) {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext("2d");

            canvas.width = width * pixelSize;
            canvas.height = height * pixelSize;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const data = map.get(`${x},${y}`);
                    const color = data?.c || "#ffffff"; // branco por padrão
                    ctx.fillStyle = color;
                    ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
                }
            }
        }


        fetchCanvas();
    }, []);

    return (
        <>
            <Head>
                <title>PixelsPlace</title>
                <meta name="description" content="Participe do PixelsPlace!" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <MainLayout>
                <button onClick={() => {
                    let coord = prompt("coord")
                    console.log(canvasMap.get(coord))
                }}>get</button>
                <canvas
                    width={canvasWidth}
                    height={canvasHeight}
                    ref={canvasRef}
                    style={{ border: "1px solid black" }}
                ></canvas>
            </MainLayout>
        </>
    );
}
