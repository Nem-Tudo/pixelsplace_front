import { useEffect, useState, useRef, useCallback } from "react";
import settings from "@/settings";
import { io } from "socket.io-client";
import Cookies from 'js-cookie'; // Adicione esta importação

// Variável global para controlar se já tentou criar o socket
let socketInstance = null;
let isCreatingSocket = false;

// Função para obter o token do cookie
const getTokenFromCookie = () => {
    return Cookies.get('authorization') || null;
};

// Função para criar socket com configurações seguras
const createSocket = () => {
    if (isCreatingSocket || socketInstance) return socketInstance;

    isCreatingSocket = true;

    try {
        const token = getTokenFromCookie(); // Pega o token do cookie

        socketInstance = io(settings.socketProtocol + '://' + settings.socketURL, {
            auth: {
                token: token // Usa o token do cookie
            },
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

// Função para atualizar o token do socket quando necessário
export const updateSocketToken = () => {
    if (socket && socket.auth) {
        const newToken = getTokenFromCookie();
        socket.auth.token = newToken;
        console.log('[WebSocket] Token updated:', newToken ? 'Present' : 'Not found');
    }
};

export function useSocketConnection() {
    const [state, setState] = useState({
        connected: false,
        connecting: false,
        error: null,
        disconnectforced: false
    });

    const connectTimeoutRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const errorTimeoutRef = useRef(null);
    const reconnectAttemptsRef = useRef(0);
    const mountedRef = useRef(true);

    const MAX_RECONNECT_ATTEMPTS = 5;
    const RECONNECT_DELAY = 2000;
    const ERROR_DISPLAY_DELAY = 15 * 1000;

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

        // Atualiza o token antes de reconectar
        updateSocketToken();

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
        reconnectAttemptsRef.current = 0;
        updateState({
            connected: true,
            connecting: false,
            error: null
        });
    }, [clearTimeouts, updateState]);

    const handleDisconnect = useCallback((reason) => {
        if (!mountedRef.current) return;

        console.log("[WebSocket] Disconnected:", reason);

        if (reason === 'io client disconnect' || reason === 'io server disconnect') {
            updateState({
                connected: false,
                connecting: false,
                error: null,
                disconnectforced: true
            });
            return;
        }

        console.log("[WebSocket] Starting reconnection attempts...");
        reconnectAttemptsRef.current = 0;
        updateState({
            connected: false,
            connecting: true,
            error: null
        });

        errorTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current && !socket.connected) {
                console.log("[WebSocket] Reconnection taking too long, will show error soon");
                updateState({
                    connecting: false,
                    error: new Error(`Unable to reconnect: ${reason}`)
                });
            }
        }, ERROR_DISPLAY_DELAY);

        const tryReconnect = () => {
            if (!mountedRef.current || socket.connected) return;

            reconnectAttemptsRef.current++;
            console.log(`[WebSocket] Reconnection attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS}`);

            // Atualiza token antes de cada tentativa de reconexão
            updateSocketToken();

            if (reconnectAttemptsRef.current <= MAX_RECONNECT_ATTEMPTS) {
                reconnectTimeoutRef.current = setTimeout(() => {
                    if (mountedRef.current && !socket.connected) {
                        socket.connect();
                        tryReconnect();
                    }
                }, RECONNECT_DELAY);
            } else {
                if (mountedRef.current) {
                    updateState({
                        connecting: false,
                        error: new Error(`Connection failed after ${MAX_RECONNECT_ATTEMPTS} attempts`)
                    });
                }
            }
        };

        tryReconnect();
    }, [updateState]);

    const handleConnectError = useCallback((error) => {
        if (!mountedRef.current) return;

        console.warn("[WebSocket] Connection error (handled):", error.message);

        if (reconnectAttemptsRef.current > 0 && reconnectAttemptsRef.current <= MAX_RECONNECT_ATTEMPTS) {
            console.log("[WebSocket] Connection error during reconnect attempts, continuing...");
            return;
        }

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

        try {
            socket.on("connect", handleConnect);
            socket.on("disconnect", handleDisconnect);
            socket.on("connect_error", handleConnectError);
            socket.on("reconnect_attempt", handleReconnectAttempt);
            socket.on("reconnect_failed", handleReconnectFailed);

            if (socket.connected) {
                handleConnect();
            } else {
                console.log('[WebSocket] Initial connection attempt...');
                updateState({ connecting: true });

                // Garante que o token está atualizado antes da primeira conexão
                updateSocketToken();

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

    useEffect(() => {
        return () => {
            clearTimeouts();
        };
    }, [clearTimeouts]);

    return {
        connected: state.connected,
        connecting: state.connecting,
        error: state.error,
        disconnectforced: state.disconnectforced,
        reconnect: attemptReconnect
    };
}