// ============================================
// 3. SERVICIO DE GENERACIÓN DE CSV
// src/modules/reports/services/csvService.ts
// ============================================

import Papa from 'papaparse';
import { ReportResponse } from '../models/report';

interface CSVOptions {
    vehicleName: string;
    dateRange?: { start: string; end: string };
}

class CSVService {
    private formatDate(dateString: string): string {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-EC');
        } catch (error) {
            return dateString;
        }
    }

    generateCSV(data: ReportResponse, options: CSVOptions): Blob {
        try {
            // Preparar datos para CSV
            const csvData = data.registros.map(record => ({
                'Fecha': this.formatDate(record.fecha),
                'Tipo de Mantenimiento': record.tipo_mantenimiento.nombre,
                'Categoría': record.tipo_mantenimiento.categoria.nombre,
                'Kilometraje': record.kilometraje,
                'Costo (USD)': record.costo,
                'Notas': record.notas || ''
            }));

            // Convertir a CSV
            const csv = Papa.unparse(csvData, {
                delimiter: ',',
                header: true
            });

            // Agregar información del reporte al inicio
            const header = [
                `# REPORTE DE MANTENIMIENTO`,
                `# Vehículo: ${options.vehicleName}`,
                `# Período: ${options.dateRange ? `${this.formatDate(options.dateRange.start)} - ${this.formatDate(options.dateRange.end)}` : 'Todos los registros'}`,
                `# Generado: ${new Date().toLocaleDateString('es-EC')}`,
                `# Total Registros: ${data.estadisticas.total_registros}`,
                `# Costo Total: $${data.estadisticas.costo_total.toFixed(2)}`,
                `#`,
                ''
            ].join('\n');

            const finalCSV = header + csv;

            // Crear blob con BOM para compatibilidad con Excel
            const BOM = '\uFEFF';
            return new Blob([BOM + finalCSV], {
                type: 'text/csv;charset=utf-8'
            });
        } catch (error) {
            console.error('Error generando CSV:', error);
            throw new Error('No se pudo generar el archivo CSV');
        }
    }
}

export const csvService = new CSVService();
