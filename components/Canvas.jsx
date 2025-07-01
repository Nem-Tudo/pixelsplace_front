import styles from "@/components/Canvas.module.css";

export default function Canvas({
    editable = false,
}) {


    return <div id={styles.main}
        style={{display: isAlready() ? "unset" : "none"}}
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
            height: "100%",
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
            const pixelRatio = window.devicePixelRatio || 1;
            
            // Ajusta as coordenadas para o pixel ratio
            const scaleX = (canvas.width / pixelRatio) / rect.width;
            const scaleY = (canvas.height / pixelRatio) / rect.height;

            const x = Math.floor((e.clientX - rect.left) * scaleX);
            const y = Math.floor((e.clientY - rect.top) * scaleY);

            setSelectedPixel({ x, y });
            }}
            onContextMenu={(e) => {
            e.preventDefault();
            const canvas = canvasRef.current;
            if (!canvas) return;

            const rect = canvas.getBoundingClientRect();
            const pixelRatio = window.devicePixelRatio || 1;
            
            // Ajusta as coordenadas para o pixel ratio
            const scaleX = (canvas.width / pixelRatio) / rect.width;
            const scaleY = (canvas.height / pixelRatio) / rect.height;

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
}