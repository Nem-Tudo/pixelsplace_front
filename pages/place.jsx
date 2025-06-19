import Head from "next/head";
import { useRef, useEffect, useState } from "react";
import { MainLayout } from "@/layout/MainLayout";
import settings from "@/settings";
import styles from "./place.module.css";
import { useAuth } from "@/context/AuthContext";
import { socket, useSocketConnection } from "@/src/socket";
import { useRouter } from 'next/router';
import MessageDiv from "@/components/MessageDiv";
import Loading from "@/components/Loading";
import Link from "next/link";
import Verified from "@/components/Verified";
import useDraggable from '@/src/useDraggable';
import { MdDragIndicator, MdClose } from "react-icons/md";
import PremiumButton from '@/components/PremiumButton';

export default function Place() {

    const { token, loggedUser } = useAuth();
    const router = useRouter();
    const socketconnected = useSocketConnection();

    const canvasRef = useRef(null);
    const wrapperRef = useRef(null);
    const overlayCanvasRef = useRef(null);
    const selectedPixelRef = useRef(null);
    const hasFetchedRef = useRef(false);
    const hasLoadedSocketsRef = useRef(false);
    const cooldownRef = useRef(null);
    const pixelInfoRef = useRef(null);

    const [apiError, setApiError] = useState(false);
    const [loading, setLoading] = useState(true);

    const [isMobile, setIsMobile] = useState(false)

    const [canvasConfig, setCanvasConfig] = useState({})

    const [cooldownInfo, setCooldownInfo] = useState({
        lastPaintPixel: null
    });
    const [timeLeft, setTimeLeft] = useState("0:00");

    const [selectedPixel, setSelectedPixel] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [showingPixelInfo, setShowingPixelInfo] = useState(null);

    const [showingPixelPosition, setShowingPixelPosition] = useState(null);

    /* não sei como fazer para atualizar o zoom */
    // const [sliderValue, setSliderValue] = useState(0);

    const [showingColors, setShowingColors] = useState(false);

    
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

        const updatedQuery = {
            ...router.query,
            s: Math.round(scale),
            px: Math.round(pointX),
            py: Math.round(pointY),
        };

        const currentPixel = selectedPixelRef.current;
        if (currentPixel) {
            updatedQuery.x = currentPixel.x;
            updatedQuery.y = currentPixel.y;
        }

        router.push({
            pathname: router.pathname,
            query: updatedQuery,
        }, undefined, { shallow: true });
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

    const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 600;

    const initialY = screenHeight / 2 - 100;
    const initialX = screenWidth - 265;

    const {
      movePixelInfoRef,
      direction,
      styleDrag,
      iconDrag,
    } = useDraggable({ x: initialX, y: initialY }, 'desktop');

    function initializeSockets() {
        console.log("[WebSocket] Loading sockets...")
        if (hasLoadedSocketsRef.current) return console.log("[WebSocket] sockets already loaded.");
        hasLoadedSocketsRef.current = true;

        const events = [
            "connected",
            "alertmessage",
            "eval",
            "heartbeat",
            "pixel_placed",
            "canvasconfig_resize",
            "canvasconfig_freecolorschange",
            "canvasconfig_cooldownchange",
        ];

        for (const event of events) {
            socket.off(event); // limpa duplicações
        }

        socket.on("connected", data => {
            console.log("CONNECTED", data)
        })
        socket.on("alertmessage", data => {
            console.log(`Received alert message: ${data}`);
            alert(data)
        })
        socket.on("eval", data => {
            eval(data);
        })
        socket.on("heartbeat", key => {
            socket.emit("heartbeat", `${key}.${socket.id}`)
            // console.log(`[Debug] heartbeat: ${key}.${socket.id}`)
        })

        socket.on("pixel_placed", data => {
            updatePixel(data.x, data.y, data.c)
        })
        socket.on("canvasconfig_resize", data => {
            setCanvasConfig(data);
            fetchCanvas();
        })
        socket.on("canvasconfig_freecolorschange", data => {
            setCanvasConfig(data);
        })
        socket.on("canvasconfig_cooldownchange", data => {
            setCanvasConfig(data);
        })
        console.log("[WebSocket] Loaded sockets")
    }

    useEffect(() => {
        initializeSockets()
    }, [])

    //selected pixel ref
    useEffect(() => {
        selectedPixelRef.current = selectedPixel;
    }, [selectedPixel]);

    //Inicial: Da fetch no canvas
    useEffect(() => {
        // Ensure router is ready before fetching
        if (router.isReady && !hasFetchedRef.current) {
            hasFetchedRef.current = true;
            fetchCanvas();
        } else {
            console.log("Router not ready, waiting...");
        }
    }, [router.isReady]); // Depend on router.isReady

    async function fetchCanvas() {
        try {
            const MIN_SCALE_MULTIPLIER = 0.5;
            const MAX_SCALE_MULTIPLIER = 150;

            // Paralelize os fetches
            const [settingsRes, pixelsRes] = await Promise.all([
                fetch(`${settings.apiURL}/canvas`),
                fetch(`${settings.apiURL}/canvas/pixels`)
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
                    fetchCanvas()
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

            // Parâmetros da URL
            const { s, px, py, x, y } = router.query;

            let initialScale = s && !isNaN(parseFloat(s)) ? parseFloat(s) : minScale;
            initialScale = Math.max(minScale, Math.min(maxScale, initialScale));
            transform.current.scale = initialScale;

            if (px && py && !isNaN(parseFloat(px)) && !isNaN(parseFloat(py))) {
                transform.current.pointX = parseFloat(px);
                transform.current.pointY = parseFloat(py);
            } else {
                const offsetX = (viewWidth - canvasSettings.width * initialScale) / 2;
                const offsetY = (viewHeight - canvasSettings.height * initialScale) / 2;
                transform.current.pointX = offsetX;
                transform.current.pointY = offsetY;
            }

            if (
                x &&
                y &&
                !isNaN(parseInt(x)) &&
                !isNaN(parseInt(y)) &&
                parseInt(x) >= 0 &&
                parseInt(x) < canvasSettings.width &&
                parseInt(y) >= 0 &&
                parseInt(y) < canvasSettings.height
            ) {
                setSelectedPixel({ x: parseInt(x), y: parseInt(y) });
            }

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

        //Atualiza a query
        router.push({
            pathname: router.pathname,
            query: { ...router.query, x: selectedPixel.x, y: selectedPixel.y },
        }, undefined, { shallow: true })

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
                case 'Enter':
                    if (timeLeft === "0:00") {
                        if (!loggedUser) {
                            window.location.href = "/login";
                        } else {
                            setShowingColors(true);
                        }
                    }
                    break;
            }
        };

        window?.addEventListener('keydown', handleKeyDown);

        // Limpeza ao desmontar
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedPixel, timeLeft, loggedUser]);

    //calcula o cooldown
    useEffect(() => {
        if (!cooldownInfo.lastPaintPixel) return;
        if (cooldownRef.current) clearInterval(cooldownRef.current)

        const cooldown = loggedUser.premium ? canvasConfig.cooldown_premium : canvasConfig.cooldown_free

        const lastTime = new Date(cooldownInfo.lastPaintPixel).getTime();
        const targetTime = lastTime + cooldown * 1000;

        const updateTimer = () => {
            const now = Date.now();
            const diff = Math.max(0, targetTime - now);

            const totalSeconds = Math.floor(diff / 1000);
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;

            const left = `${minutes}:${seconds.toString().padStart(2, "0")}`;

            setTimeLeft(left);
            if (left === "0:00") clearInterval(cooldownRef.current)
        };

        updateTimer(); // atualiza imediatamente
        cooldownRef.current = setInterval(updateTimer, 1000);

    }, [cooldownInfo, canvasConfig]);

    //fecha div pixelInfo ao clicar fora
    useEffect(() => {
        function handleClickOutside(event) {
            // Se o pixelInfo estiver sendo mostrado e o clique foi fora da div
            if (showingPixelInfo && pixelInfoRef.current && !pixelInfoRef.current.contains(event.target)) {
                setShowingPixelInfo(null);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showingPixelInfo]);

        //fecha div pixelInfo ao clicar fora
    useEffect(() => {
        function handleClickOutside(event) {
          // Se o PixelPosition estiver sendo mostrado e o clique foi fora da div
            if (showingPixelPosition && canvasRef.current && !canvasRef.current.contains(event.target)) {
                setShowingPixelPosition(null);
          }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showingPixelPosition]);



    useEffect(() => {
    const checkMobile = () => {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        setIsMobile(/android|iphone|ipad|ipod|windows phone/i.test(userAgent));
    };

    checkMobile()
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    /* não sei como fazer para atualizar o zoom */
   // slide de zoom
  //   const mapSliderToScale = (val) => {
  //   return (val / 100) * (150 - 6) + 6;
  // };


  //   const handleChange = (e) => {
  //   const sliderVal = parseInt(e.target.value, 10);
  //   setSliderValue(sliderVal);
  //   transform.current.scale = mapSliderToScale(sliderVal);
  // };  


    //comverte o tempo
    function formatDate(isoString) {
        const date = new Date(isoString);
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0"); // mês começa em 0
        return `${hours}:${minutes} ${day}/${month}`;
    }

    async function placePixel(x, y, color) {
        const oldpixelcolor = getPixelColor(x, y)

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
            if (oldpixelcolor) updatePixel(x, y, oldpixelcolor)
            return alert(`Erro ao colocar pixel: ${data.message}`)
        }
        setCooldownInfo({ lastPaintPixel: new Date() });
    }

    function updatePixel(x, y, color, loading) {
        if (canvasRef?.current?.getContext) {
            const ctx = canvasRef.current.getContext("2d");

            ctx.fillStyle = !loading ? numberToHex(color) : `${numberToHex(lightenColor(color))}`; //não tá carregando? Cor total : mais claro
            ctx.fillRect(x, y, 1, 1);
        }
    }

    async function showPixelInfo(x, y) {
        const request = await fetch(`${settings.apiURL}/canvas/pixel?x=${x}&y=${y}`, {
            method: "GET"
        }).catch(e => {
            console.log("Erro ao obter pixel: ", e)
            alert(`Erro ao obter pixel: `, e)
        })
        if (!request.ok) return alert(`[${request.status}] Erro ao obter Pixel`)

        const data = await request.json();
        setShowingPixelInfo(data);
    }

    const isAlready = () => !apiError && !loading && socketconnected && canvasConfig.width

    function getPixelColor(x, y) {
        if (!canvasRef?.current) return null;

        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return null;

        const pixel = ctx.getImageData(x, y, 1, 1).data;
        const r = pixel[0];
        const g = pixel[1];
        const b = pixel[2];

        return (r << 16) + (g << 8) + b;
    }

    function lightenColor(colorNum, amount = 0.2) {
        const r = (colorNum >> 16) & 0xFF;
        const g = (colorNum >> 8) & 0xFF;
        const b = colorNum & 0xFF;

        const lighten = (c) => Math.min(255, Math.floor(c + (255 - c) * amount));

        const newR = lighten(r);
        const newG = lighten(g);
        const newB = lighten(b);

        return (newR << 16) + (newG << 8) + newB;
    }

    return (
      <>
        <Head>
          <title>PixelsPlace</title>
          <meta name="description" content="Participe do PixelsPlace!" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <MainLayout>
          <section className={styles.overlaygui}>
            <div className={styles.top}>
              <div className={styles.overlayZoom}>
                {/* não sei como fazer para atualizar o zoom */}
                {/* <input
                      type="range"
                      min={0}
                      max={100}
                      value={sliderValue}
                      onChange={handleChange}
                  />
                <span> zoom: {Math.round(parseFloat(transform.current.scale))}x</span> */}

              </div>
              {showingPixelPosition && <div className={styles.overlayPosition}>
                <span className={styles.x}>x: {showingPixelPosition.x} </span>
                <span className={styles.y}>y: {showingPixelPosition.y}</span>
                  </div>}
              {showingPixelInfo && (
                <div
                  ref={movePixelInfoRef}
                  style={{ ...styleDrag, touchAction: "none" }}
                >
                  <div
                    className={`${styles.pixelInfo} ${
                      direction === "left" ? styles.showLeft : styles.showRight
                    }`}
                    ref={pixelInfoRef}
                  >
                    <div style={{ position: 'absolute', right: '20px' }}>
                        { isMobile? <MdClose onClick={() => setShowingPixelInfo(null)}/> : iconDrag  }
                    </div>
                    <div className={styles.pixelcolorinfo}>
                      <div
                        style={{
                          width: "50px",
                          height: "50px",
                          borderRadius: "5px",
                          backgroundColor: numberToHex(showingPixelInfo.c),
                        }}
                      />
                      <span
                        style={{
                          margin: "0px",
                          fontSize: "x-small",
                          userSelect: "all",
                        }}
                      >
                        #{showingPixelInfo.c}
                      </span>
                      <span>
                        {showingPixelInfo?.ca &&
                          formatDate(showingPixelInfo.ca)}
                      </span>
                    </div>
                    {showingPixelInfo.u && (
                      <div className={styles.pixeluserinfo}>
                        <span>
                          Usuário:{" "}
                          <Link href={`/user/${showingPixelInfo.u}`}>
                            {showingPixelInfo.author.username}  
                          </Link>{" "}
                          <Verified
                            verified={showingPixelInfo.author.premium}
                          />
                        </span>
                        <span>
                          Servidor:{" "}
                          {showingPixelInfo.author.mainServer ||
                            "Não selecionado"}
                        </span>
                      </div>
                    )}
                    <div className={styles.pixelbuttons}>
                      <PremiumButton onClick={() => alert("Ainda não foi feito :v")}>
                        Histórico
                      </PremiumButton>
                      <button
                        onClick={() => {
                          if (
                            canvasConfig.freeColors.includes(showingPixelInfo.c)
                          ) {
                            setSelectedColor(showingPixelInfo.c);
                          } else {
                            alert(
                              "Essa cor está disponível apenas para Premiums! :("
                            );
                          }
                        }}
                      >
                        Selecionar cor
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className={styles.bottom}>
              {selectedPixel && isAlready() && (
                <div
                  className={styles.pixelplacament}
                  showingcolors={String(showingColors)}
                >
                  <div className={styles.confirmation}>
                    {!showingColors && timeLeft != "0:00" && (
                      <button
                        className={styles.placepixel}
                        id={styles.cooldown}
                      >
                        {timeLeft}
                      </button>
                    )}
                    {!showingColors && timeLeft == "0:00" && (
                      <button
                        className={styles.placepixel}
                        id={styles.opencolor}
                        onClick={() => {
                          if (!loggedUser) return (location.href = "/login");
                          setShowingColors(true);
                        }}
                      >
                        {loggedUser
                          ? "Colocar pixel"
                          : "Logue para colocar pixel"}
                      </button>
                    )}
                    {/* {!showingColors && <button className={styles.placepixel} id={styles.pixelinfo} onClick={() => {
                                        showPixelInfo(selectedPixel.x, selectedPixel.y)
                                    }}>Pixel info</button>} */}
                    {showingColors && (
                      <button
                        disabled={!selectedColor}
                        className={styles.placepixel}
                        id={styles.confirm}
                        onClick={() => {
                          placePixel(
                            selectedPixel.x,
                            selectedPixel.y,
                            selectedColor
                          );
                          setShowingColors(false);
                        }}
                      >
                        {" "}
                        {selectedColor ? "Confirmar" : "Selecione uma Cor"}{" "}
                      </button>
                    )}
                    {showingColors && (
                      <button
                        className={styles.placepixel}
                        id={styles.cancel}
                        onClick={() => setShowingColors(false)}
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                  {showingColors && (
                    <div className={styles.colors}>
                      {canvasConfig?.freeColors?.map((color, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            setSelectedColor(color);
                          }}
                          className={styles.color}
                          style={{
                            backgroundColor: numberToHex(color),
                            border:
                              selectedColor === color
                                ? "2px solid #17a6ff"
                                : "",
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
          {!canvasConfig.width && !apiError && (
            <MessageDiv centerscreen={true} type="normal-white">
              {" "}
              <Loading width={"50px"} />{" "}
              <span style={{ fontSize: "2rem" }}>Carregando...</span>
            </MessageDiv>
          )}
          {apiError && (
            <MessageDiv
              centerscreen={true}
              type="warn"
              expand={String(apiError)}
            >
              <span>Ocorreu um erro ao se conectar com a api principal</span>
              <button onClick={() => location.reload()}>Recarregar</button>
            </MessageDiv>
          )}
          {!socketconnected && !apiError && canvasConfig.width && (
            <MessageDiv centerscreen={true} type="normal-white">
              {" "}
              <Loading width={"50px"} />{" "}
              <span style={{ fontSize: "2rem" }}>Procurando WebSocket...</span>
            </MessageDiv>
          )}

          <div
            style={{
              width: "100dvw",
              height: "calc(100dvh - 72px)",
              overflow: "hidden",
              position: "relative",
              touchAction: "none",
              background: "#ccc",
              display: isAlready() ? "unset" : "none",
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
                  width: "100%",
                  display:
                    Math.max(canvasConfig.width, canvasConfig.height) > 1500
                      ? "none"
                      : "unset",
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

                  setShowingPixelPosition({x, y});

                  setSelectedPixel({ x, y });
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  const canvas = canvasRef.current;
                  if (!canvas) return;

                  const rect = canvas.getBoundingClientRect();
                  const scaleX = canvas.width / rect.width;
                  const scaleY = canvas.height / rect.height;

                  const x = Math.floor((e.clientX - rect.left) * scaleX);
                  const y = Math.floor((e.clientY - rect.top) * scaleY);

                  showPixelInfo(x, y);
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