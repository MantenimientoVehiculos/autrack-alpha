// src/modules/notifications/context/NotificationProvider.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Notification } from '../models/notification';
import { useNotifications } from '../hooks/useNotifications';
import { useNotificationWebSocket } from '../hooks/useNotificationWebSocket';
import { useAuth } from '@/src/modules/auth/context/AuthContext';
import { websocketService } from '@/src/shared/services/websocket';

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

    // Combinar hooks de notificaciones normales y WebSocket
    const {
        notifications,
        unreadCount,
        isLoading,
        error,
        loadNotifications,
        loadUnreadNotifications,
        markAsRead,
        markAllAsRead,
        formatNotificationDate,
        setUnreadCount
    } = useNotifications();

    const {
        isConnected: wsConnected,
        latestNotification,
        markAsReadWS,
        markAllAsReadWS
    } = useNotificationWebSocket();

    // Conectar/desconectar WebSocket según autenticación
    useEffect(() => {
        if (isAuthenticated) {
            websocketService.connect();
        } else {
            websocketService.disconnect();
        }
    }, [isAuthenticated]);

    // Versión mejorada de markAsRead que intenta primero WebSocket
    const handleMarkAsRead = async (notificationId: number) => {
        // Intentar primero con WebSocket
        const wsSuccess = markAsReadWS(notificationId);

        if (wsSuccess) {
            // Si WebSocket tuvo éxito, devolver resultado exitoso
            return { success: true };
        } else {
            // Si WebSocket falló, usar API REST
            return await markAsRead(notificationId);
        }
    };

    // Versión mejorada de markAllAsRead que intenta primero WebSocket
    const handleMarkAllAsRead = async () => {
        // Intentar primero con WebSocket
        const wsSuccess = markAllAsReadWS();

        if (wsSuccess) {
            // Si WebSocket tuvo éxito, devolver resultado exitoso
            return { success: true, affected: unreadCount };
        } else {
            // Si WebSocket falló, usar API REST
            return await markAllAsRead();
        }
    };

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
                markAsRead: handleMarkAsRead,
                markAllAsRead: handleMarkAllAsRead,
                formatNotificationDate,
                wsConnected
            }}
        >
            {children}
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