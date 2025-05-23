import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
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

    private escapeXMLChars(str: string): string {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    private generateExcelXML(data: ReportResponse, options: ExcelOptions): string {
        const currentDate = new Date().toLocaleDateString('es-EC');
        const periodText = options.dateRange
            ? `${this.formatDate(options.dateRange.start)} - ${this.formatDate(options.dateRange.end)}`
            : 'Todos los registros';

        // Crear hojas de trabajo
        const infoSheet = `
            <Worksheet ss:Name="Información">
                <Table>
                    <Row><Cell><Data ss:Type="String">REPORTE DE MANTENIMIENTO</Data></Cell></Row>
                    <Row></Row>
                    <Row><Cell><Data ss:Type="String">Vehículo:</Data></Cell><Cell><Data ss:Type="String">${this.escapeXMLChars(options.vehicleName)}</Data></Cell></Row>
                    <Row><Cell><Data ss:Type="String">Período:</Data></Cell><Cell><Data ss:Type="String">${this.escapeXMLChars(periodText)}</Data></Cell></Row>
                    <Row><Cell><Data ss:Type="String">Generado:</Data></Cell><Cell><Data ss:Type="String">${currentDate}</Data></Cell></Row>
                    <Row></Row>
                    <Row><Cell><Data ss:Type="String">RESUMEN ESTADÍSTICO</Data></Cell></Row>
                    <Row><Cell><Data ss:Type="String">Total de Registros:</Data></Cell><Cell><Data ss:Type="Number">${data.estadisticas.total_registros}</Data></Cell></Row>
                    <Row><Cell><Data ss:Type="String">Costo Total:</Data></Cell><Cell><Data ss:Type="Number">${data.estadisticas.costo_total}</Data></Cell></Row>
                    <Row><Cell><Data ss:Type="String">Costo Promedio:</Data></Cell><Cell><Data ss:Type="Number">${data.estadisticas.costo_promedio}</Data></Cell></Row>
                </Table>
            </Worksheet>
        `;

        const recordsSheet = `
            <Worksheet ss:Name="Registros">
                <Table>
                    <Row>
                        <Cell><Data ss:Type="String">Fecha</Data></Cell>
                        <Cell><Data ss:Type="String">Tipo de Mantenimiento</Data></Cell>
                        <Cell><Data ss:Type="String">Categoría</Data></Cell>
                        <Cell><Data ss:Type="String">Kilometraje</Data></Cell>
                        <Cell><Data ss:Type="String">Costo</Data></Cell>
                        <Cell><Data ss:Type="String">Notas</Data></Cell>
                    </Row>
                    ${data.registros.map(record => `
                    <Row>
                        <Cell><Data ss:Type="String">${this.formatDate(record.fecha)}</Data></Cell>
                        <Cell><Data ss:Type="String">${this.escapeXMLChars(record.tipo_mantenimiento.nombre)}</Data></Cell>
                        <Cell><Data ss:Type="String">${this.escapeXMLChars(record.tipo_mantenimiento.categoria.nombre)}</Data></Cell>
                        <Cell><Data ss:Type="Number">${record.kilometraje}</Data></Cell>
                        <Cell><Data ss:Type="Number">${record.costo}</Data></Cell>
                        <Cell><Data ss:Type="String">${this.escapeXMLChars(record.notas || '')}</Data></Cell>
                    </Row>
                    `).join('')}
                </Table>
            </Worksheet>
        `;

        const typeSheet = data.por_tipo.length > 0 ? `
            <Worksheet ss:Name="Por Tipo">
                <Table>
                    <Row>
                        <Cell><Data ss:Type="String">Tipo de Mantenimiento</Data></Cell>
                        <Cell><Data ss:Type="String">Cantidad</Data></Cell>
                        <Cell><Data ss:Type="String">Costo Total</Data></Cell>
                        <Cell><Data ss:Type="String">Costo Promedio</Data></Cell>
                    </Row>
                    ${data.por_tipo.map(type => `
                    <Row>
                        <Cell><Data ss:Type="String">${this.escapeXMLChars(type.nombre)}</Data></Cell>
                        <Cell><Data ss:Type="Number">${type.cantidad}</Data></Cell>
                        <Cell><Data ss:Type="Number">${type.costo_total}</Data></Cell>
                        <Cell><Data ss:Type="Number">${type.costo_total / type.cantidad}</Data></Cell>
                    </Row>
                    `).join('')}
                </Table>
            </Worksheet>
        ` : '';

        return `<?xml version="1.0"?>
        <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
         xmlns:o="urn:schemas-microsoft-com:office:office"
         xmlns:x="urn:schemas-microsoft-com:office:excel"
         xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
         xmlns:html="http://www.w3.org/TR/REC-html40">
            ${infoSheet}
            ${recordsSheet}
            ${typeSheet}
        </Workbook>`;
    }

    public async generateExcel(data: ReportResponse, options: ExcelOptions): Promise<string> {
        try {
            const xmlContent = this.generateExcelXML(data, options);

            // Crear archivo temporal
            const fileName = `reporte_${options.vehicleName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.xls`;
            const fileUri = `${FileSystem.documentDirectory}${fileName}`;

            await FileSystem.writeAsStringAsync(fileUri, xmlContent, {
                encoding: FileSystem.EncodingType.UTF8,
            });

            return fileUri;
        } catch (error) {
            console.error('Error generando Excel:', error);
            throw new Error('No se pudo generar el archivo Excel');
        }
    }
}

export const excelService = new ExcelService();