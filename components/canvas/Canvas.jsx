import { useRef, useEffect, useState, useImperativeHandle, forwardRef, useCallback } from "react";
import { hexToNumber, numberToHex, lightenColor } from "@/src/colorFunctions";
import styles from "./Canvas.module.css";

const Canvas = forwardRef(({
    width = 1000,
    height = 1000,
    onChangeSelectedPixel,
    onRightClickPixel,
    settings = {
        showSelectedPixelOutline: true
    }
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

    // States
    const [selectedPixel, setSelectedPixel] = useState(null);
    const [canvasInitialized, setCanvasInitialized] = useState(false);
    const [initializationError, setInitializationError] = useState(null);
    const [, forceUpdate] = useState(0);

    // Memoized callbacks para evitar dependências circulares
    const selectPixel = useCallback((x, y) => {
        if (onChangeSelectedPixel && typeof onChangeSelectedPixel === 'function') {
            onChangeSelectedPixel(x, y);
        }
    }, [onChangeSelectedPixel]);

    const rightClickPixel = useCallback((x, y) => {
        if (onRightClickPixel && typeof onRightClickPixel === 'function') {
            onRightClickPixel(x, y);
        }
    }, [onRightClickPixel]);

    // Expose functions to parent component
    useImperativeHandle(ref, () => ({
        updatePixel: (x, y, c, lighten = false) => {
            updatePixel(x, y, c, lighten);
        },
        getPixelColor: (x, y) => {
            return getPixelColor(x, y);
        },
        initializeCanvas: (bytes) => {
            initializeCanvas(bytes);
        },
        initializeCanvasWhenReady: (bytes) => {
            // Versão que aguarda o componente estar pronto
            const tryInitialize = () => {
                if (canvasRef.current && overlayCanvasRef.current) {
                    initializeCanvas(bytes);
                } else {
                    setTimeout(tryInitialize, 50);
                }
            };
            tryInitialize();
        },
        centerCanvas: () => {
            centerCanvas();
        },
        getSelectedPixel: () => selectedPixel,
        getTransform: () => transform.current,
        setSelectedPixel: (pixel) => setSelectedPixel(pixel),
        getInitializationStatus: () => ({ initialized: canvasInitialized, error: initializationError }),
        isReady: () => !!(canvasRef.current && overlayCanvasRef.current)
    }));

    // Apply transform to canvas
    const applyTransform = () => {
        const wrapper = wrapperRef.current;
        const canvas = canvasRef.current;
        const overlayCanvas = overlayCanvasRef.current;
        if (!wrapper || !canvas || !overlayCanvas) return;

        const { translateX, translateY, scale } = transform.current;

        // Only translation on wrapper
        wrapper.style.transform = `translate(${translateX}px, ${translateY}px)`;

        // Direct scaling on canvas
        const scaledWidth = width * scale;
        const scaledHeight = height * scale;

        canvas.style.width = scaledWidth + 'px';
        canvas.style.height = scaledHeight + 'px';
        overlayCanvas.style.width = scaledWidth + 'px';
        overlayCanvas.style.height = scaledHeight + 'px';

        forceUpdate(Date.now());
    };

    // Center canvas on screen
    const centerCanvas = () => {
        if (!width || !height) return;

        const { scale } = transform.current;
        const viewWidth = window.innerWidth;
        const viewHeight = window.innerHeight - 72;

        const canvasDisplayWidth = width * scale;
        const canvasDisplayHeight = height * scale;

        transform.current.translateX = (viewWidth - canvasDisplayWidth) / 2;
        transform.current.translateY = (viewHeight - canvasDisplayHeight) / 2;

        applyTransform();
    };

    // Initialize canvas with pixel data
    const initializeCanvas = (bytes) => {
        try {
            setInitializationError(null);

            // Validações iniciais
            if (!bytes || !Array.isArray(bytes) && !(bytes instanceof Uint8Array)) {
                throw new Error("Dados de bytes inválidos");
            }

            // Aguardar o canvas estar disponível
            if (!canvasRef.current) {
                console.log("Canvas ref não disponível ainda, tentando novamente...");
                setTimeout(() => initializeCanvas(bytes), 100);
                return;
            }

            const ctx = canvasRef.current.getContext("2d");
            if (!ctx) {
                console.log("Contexto 2D não disponível ainda, tentando novamente...");
                setTimeout(() => initializeCanvas(bytes), 100);
                return;
            }

            const canvas = canvasRef.current;
            const overlayCanvas = overlayCanvasRef.current;

            if (!overlayCanvas) {
                console.log("Canvas de overlay não disponível ainda, tentando novamente...");
                setTimeout(() => initializeCanvas(bytes), 100);
                return;
            }

            // Verificar se os bytes têm o tamanho correto
            const expectedSize = width * height * 3; // RGB
            if (bytes.length !== expectedSize) {
                console.warn(`Tamanho dos bytes não corresponde: esperado ${expectedSize}, recebido ${bytes.length}`);
            }

            // Setup main canvas
            canvas.width = width;
            canvas.height = height;
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';

            // Setup overlay canvas
            overlayCanvas.width = width * 10;
            overlayCanvas.height = height * 10;
            overlayCanvas.style.width = width + 'px';
            overlayCanvas.style.height = height + 'px';

            // Scale overlay context
            const overlayCtx = overlayCanvas.getContext('2d');
            if (!overlayCtx) {
                console.log("Contexto do overlay canvas não disponível ainda, tentando novamente...");
                setTimeout(() => initializeCanvas(bytes), 100);
                return;
            }
            overlayCtx.scale(10, 10);

            // Disable antialiasing
            ctx.imageSmoothingEnabled = false;
            ctx.mozImageSmoothingEnabled = false;
            ctx.webkitImageSmoothingEnabled = false;
            ctx.msImageSmoothingEnabled = false;

            overlayCtx.imageSmoothingEnabled = false;
            overlayCtx.mozImageSmoothingEnabled = false;
            overlayCtx.webkitImageSmoothingEnabled = false;
            overlayCtx.msImageSmoothingEnabled = false;

            // Create and fill ImageData
            const imageData = ctx.createImageData(width, height);
            const data = imageData.data;

            let i = 0;
            for (let j = 0; j < data.length; j += 4) {
                data[j] = bytes[i++] || 0; // R
                data[j + 1] = bytes[i++] || 0; // G
                data[j + 2] = bytes[i++] || 0; // B
                data[j + 3] = 255; // Alpha
            }

            // Render image
            const renderFrame = () => {
                try {
                    ctx.putImageData(imageData, 0, 0);

                    // Calculate initial scale
                    const MIN_SCALE_MULTIPLIER = 0.5;
                    const MAX_SCALE_MULTIPLIER = 150;
                    const viewWidth = window.innerWidth;
                    const viewHeight = window.innerHeight - 72;
                    const scaleX = viewWidth / width;
                    const scaleY = viewHeight / height;
                    const minScale = Math.min(scaleX, scaleY) * MIN_SCALE_MULTIPLIER;
                    const maxScale = MAX_SCALE_MULTIPLIER;

                    transform.current.minScale = minScale;
                    transform.current.maxScale = maxScale;
                    transform.current.scale = minScale;

                    centerCanvas();
                    setCanvasInitialized(true);

                    console.log("Canvas inicializado com sucesso");
                } catch (renderError) {
                    console.error("Erro ao renderizar:", renderError);
                    setInitializationError(`Erro ao renderizar: ${renderError.message}`);
                }
            };

            requestAnimationFrame(renderFrame);

        } catch (error) {
            console.error("Erro na inicialização do canvas:", error);
            setInitializationError(error.message);
            setCanvasInitialized(false);
        }
    };

    // Update selectedPixelRef when selectedPixel changes - SEM dependência circular
    useEffect(() => {
        selectedPixelRef.current = selectedPixel;
    }, [selectedPixel]);

    // Separar o callback para onChangeSelectedPixel
    useEffect(() => {
        if (selectedPixel && onChangeSelectedPixel) {
            selectPixel(selectedPixel.x, selectedPixel.y);
        }
    }, [selectedPixel]);

    // Update overlay when selectedPixel changes
    useEffect(() => {
        if (!settings.showSelectedPixelOutline) return;

        const canvas = overlayCanvasRef.current;
        if (!canvas || !selectedPixel) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const x = selectedPixel.x;
        const y = selectedPixel.y;

        // White external outline
        ctx.fillStyle = "#b3b3b3cf";
        ctx.fillRect(x - 0.2, y - 0.2, 1.4, 1.4);

        // Clear internal
        ctx.clearRect(x - 0.1, y - 0.1, 1.2, 1.2);

        // Black internal outline
        ctx.fillStyle = "#05050096";
        ctx.fillRect(x - 0.1, y - 0.1, 1.2, 1.2);

        // Clear interior
        ctx.clearRect(x, y, 1, 1);

        // Clear corners to create border effect
        ctx.clearRect(x + 0.2, y - 0.2, 0.6, 1.5);
        ctx.clearRect(x - 0.2, y + 0.2, 1.5, 0.6);
    }, [selectedPixel, settings.showSelectedPixelOutline]);

    // Canvas movement and zoom
    useEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper || !canvasInitialized) return;

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

        // Wheel Event (zoom without transform scale)
        const handleWheel = (e) => {
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
            } else if (e.touches.length === 2 && isPinching) {
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
    }, [canvasInitialized, width, height]);

    // Keyboard navigation for selected pixel
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (!selectedPixel) return;

            let newPixel = { ...selectedPixel };

            switch (event.key) {
                case "ArrowUp":
                    newPixel.y = Math.max(0, selectedPixel.y - 1);
                    break;
                case "ArrowDown":
                    newPixel.y = Math.min(height - 1, selectedPixel.y + 1);
                    break;
                case "ArrowLeft":
                    newPixel.x = Math.max(0, selectedPixel.x - 1);
                    break;
                case "ArrowRight":
                    newPixel.x = Math.min(width - 1, selectedPixel.x + 1);
                    break;
                default:
                    return;
            }

            setSelectedPixel(newPixel);
        };

        window?.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [selectedPixel, width, height]);

    // Update pixel on canvas
    const updatePixel = (x, y, color, loading = false) => {
        if (canvasRef?.current?.getContext) {
            const ctx = canvasRef.current.getContext("2d");
            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.fillStyle = !loading
                ? numberToHex(color)
                : `${numberToHex(lightenColor(color))}`;
            ctx.fillRect(x, y, 1, 1);
            ctx.restore();
        }
    };

    // Get pixel color from canvas
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

    // Handle canvas click
    const handleCanvasClick = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const clientX = e.clientX;
        const clientY = e.clientY;

        const x = Math.floor((clientX - rect.left) / rect.width * width);
        const y = Math.floor((clientY - rect.top) / rect.height * height);

        if (x >= 0 && x < width && y >= 0 && y < height) {
            setSelectedPixel({ x, y });
        }
    };

    // Handle canvas right click
    const handleCanvasRightClick = (e) => {
        e.preventDefault();
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const clientX = e.clientX;
        const clientY = e.clientY;

        const x = Math.floor((clientX - rect.left) / rect.width * width);
        const y = Math.floor((clientY - rect.top) / rect.height * height);

        if (x >= 0 && x < width && y >= 0 && y < height && onRightClickPixel) {
            rightClickPixel(x, y);
        }
    };

    // Handle touch events for mobile
    const handleTouchStart = (e) => {
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

        const longPressTimer = setTimeout(() => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const rect = canvas.getBoundingClientRect();
            const x = Math.floor((startX - rect.left) / rect.width * width);
            const y = Math.floor((startY - rect.top) / rect.height * height);

            if (x >= 0 && x < width && y >= 0 && y < height && onRightClickPixel) {
                rightClickPixel(x, y);
            }

            if (navigator.vibrate) navigator.vibrate(50);

            if (e.currentTarget.touchData) {
                e.currentTarget.touchData.longPressTriggered = true;
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
    };

    const handleTouchMove = (e) => {
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
    };

    const handleTouchEnd = (e) => {
        if (!e.currentTarget.touchData) return;

        const { startTime, startX, startY, moved, longPressTimer, longPressTriggered, moveDistance } = e.currentTarget.touchData;

        if (longPressTimer) {
            clearTimeout(longPressTimer);
        }

        const MOVEMENT_TOLERANCE = 10;

        if (!moved && !longPressTriggered && moveDistance <= MOVEMENT_TOLERANCE) {
            const endTime = Date.now();
            const duration = endTime - startTime;

            if (duration < 500) {
                const canvas = canvasRef.current;
                if (!canvas) return;

                const rect = canvas.getBoundingClientRect();
                const x = Math.floor((startX - rect.left) / rect.width * width);
                // 🔧 CORREÇÃO: estava usando width em vez de height
                const y = Math.floor((startY - rect.top) / rect.height * height);

                if (x >= 0 && x < width && y >= 0 && y < height) {
                    setSelectedPixel({ x, y });
                }
            }
        }

        delete e.currentTarget.touchData;
    };

    // Renderização condicional melhorada
    if (initializationError) {
        return (
            <div className={styles.canvasContainer}>
                <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
                    <h2>Erro na inicialização do Canvas</h2>
                    <p>{initializationError}</p>
                    <button onClick={() => {
                        setInitializationError(null);
                        setCanvasInitialized(false);
                    }}>
                        Tentar Novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.canvasContainer}>
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
                            Math.max(width, height) <= 1500 ? "block" : "none",
                    }}
                />

                {/* Main Canvas */}
                <canvas
                    ref={canvasRef}
                    className={`${styles.mainCanvas} pixelate`}
                    width={width}
                    height={height}
                    onClick={handleCanvasClick}
                    onContextMenu={handleCanvasRightClick}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    style={{
                        aspectRatio: `auto ${width} / ${height}`,
                    }}
                />
            </div>
        </div>
    );
});

Canvas.displayName = 'Canvas';

export default Canvas;