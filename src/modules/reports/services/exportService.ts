import * as Sharing from 'expo-sharing';
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
    private async shareFile(fileUri: string, mimeType: string, dialogTitle: string): Promise<void> {
        try {
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri, {
                    mimeType,
                    dialogTitle,
                    UTI: this.getUTI(mimeType),
                });
            } else {
                throw new Error('Compartir no está disponible en este dispositivo');
            }
        } catch (error) {
            console.error('Error compartiendo archivo:', error);
            throw error;
        }
    }

    private getUTI(mimeType: string): string {
        switch (mimeType) {
            case 'application/pdf':
                return 'com.adobe.pdf';
            case 'application/vnd.ms-excel':
                return 'com.microsoft.excel.xls';
            case 'text/csv':
                return 'public.comma-separated-values-text';
            default:
                return 'public.data';
        }
    }

    async exportToPDF(data: ReportResponse, options: ExportOptions): Promise<void> {
        try {
            const fileUri = await pdfService.generatePDF(data, options);
            await this.shareFile(fileUri, 'application/pdf', 'Compartir Reporte PDF');
        } catch (error) {
            console.error('Error exportando PDF:', error);
            throw new Error('No se pudo exportar el reporte en formato PDF');
        }
    }

    async exportToExcel(data: ReportResponse, options: ExportOptions): Promise<void> {
        try {
            const fileUri = await excelService.generateExcel(data, options);
            await this.shareFile(fileUri, 'application/vnd.ms-excel', 'Compartir Reporte Excel');
        } catch (error) {
            console.error('Error exportando Excel:', error);
            throw new Error('No se pudo exportar el reporte en formato Excel');
        }
    }

    async exportToCSV(data: ReportResponse, options: ExportOptions): Promise<void> {
        try {
            const fileUri = await csvService.generateCSV(data, options);
            await this.shareFile(fileUri, 'text/csv', 'Compartir Reporte CSV');
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