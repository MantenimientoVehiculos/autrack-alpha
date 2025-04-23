// src/modules/notifications/context/NotificationProvider.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Notification } from '../models/notification';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '@/src/modules/auth/context/AuthContext';
import { websocketService } from '@/src/shared/services/websocket';
import NotificationToast from '../components/NotificationToast';

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    latestNotification: Notification | null;
    isLoading: boolean;
    error: string | null;
    loadNotifications: () => Promise<void>;
    loadUnreadNotifications: () => Promise<void>;
    markAsRead: (notificationId: number) => Promise<{ success: boolean, data?: Notification, error?: string }>;
    markAllAsRead: () => Promise<{ success: boolean, affected?: number, error?: string }>;
    formatNotificationDate: (dateString: string) => string;
    wsConnected: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const wsSetupRef = useRef(false);

    // Hook básico de notificaciones para métodos API
    const {
        notifications,
        unreadCount,
        isLoading,
        error,
        loadNotifications,
        loadUnreadNotifications,
        markAsRead: markAsReadApi,
        markAllAsRead: markAllAsReadApi,
        formatNotificationDate,
        setUnreadCount
    } = useNotifications();

    // Estado para WebSocket y última notificación
    const [wsConnected, setWsConnected] = useState(websocketService.isConnected());
    const [latestNotification, setLatestNotification] = useState<Notification | null>(null);

    // Conectar/desconectar WebSocket según autenticación
    useEffect(() => {
        if (isAuthenticated && !wsSetupRef.current) {
            // Establecer conexión
            const connectWs = async () => {
                try {
                    await websocketService.connect();
                } catch (error) {
                    console.error("Error conectando WebSocket:", error);
                }
            };

            connectWs();
            wsSetupRef.current = true;
        } else if (!isAuthenticated && wsSetupRef.current) {
            // Desconectar si no está autenticado
            websocketService.disconnect();
            wsSetupRef.current = false;
        }

        return () => {
            // No desconectar al desmontar - dejamos que la gestión del WS sea controlada
            // por el estado de autenticación global
        };
    }, [isAuthenticated]);

    // Configurar listeners de WebSocket una sola vez
    useEffect(() => {
        // Actualizar estado de conexión
        const handleConnect = () => setWsConnected(true);
        const handleDisconnect = () => setWsConnected(false);

        // Manejar nuevas notificaciones
        const handleNewNotification = (notification: Notification) => {
            setLatestNotification(notification);
            setUnreadCount(prev => prev + 1);
            // Recargar lista completa de notificaciones
            loadNotifications();
        };

        // Registrar listeners
        websocketService.on('connect', handleConnect);
        websocketService.on('disconnect', handleDisconnect);
        websocketService.on('newNotification', handleNewNotification);

        // Limpiar listeners al desmontar
        return () => {
            websocketService.off('connect', handleConnect);
            websocketService.off('disconnect', handleDisconnect);
            websocketService.off('newNotification', handleNewNotification);
        };
    }, [loadNotifications, setUnreadCount]);

    // Método para marcar como leído (primero WS, fallback a API)
    const markAsRead = useCallback(async (notificationId: number) => {
        // Intentar con WebSocket primero
        if (wsConnected) {
            websocketService.emit('markNotificationAsRead', { notificationId });

            // Optimistic update
            if (latestNotification?.id_notificacion === notificationId) {
                setLatestNotification(prev => prev ? { ...prev, leida: true } : null);
            }

            // Actualizar conteo local inmediatamente
            if (unreadCount > 0) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }

            return { success: true };
        } else {
            // Fallback a la API
            return await markAsReadApi(notificationId);
        }
    }, [wsConnected, latestNotification, unreadCount, setUnreadCount, markAsReadApi]);

    // Método para marcar todas como leídas (primero WS, fallback a API)
    const markAllAsRead = useCallback(async () => {
        // Intentar con WebSocket primero
        if (wsConnected) {
            websocketService.emit('markAllNotificationsAsRead');

            // Optimistic update
            setLatestNotification(prev => prev ? { ...prev, leida: true } : null);

            // Actualizar conteo local inmediatamente
            const prevCount = unreadCount;
            setUnreadCount(0);

            return { success: true, affected: prevCount };
        } else {
            // Fallback a la API
            return await markAllAsReadApi();
        }
    }, [wsConnected, unreadCount, setUnreadCount, markAllAsReadApi]);

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                latestNotification,
                isLoading,
                error,
                loadNotifications,
                loadUnreadNotifications,
                markAsRead,
                markAllAsRead,
                formatNotificationDate,
                wsConnected
            }}
        >
            {children}
            <NotificationToast />
        </NotificationContext.Provider>
    );
};

export const useNotificationContext = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotificationContext debe usarse dentro de NotificationProvider');
    }
    return context;
};

export default NotificationProvider;