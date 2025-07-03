import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react";
import styles from "./PixelCanvas.module.css";
import checkFlags from "@/src/checkFlags";
import { useAuth } from "@/context/AuthContext";
import Tippy from "@tippyjs/react";
import downloadCanvasImage from "@/src/downloadCanvasImage";
import { FaGear } from "react-icons/fa6";

const PixelCanvas = forwardRef(({
    onChangeSelectedPixel,
    onRightClickPixel,
    onTransformChange,
    fetchCanvas,
    settings = {
        showSelectedPixelOutline: true,
        minScaleMultiplier: 0.5,
        maxScaleMultiplier: 150,
        enableMovement: true,
        enableZoom: true,
        enableSelection: true,
        disableCanvasTools: false
    },
    className = "",
    style = {},
    ...props
}, ref) => {
    // Refs
    const canvasRef = useRef(null);
    const wrapperRef = useRef(null);
    const overlayCanvasRef = useRef(null);
    const selectedPixelRef = useRef(null);
    const transform = useRef({
        scale: 1,
        translateX: 0,
        translateY: 0,
        minScale: 1,
        maxScale: 80,
    });

    const { loggedUser } = useAuth()

    // States
    const [selectedPixel, setSelectedPixelState] = useState(null);
    const [canvasConfig, setCanvasConfig] = useState({ width: 0, height: 0 });
    const [isInitialized, setIsInitialized] = useState(false);
    const [, forceUpdate] = useState(0);

    const [tools_canvasConfigCustom, tools_setCanvasConfigCustom] = useState(null);
    const [tools_initialBytes, tools_setInitialBytes] = useState(null);

    // Aplicar transformações
    const applyTransform = () => {
        if (onTransformChange) {
            onTransformChange({ ...transform.current });
        }
        const wrapper = wrapperRef.current;
        const canvas = canvasRef.current;
        const overlayCanvas = overlayCanvasRef.current;
        if (!wrapper || !canvas || !overlayCanvas) return;

        const { translateX, translateY, scale } = transform.current;

        // Translação no wrapper
        wrapper.style.transform = `translate(${translateX}px, ${translateY}px)`;

        // Escala nos canvas
        const scaledWidth = canvasConfig.width * scale;
        const scaledHeight = canvasConfig.height * scale;

        canvas.style.width = scaledWidth + 'px';
        canvas.style.height = scaledHeight + 'px';
        overlayCanvas.style.width = scaledWidth + 'px';
        overlayCanvas.style.height = scaledHeight + 'px';

        forceUpdate(Date.now());
    };

    // Centralizar canvas
    const centerCanvas = () => {
        if (!canvasConfig.width || !canvasConfig.height) return;

        // Aguardar se os elementos ainda não estão prontos
        const canvas = canvasRef.current;
        const wrapper = wrapperRef.current;
        if (!canvas || !wrapper) {
            requestAnimationFrame(centerCanvas);
            return;
        }

        const { scale } = transform.current;
        const viewWidth = window.innerWidth;
        const viewHeight = window.innerHeight - 72;

        const canvasDisplayWidth = canvasConfig.width * scale;
        const canvasDisplayHeight = canvasConfig.height * scale;

        transform.current.translateX = (viewWidth - canvasDisplayWidth) / 2;
        transform.current.translateY = (viewHeight - canvasDisplayHeight) / 2;

        applyTransform();
    };

    // Definir pixel selecionado
    const setSelectedPixel = (pixel) => {
        setSelectedPixelState(pixel);
        selectedPixelRef.current = pixel;
        if (onChangeSelectedPixel) {
            onChangeSelectedPixel(pixel);
        }
    };

    // Obter cor do pixel
    const getPixelColor = (x, y) => {
        if (!canvasRef?.current) return null;

        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return null;

        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        ctx.restore();

        const r = pixel[0];
        const g = pixel[1];
        const b = pixel[2];

        return (r << 16) + (g << 8) + b;
    };

    // Atualizar pixel
    const updatePixel = (x, y, color, loading = false) => {
        if (canvasRef?.current?.getContext) {
            const ctx = canvasRef.current.getContext("2d");

            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);

            // Converter cor para hex se necessário
            const hexColor = typeof color === 'number' ?
                `#${color.toString(16).padStart(6, '0')}` : color;

            ctx.fillStyle = loading ?
                `${hexColor}80` : hexColor; // 80 = 50% opacity for loading

            ctx.fillRect(x, y, 1, 1);
            ctx.restore();
        }
    };

    // Inicializar canvas
    const initializeCanvas = (bytes, config, defaultView = {}, initializeSettings = { renderImageTimeout: 50, changeTransform: true }) => {
        if (tools_canvasConfigCustom) config = tools_canvasConfigCustom;
        // Verificar se os elementos estão prontos
        if (!canvasRef.current || !overlayCanvasRef.current || !wrapperRef.current) {
            requestAnimationFrame(() => {
                initializeCanvas(bytes, config, defaultView);
            });
            return false;
        }
        setCanvasConfig(config);

        if (!canvasRef.current) {
            console.log("Canvas ref not available");
            return false;
        }

        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) {
            console.log("Canvas context not available");
            // Tentar novamente no próximo frame
            requestAnimationFrame(() => {
                initializeCanvas(bytes, config, defaultView);
            });
            return false;
        }

        const canvas = canvasRef.current;
        const overlayCanvas = overlayCanvasRef.current;

        if (initializeSettings.changeTransform) {
            // Configurar canvas principal
            canvas.width = config.width;
            canvas.height = config.height;
            canvas.style.width = config.width + 'px';
            canvas.style.height = config.height + 'px';

            // Configurar overlay
            overlayCanvas.width = config.width * 10;
            overlayCanvas.height = config.height * 10;
            overlayCanvas.style.width = config.width + 'px';
            overlayCanvas.style.height = config.height + 'px';
        }

        const overlayCtx = overlayCanvas.getContext('2d');
        overlayCtx.scale(10, 10);

        // Renderizar pixels se bytes fornecidos
        replaceCanvasBytes(bytes, ctx, config, initializeSettings.renderImageTimeout)

        if (initializeSettings.changeTransform) {
            // Configurar escala
            const viewWidth = window.innerWidth;
            const viewHeight = window.innerHeight - 72;
            const scaleX = viewWidth / config.width;
            const scaleY = viewHeight / config.height;
            const minScale = Math.min(scaleX, scaleY) * settings.minScaleMultiplier;
            const maxScale = settings.maxScaleMultiplier;

            transform.current.minScale = minScale;
            transform.current.maxScale = maxScale;

            const { s, px, py, x, y } = defaultView;

            let initialScale = s && !isNaN(parseFloat(s)) ? parseFloat(s) : minScale;
            initialScale = Math.max(minScale, Math.min(maxScale, initialScale));
            transform.current.scale = initialScale;

            if (px && py && !isNaN(parseFloat(px)) && !isNaN(parseFloat(py))) {
                transform.current.translateX = parseFloat(px);
                transform.current.translateY = parseFloat(py);
            } else {
                const offsetX = (viewWidth - config.width * initialScale) / 2;
                const offsetY = (viewHeight - config.height * initialScale) / 2;
                transform.current.translateX = offsetX;
                transform.current.translateY = offsetY;
            }

            if (
                x &&
                y &&
                !isNaN(parseInt(x)) &&
                !isNaN(parseInt(y)) &&
                parseInt(x) >= 0 &&
                parseInt(x) < config.width &&
                parseInt(y) >= 0 &&
                parseInt(y) < config.height
            ) {
                setSelectedPixel({ x: parseInt(x), y: parseInt(y) });
            }

            if (wrapperRef.current) {
                wrapperRef.current.style.transform = `translate(${transform.current.translateX}px, ${transform.current.translateY}px)`;

                // Redimensionar o canvas diretamente
                const scaledWidth = config.width * transform.current.scale;
                const scaledHeight = config.height * transform.current.scale;

                canvas.style.width = scaledWidth + 'px';
                canvas.style.height = scaledHeight + 'px';
                overlayCanvas.style.width = scaledWidth + 'px';
                overlayCanvas.style.height = scaledHeight + 'px';
            } else {
                console.error("wrapperRef not available");
            }
        }
        setIsInitialized(true);

        return true;
    };

    const replaceCanvasBytes = (bytes, ctx, config, timeout) => {
        const imageData = ctx.createImageData(config.width, config.height);
        const data = imageData.data;

        let i = 0;
        for (let j = 0; j < data.length; j += 4) {
            data[j] = bytes[i++]; // R
            data[j + 1] = bytes[i++]; // G
            data[j + 2] = bytes[i++]; // B
            data[j + 3] = 255; // Alpha
        }
        setTimeout(() => {
            ctx.putImageData(imageData, 0, 0);
        }, timeout);

    }

    function getCanvasBytes(ctx, config) {
        // Obtém os dados da imagem do canvas
        const imageData = ctx.getImageData(0, 0, config.width, config.height);
        const data = imageData.data;

        // Calcula o tamanho do array de bytes (apenas RGB, sem alpha)
        const bytesLength = (data.length / 4) * 3;
        const bytes = new Uint8Array(bytesLength);

        let i = 0;
        for (let j = 0; j < data.length; j += 4) {
            bytes[i++] = data[j];     // R
            bytes[i++] = data[j + 1]; // G  
            bytes[i++] = data[j + 2]; // B
            // Ignora o canal alpha (data[j + 3])
        }

        return bytes;
    }

    // Atualizar outline do pixel selecionado
    useEffect(() => {
        if (!settings.showSelectedPixelOutline) return;

        const canvas = overlayCanvasRef.current;
        if (!canvas || !selectedPixel) return;

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const x = selectedPixel.x;
        const y = selectedPixel.y;

        // Desenhar outline
        ctx.fillStyle = "#b3b3b3cf";
        ctx.fillRect(x - 0.2, y - 0.2, 1.4, 1.4);
        ctx.clearRect(x - 0.1, y - 0.1, 1.2, 1.2);
        ctx.fillStyle = "#05050096";
        ctx.fillRect(x - 0.1, y - 0.1, 1.2, 1.2);
        ctx.clearRect(x, y, 1, 1);
        ctx.clearRect(x + 0.2, y - 0.2, 0.6, 1.5);
        ctx.clearRect(x - 0.2, y + 0.2, 1.5, 0.6);
    }, [selectedPixel, settings.showSelectedPixelOutline]);

    // Eventos de movimento e zoom
    useEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper || !canvasConfig.width || !settings.enableMovement) return;

        let isDragging = false;
        let lastMouseX = 0;
        let lastMouseY = 0;
        let isPinching = false;
        let lastTouchDistance = 0;
        let lastTouchCenterX = 0;
        let lastTouchCenterY = 0;

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

        // Mouse Events
        const handleMouseDown = (e) => {
            if (e.button !== 0) return;
            e.preventDefault();
            isDragging = true;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
        };

        const handleMouseMove = (e) => {
            if (!isDragging) return;
            e.preventDefault();

            if (wrapper.style.cursor !== 'grabbing') {
                wrapper.style.cursor = 'grabbing';
            }

            const deltaX = e.clientX - lastMouseX;
            const deltaY = e.clientY - lastMouseY;

            transform.current.translateX += deltaX;
            transform.current.translateY += deltaY;

            lastMouseX = e.clientX;
            lastMouseY = e.clientY;

            applyTransform();
        };

        const handleMouseUp = () => {
            if (!isDragging) return;
            isDragging = false;
            wrapper.style.cursor = 'default';
        };

        // Wheel Event
        const handleWheel = (e) => {
            if (!settings.enableZoom) return;
            e.preventDefault();

            const { scale, translateX, translateY, minScale, maxScale } = transform.current;
            const mouseX = e.clientX;
            const mouseY = e.clientY;

            const zoomFactor = 1.2;
            const isZoomIn = e.deltaY < 0;
            const newScale = isZoomIn
                ? Math.min(maxScale, scale * zoomFactor)
                : Math.max(minScale, scale / zoomFactor);

            if (newScale === scale) return;

            const canvasX = (mouseX - translateX) / scale;
            const canvasY = (mouseY - translateY) / scale;

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
                isDragging = true;
                isPinching = false;
                lastMouseX = e.touches[0].clientX;
                lastMouseY = e.touches[0].clientY;
            } else if (e.touches.length === 2) {
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
                const touch = e.touches[0];
                const deltaX = touch.clientX - lastMouseX;
                const deltaY = touch.clientY - lastMouseY;

                transform.current.translateX += deltaX;
                transform.current.translateY += deltaY;

                lastMouseX = touch.clientX;
                lastMouseY = touch.clientY;

                applyTransform();
            } else if (e.touches.length === 2 && isPinching && settings.enableZoom) {
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];

                const currentDistance = getTouchDistance(touch1, touch2);
                const currentCenter = getTouchCenter(touch1, touch2);

                if (lastTouchDistance > 0) {
                    const { scale, translateX, translateY, minScale, maxScale } = transform.current;
                    const distanceRatio = currentDistance / lastTouchDistance;
                    const newScale = Math.max(minScale, Math.min(maxScale, scale * distanceRatio));

                    if (newScale !== scale) {
                        const canvasX = (currentCenter.x - translateX) / scale;
                        const canvasY = (currentCenter.y - translateY) / scale;

                        const newTranslateX = currentCenter.x - canvasX * newScale;
                        const newTranslateY = currentCenter.y - canvasY * newScale;

                        transform.current.scale = newScale;
                        transform.current.translateX = newTranslateX;
                        transform.current.translateY = newTranslateY;

                        applyTransform();
                    }
                }

                lastTouchDistance = currentDistance;
                lastTouchCenterX = currentCenter.x;
                lastTouchCenterY = currentCenter.y;
            }
        };

        const handleTouchEnd = (e) => {
            if (e.touches.length === 0) {
                isDragging = false;
                isPinching = false;
                lastTouchDistance = 0;
            } else if (e.touches.length === 1 && isPinching) {
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

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        window.addEventListener("keypress", handleKeyPress);

        wrapper.style.cursor = 'default';

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
    }, [canvasConfig.width, canvasConfig.height, settings.enableMovement, settings.enableZoom]);

    // Navegação com setas
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (!selectedPixel || !settings.enableSelection) return;

            let newPixel = null;
            switch (event.key) {
                case "ArrowUp":
                    newPixel = { x: selectedPixel.x, y: selectedPixel.y - 1 };
                    break;
                case "ArrowDown":
                    newPixel = { x: selectedPixel.x, y: selectedPixel.y + 1 };
                    break;
                case "ArrowLeft":
                    newPixel = { x: selectedPixel.x - 1, y: selectedPixel.y };
                    break;
                case "ArrowRight":
                    newPixel = { x: selectedPixel.x + 1, y: selectedPixel.y };
                    break;
            }

            if (newPixel) {
                // Validar limites
                if (newPixel.x >= 0 && newPixel.x < canvasConfig.width &&
                    newPixel.y >= 0 && newPixel.y < canvasConfig.height) {
                    setSelectedPixel(newPixel);
                }
            }
        };

        window?.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [selectedPixel, canvasConfig, settings.enableSelection]);

    // Expor métodos via ref
    useImperativeHandle(ref, () => ({
        updatePixel,
        getPixelColor,
        initializeCanvas,
        centerCanvas,
        getSelectedPixel: () => selectedPixelRef.current,
        getTransform: () => transform.current,
        setSelectedPixel,
        clearCanvas: () => {
            const ctx = canvasRef.current?.getContext("2d");
            if (ctx) {
                ctx.clearRect(0, 0, canvasConfig.width, canvasConfig.height);
            }
        },
        getCanvasRef: () => canvasRef.current,
        getOverlayRef: () => overlayCanvasRef.current,
        isInitialized: () => isInitialized,
        resetTransform: () => {
            transform.current.scale = transform.current.minScale;
            centerCanvas();
        },
        setTransform: (newTransform) => {
            Object.assign(transform.current, newTransform);
            applyTransform();
        }
    }));

    // Função para calcular coordenadas do clique
    const getClickCoordinates = (e, canvas) => {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
        const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);

        if (clientX === undefined || clientY === undefined) return null;

        const x = Math.floor((clientX - rect.left) / rect.width * canvasConfig.width);
        const y = Math.floor((clientY - rect.top) / rect.height * canvasConfig.height);

        // Validar limites
        if (x < 0 || x >= canvasConfig.width || y < 0 || y >= canvasConfig.height) {
            return null;
        }

        return { x, y };
    };

    return (
        <>
            <div>
                {
                    !settings.disableCanvasTools && checkFlags(loggedUser?.flags, "CANVAS_TOOLS") && <>
                        <Tippy placement="top" trigger="click" interactive={true} content={<>
                            <button onClick={() => {
                                const multipler = Number(prompt("Cada pixel equivale a quantos pixels? (default = 10) (1 = tamanho real)") || 10);
                                if (isNaN(multipler)) return alert("deve ser um número")
                                downloadCanvasImage(canvasRef.current, `canvas-x${multipler}-${Date.now()}.png`, multipler)
                            }}>Download Canvas</button>
                            <div>
                                <span>Buffer width </span>
                                <input type="number" value={tools_canvasConfigCustom?.width || canvasConfig.width} onChange={e => {
                                    if (tools_canvasConfigCustom === null) tools_setInitialBytes(getCanvasBytes(canvasRef.current.getContext("2d"), canvasConfig))

                                    const bytes = tools_initialBytes || getCanvasBytes(canvasRef.current.getContext("2d"), canvasConfig);

                                    const newConfig = JSON.parse(JSON.stringify(tools_canvasConfigCustom || canvasConfig));
                                    newConfig.width = e.target.value
                                    tools_setCanvasConfigCustom(newConfig)
                                    replaceCanvasBytes(bytes, canvasRef.current.getContext("2d"), newConfig, 1);
                                }} />
                            </div>
                            <div>
                                <span>Buffer height </span>
                                <input type="number" value={tools_canvasConfigCustom?.height || canvasConfig.height} onChange={e => {
                                    if (tools_canvasConfigCustom === null) tools_setInitialBytes(getCanvasBytes(canvasRef.current.getContext("2d"), canvasConfig))

                                    const bytes = tools_initialBytes || getCanvasBytes(canvasRef.current.getContext("2d"), canvasConfig);

                                    const newConfig = JSON.parse(JSON.stringify(tools_canvasConfigCustom || canvasConfig));
                                    newConfig.height = e.target.value
                                    tools_setCanvasConfigCustom(newConfig)
                                    replaceCanvasBytes(bytes, canvasRef.current.getContext("2d"), newConfig, 1);
                                }} />
                            </div>
                            <div>
                                <button onClick={() => {
                                    const bytes = tools_initialBytes || getCanvasBytes(canvasRef.current.getContext("2d"), canvasConfig);
                                    replaceCanvasBytes(bytes, canvasRef.current.getContext("2d"), canvasConfig, 1);
                                    tools_setCanvasConfigCustom(null);
                                    tools_setInitialBytes(null)
                                }}>Reset</button>
                            </div>
                            <div>
                                <button onClick={() => {
                                    centerCanvas()
                                }}>centralizar</button>
                                <button onClick={() => {
                                    transform.current.scale = transform.current.minScale;
                                    applyTransform()
                                }}>resetar scala</button>
                                <button onClick={() => {
                                    transform.current.scale = transform.current.minScale;
                                    centerCanvas();
                                }}>resetar tudo</button>
                            </div>
                        </>}>
                            <div style={{
                                right: 0,
                                bottom: 0,
                                position: "absolute",
                                margin: "10px",
                                cursor: "pointer",
                                pointerEvents: "all",
                                zIndex: 20
                            }}>
                                <div style={{ cursor: "pointer" }}>
                                    <FaGear />
                                </div>
                            </div>
                        </Tippy>
                    </>
                }
            </div>
            <div
                className={`${styles.canvasContainer} ${className}`}
                style={style}
                {...props}
            >
                <div
                    ref={wrapperRef}
                    className={styles.canvasWrapper}
                    style={{
                        transformOrigin: "0 0",
                        position: "absolute",
                        top: 0,
                        left: 0,
                    }}
                >
                    {/* Overlay Canvas */}
                    <canvas
                        ref={overlayCanvasRef}
                        className={`${styles.overlayCanvas} pixelate`}
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            pointerEvents: "none",
                            transformOrigin: "0 0",
                            zIndex: 10,
                            display: settings.showSelectedPixelOutline &&
                                Math.max(canvasConfig.width, canvasConfig.height) <= 1500
                                ? "block" : "none",
                        }}
                    />

                    {/* Main Canvas */}
                    <canvas
                        ref={canvasRef}
                        className={`${styles.mainCanvas} pixelate`}
                        onClick={(e) => {
                            if (!settings.enableSelection) return;

                            const coords = getClickCoordinates(e, canvasRef.current);
                            if (coords) {
                                setSelectedPixel(coords);
                            }
                        }}
                        onContextMenu={(e) => {
                            e.preventDefault();
                            if (!onRightClickPixel) return;

                            const coords = getClickCoordinates(e, canvasRef.current);
                            if (coords) {
                                onRightClickPixel(coords.x, coords.y);
                            }
                        }}
                        onTouchStart={(e) => {
                            const touch = e.touches[0];
                            const startTime = Date.now();
                            const startX = touch.clientX;
                            const startY = touch.clientY;

                            if (e.touches.length > 1) {
                                if (e.currentTarget.touchData?.longPressTimer) {
                                    clearTimeout(e.currentTarget.touchData.longPressTimer);
                                    e.currentTarget.touchData.longPressTimer = null;
                                }
                                return;
                            }

                            // Timer para long press
                            const longPressTimer = setTimeout(() => {
                                if (onRightClickPixel) {
                                    const coords = getClickCoordinates({
                                        clientX: startX,
                                        clientY: startY
                                    }, canvasRef.current);
                                    if (coords) {
                                        onRightClickPixel(coords.x, coords.y);
                                    }

                                    if (navigator.vibrate) navigator.vibrate(50);

                                    if (e.currentTarget.touchData) {
                                        e.currentTarget.touchData.longPressTriggered = true;
                                    }
                                }
                            }, 500);

                            e.currentTarget.touchData = {
                                startTime,
                                startX,
                                startY,
                                moved: false,
                                longPressTimer,
                                longPressTriggered: false,
                                moveDistance: 0
                            };
                        }}
                        onTouchMove={(e) => {
                            if (e.currentTarget.touchData) {
                                const touch = e.touches[0];
                                const { startX, startY } = e.currentTarget.touchData;

                                const deltaX = touch.clientX - startX;
                                const deltaY = touch.clientY - startY;
                                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

                                const MOVEMENT_TOLERANCE = 10;
                                e.currentTarget.touchData.moveDistance = distance;

                                if (distance > MOVEMENT_TOLERANCE) {
                                    if (e.currentTarget.touchData.longPressTimer) {
                                        clearTimeout(e.currentTarget.touchData.longPressTimer);
                                        e.currentTarget.touchData.longPressTimer = null;
                                    }
                                    e.currentTarget.touchData.moved = true;
                                }
                            }
                        }}
                        onTouchEnd={(e) => {
                            if (!e.currentTarget.touchData) return;

                            const {
                                startTime,
                                startX,
                                startY,
                                moved,
                                longPressTimer,
                                longPressTriggered,
                                moveDistance
                            } = e.currentTarget.touchData;

                            if (longPressTimer) {
                                clearTimeout(longPressTimer);
                            }

                            const MOVEMENT_TOLERANCE = 10;

                            // Tap simples
                            if (!moved && !longPressTriggered &&
                                moveDistance <= MOVEMENT_TOLERANCE &&
                                settings.enableSelection) {
                                const endTime = Date.now();
                                const duration = endTime - startTime;

                                if (duration < 500) {
                                    const coords = getClickCoordinates({
                                        clientX: startX,
                                        clientY: startY
                                    }, canvasRef.current);
                                    if (coords) {
                                        setSelectedPixel(coords);
                                    }
                                }
                            }

                            delete e.currentTarget.touchData;
                        }}
                        width={canvasConfig.width}
                        height={canvasConfig.height}
                        style={{
                            aspectRatio: `auto ${canvasConfig.width} / ${canvasConfig.height}`,
                        }}
                    />
                </div>
            </div>
        </>
    );
});

PixelCanvas.displayName = 'PixelCanvas';

export default PixelCanvas;