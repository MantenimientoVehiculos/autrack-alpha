// src/modules/reports/models/report.ts
import { Vehicle } from '@/src/modules/vehicles/models/vehicle';

// Filtros para generar un reporte
export interface ReportFilter {
    id_vehiculo: number;
    fecha_inicio?: string;
    fecha_fin?: string;
    kilometraje_minimo?: number;
    kilometraje_maximo?: number;
    tipos_mantenimiento?: number[];
    formato?: 'pdf' | 'excel' | 'csv';
}

// Registro de mantenimiento en el reporte
export interface ReportMaintenanceRecord {
    id_registro: number;
    id_vehiculo: number;
    id_tipo: number;
    fecha: string;
    kilometraje: number;
    costo: number;
    notas?: string;
    fecha_creacion: string;
    fecha_actualizacion: string;
    tipo_mantenimiento: {
        id_tipo: number;
        nombre: string;
        categoria: {
            id_categoria: number;
            nombre: string;
        }
    };
}

// Estadísticas generales del reporte
export interface ReportStatistics {
    total_registros: number;
    costo_total: number;
    costo_promedio: number;
}

// Estadísticas por tipo de mantenimiento
export interface ReportByType {
    id: number;
    nombre: string;
    cantidad: number;
    costo_total: number;
}

// Respuesta completa del reporte generado
export interface ReportResponse {
    registros: ReportMaintenanceRecord[];
    estadisticas: ReportStatistics;
    por_tipo: ReportByType[];
}

// Solicitud para exportar reporte
export interface ExportReportRequest {
    registros: number[];
    formato: 'pdf' | 'excel' | 'csv';
}

// Respuesta de exportación
export interface ExportReportResponse {
    message: string;
    total_registros: number;
    url?: string; // URL para descargar el archivo (si aplica)
}

// Estado del reporte actual
export interface ReportState {
    filter: ReportFilter;
    result?: ReportResponse;
    isGenerating: boolean;
    isExporting: boolean;
    error: string | null;
}

// Índice de exportación
export * from './report';