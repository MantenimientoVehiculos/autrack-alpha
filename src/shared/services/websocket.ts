// src/shared/services/websocket.ts
import { Socket } from 'socket.io-client';
import io from 'socket.io-client';
import { useState, useEffect, useCallback, useRef } from 'react';
import storage from '../storage';
import { API_BASE_URL } from '../api/client';

// Convertir API_BASE_URL en URL WebSocket
const getWebSocketUrl = () => {
    const wsUrl = API_BASE_URL.replace(/^http/, 'ws').replace(/\/api\/v1$/, '');
    return wsUrl;
};

class WebSocketService {
    private socket: typeof Socket | null = null;
    private listeners: Map<string, Set<Function>> = new Map();
    private isConnecting: boolean = false;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;
    private reconnectDelay: number = 1000;
    private reconnectTimeout: NodeJS.Timeout | null = null;

    async connect(): Promise<boolean> {
        // Evitar múltiples intentos de conexión simultáneos
        if (this.isConnecting || this.socket?.connected) return this.socket?.connected || false;

        this.isConnecting = true;

        try {
            // Obtener token de autenticación
            const token = await storage.get('auth_token');
            if (!token) {
                console.warn('WebSocket: No token found');
                this.isConnecting = false;
                return false;
            }

            // Limpiar socket anterior si existe
            if (this.socket) {
                this.cleanupSocket();
            }

            // Crear nuevo socket
            const wsUrl = getWebSocketUrl();
            console.log(`WebSocket: Connecting to ${wsUrl}`);

            this.socket = io(wsUrl, {
                auth: { token },
                reconnection: false, // Manejaremos la reconexión manualmente
                transports: ['websocket'],
            });

            // Configurar eventos de conexión
            this.socket.on('connect', this.handleConnect);
            this.socket.on('disconnect', this.handleDisconnect);
            this.socket.on('connect_error', this.handleError);

            // Configurar listeners registrados
            this.setupListeners();

            // Esperar a que se resuelva la conexión
            return new Promise((resolve) => {
                // Si ya está conectado (raro pero posible)
                if (this.socket?.connected) {
                    this.isConnecting = false;
                    resolve(true);
                    return;
                }

                // Establecer timeout para la conexión
                const timeout = setTimeout(() => {
                    this.isConnecting = false;
                    console.warn('WebSocket: Connection timeout');
                    resolve(false);
                }, 5000);

                // Cancelar timeout cuando se conecta
                this.socket?.once('connect', () => {
                    clearTimeout(timeout);
                    this.isConnecting = false;
                    resolve(true);
                });

                // Cancelar timeout en error
                this.socket?.once('connect_error', () => {
                    clearTimeout(timeout);
                    this.isConnecting = false;
                    resolve(false);
                });
            });
        } catch (error) {
            console.error('WebSocket: Connection error', error);
            this.isConnecting = false;
            return false;
        }
    }

    private handleConnect = () => {
        console.log('WebSocket: Connected');
        this.reconnectAttempts = 0;
        // Notificar a todos los listeners de 'connect'
        this.notifyListeners('connect');
    };

    private handleDisconnect = (reason: string) => {
        console.log(`WebSocket: Disconnected - ${reason}`);
        // Notificar a todos los listeners de 'disconnect'
        this.notifyListeners('disconnect', reason);

        // Intentar reconectar si la desconexión no fue intencional
        if (reason === 'io server disconnect' || reason === 'transport close') {
            this.attemptReconnect();
        }
    };

    private handleError = (error: Error) => {
        console.error('WebSocket: Connection error', error);
        this.isConnecting = false;
        // Notificar a todos los listeners de 'error'
        this.notifyListeners('error', error);

        // Intentar reconectar
        this.attemptReconnect();
    };

