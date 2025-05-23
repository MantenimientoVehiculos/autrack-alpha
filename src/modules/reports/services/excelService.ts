// ============================================
// 2. SERVICIO DE GENERACIÓN DE EXCEL
// src/modules/reports/services/excelService.ts
// ============================================

import * as XLSX from 'xlsx';
import { ReportResponse } from '../models/report';

interface ExcelOptions {
    vehicleName: string;
    dateRange?: { start: string; end: string };
}

class ExcelService {
    private formatCurrency(amount: number): string {
        return new Intl.NumberFormat('es-EC', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    private formatDate(dateString: string): string {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-EC');
        } catch (error) {
            return dateString;
        }
    }

    generateExcel(data: ReportResponse, options: ExcelOptions): Blob {
        try {
            const workbook = XLSX.utils.book_new();

            // Hoja 1: Información General
            const infoData = [
                ['REPORTE DE MANTENIMIENTO'],
                [''],
                ['Vehículo:', options.vehicleName],
                ['Período:', options.dateRange ? `${this.formatDate(options.dateRange.start)} - ${this.formatDate(options.dateRange.end)}` : 'Todos los registros'],
                ['Generado:', new Date().toLocaleDateString('es-EC')],
                [''],
                ['RESUMEN ESTADÍSTICO'],
                ['Total de Registros:', data.estadisticas.total_registros],
                ['Costo Total:', this.formatCurrency(data.estadisticas.costo_total)],
                ['Costo Promedio:', this.formatCurrency(data.estadisticas.costo_promedio)]
            ];

            const infoSheet = XLSX.utils.aoa_to_sheet(infoData);
            XLSX.utils.book_append_sheet(workbook, infoSheet, 'Información');

            // Hoja 2: Registros Detallados
            const recordsData = [
                ['Fecha', 'Tipo de Mantenimiento', 'Categoría', 'Kilometraje', 'Costo', 'Notas'],
                ...data.registros.map(record => [
                    this.formatDate(record.fecha),
                    record.tipo_mantenimiento.nombre,
                    record.tipo_mantenimiento.categoria.nombre,
                    record.kilometraje,
                    record.costo,
                    record.notas || ''
                ])
            ];

            const recordsSheet = XLSX.utils.aoa_to_sheet(recordsData);
            XLSX.utils.book_append_sheet(workbook, recordsSheet, 'Registros');

            // Hoja 3: Resumen por Tipo
            if (data.por_tipo.length > 0) {
                const typeData = [
                    ['Tipo de Mantenimiento', 'Cantidad', 'Costo Total', 'Costo Promedio'],
                    ...data.por_tipo.map(type => [
                        type.nombre,
                        type.cantidad,
                        type.costo_total,
                        type.costo_total / type.cantidad
                    ])
                ];

                const typeSheet = XLSX.utils.aoa_to_sheet(typeData);
                XLSX.utils.book_append_sheet(workbook, typeSheet, 'Por Tipo');
            }

            // Convertir a blob
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            return new Blob([excelBuffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
        } catch (error) {
            console.error('Error generando Excel:', error);
            throw new Error('No se pudo generar el archivo Excel');
        }
    }
}

export const excelService = new ExcelService();