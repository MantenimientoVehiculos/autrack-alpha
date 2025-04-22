// src/modules/vehicles/models/vehicle.ts

export interface Brand {
    id_marca: number;
    nombre: string;
}

export interface Model {
    id_modelo: number;
    id_marca: number;
    nombre: string;
    es_global: boolean;
    id_usuario?: number;
}

export interface Vehicle {
    id_vehiculo?: number;
    id_usuario?: number;
    placa: string;
    id_marca: number;
    id_modelo: number;
    anio: number;
    kilometraje_actual: number;
    fecha_creacion?: string;
    fecha_actualizacion?: string;
    activo?: boolean;
    color?: string;
    marca?: Brand;
    modelo?: Model;
}

// Para la actualización de kilometraje
export interface KilometrageUpdate {
    kilometraje: number;
}

// Para la creación de modelo personalizado
export interface CustomModelCreate {
    id_marca: number;
    nombre: string;
}

export type VehicleWithRelations = Vehicle & {
    marca: Brand;
    modelo: Model;
};