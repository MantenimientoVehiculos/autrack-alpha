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

// Interfaces para estadísticas
export interface MaintenanceCountByVehicle {
    user_id: number;
    total_vehicles: number;
    vehicles_stats: Array<{
        vehicle: {
            id: number;
            brand: string;
            model: string;
            year: number;
            plate: string;
        };
        maintenance_count: number;
    }>;
}

export interface MaintenanceByCategory {
    user_id: number;
    total_vehicles: number;
    vehicles_categories_stats: Array<{
        vehicle: {
            id: number;
            brand: string;
            model: string;
            year: number;
            plate: string;
        };
        categories: Array<{
            id: number;
            name: string;
            count: number;
        }>;
    }>;
}

export interface CompleteMaintenanceStatistics {
    user_id: number;
    total_vehicles: number;
    vehicle_statistics: Array<{
        vehicle: {
            id: number;
            brand: string;
            model: string;
            year: number;
            plate: string;
        };
        total_maintenance_count: number;
        maintenance_by_category: Array<{
            id: number;
            name: string;
            count: number;
        }>;
    }>;
}

export interface MaintenanceCostByVehicle {
    user_id: number;
    total_vehicles: number;
    overall_total_cost: number;
    vehicles_cost: Array<{
        vehicle: {
            id: number;
            brand: string;
            model: string;
            year: number;
            plate: string;
        };
        total_maintenance_cost: number;
    }>;
}

export interface MaintenanceCostByCategory {
    user_id: number;
    total_vehicles: number;
    vehicles_category_costs: Array<{
        vehicle: {
            id: number;
            brand: string;
            model: string;
            year: number;
            plate: string;
        };
        category_costs: Array<{
            id: number;
            name: string;
            total_cost: number;
            maintenance_count: number;
        }>;
    }>;
}

export interface MaintenanceCostByType {
    user_id: number;
    total_vehicles: number;
    vehicles_type_costs: Array<{
        vehicle: {
            id: number;
            brand: string;
            model: string;
            year: number;
            plate: string;
        };
        type_costs: Array<{
            id: number;
            name: string;
            total_cost: number;
            maintenance_count: number;
        }>;
    }>;
}

export interface CompleteCostStatistics {
    user_id: number;
    total_vehicles: number;
    overall_total_cost: number;
    vehicle_cost_statistics: Array<{
        vehicle: {
            id: number;
            brand: string;
            model: string;
            year: number;
            plate: string;
        };
        total_maintenance_cost: number;
        costs_by_category: Array<{
            id: number;
            name: string;
            total_cost: number;
            maintenance_count: number;
        }>;
        costs_by_type: Array<{
            id: number;
            name: string;
            total_cost: number;
            maintenance_count: number;
        }>;
    }>;
}

// Índice de exportación
export * from './report';