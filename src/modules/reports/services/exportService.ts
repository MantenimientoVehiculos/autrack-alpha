// ============================================
// 4. SERVICIO PRINCIPAL DE EXPORTACIÓN
// src/modules/reports/services/exportService.ts
// ============================================

import { ReportResponse } from '../models/report';
import { pdfService } from './pdfService';
import { excelService } from './excelService';
import { csvService } from './csvService';

interface ExportOptions {
    vehicleName: string;
    dateRange?: { start: string; end: string };
    filename?: string;
}

class ExportService {
    private generateFilename(vehicleName: string, format: string, dateRange?: { start: string; end: string }): string {
        const cleanVehicleName = vehicleName.replace(/[^a-zA-Z0-9]/g, '_');
        const dateStr = dateRange
            ? `_${dateRange.start}_${dateRange.end}`
            : '_completo';
        const timestamp = new Date().toISOString().split('T')[0];

        return `Reporte_${cleanVehicleName}${dateStr}_${timestamp}.${format}`;
    }

    private downloadBlob(blob: Blob, filename: string) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Limpiar URL temporal después de un pequeño delay
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 100);
    }

    async exportToPDF(data: ReportResponse, options: ExportOptions): Promise<void> {
        try {
            const blob = pdfService.generatePDF(data, options);
            const filename = options.filename || this.generateFilename(options.vehicleName, 'pdf', options.dateRange);
            this.downloadBlob(blob, filename);
        } catch (error) {
            console.error('Error exportando PDF:', error);
            throw new Error('No se pudo exportar el reporte en formato PDF');
        }
    }

    async exportToExcel(data: ReportResponse, options: ExportOptions): Promise<void> {
        try {
            const blob = excelService.generateExcel(data, options);
            const filename = options.filename || this.generateFilename(options.vehicleName, 'xlsx', options.dateRange);
            this.downloadBlob(blob, filename);
        } catch (error) {
            console.error('Error exportando Excel:', error);
            throw new Error('No se pudo exportar el reporte en formato Excel');
        }
    }

    async exportToCSV(data: ReportResponse, options: ExportOptions): Promise<void> {
        try {
            const blob = csvService.generateCSV(data, options);
            const filename = options.filename || this.generateFilename(options.vehicleName, 'csv', options.dateRange);
            this.downloadBlob(blob, filename);
        } catch (error) {
            console.error('Error exportando CSV:', error);
            throw new Error('No se pudo exportar el reporte en formato CSV');
        }
    }

    async exportReport(
        data: ReportResponse,
        format: 'pdf' | 'excel' | 'csv',
        options: ExportOptions
    ): Promise<void> {
        switch (format) {
            case 'pdf':
                return this.exportToPDF(data, options);
            case 'excel':
                return this.exportToExcel(data, options);
            case 'csv':
                return this.exportToCSV(data, options);
            default:
                throw new Error(`Formato no soportado: ${format}`);
        }
    }
}

export const exportService = new ExportService();