    private attemptReconnect = () => {
        // Evitar múltiples intentos de reconexión
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.warn(`WebSocket: Max reconnect attempts (${this.maxReconnectAttempts}) reached`);
            return;
        }

        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1);

        console.log(`WebSocket: Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);

        this.reconnectTimeout = setTimeout(() => {
            this.reconnectTimeout = null;
            this.connect();
        }, delay);
    };

    disconnect(): void {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        if (this.socket) {
            console.log('WebSocket: Disconnecting');
            this.cleanupSocket();
        }
    }

    private cleanupSocket(): void {
        if (!this.socket) return;

        // Eliminar listeners internos para evitar memory leaks
        this.socket.off('connect', this.handleConnect);
        this.socket.off('disconnect', this.handleDisconnect);
        this.socket.off('connect_error', this.handleError);

        // Desconectar socket
        this.socket.disconnect();
        this.socket = null;
    }

    private setupListeners(): void {
        if (!this.socket) return;

        // Configurar cada evento registrado
        this.listeners.forEach((callbacks, event) => {
            // Solo configurar eventos que no son los eventos de sistema
            if (event !== 'connect' && event !== 'disconnect' && event !== 'error') {
                callbacks.forEach(callback => {
                    this.socket?.on(event, (...args: any[]) => callback(...args));
                });
            }
        });
    }

    on(event: string, callback: Function): void {
        // Añadir callback al registro de listeners
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)?.add(callback);

        // Si ya hay un socket conectado, añadir el listener directamente
        if (this.socket && event !== 'connect' && event !== 'disconnect' && event !== 'error') {
            this.socket.on(event, (...args: any[]) => callback(...args));
        }
    }

    off(event: string, callback?: Function): void {
        if (!callback) {
            // Quitar todos los listeners para un evento
            this.listeners.delete(event);
            if (this.socket && event !== 'connect' && event !== 'disconnect' && event !== 'error') {
                this.socket.off(event);
            }
        } else {
            // Quitar un listener específico
            const callbacks = this.listeners.get(event);
            if (callbacks) {
                callbacks.delete(callback);
                if (callbacks.size === 0) {
                    this.listeners.delete(event);
                }
            }
        }
    }

    emit(event: string, data?: any): boolean {
        if (!this.socket || !this.socket.connected) {
            console.warn(`WebSocket: Cannot emit ${event}, not connected`);
            // Intentar conectar automáticamente
            this.connect();
            return false;
        }

        this.socket.emit(event, data);
        return true;
    }

    private notifyListeners(event: string, ...args: any[]): void {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(...args);
                } catch (error) {
                    console.error(`WebSocket: Error in ${event} listener`, error);
                }
            });
        }
    }

    isConnected(): boolean {
        return !!this.socket?.connected;
    }
}

// Instancia singleton
export const websocketService = new WebSocketService();

// Hook para usar en componentes
export const useWebSocket = () => {
    const [isConnected, setIsConnected] = useState(websocketService.isConnected());
    const connectingRef = useRef(false);

    // Efecto para manejar el estado de conexión
    useEffect(() => {
        const handleConnect = () => setIsConnected(true);
        const handleDisconnect = () => setIsConnected(false);

        websocketService.on('connect', handleConnect);
        websocketService.on('disconnect', handleDisconnect);

        // No iniciar conexión aquí, dejar que el componente decida cuándo conectar

        return () => {
            websocketService.off('connect', handleConnect);
            websocketService.off('disconnect', handleDisconnect);
        };
    }, []);

    // Conectar de forma controlada
    const connect = useCallback(async () => {
        // Evitar intentos de conexión mientras ya hay uno en progreso
        if (connectingRef.current) return false;

        connectingRef.current = true;
        try {
            const success = await websocketService.connect();
            return success;
        } finally {
            connectingRef.current = false;
        }
    }, []);

    const disconnect = useCallback(() => {
        websocketService.disconnect();
    }, []);

    return {
        isConnected,
        connect,
        disconnect,
        on: useCallback((event: string, callback: Function) => websocketService.on(event, callback), []),
        off: useCallback((event: string, callback?: Function) => websocketService.off(event, callback), []),
        emit: useCallback((event: string, data?: any) => websocketService.emit(event, data), []),
    };
};

export default websocketService;