// src/modules/notifications/hooks/useNotificationWebSocket.ts
import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from '@/src/shared/services/websocket';
import { Notification } from '../models/notification';
import * as Haptics from 'expo-haptics';
import { useNotifications } from './useNotifications';

export const useNotificationWebSocket = () => {
    const [latestNotification, setLatestNotification] = useState<Notification | null>(null);
    const { isConnected, on, off, emit } = useWebSocket();
    const { loadNotifications, unreadCount, setUnreadCount } = useNotifications();

    // Manejar nueva notificación recibida
    const handleNewNotification = useCallback((notification: Notification) => {
        // Actualizar estado local
        setLatestNotification(notification);

        // Incrementar contador de no leídas
        setUnreadCount(prev => prev + 1);

        // Vibrar para alertar al usuario
        Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
        );

        // Recargar lista de notificaciones
        loadNotifications();
    }, [loadNotifications, setUnreadCount]);

    // Marcar notificación como leída a través de WebSocket
    const markAsReadWS = useCallback((notificationId: number) => {
        if (isConnected) {
            emit('markNotificationAsRead', { notificationId });

            // Actualizar conteo local inmediatamente (optimista)
            if (unreadCount > 0) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }

            // Si es la última notificación recibida, marcarla como leída localmente
            if (latestNotification?.id_notificacion === notificationId) {
                setLatestNotification(prev => prev ? { ...prev, leida: true } : null);
            }

            return true;
        }
        return false;
    }, [isConnected, emit, latestNotification, unreadCount, setUnreadCount]);

    // Marcar todas las notificaciones como leídas a través de WebSocket
    const markAllAsReadWS = useCallback(() => {
        if (isConnected) {
            emit('markAllNotificationsAsRead');

            // Actualizar conteo local inmediatamente (optimista)
            setUnreadCount(0);

            // Marcar última notificación como leída
            if (latestNotification) {
                setLatestNotification(prev => prev ? { ...prev, leida: true } : null);
            }

            return true;
        }
        return false;
    }, [isConnected, emit, latestNotification, setUnreadCount]);

    // Configurar listeners de WebSocket
    useEffect(() => {
        // Registrar listener para nuevas notificaciones
        on('newNotification', handleNewNotification);

        // Limpiar al desmontar
        return () => {
            off('newNotification', handleNewNotification);
        };
    }, [on, off, handleNewNotification]);

    return {
        isConnected,
        latestNotification,
        markAsReadWS,
        markAllAsReadWS
    };
};

export default useNotificationWebSocket;