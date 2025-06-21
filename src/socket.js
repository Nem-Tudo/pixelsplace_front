import { useEffect, useState, useRef, useCallback } from "react";
import settings from "@/settings";
import { io } from "socket.io-client";

// Variável global para controlar se já tentou criar o socket
let socketInstance = null;
let isCreatingSocket = false;

// Função para criar socket com configurações seguras
const createSocket = () => {
    if (isCreatingSocket || socketInstance) return socketInstance;

    isCreatingSocket = true;

    try {
        socketInstance = io(settings.socketURL, {
            autoConnect: false,
            transports: ['websocket', 'polling'],
            upgrade: true,
            reconnection: true,
            reconnectionDelay: 2000,
            reconnectionAttempts: 3,
            timeout: 10000,
            forceNew: false,
            pingTimeout: 60000,
            pingInterval: 25000,
        });

        // Adiciona listener global para erros não capturados
        socketInstance.on('error', (error) => {
            console.warn('[WebSocket] Socket error (handled):', error.message);
        });

        isCreatingSocket = false;
        return socketInstance;
    } catch (error) {
        console.error('[WebSocket] Failed to create socket:', error);
        isCreatingSocket = false;
        return null;
    }
};

// Exporta o socket (criado sob demanda)
export const socket = createSocket();

