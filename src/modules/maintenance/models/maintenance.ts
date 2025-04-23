// src/modules/maintenance/models/maintenance.ts

export interface MaintenanceCategory {
    id_categoria: number;
    nombre: string;
    descripcion: string;
    es_sistema: boolean;
}

export interface MaintenanceType {
    id_tipo: number;
    id_categoria: number;
    nombre: string;
    descripcion: string;
    es_sistema: boolean;
    id_usuario?: number;
    fecha_creacion?: string;
    categoria?: MaintenanceCategory;
}

export interface CustomMaintenanceTypeCreate {
    id_categoria: number;
    nombre: string;
    descripcion: string;
}

export interface MaintenanceRecord {
    id_registro?: number;
    id_vehiculo: number;
    id_tipo: number;
    fecha: string;
    kilometraje: number;
    costo: number;
    notas?: string;
    fecha_creacion?: string;
    fecha_actualizacion?: string;
    tipo_mantenimiento?: MaintenanceType;
}

export interface MaintenanceConfig {
    id_configuracion?: number;
    id_usuario?: number;
    id_tipo: number;
    id_vehiculo: number;
    frecuencia_cambio_meses: number;
    frecuencia_cambio_km: number;
    costo_estimado: number;
    fecha_creacion?: string;
    fecha_actualizacion?: string;
}

export interface MaintenanceRecordCreate {
    id_vehiculo: number;
    id_tipo: number;
    fecha: string;
    kilometraje: number;
    costo: number;
    notas?: string;
    frecuencia_cambio_meses?: number;
    frecuencia_cambio_km?: number;
    costo_estimado?: number;
}

export interface MaintenanceRecordResponse {
    record: MaintenanceRecord;
    needsConfig: boolean;
    config?: MaintenanceConfig;
    message: string;
}

// Nuevos modelos para recordatorios
export interface MaintenanceReminder {
    id_recordatorio: number;
    id_vehiculo: number;
    id_tipo: number;
    fecha_vencimiento: string;
    kilometraje_vencimiento: number;
    activo: boolean;
    fecha_creacion: string;
    fecha_actualizacion: string;
    tipo_mantenimiento?: MaintenanceType;
}

export interface MaintenanceReminderCreate {
    id_vehiculo: number;
    id_tipo: number;
    fecha_vencimiento: string;
    kilometraje_vencimiento: number;
}

// Modelos para próximo mantenimiento
export interface NextMaintenanceVehicle {
    id: number;
    plate: string;
    brand: string;
    model: string;
    year: number;
    current_km: number;
}

export interface NextMaintenanceConfig {
    frequency_months: number;
    frequency_km: number;
    estimated_cost: number;
}

export interface NextMaintenanceDate {
    by_date: string;
    by_km: number;
}

export interface NextMaintenanceTimeStatus {
    days_remaining: number;
    is_due: boolean;
    is_upcoming: boolean;
}

export interface NextMaintenanceKmStatus {
    km_remaining: number;
    is_due: boolean;
    is_upcoming: boolean;
}

export interface NextMaintenanceStatus {
    time_status: NextMaintenanceTimeStatus;
    km_status: NextMaintenanceKmStatus;
}

export interface NextMaintenanceItem {
    type: {
        id_tipo: number;
        nombre: string;
    };
    type_id: number;
    last_maintenance_date: string;
    last_maintenance_km: number;
    config: NextMaintenanceConfig;
    next_maintenance: NextMaintenanceDate;
    status: NextMaintenanceStatus;
}

export interface NextMaintenanceSummary {
    total_items: number;
    due_items: number;
    upcoming_items: number;
}

export interface NextMaintenanceResponse {
    vehicle: NextMaintenanceVehicle;
    maintenance_items: NextMaintenanceItem[];
    summary: NextMaintenanceSummary;
}

// Modelos para notificaciones
export interface Notification {
    id_notificacion: number;
    id_usuario: number;
    titulo: string;
    mensaje: string;
    leida: boolean;
    fecha_creacion: string;
}