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