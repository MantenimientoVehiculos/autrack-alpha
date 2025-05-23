import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { ReportResponse, ReportMaintenanceRecord } from '../models/report';

interface PDFOptions {
    vehicleName: string;
    dateRange?: { start: string; end: string };
    logoUrl?: string;
}

class PDFService {
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
        } catch {
            return dateString;
        }
    }

    private generateHTML(data: ReportResponse, options: PDFOptions): string {
        const currentDate = new Date().toLocaleDateString('es-EC');
        const periodText = options.dateRange 
            ? `${this.formatDate(options.dateRange.start)} - ${this.formatDate(options.dateRange.end)}`
            : 'Todos los registros';

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Reporte de Mantenimiento</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Helvetica Neue', Arial, sans-serif;
                    font-size: 12px;
                    line-height: 1.4;
                    color: #333;
                    padding: 20px;
                    background: white;
                }
                
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    border-bottom: 2px solid #9D7E68;
                    padding-bottom: 20px;
                }
                
                .header h1 {
                    color: #9D7E68;
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 10px;
                }
                
                .header-info {
                    text-align: left;
                    margin-top: 15px;
                }
                
                .header-info p {
                    margin: 5px 0;
                    font-size: 14px;
                }
                
                .section {
                    margin-bottom: 25px;
                }
                
                .section-title {
                    font-size: 16px;
                    font-weight: bold;
                    color: #333;
                    margin-bottom: 10px;
                    border-bottom: 1px solid #ddd;
                    padding-bottom: 5px;
                }
                
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 15px;
                    font-size: 11px;
                }
                
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                    vertical-align: top;
                }
                
                th {
                    background-color: #9D7E68;
                    color: white;
                    font-weight: bold;
                    text-align: center;
                }
                
                .stats-table td:last-child {
                    text-align: right;
                    font-weight: bold;
                }
                
                .records-table tr:nth-child(even) {
                    background-color: #f9f9f9;
                }
                
                .records-table td:nth-child(3),
                .records-table td:nth-child(4) {
                    text-align: right;
                }
                
                .type-table td:nth-child(2),
                .type-table td:nth-child(3),
                .type-table td:nth-child(4) {
                    text-align: right;
                }
                
                .footer {
                    margin-top: 40px;
                    text-align: center;
                    font-size: 10px;
                    color: #888;
                    border-top: 1px solid #ddd;
                    padding-top: 10px;
                }
                
                .page-break {
                    page-break-before: always;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>REPORTE DE MANTENIMIENTO</h1>
                <div class="header-info">
                    <p><strong>Vehículo:</strong> ${options.vehicleName}</p>
                    <p><strong>Período:</strong> ${periodText}</p>
                    <p><strong>Generado:</strong> ${currentDate}</p>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">RESUMEN ESTADÍSTICO</h2>
                <table class="stats-table">
                    <thead>
                        <tr>
                            <th>Concepto</th>
                            <th>Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Total de Registros</td>
                            <td>${data.estadisticas.total_registros}</td>
                        </tr>
                        <tr>
                            <td>Costo Total</td>
                            <td>${this.formatCurrency(data.estadisticas.costo_total)}</td>
                        </tr>
                        <tr>
                            <td>Costo Promedio</td>
                            <td>${this.formatCurrency(data.estadisticas.costo_promedio)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            ${data.por_tipo.length > 0 ? `
            <div class="section">
                <h2 class="section-title">RESUMEN POR TIPO DE MANTENIMIENTO</h2>
                <table class="type-table">
                    <thead>
                        <tr>
                            <th>Tipo de Mantenimiento</th>
                            <th>Cantidad</th>
                            <th>Costo Total</th>
                            <th>Costo Promedio</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.por_tipo.map(type => `
                        <tr>
                            <td>${type.nombre}</td>
                            <td>${type.cantidad}</td>
                            <td>${this.formatCurrency(type.costo_total)}</td>
                            <td>${this.formatCurrency(type.costo_total / type.cantidad)}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            ` : ''}

            <div class="page-break"></div>

            <div class="section">
                <h2 class="section-title">DETALLE DE MANTENIMIENTOS</h2>
                <table class="records-table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Tipo</th>
                            <th>Kilometraje</th>
                            <th>Costo</th>
                            <th>Notas</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.registros.map(record => `
                        <tr>
                            <td>${this.formatDate(record.fecha)}</td>
                            <td>${record.tipo_mantenimiento.nombre}</td>
                            <td>${record.kilometraje.toLocaleString()}</td>
                            <td>${this.formatCurrency(record.costo)}</td>
                            <td>${record.notas || '-'}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <div class="footer">
                <p>Generado por Sistema de Gestión Vehicular</p>
            </div>
        </body>
        </html>
        `;
    }

    public async generatePDF(data: ReportResponse, options: PDFOptions): Promise<string> {
        try {
            const html = this.generateHTML(data, options);
            
            const { uri } = await Print.printToFileAsync({
                html,
                base64: false,
                width: 612,
                height: 792,
                margins: {
                    left: 40,
                    top: 40,
                    right: 40,
                    bottom: 40,
                },
            });

            return uri;
        } catch (error) {
            console.error('Error generando PDF:', error);
            throw new Error('No se pudo generar el archivo PDF');
        }
    }

    public async exportarReporteComoPDF(html: string): Promise<void> {
        try {
            const { uri } = await Print.printToFileAsync({
                html,
                base64: false,
                width: 612,
                height: 792,
                margins: {
                    left: 40,
                    top: 40,
                    right: 40,
                    bottom: 40,
                },
            });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri, {
                    mimeType: 'application/pdf',
                    dialogTitle: 'Compartir Reporte',
                    UTI: 'com.adobe.pdf',
                });
            } else {
                throw new Error('Compartir no está disponible en este dispositivo');
            }
        } catch (error) {
            console.error('Error exportando PDF:', error);
            throw new Error('No se pudo exportar el archivo PDF');
        }
    }
}

export const pdfService = new PDFService();