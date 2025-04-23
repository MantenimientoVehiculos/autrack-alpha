// src/modules/notifications/models/notification.ts

export interface Notification {
    id_notificacion: number;
    id_usuario: number;
    titulo: string;
    mensaje: string;
    leida: boolean;
    fecha_creacion: string;
}