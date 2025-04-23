// src/modules/notifications/hooks/useNotifications.ts
import { useState, useEffect, useCallback } from 'react';
import { notificationsApi } from '../services/notificationsApi';
import { Notification } from '../models/notification';
import * as Haptics from 'expo-haptics';

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Cargar todas las notificaciones
    const loadNotifications = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const allNotifications = await notificationsApi.getAllNotifications();
            setNotifications(allNotifications);

            // Actualizar contador de no leídas
            const unread = allNotifications.filter(notification => !notification.leida).length;
            setUnreadCount(unread);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Error al cargar notificaciones');
            Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Error
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Cargar notificaciones no leídas
    const loadUnreadNotifications = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const unreadNotifications = await notificationsApi.getUnreadNotifications();
            setNotifications(unreadNotifications);
            setUnreadCount(unreadNotifications.length);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Error al cargar notificaciones no leídas');
            Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Error
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Marcar notificación como leída
    const markAsRead = useCallback(async (notificationId: number) => {
        setIsLoading(true);
        setError(null);
        try {
            const updatedNotification = await notificationsApi.markAsRead(notificationId);

            // Actualizar el estado local
            setNotifications(prevNotifications =>
                prevNotifications.map(notification =>
                    notification.id_notificacion === notificationId
                        ? { ...notification, leida: true }
                        : notification
                )
            );

            // Actualizar contador de no leídas
            setUnreadCount(prev => Math.max(0, prev - 1));

            return { success: true, data: updatedNotification };
        } catch (err: any) {
            console.error(err);
            const msg = err.message || 'Error al marcar notificación como leída';
            setError(msg);
            Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Error
            );
            return { success: false, error: msg };
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Marcar todas las notificaciones como leídas
    const markAllAsRead = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await notificationsApi.markAllAsRead();

            // Actualizar el estado local
            setNotifications(prevNotifications =>
                prevNotifications.map(notification => ({ ...notification, leida: true }))
            );

            // Actualizar contador de no leídas
            setUnreadCount(0);

            return { success: true, affected: result.affected };
        } catch (err: any) {
            console.error(err);
            const msg = err.message || 'Error al marcar todas las notificaciones como leídas';
            setError(msg);
            Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Error
            );
            return { success: false, error: msg };
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Cargar notificaciones al montar el componente
    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    // Formatear fecha para mostrar
    const formatNotificationDate = useCallback((dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHours = Math.floor(diffMin / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffSec < 60) {
            return 'Ahora mismo';
        } else if (diffMin < 60) {
            return `Hace ${diffMin} min`;
        } else if (diffHours < 24) {
            return `Hace ${diffHours} h`;
        } else if (diffDays < 7) {
            return `Hace ${diffDays} días`;
        } else {
            return date.toLocaleDateString();
        }
    }, []);

    return {
        notifications,
        unreadCount,
        isLoading,
        error,
        loadNotifications,
        loadUnreadNotifications,
        markAsRead,
        markAllAsRead,
        formatNotificationDate,
        setUnreadCount,  // Exportado para usarlo en el contexto de WebSocket
        clearError: () => setError(null)
    };
};

export default useNotifications;