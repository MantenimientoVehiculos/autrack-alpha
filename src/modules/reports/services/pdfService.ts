import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
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

    private addHeader(doc: jsPDF, vehicleName: string, dateRange?: { start: string; end: string }): number {
        doc.setFontSize(20);
        doc.setTextColor(157, 126, 104);
        doc.text('REPORTE DE MANTENIMIENTO', 105, 25, { align: 'center' });

        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text(`Vehículo: ${vehicleName}`, 20, 40);

        if (dateRange) {
            doc.setFontSize(12);
            doc.setTextColor(100, 100, 100);
            doc.text(
                `Período: ${this.formatDate(dateRange.start)} - ${this.formatDate(dateRange.end)}`,
                20,
                50
            );
        }

        doc.setFontSize(10);
        doc.text(`Generado el: ${new Date().toLocaleDateString('es-EC')}`, 20, 60);

        doc.setDrawColor(157, 126, 104);
        doc.setLineWidth(0.5);
        doc.line(20, 65, 190, 65);

        return 75;
    }

    private addStatistics(doc: jsPDF, statistics: any, startY: number): number {
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('RESUMEN ESTADÍSTICO', 20, startY);

        const statsData = [
            ['Total de Registros', statistics.total_registros.toString()],
            ['Costo Total', this.formatCurrency(statistics.costo_total)],
            ['Costo Promedio', this.formatCurrency(statistics.costo_promedio)]
        ];

        autoTable(doc, {
            startY: startY + 10,
            head: [['Concepto', 'Valor']],
            body: statsData,
            theme: 'grid',
            headStyles: {
                fillColor: [157, 126, 104],
                textColor: 255,
                fontSize: 12,
                fontStyle: 'bold'
            },
            bodyStyles: { fontSize: 11 },
            columnStyles: {
                0: { cellWidth: 80 },
                1: { cellWidth: 80, halign: 'right' }
            }
        });

        return (doc as any).lastAutoTable.finalY + 20;
    }

    private addTypeBreakdown(doc: jsPDF, byType: any[], startY: number): number {
        if (!byType.length) return startY;

        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('RESUMEN POR TIPO DE MANTENIMIENTO', 20, startY);

        const typeData = byType.map(type => [
            type.nombre,
            type.cantidad.toString(),
            this.formatCurrency(type.costo_total),
            this.formatCurrency(type.costo_total / type.cantidad)
        ]);

        autoTable(doc, {
            startY: startY + 10,
            head: [['Tipo de Mantenimiento', 'Cantidad', 'Costo Total', 'Costo Promedio']],
            body: typeData,
            theme: 'grid',
            headStyles: {
                fillColor: [157, 126, 104],
                textColor: 255,
                fontSize: 11,
                fontStyle: 'bold'
            },
            bodyStyles: { fontSize: 10 },
            columnStyles: {
                0: { cellWidth: 80 },
                1: { cellWidth: 30, halign: 'center' },
                2: { cellWidth: 40, halign: 'right' },
                3: { cellWidth: 40, halign: 'right' }
            }
        });

        return (doc as any).lastAutoTable.finalY + 20;
    }

    private addMaintenanceRecords(
        doc: jsPDF,
        records: ReportMaintenanceRecord[],
        startY: number
    ): number {
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('DETALLE DE MANTENIMIENTOS', 20, startY);

        const tableData = records.map(record => [
            this.formatDate(record.fecha),
            record.tipo_mantenimiento.nombre,
            record.kilometraje.toLocaleString(),
            this.formatCurrency(record.costo),
            record.notas || '-'
        ]);

        autoTable(doc, {
            startY: startY + 10,
            head: [['Fecha', 'Tipo', 'Kilometraje', 'Costo', 'Notas']],
            body: tableData,
            theme: 'striped',
            headStyles: {
                fillColor: [157, 126, 104],
                textColor: 255,
                fontSize: 10,
                fontStyle: 'bold'
            },
            bodyStyles: { fontSize: 9 },
            columnStyles: {
                0: { cellWidth: 25 },
                1: { cellWidth: 45 },
                2: { cellWidth: 25, halign: 'right' },
                3: { cellWidth: 25, halign: 'right' },
                4: { cellWidth: 70 }
            },
            styles: { cellPadding: 3, fontSize: 9 }
        });

        return (doc as any).lastAutoTable.finalY + 20;
    }

    private addFooter(doc: jsPDF): void {
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(128, 128, 128);
            doc.text(
                `Página ${i} de ${pageCount}`,
                105,
                doc.internal.pageSize.height - 10,
                { align: 'center' }
            );
            doc.text(
                'Generado por Sistema de Gestión Vehicular',
                105,
                doc.internal.pageSize.height - 5,
                { align: 'center' }
            );
        }
    }

    public generatePDF(data: ReportResponse, options: PDFOptions): Blob {
        const doc = new jsPDF();

        let currentY = this.addHeader(doc, options.vehicleName, options.dateRange);
        currentY = this.addStatistics(doc, data.estadisticas, currentY);

        if (currentY > 200) {
            doc.addPage();
            currentY = 20;
        }

        currentY = this.addTypeBreakdown(doc, data.por_tipo, currentY);

        if (currentY > 150) {
            doc.addPage();
            currentY = 20;
        }

        this.addMaintenanceRecords(doc, data.registros, currentY);
        this.addFooter(doc);

        return doc.output('blob');
    }
}

export const pdfService = new PDFService();