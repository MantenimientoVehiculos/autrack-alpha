// src/modules/notifications/services/notificationsApi.ts
import apiClient from '@/src/shared/api/client';
import { Notification } from '../../maintenance';

class NotificationsApi {
    // Obtener todas las notificaciones
    async getAllNotifications(): Promise<Notification[]> {
        return apiClient.get<Notification[]>('/notifications');
    }

    // Obtener notificaciones no leídas
    async getUnreadNotifications(): Promise<Notification[]> {
        return apiClient.get<Notification[]>('/notifications/unread');
    }

    // Marcar notificación como leída
    async markAsRead(notificationId: number): Promise<Notification> {
        return apiClient.post<Notification>('/notifications/mark-as-read', {
            id_notificacion: notificationId
        });
    }

    // Marcar todas las notificaciones como leídas
    async markAllAsRead(): Promise<{ affected: number }> {
        return apiClient.post<{ affected: number }>('/notifications/mark-all-as-read');
    }
}

export const notificationsApi = new NotificationsApi();
export default NotificationsApi;