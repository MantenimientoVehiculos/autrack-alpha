// src/shared/services/websocket.ts
import io, { Socket } from 'socket.io-client';
import { useEffect, useState } from 'react';
import storage from '../storage';
import { API_BASE_URL } from '../api/client';

// Convertir API_BASE_URL en URL WebSocket
const getWebSocketUrl = () => {
    let wsUrl = API_BASE_URL;

    // Reemplazar http/https con ws/wss
    if (wsUrl.startsWith('https://')) {
        wsUrl = 'wss://' + wsUrl.substring(8);
    } else if (wsUrl.startsWith('http://')) {
        wsUrl = 'ws://' + wsUrl.substring(7);
    }

    // Asegurarse de que no termine con /api/v1
    if (wsUrl.endsWith('/api/v1')) {
        wsUrl = wsUrl.substring(0, wsUrl.length - 7);
    }

    return wsUrl;
};

class WebSocketService {
    private socket: any | null = null;
    private listeners: Map<string, Function[]> = new Map();

    // Inicializar conexión WebSocket
    async connect(): Promise<void> {
        if (this.socket) {
            this.disconnect();
        }

        try {
            // Obtener token de autenticación
            const token = await storage.get('auth_token');
            if (!token) {
                console.warn('No se pudo conectar al WebSocket: Token no encontrado');
                return;
            }

            // Conectar a WebSocket
            this.socket = io(getWebSocketUrl(), {
                auth: { token },
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                transports: ['websocket']
            });

            // Manejar eventos de conexión
            this.socket.on('connect', () => {
                console.log('WebSocket conectado');
            });

            this.socket.on('disconnect', (reason: any) => {
                console.log(`WebSocket desconectado: ${reason}`);
            });

            this.socket.on('connect_error', (error: any) => {
                console.error('Error de conexión WebSocket:', error);
            });

            // Configurar listeners guardados previamente
            this.restoreListeners();
        } catch (error) {
            console.error('Error al conectar WebSocket:', error);
        }
    }

    // Desconectar WebSocket
    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    // Agregar listener para un evento
    on(event: string, callback: Function): void {
        // Guardar callback en la lista de listeners
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)!.push(callback);

        // Si el socket ya está conectado, agregar listener directamente
        if (this.socket) {
            this.socket.on(event, (...args: any) => callback(...args));
        }
    }

    // Quitar listener para un evento
    off(event: string, callback?: Function): void {
        if (!callback) {
            // Si no se proporciona callback, eliminar todos los listeners para el evento
            this.listeners.delete(event);
            if (this.socket) {
                this.socket.off(event);
            }
        } else {
            // Eliminar solo el callback específico
            const eventListeners = this.listeners.get(event);
            if (eventListeners) {
                const index = eventListeners.indexOf(callback);
                if (index !== -1) {
                    eventListeners.splice(index, 1);
                }

                // Si no quedan listeners, eliminar la clave
                if (eventListeners.length === 0) {
                    this.listeners.delete(event);
                } else {
                    this.listeners.set(event, eventListeners);
                }
            }

            // Nota: No es posible eliminar un único listener con socket.io,
            // tendríamos que recrear todos los listeners para este evento
            this.restoreEventListeners(event);
        }
    }

    // Emitir evento al servidor
    emit(event: string, data?: any): void {
        if (this.socket) {
            this.socket.emit(event, data);
        } else {
            console.warn(`No se pudo emitir evento ${event}: Socket no conectado`);
            // Intentar reconectar
            this.connect();
        }
    }

    // Restaurar todos los listeners
    private restoreListeners(): void {
        if (!this.socket) return;

        // Para cada evento registrado
        this.listeners.forEach((callbacks, event) => {
            // Eliminar listeners existentes para este evento
            this.socket!.off(event);

            // Agregar cada callback
            callbacks.forEach(callback => {
                this.socket!.on(event, (...args: any) => callback(...args));
            });
        });
    }

    // Restaurar listeners para un evento específico
    private restoreEventListeners(event: string): void {
        if (!this.socket) return;

        const callbacks = this.listeners.get(event);
        if (!callbacks) return;

        // Eliminar listeners existentes para este evento
        this.socket.off(event);

        // Agregar cada callback
        callbacks.forEach(callback => {
            this.socket!.on(event, (...args: any) => callback(...args));
        });
    }
}

// Instancia singleton del servicio WebSocket
export const websocketService = new WebSocketService();

// Hook personalizado para usar WebSocket en componentes
export const useWebSocket = () => {
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Iniciar conexión WebSocket al montar el componente
        websocketService.connect()
            .then(() => setIsConnected(true))
            .catch(() => setIsConnected(false));

        // Agregar listener para detectar cambios en la conexión
        const handleConnect = () => setIsConnected(true);
        const handleDisconnect = () => setIsConnected(false);

        websocketService.on('connect', handleConnect);
        websocketService.on('disconnect', handleDisconnect);

        // Limpiar al desmontar
        return () => {
            websocketService.off('connect', handleConnect);
            websocketService.off('disconnect', handleDisconnect);
        };
    }, []);

    return {
        isConnected,
        on: websocketService.on.bind(websocketService),
        off: websocketService.off.bind(websocketService),
        emit: websocketService.emit.bind(websocketService),
        connect: websocketService.connect.bind(websocketService),
        disconnect: websocketService.disconnect.bind(websocketService),
    };
};

export default websocketService;