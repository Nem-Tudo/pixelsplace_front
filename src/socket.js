import { useEffect, useState } from "react";
import settings from "@/settings";
import { io } from "socket.io-client";

// Cria o socket fora do componente para manter a conexão única
export const socket = io(settings.socketURL);

export function useSocketConnection() {
    const [connected, setConnected] = useState(socket.connected);

    useEffect(() => {
        const handleConnect = () => console.log("[WebSocket] Connected") || setConnected(true);
        const handleDisconnect = () => console.log("[WebSocket] Disconnected") || setConnected(false);

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);

        // Limpeza
        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
        };
    }, []);

    return connected;
}
