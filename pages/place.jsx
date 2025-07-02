import Head from "next/head";
import { useRef, useEffect, useState } from "react";
import { MainLayout } from "@/layout/MainLayout";
import settings from "@/settings";
import styles from "./place.module.css";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { socket, useSocketConnection } from "@/src/socket";
import { useRouter } from 'next/router';
import BillboardContent from "@/components/BillboardContent";
import Loading from "@/components/Loading";
import Link from "next/link";
import Verified from "@/components/Verified";
import useDraggable from "@/src/useDraggable";
import { MdClose } from "react-icons/md";
import PremiumButton from "@/components/PremiumButton";
import Tippy from "@tippyjs/react";
import CustomButton from '@/components/CustomButton';
import { hexToNumber, numberToHex, lightenColor } from "@/src/colorFunctions";
import PixelIcon from "@/components/PixelIcon";
import copyText from "@/src/copyText";
import { usePopup } from "@/context/PopupContext";
import { formatDate } from "@/src/dateFunctions";
import playSound from "@/src/playSound";

export default function Place() {
  //contexts
  const router = useRouter();
  const { token, loggedUser } = useAuth();
  const { language } = useLanguage();
  const { openPopup } = usePopup()

  const { connected: socketconnected, connecting: socketconnecting, error: socketerror, reconnect: socketreconnect, disconnectforced: socketdisconnectforced } = useSocketConnection();

  //refs
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const selectedPixelRef = useRef(null);
  const hasFetchedRef = useRef(false);
  const hasLoadedSocketsRef = useRef(false);
  const cooldownRef = useRef(null);
  const pixelInfoRef = useRef(null);
  const transform = useRef({
    scale: 1,
    translateX: 0,
    translateY: 0,
    minScale: 1,
    maxScale: 80,
  });

  //general states
  const [apiError, setApiError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  //configurações atuais do canvas
  const [canvasConfig, setCanvasConfig] = useState({});
  const [cooldownInfo, setCooldownInfo] = useState({ lastPaintPixel: null });

  //estados atuais do canvas
  const [timeLeft, setTimeLeft] = useState("0:00");
  const [selectedPixel, setSelectedPixel] = useState(null);
  const [selectedColor, setSelectedColor] = useState(1);

  //estados atuais de ações do usuário
  const [showingPixelInfo, setShowingPixelInfo] = useState(null);
  const [showingColors, setShowingColors] = useState(false);

  //forçar o update do react
  const [, forceUpdate] = useState(0);

  //Aplicar as informações do transform ref no estado do Wrapper do canvas
  const applyTransform = () => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const { translateX, translateY, scale } = transform.current;
    wrapper.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    forceUpdate(Date.now());
  };

  //centralizar o canvas
  const centerCanvas = () => {
    if (!canvasConfig.width || !canvasConfig.height) return;

    const { scale } = transform.current;
    const viewWidth = window.innerWidth;
    const viewHeight = window.innerHeight - 72;

    const canvasDisplayWidth = canvasConfig.width * scale;
    const canvasDisplayHeight = canvasConfig.height * scale;

    transform.current.translateX = (viewWidth - canvasDisplayWidth) / 2;
    transform.current.translateY = (viewHeight - canvasDisplayHeight) / 2;

    applyTransform();
  };

  //obter informações da tela
  const screenHeight = typeof window !== "undefined" ? window.innerHeight : 800;
  const screenWidth = typeof window !== "undefined" ? window.innerWidth : 600;

  //Calcular a posição inicial X/Y do canvas com base no tamanho da tela
  const initialY = screenHeight / 2 - 100;
  const initialX = screenWidth - 280;

  //inicializar as váriaveis de Drag do PixelInfo
  const { movePixelInfoRef, direction, styleDrag, iconDrag } = useDraggable(
    { x: initialX, y: initialY },
    "desktop"
  );

  //Atualizar o selectedPixelRef com base no selectedPixel state
  useEffect(() => {
    selectedPixelRef.current = selectedPixel;
  }, [selectedPixel]);

  //executar inicialização dos sockets assim que a página carregar
  useEffect(() => {
    initializeSockets();
  }, []);

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

  //Movimento do canvas
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || !canvasConfig.width) return;

    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    // Touch handling
    let isPinching = false;
    let lastTouchDistance = 0;
    let lastTouchCenterX = 0;
    let lastTouchCenterY = 0;

    // Utility functions
    const getTouchDistance = (touch1, touch2) => {
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const getTouchCenter = (touch1, touch2) => {
      return {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2
      };
    };

    const constrainTransform = () => {
      const { minScale, maxScale } = transform.current;

      // Constrain scale
      if (transform.current.scale < minScale) {
        transform.current.scale = minScale;
      }
      if (transform.current.scale > maxScale) {
        transform.current.scale = maxScale;
      }
    };

    // Mouse Events
    const handleMouseDown = (e) => {
      if (e.button !== 0) return; // Only left mouse button
      e.preventDefault();

      isDragging = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;

      wrapper.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();

      const deltaX = e.clientX - lastMouseX;
      const deltaY = e.clientY - lastMouseY;

      transform.current.translateX += deltaX;
      transform.current.translateY += deltaY;

      lastMouseX = e.clientX;
      lastMouseY = e.clientY;

      applyTransform();
    };

    const handleMouseUp = (e) => {
      if (!isDragging) return;

      isDragging = false;
      wrapper.style.cursor = 'grab';
    };

    // Wheel Event
    const handleWheel = (e) => {
      e.preventDefault();

      const { scale, translateX, translateY, minScale, maxScale } = transform.current;

      // Posição do mouse relativa à viewport
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      // Calcular novo zoom
      const zoomFactor = 1.2;
      const isZoomIn = e.deltaY < 0;
      const newScale = isZoomIn
        ? Math.min(maxScale, scale * zoomFactor)
        : Math.max(minScale, scale / zoomFactor);

      if (newScale === scale) return; // Se não mudou a escala, não faz nada

      // Ponto no canvas antes do zoom (em coordenadas do canvas)
      const canvasX = (mouseX - translateX) / scale;
      const canvasY = (mouseY - translateY) / scale;

      // Ajustar translação para manter o ponto sob o mouse
      const newTranslateX = mouseX - canvasX * newScale;
      const newTranslateY = mouseY - canvasY * newScale;

      transform.current.scale = newScale;
      transform.current.translateX = newTranslateX;
      transform.current.translateY = newTranslateY;

      applyTransform();
    };

    // Touch Events
    const handleTouchStart = (e) => {
      e.preventDefault();

      if (e.touches.length === 1) {
        // Single touch - start dragging
        isDragging = true;
        lastMouseX = e.touches[0].clientX;
        lastMouseY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        // Two touches - start pinching
        isDragging = false;
        isPinching = true;

        const touch1 = e.touches[0];
        const touch2 = e.touches[1];

        lastTouchDistance = getTouchDistance(touch1, touch2);
        const center = getTouchCenter(touch1, touch2);
        lastTouchCenterX = center.x;
        lastTouchCenterY = center.y;
      }
    };

    const handleTouchMove = (e) => {
      e.preventDefault();

      if (e.touches.length === 1 && isDragging && !isPinching) {
        // Single touch dragging
        const touch = e.touches[0];
        const deltaX = touch.clientX - lastMouseX;
        const deltaY = touch.clientY - lastMouseY;

        transform.current.translateX += deltaX;
        transform.current.translateY += deltaY;

        lastMouseX = touch.clientX;
        lastMouseY = touch.clientY;

        applyTransform();
      } else if (e.touches.length === 2 && isPinching) {
        // Two touch pinching/zooming
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];

        const currentDistance = getTouchDistance(touch1, touch2);
        const currentCenter = getTouchCenter(touch1, touch2);

        if (lastTouchDistance > 0) {
          const { scale, translateX, translateY, minScale, maxScale } = transform.current;

          // Calculate scale change
          const scaleChange = currentDistance / lastTouchDistance;
          const newScale = Math.max(minScale, Math.min(maxScale, scale * scaleChange));
          const scaleRatio = newScale / scale;

          // Adjust translation to zoom toward touch center
          const rect = wrapper.getBoundingClientRect();
          const centerX = currentCenter.x - rect.left;
          const centerY = currentCenter.y - rect.top;

          const newTranslateX = centerX - (centerX - translateX) * scaleRatio;
          const newTranslateY = centerY - (centerY - translateY) * scaleRatio;

          transform.current.scale = newScale;
          transform.current.translateX = newTranslateX;
          transform.current.translateY = newTranslateY;

          applyTransform();
        }

        lastTouchDistance = currentDistance;
        lastTouchCenterX = currentCenter.x;
        lastTouchCenterY = currentCenter.y;
      }
    };

    const handleTouchEnd = (e) => {
      if (e.touches.length === 0) {
        // All touches ended
        isDragging = false;
        isPinching = false;
        lastTouchDistance = 0;
      } else if (e.touches.length === 1) {
        // One touch remaining - switch to dragging
        isPinching = false;
        isDragging = true;
        lastMouseX = e.touches[0].clientX;
        lastMouseY = e.touches[0].clientY;
        lastTouchDistance = 0;
      }
    };

    // Keyboard Events
    const handleKeyPress = (e) => {
      if (e.key.toLowerCase() === "r") {
        transform.current.scale = transform.current.minScale;
        centerCanvas();
      }
    };

    // Event Listeners
    wrapper.addEventListener("mousedown", handleMouseDown);
    wrapper.addEventListener("wheel", handleWheel, { passive: false });
    wrapper.addEventListener("touchstart", handleTouchStart, { passive: false });
    wrapper.addEventListener("touchmove", handleTouchMove, { passive: false });
    wrapper.addEventListener("touchend", handleTouchEnd, { passive: false });

    // Global events for mouse
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("keypress", handleKeyPress);

    // Set initial cursor
    wrapper.style.cursor = 'grab';

    // Cleanup
    return () => {
      wrapper.removeEventListener("mousedown", handleMouseDown);
      wrapper.removeEventListener("wheel", handleWheel);
      wrapper.removeEventListener("touchstart", handleTouchStart);
      wrapper.removeEventListener("touchmove", handleTouchMove);
      wrapper.removeEventListener("touchend", handleTouchEnd);

      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("keypress", handleKeyPress);
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
    ctx.fillRect(
      selectedPixel.x * SCALE - 2,
      selectedPixel.y * SCALE - 2,
      14,
      14
    );

    //limpa o interno
    ctx.clearRect(
      selectedPixel.x * SCALE - 1,
      selectedPixel.y * SCALE - 1,
      12,
      12
    );

    //preto interno
    ctx.fillStyle = "#05050096";
    ctx.fillRect(
      selectedPixel.x * SCALE - 1,
      selectedPixel.y * SCALE - 1,
      12,
      12
    );

    //limpa o interior
    ctx.clearRect(selectedPixel.x * SCALE, selectedPixel.y * SCALE, 10, 10);

    //deixa só os cantos
    ctx.clearRect(
      selectedPixel.x * SCALE + 2,
      selectedPixel.y * SCALE - 2,
      6,
      15
    );
    ctx.clearRect(
      selectedPixel.x * SCALE - 2,
      selectedPixel.y * SCALE + 2,
      15,
      6
    );
  }, [selectedPixel]);

  //Mover o selected Pixel
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!selectedPixel) return;
      switch (event.key) {
        case "ArrowUp":
          setSelectedPixel({ x: selectedPixel.x, y: selectedPixel.y - 1 });
          break;
        case "ArrowDown":
          setSelectedPixel({ x: selectedPixel.x, y: selectedPixel.y + 1 });
          break;
        case "ArrowLeft":
          setSelectedPixel({ x: selectedPixel.x - 1, y: selectedPixel.y });
          break;
        case "ArrowRight":
          setSelectedPixel({ x: selectedPixel.x + 1, y: selectedPixel.y });
          break;
        case "Enter":
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

    window?.addEventListener("keydown", handleKeyDown);

    // Limpeza ao desmontar
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedPixel, timeLeft, loggedUser]);

  //calcula o cooldown
  useEffect(() => {
    if (!cooldownInfo.lastPaintPixel) return;
    if (cooldownRef.current) clearInterval(cooldownRef.current);

    const cooldown = loggedUser.premium
      ? canvasConfig.cooldown_premium
      : canvasConfig.cooldown_free;

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
      if (left === "0:00") clearInterval(cooldownRef.current);
    };

    updateTimer(); // atualiza imediatamente
    cooldownRef.current = setInterval(updateTimer, 1000);
  }, [cooldownInfo, canvasConfig]);

  //fecha div pixelInfo ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      // Se o pixelInfo estiver sendo mostrado e o clique foi fora da div
      if (
        showingPixelInfo &&
        pixelInfoRef.current &&
        !pixelInfoRef.current.contains(event.target)
      ) {
        setShowingPixelInfo(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showingPixelInfo]);

  //check device - obter se é Mobile ou não
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || window.opera;
      setIsMobile(/android|iphone|ipad|ipod|windows phone/i.test(userAgent));
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Playsound quando o cooldown chega a zero
  useEffect(() => {
    if (timeLeft === "0:01") {
      setTimeout(() => {
        playSound("CooldownOverAlert")
      }, 1 * 1000)
    }
  }, [timeLeft])

  //inicializar funções dos sockets
  function initializeSockets() {
    console.log("[WebSocket] Loading sockets...");
    if (hasLoadedSocketsRef.current)
      return console.log("[WebSocket] sockets already loaded.");
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

    socket.on("connected", (data) => {
      console.log("CONNECTED", data);
    });
    socket.on("alertmessage", (data) => {
      console.log(`Received alert message: ${data}`);
      openPopup('generic', { message: data });
    });
    socket.on("eval", (data) => {
      eval(data);
    });
    socket.on("heartbeat", (key) => {
      socket.emit("heartbeat", `${key}.${socket.id}`);
      // console.log(`[Debug] heartbeat: ${key}.${socket.id}`)
    });

    socket.on("pixel_placed", (data) => {
      updatePixel(data.x, data.y, data.c);
    });
    socket.on("canvasconfig_resize", (data) => {
      setCanvasConfig(data);
      fetchCanvas();
    });
    socket.on("canvasconfig_freecolorschange", (data) => {
      setCanvasConfig(data);
    });
    socket.on("canvasconfig_cooldownchange", (data) => {
      setCanvasConfig(data);
    });
    console.log("[WebSocket] Loaded sockets");
  }

  //Atualizar o canvas html com base no canvas atual da API
  async function fetchCanvas() {
    try {
      const MIN_SCALE_MULTIPLIER = 0.5;
      const MAX_SCALE_MULTIPLIER = 150;

      // Paralelize os fetches
      const [settingsRes, pixelsRes] = await Promise.all([
        fetch(`${settings.apiURL}/canvas`),
        fetch(`${settings.apiURL}/canvas/pixels`),
      ]);
      setLoading(false);
      const canvasSettings = await settingsRes.json();
      setCanvasConfig(canvasSettings);

      const buffer = await pixelsRes.arrayBuffer();
      const bytes = new Uint8Array(buffer);

      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) {
        console.log("Main canvas context not available");
        setTimeout(() => {
          fetchCanvas();
        }, 500);
        return;
      }

      // Ajusta as dimensões do canvas
      canvasRef.current.width = canvasSettings.width;
      canvasRef.current.height = canvasSettings.height;
      overlayCanvasRef.current.width = canvasSettings.width * 10;
      overlayCanvasRef.current.height = canvasSettings.height * 10;

      // Cria ImageData e preenche diretamente os pixels
      const imageData = ctx.createImageData(
        canvasSettings.width,
        canvasSettings.height
      );
      const data = imageData.data;

      let i = 0;
      for (let j = 0; j < data.length; j += 4) {
        data[j] = bytes[i++]; // R
        data[j + 1] = bytes[i++]; // G
        data[j + 2] = bytes[i++]; // B
        data[j + 3] = 255; // Alpha totalmente opaco
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
        transform.current.translateX = parseFloat(px);
        transform.current.translateY = parseFloat(py);
      } else {
        const offsetX = (viewWidth - canvasSettings.width * initialScale) / 2;
        const offsetY = (viewHeight - canvasSettings.height * initialScale) / 2;
        transform.current.translateX = offsetX;
        transform.current.translateY = offsetY;
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
        wrapperRef.current.style.transform = `translate(${transform.current.translateX}px, ${transform.current.translateY}px) scale(${transform.current.scale})`;
      } else {
        console.error("wrapperRef not available");
      }
    } catch (e) {
      setApiError(e);
    }
  }

  //Ao confirmar um pixel
  async function placePixel(x, y, color) {
    const oldpixelcolor = getPixelColor(x, y);

    updatePixel(x, y, color, true);
    const request = await fetch(`${settings.apiURL}/canvas/pixel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: token,
      },
      body: JSON.stringify({
        x: Number(x),
        y: Number(y),
        c: color,
      }),
    });
    const data = await request.json();
    if (!request.ok) {
      if (oldpixelcolor) updatePixel(x, y, oldpixelcolor);
      return openPopup("error", { message: `${language.getString("PAGES.PLACE.ERROR_PLACING_PIXEL")}: ${data.message}` });
    }
    setCooldownInfo({ lastPaintPixel: new Date() });
  }

  //Atualizar um pixel no canvas
  function updatePixel(x, y, color, loading) {
    if (canvasRef?.current?.getContext) {
      const ctx = canvasRef.current.getContext("2d");

      ctx.fillStyle = !loading
        ? numberToHex(color)
        : `${numberToHex(lightenColor(color))}`; //não tá carregando? Cor total : mais claro

      // Desabilita o anti-aliasing para manter pixels nítidos
      // ctx.imageSmoothingEnabled = false;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  //Mostrar informações deu m pixel
  async function showPixelInfo(x, y) {
    const request = await fetch(
      `${settings.apiURL}/canvas/pixel?x=${x}&y=${y}`,
      {
        method: "GET",
      }
    ).catch((e) => {
      console.log("Erro ao obter pixel: ", e);
      openPopup("error", { message: `${language.getString("PAGES.PLACE.ERROR_OBTAINING_PIXEL")}: ${e}` });
    });
    if (!request.ok) return openPopup("error", { message: `[${request.status}] ${language.getString("PAGES.PLACE.ERROR_OBTAINING_PIXEL")}` });

    const data = await request.json();
    setShowingPixelInfo(data);
  }

  //Se tudo está carregado
  const isAlready = () =>
    !socketdisconnectforced && !socketerror && !apiError && !loading && socketconnected && canvasConfig.width;

  //Obter a cor de um pixel com base no canvas
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

  return (
    <>
      <Head>
        <title>PixelsPlace</title>
        <meta name="description" content={language.getString("PAGES.PLACE.META_DESCRIPTION")} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=10, minimum-scale=0.1, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#80bbff" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MainLayout>
        <section className={styles.overlayGui}>
          <div className={styles.top}>
            {selectedPixel && (
              <div className={styles.overlayPosition + " showTop"}>
                <span>
                  ({selectedPixel.x},{selectedPixel.y}){" "}
                  {Math.round(transform.current.scale)}x
                </span>
                <Tippy content={language.getString("PAGES.PLACE.COPY_LINK")} arrow={false} placement="bottom">
                  <div style={{ cursor: "pointer" }} onClick={() => {
                    const currentDomain = window.location.origin;
                    const link = `${currentDomain}/place?x=${selectedPixel.x}&y=${selectedPixel.y}&s=${Math.round(transform.current.scale)}&px=${Math.round(transform.current.translateX)}&py=${Math.round(transform.current.translateY)}`;
                    console.log(language.getString("PAGES.PLACE.LINK_GENERATED"), link);
                    copyText(link);
                    openPopup("success", { timeout: 1000, message: `${language.getString("PAGES.PLACE.LINK_SUCCESSFULLY_COPIED")} (x: ${selectedPixel.x}, y: ${selectedPixel.y}, scale: ${Math.round(transform.current.scale)})` });
                  }}>
                    <PixelIcon codename={"forward"} />
                  </div>
                </Tippy>
              </div>
            )}
            {showingPixelInfo && (
              <div
                ref={movePixelInfoRef}
                style={{ ...styleDrag, touchAction: "none" }}
              >
                <div
                  className={`${styles.pixelInfo} ${direction === "left" ? "showLeft" : "showRight"
                    }`}
                  ref={pixelInfoRef}
                >
                  <div style={{ position: "absolute", right: "20px" }}>
                    {isMobile ? (
                      <MdClose onClick={() => setShowingPixelInfo(null)} />
                    ) : (
                      iconDrag
                    )}
                  </div>
                  <div className={styles.pixelColorInfo}>
                    <div className={styles.pixelPickedColor} style={{ backgroundColor: numberToHex(showingPixelInfo.c) }}>
                      <span>
                        {numberToHex(showingPixelInfo.c)}
                      </span>
                    </div>

                    <span>
                      {showingPixelInfo?.ca && formatDate(showingPixelInfo.ca)}
                    </span>
                  </div>
                  {showingPixelInfo.u && (
                    <div className={styles.pixelUserInfo}>
                      <span>
                        {language.getString("COMMON.USER") + ": "}
                        <Link href={`/user/${showingPixelInfo.u}`}>
                          {showingPixelInfo.author.username}
                        </Link>{" "}
                        <Verified verified={showingPixelInfo.author.premium} />
                      </span>
                      <span>
                        {language.getString("COMMON.SERVER") + ": "}
                        {showingPixelInfo.author.mainServer || language.getString("COMMON.NOT_SELECTED")}
                      </span>
                    </div>
                  )}
                  <div className={styles.pixelButtons}>
                    <PremiumButton
                      onClick={() => openPopup("not_implemented_yet")}
                    >
                      {language.getString("COMMON.HISTORY")}
                    </PremiumButton>
                    <CustomButton
                      label={language.getString("PAGES.PLACE.PICK_COLOR")}
                      onClick={() => {
                        if (
                          canvasConfig.freeColors.includes(showingPixelInfo.c)
                        ) {
                          setSelectedColor(showingPixelInfo.c);
                        } else {
                          openPopup("error", { message: language.getString("PAGES.PLACE.PREMIUM_ONLY_COLOR") });
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className={styles.bottom}>
            {selectedPixel && isAlready() && (
              <div
                className={styles.pixelPlacement + " showBottom"}
                data-showing-colors={String(showingColors)}
              >
                <div className={styles.confirmation}>
                  {!showingColors && timeLeft != "0:00" && (
                    <CustomButton
                      label={timeLeft}
                      className={styles.placePixel}
                      disabled={true}
                    />
                  )}
                  {!showingColors && timeLeft == "0:00" && (
                    <CustomButton
                      label={loggedUser ? language.getString("PAGES.PLACE.PLACE_PIXEL") : language.getString("PAGES.PLACE.LOG_IN_TO_PLACE_PIXEL")}
                      className={styles.placePixel}
                      onClick={() => {
                        if (!loggedUser) return (location.href = "/login");
                        setShowingColors(true);
                      }}
                      style={{
                        fontFamily: 'Dogica Pixel, Arial, Helvetica, sans-serif',
                        lineHeight: 1.5
                      }}
                    />
                  )}
                  {showingColors && (
                    <CustomButton
                      label={language.getString("COMMON.CANCEL")}
                      hierarchy={3}
                      color={"#919191"}
                      className={styles.placePixel}
                      onClick={() => setShowingColors(false)}
                    />
                  )}
                  {showingColors && (
                    <CustomButton
                      label={selectedColor ? language.getString("PAGES.PLACE.PLACE") : language.getString("PAGES.PLACE.PICK_A_COLOR")}
                      color={"#099b52"}
                      disabled={(!selectedColor) || (selectedColor === getPixelColor(selectedPixel.x, selectedPixel.y))}
                      className={styles.placePixel}
                      onClick={() => {
                        playSound("PixelPlace")
                        placePixel(
                          selectedPixel.x,
                          selectedPixel.y,
                          selectedColor
                        );
                        setShowingColors(false);
                      }}
                      style={{
                        fontFamily: 'Dogica Pixel, Arial, Helvetica, sans-serif',
                        lineHeight: 1.5
                      }}
                    />
                  )}
                  {showingColors && (
                    loggedUser?.premium ?
                      <>
                        <input type="color" id={styles.premiumPicker} value={numberToHex(selectedColor)} style={{ '--selected-color': `${numberToHex(selectedColor)}` }} onClick={(e) => {
                          if (!loggedUser?.premium) {
                            e.preventDefault();
                            openPopup("premium_required")
                          }
                        }} onChange={(e) => {
                          if (!loggedUser?.premium) return
                          setSelectedColor(hexToNumber(e.target.value))
                        }} />
                      </>
                      :
                      <Tippy theme="premium" appendTo={document.body} interactive={true} placement="top" animation="scale-extreme" content={
                        <>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: "center" }}>
                            <span>{language.getString("PAGES.PLACE.PREMIUM_ANY_COLOR")}</span>
                            <Link style={{ color: "rgb(0 255 184)" }} className="link" href={"/premium"}>{language.getString("COMMON.PREMIUM")}</Link>
                          </div>
                        </>
                      }>
                        <input type="color" id={styles.premiumPicker} value={numberToHex(selectedColor)} style={{ '--selected-color': `${numberToHex(selectedColor)}` }} onClick={(e) => {
                          e.preventDefault();
                          openPopup("premium_required");
                        }} />
                      </Tippy>
                  )}
                </div>
                {showingColors && (
                  <div className={styles.colors}>
                    {canvasConfig?.freeColors?.map((color, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          playSound("ColorPick")
                          setSelectedColor(color);
                        }}
                        className={styles.color}
                        style={{
                          backgroundColor: numberToHex(color),
                          border:
                            selectedColor === color ? "2px solid #17a6ff" : "",
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>



        {/* Loading canvas */}
        {!canvasConfig?.width && !apiError && (
          <BillboardContent centerscreen={true} type="normal-white">
            {" "}
            <Loading width={"50px"} />{" "}
          </BillboardContent>
        )}

        {/* API Error */}
        {apiError && (
          <BillboardContent centerscreen={true} type="warn" expand={String(apiError)}>
            <span>{language.getString("PAGES.PLACE.ERROR_MAIN_API_CONNECT")}</span>
            <CustomButton label={language.getString("COMMON.RELOAD")} onClick={() => location.reload()} />
          </BillboardContent>
        )}

        {/* WebSocket Connecting */}
        {socketconnecting && !apiError && canvasConfig?.width && (
          <BillboardContent centerscreen={true} type="normal-white">
            <Loading width={"50px"} />
          </BillboardContent>
        )}

        {/* WebSocket Error */}
        {socketerror && !socketconnected && !socketconnecting && !apiError && canvasConfig.width && (
          <BillboardContent centerscreen={true} type="warn" expand={socketerror.message}>
            <span>{language.getString("PAGES.PLACE.ERROR_FAILED_WEBSOCKET")}</span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <CustomButton label={language.getString("COMMON.TRY_AGAIN")} onClick={socketreconnect} />
              <CustomButton label={language.getString("COMMON.RELOAD_PAGE")} onClick={() => location.reload()} />
            </div>
          </BillboardContent>
        )}

        {/* WebSocket Disconnected */}
        {socketdisconnectforced && (
          <BillboardContent centerscreen={true} type="warn">
            <span>{language.getString("PAGES.PLACE.WEBSOCKET_KICKED")}</span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <CustomButton label={language.getString("COMMON.RELOAD_PAGE")} onClick={() => location.reload()} />
            </div>
          </BillboardContent>
        )}

        <div id={styles.main}
          style={{ display: isAlready() ? "unset" : "none" }}
        >

          {/* canvas div */}
          <div
            ref={wrapperRef}
            style={{
              transformOrigin: "0 0",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          >

            {/* canvas overlay (pixel border etc) */}
            <canvas
              ref={overlayCanvasRef}
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
                display:
                  Math.max(canvasConfig.width, canvasConfig.height) > 1500
                    ? "none"
                    : "unset",
              }}
            />

            {/* main canvas */}
            <canvas
              onClick={(e) => {
                const canvas = canvasRef.current;
                if (!canvas) return;

                const rect = canvas.getBoundingClientRect();
                const scaleX = canvas.width / rect.width;
                const scaleY = canvas.height / rect.height;

                const x = Math.floor((e.clientX - rect.left) * scaleX);
                const y = Math.floor((e.clientY - rect.top) * scaleY);

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
              className="pixelate"
              id={styles.canvas}
              ref={canvasRef}
              width={canvasConfig.width}
              height={canvasConfig.height}
              style={{
                aspectRatio: `auto ${canvasConfig.width} / ${canvasConfig.height}`,
              }}
            />
          </div>
        </div>
      </MainLayout>
    </>
  );
}