import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
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

    private escapeCSVField(field: any): string {
        if (field === null || field === undefined) return '';

        const str = String(field);

        // Si contiene comas, comillas o saltos de línea, envolver en comillas
        if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
            // Escapar comillas duplicándolas
            return `"${str.replace(/"/g, '""')}"`;
        }

        return str;
    }

    private _generateCSV(data: ReportResponse, options: CSVOptions): string {
        try {
            // Cabecera del reporte
            const header = [
                '# REPORTE DE MANTENIMIENTO',
                `# Vehículo: ${options.vehicleName}`,
                `# Período: ${options.dateRange ? `${this.formatDate(options.dateRange.start)} - ${this.formatDate(options.dateRange.end)}` : 'Todos los registros'}`,
                `# Generado: ${new Date().toLocaleDateString('es-EC')}`,
                `# Total Registros: ${data.estadisticas.total_registros}`,
                `# Costo Total: $${data.estadisticas.costo_total.toFixed(2)}`,
                '#',
                ''
            ].join('\n');

            // Encabezados de las columnas
            const columnHeaders = [
                'Fecha',
                'Tipo de Mantenimiento',
                'Categoría',
                'Kilometraje',
                'Costo (USD)',
                'Notas'
            ];

            // Datos de los registros
            const csvRows = data.registros.map(record => [
                this.escapeCSVField(this.formatDate(record.fecha)),
                this.escapeCSVField(record.tipo_mantenimiento.nombre),
                this.escapeCSVField(record.tipo_mantenimiento.categoria.nombre),
                this.escapeCSVField(record.kilometraje),
                this.escapeCSVField(record.costo),
                this.escapeCSVField(record.notas || '')
            ]);

            // Construir CSV completo
            const csvContent = [
                header,
                columnHeaders.map(h => this.escapeCSVField(h)).join(','),
                ...csvRows.map(row => row.join(','))
            ].join('\n');

            return csvContent;
        } catch (error) {
            console.error('Error generando CSV:', error);
            throw new Error('No se pudo generar el archivo CSV');
        }
    }

    public async generateCSV(data: ReportResponse, options: CSVOptions): Promise<string> {
        try {
            const csvContent = this._generateCSV(data, options);

            // Crear archivo temporal
            const fileName = `reporte_${options.vehicleName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
            const fileUri = `${FileSystem.documentDirectory}${fileName}`;

            // Escribir archivo con BOM para compatibilidad con Excel
            const BOM = '\uFEFF';
            await FileSystem.writeAsStringAsync(fileUri, BOM + csvContent, {
                encoding: FileSystem.EncodingType.UTF8,
            });

            return fileUri;
        } catch (error) {
            console.error('Error generando CSV:', error);
            throw new Error('No se pudo generar el archivo CSV');
        }
    }
}

export const csvService = new CSVService();