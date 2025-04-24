// src/modules/home/models/home.ts
import { Vehicle } from '@/src/modules/vehicles/models/vehicle';
import { NextMaintenanceItem } from '@/src/modules/maintenance/models/maintenance';

// Interfaz para la información de estado del vehículo
export interface VehicleStatus {
    vehicle: Vehicle;
    lastServiceDate?: string;
    statusPercentage: number;
    statusDescription: 'Bueno' | 'Regular' | 'Requiere atención';
}

// Interfaz para el agrupamiento de mantenimientos por vehículo
export interface VehicleMaintenance {
    vehicle: Vehicle;
    maintenanceItems: NextMaintenanceItem[];
}

// Estados de prioridad para mantenimientos
export enum MaintenancePriority {
    High = 'high',
    Medium = 'medium',
    Low = 'low'
}

// Objeto para agrupar mantenimientos por prioridad
export interface MaintenanceByPriority {
    [MaintenancePriority.High]: NextMaintenanceItem[];
    [MaintenancePriority.Medium]: NextMaintenanceItem[];
    [MaintenancePriority.Low]: NextMaintenanceItem[];
}

// Datos para el resumen del dashboard
export interface DashboardSummary {
    totalVehicles: number;
    vehiclesRequiringMaintenance: number;
    upcomingMaintenanceCount: number;
    totalMaintenanceCost: number;
    averageMaintenanceCost: number;
}

// Función utilitaria para calcular la prioridad de un mantenimiento
export const getMaintenancePriority = (item: NextMaintenanceItem): MaintenancePriority => {
    if (item.status.time_status.is_due || item.status.km_status.is_due) {
        return MaintenancePriority.High;
    }
    if (item.status.time_status.is_upcoming || item.status.km_status.is_upcoming) {
        return MaintenancePriority.Medium;
    }
    return MaintenancePriority.Low;
};

// Función utilitaria para agrupar mantenimientos por prioridad
export const groupMaintenanceByPriority = (items: NextMaintenanceItem[]): MaintenanceByPriority => {
    return items.reduce(
        (result, item) => {
            const priority = getMaintenancePriority(item);
            result[priority].push(item);
            return result;
        },
        {
            [MaintenancePriority.High]: [],
            [MaintenancePriority.Medium]: [],
            [MaintenancePriority.Low]: [],
        } as MaintenanceByPriority
    );
};

// Función para calcular el porcentaje de estado general del vehículo
export const calculateVehicleStatusPercentage = (vehicle: Vehicle, maintenanceItems: NextMaintenanceItem[]): number => {
    if (!maintenanceItems || maintenanceItems.length === 0) {
        return 100; // Si no hay mantenimientos programados, el vehículo está en perfecto estado
    }

    // Contar mantenimientos por prioridad
    const priorities = groupMaintenanceByPriority(maintenanceItems);
    const highPriorityCount = priorities[MaintenancePriority.High].length;
    const mediumPriorityCount = priorities[MaintenancePriority.Medium].length;

    // Calcular un puntaje basado en la cantidad de mantenimientos pendientes
    // y su prioridad (alta prioridad tiene mayor impacto)
    const totalItems = maintenanceItems.length;
    const highImpact = highPriorityCount * 25; // Cada mantenimiento de alta prioridad reduce hasta 25%
    const mediumImpact = mediumPriorityCount * 10; // Cada mantenimiento de media prioridad reduce hasta 10%

    // Calcular porcentaje (máximo 100, mínimo 0)
    const statusPercentage = Math.max(0, Math.min(100, 100 - highImpact - mediumImpact));

    return statusPercentage;
};