export function useSocketConnection() {
    const [state, setState] = useState({
        connected: false,
        connecting: false,
        error: null
    });

    const connectTimeoutRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const errorTimeoutRef = useRef(null);
    const reconnectAttemptsRef = useRef(0);
    const mountedRef = useRef(true);

    const MAX_RECONNECT_ATTEMPTS = 5;
    const RECONNECT_DELAY = 2000;
    const ERROR_DISPLAY_DELAY = 15 * 1000; // Só mostra erro após 8 segundos tentando

    // Função para atualizar estado de forma segura
    const updateState = useCallback((updates) => {
        if (!mountedRef.current) return;

        setState(prevState => ({
            ...prevState,
            ...updates
        }));
    }, []);

    // Função para limpar timeouts
    const clearTimeouts = useCallback(() => {
        if (connectTimeoutRef.current) {
            clearTimeout(connectTimeoutRef.current);
            connectTimeoutRef.current = null;
        }
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        if (errorTimeoutRef.current) {
            clearTimeout(errorTimeoutRef.current);
            errorTimeoutRef.current = null;
        }
    }, []);

    // Função para tentar reconectar manualmente
    const attemptReconnect = useCallback(() => {
        if (!mountedRef.current || !socket) return;

        clearTimeouts();
        reconnectAttemptsRef.current = 0;

        console.log('[WebSocket] Attempting manual reconnect...');
        updateState({
            connecting: true,
            error: null
        });

        // Agenda mostrar erro após um tempo tentando
        errorTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current && !socket.connected) {
                console.log('[WebSocket] Reconnect taking too long, showing error');
                updateState({
                    connecting: false,
                    error: new Error('Connection timeout - unable to reconnect')
                });
            }
        }, ERROR_DISPLAY_DELAY);

        try {
            if (socket.connected) {
                socket.disconnect();
            }
            socket.connect();
        } catch (err) {
            console.error('[WebSocket] Error during reconnect:', err);
            updateState({
                connecting: false,
                error: err
            });
        }
    }, [clearTimeouts, updateState]);

    // Handlers dos eventos do socket
    const handleConnect = useCallback(() => {
        if (!mountedRef.current) return;

        console.log("[WebSocket] Connected successfully");
        clearTimeouts();
        reconnectAttemptsRef.current = 0; // Reset contador
        updateState({
            connected: true,
            connecting: false,
            error: null
        });
    }, [clearTimeouts, updateState]);

    const handleDisconnect = useCallback((reason) => {
        if (!mountedRef.current) return;

        console.log("[WebSocket] Disconnected:", reason);

        // Se foi desconectado intencionalmente, não tenta reconectar
        if (reason === 'io client disconnect' || reason === 'io server disconnect') {
            updateState({
                connected: false,
                connecting: false,
                error: null
            });
            return;
        }

        // Começa tentando reconectar (mostra "connecting")
        console.log("[WebSocket] Starting reconnection attempts...");
        reconnectAttemptsRef.current = 0;
        updateState({
            connected: false,
            connecting: true, // Mostra como "tentando conectar"
            error: null
        });

        // Agenda timeout para mostrar erro se não conseguir reconectar
        errorTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current && !socket.connected) {
                console.log("[WebSocket] Reconnection taking too long, will show error soon");
                updateState({
                    connecting: false,
                    error: new Error(`Unable to reconnect: ${reason}`)
                });
            }
        }, ERROR_DISPLAY_DELAY);

        // Inicia tentativas de reconexão automática
        const tryReconnect = () => {
            if (!mountedRef.current || socket.connected) return;

            reconnectAttemptsRef.current++;
            console.log(`[WebSocket] Reconnection attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS}`);

            if (reconnectAttemptsRef.current <= MAX_RECONNECT_ATTEMPTS) {
                reconnectTimeoutRef.current = setTimeout(() => {
                    if (mountedRef.current && !socket.connected) {
                        socket.connect();
                        tryReconnect(); // Agenda próxima tentativa
                    }
                }, RECONNECT_DELAY);
            } else {
                // Esgotou tentativas, mostra erro
                if (mountedRef.current) {
                    updateState({
                        connecting: false,
                        error: new Error(`Connection failed after ${MAX_RECONNECT_ATTEMPTS} attempts`)
                    });
                }
            }
        };

        // Inicia o ciclo de tentativas
        tryReconnect();
    }, [updateState]);

    const handleConnectError = useCallback((error) => {
        if (!mountedRef.current) return;

        console.warn("[WebSocket] Connection error (handled):", error.message);

        // Se já está tentando reconectar, não mostra erro imediatamente
        // Deixa o processo de reconexão automática lidar com isso
        if (reconnectAttemptsRef.current > 0 && reconnectAttemptsRef.current <= MAX_RECONNECT_ATTEMPTS) {
            console.log("[WebSocket] Connection error during reconnect attempts, continuing...");
            return;
        }

        // Se não está em processo de reconexão, mostra erro
        const errorMessage = error.message && error.message.includes('xhr poll error')
            ? 'Connection failed - server may be down'
            : `Connection failed: ${error.message || 'Unknown error'}`;

        updateState({
            connected: false,
            connecting: false,
            error: new Error(errorMessage)
        });
    }, [updateState]);

    const handleReconnectAttempt = useCallback((attemptNumber) => {
        if (!mountedRef.current) return;

        console.log(`[WebSocket] Reconnection attempt #${attemptNumber}`);
        // Mantém o estado connecting: true durante as tentativas
    }, []);

    const handleReconnectFailed = useCallback(() => {
        if (!mountedRef.current) return;

        console.warn("[WebSocket] All reconnection attempts failed");
        clearTimeouts();
        updateState({
            connected: false,
            connecting: false,
            error: new Error('All reconnection attempts failed')
        });
    }, [clearTimeouts, updateState]);

    useEffect(() => {
        mountedRef.current = true;

        if (!socket) {
            console.error('[WebSocket] Socket not available');
            updateState({ error: new Error('Socket not available') });
            return;
        }

        // Registra os eventos
        try {
            socket.on("connect", handleConnect);
            socket.on("disconnect", handleDisconnect);
            socket.on("connect_error", handleConnectError);
            socket.on("reconnect_attempt", handleReconnectAttempt);
            socket.on("reconnect_failed", handleReconnectFailed);

            // Verifica se já está conectado
            if (socket.connected) {
                handleConnect();
            } else {
                // Tenta conectar se não estiver conectado
                console.log('[WebSocket] Initial connection attempt...');
                updateState({ connecting: true });

                // Timeout para primeira conexão (mais tolerante)
                errorTimeoutRef.current = setTimeout(() => {
                    if (mountedRef.current && !socket.connected) {
                        console.log('[WebSocket] Initial connection taking too long');
                        updateState({
                            connecting: false,
                            error: new Error('Initial connection timeout')
                        });
                    }
                }, ERROR_DISPLAY_DELAY);

                socket.connect();
            }
        } catch (err) {
            console.error('[WebSocket] Error setting up socket:', err);
            updateState({ error: err });
        }

        // Cleanup
        return () => {
            mountedRef.current = false;
            clearTimeouts();

            if (socket) {
                socket.off("connect", handleConnect);
                socket.off("disconnect", handleDisconnect);
                socket.off("connect_error", handleConnectError);
                socket.off("reconnect_attempt", handleReconnectAttempt);
                socket.off("reconnect_failed", handleReconnectFailed);
            }
        };
    }, [
        handleConnect,
        handleDisconnect,
        handleConnectError,
        handleReconnectAttempt,
        handleReconnectFailed,
        clearTimeouts,
        updateState
    ]);

    // Cleanup quando componente for desmontado
    useEffect(() => {
        return () => {
            clearTimeouts();
        };
    }, [clearTimeouts]);

    return {
        connected: state.connected,
        connecting: state.connecting,
        error: state.error,
        reconnect: attemptReconnect
    };
}