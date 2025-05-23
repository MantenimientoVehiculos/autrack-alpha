import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { Card } from '@/src/shared/components/ui/Card';
import { ReportStatistics, ReportByType } from '../models/report';
import { ExportFormatSelector } from './ExportFormatSelector';

interface ReportCardProps {
    statistics: ReportStatistics;
    byType?: ReportByType[];
    vehicleName?: string;
    dateRange?: { start: string, end: string };
    onExport?: (format: 'pdf' | 'excel' | 'csv') => Promise<{ success: boolean; error?: string; message?: string }>;
    isExporting?: boolean;
}

export const ReportCard: React.FC<ReportCardProps> = ({
    statistics,
    byType = [],
    vehicleName,
    dateRange,
    onExport,
    isExporting = false
}) => {
    const { theme } = useAppTheme();
    const [showFormatSelector, setShowFormatSelector] = useState(false);

    const textColor = theme === 'dark' ? '#F9F9F9' : '#313131';
    const secondaryTextColor = theme === 'dark' ? '#BBBBBB' : '#666666';
    const accentColor = theme === 'dark' ? '#B27046' : '#9D7E68';
    const cardBgColor = theme === 'dark' ? '#222222' : '#FFFFFF';
    const highlightBgColor = theme === 'dark' ? '#333333' : '#F9F9F9';
    const borderColor = theme === 'dark' ? '#444444' : '#EEEEEE';

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-EC');
        } catch (error) {
            return dateString;
        }
    };

    const handleExportClick = () => {
        if (!onExport) return;
        setShowFormatSelector(true);
    };

    const handleFormatSelected = async (format: 'pdf' | 'excel' | 'csv') => {
        if (!onExport) return;

        try {
            const result = await onExport(format);

            if (result.success) {
                Alert.alert(
                    'Éxito',
                    result.message || `Reporte exportado en formato ${format.toUpperCase()}`,
                    [{ text: 'OK' }]
                );
            } else {
                Alert.alert(
                    'Error',
                    result.error || 'No se pudo exportar el reporte',
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            Alert.alert(
                'Error',
                'Ocurrió un error inesperado al exportar el reporte',
                [{ text: 'OK' }]
            );
        } finally {
            setShowFormatSelector(false);
        }
    };

    const handleFormatCancel = () => {
        setShowFormatSelector(false);
    };

    return (
        <>
            <Card style={[styles.container, { backgroundColor: cardBgColor }]}>
                {/* Encabezado con información del vehículo y período */}
                {(vehicleName || dateRange) && (
                    <View style={styles.header}>
                        {vehicleName && (
                            <Text style={[styles.vehicleName, { color: textColor }]}>
                                {vehicleName}
                            </Text>
                        )}

                        {dateRange && (
                            <View style={[styles.dateRangeContainer, { backgroundColor: highlightBgColor, borderColor }]}>
                                <Text style={[styles.dateRangeLabel, { color: secondaryTextColor }]}>
                                    Período:
                                </Text>
                                <Text style={[styles.dateRange, { color: textColor }]}>
                                    {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Estadísticas generales */}
                <View style={[styles.statsContainer, { backgroundColor: highlightBgColor, borderColor }]}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: textColor }]}>
                            {statistics.total_registros}
                        </Text>
                        <Text style={[styles.statLabel, { color: secondaryTextColor }]}>
                            Registros
                        </Text>
                    </View>

                    <View style={[styles.divider, { backgroundColor: borderColor }]} />

                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: accentColor }]}>
                            ${Number(statistics.costo_total).toFixed(2)}
                        </Text>
                        <Text style={[styles.statLabel, { color: secondaryTextColor }]}>
                            Costo Total
                        </Text>
                    </View>

                    <View style={[styles.divider, { backgroundColor: borderColor }]} />

                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: textColor }]}>
                            ${Number(statistics.costo_promedio).toFixed(2)}
                        </Text>
                        <Text style={[styles.statLabel, { color: secondaryTextColor }]}>
                            Promedio
                        </Text>
                    </View>
                </View>

                {/* Listado por tipo */}
                {byType.length > 0 && (
                    <View style={styles.typesContainer}>
                        <Text style={[styles.sectionTitle, { color: textColor }]}>
                            Resumen por Tipo
                        </Text>

                        {byType.slice(0, 4).map((type, index) => (
                            <View
                                key={type.id}
                                style={[
                                    styles.typeItem,
                                    index !== byType.slice(0, 4).length - 1 && { borderBottomWidth: 1, borderBottomColor: borderColor }
                                ]}
                            >
                                <View style={styles.typeInfo}>
                                    <Text
                                        style={[styles.typeName, { color: textColor }]}
                                        numberOfLines={1}
                                        ellipsizeMode="tail"
                                    >
                                        {type.nombre}
                                    </Text>
                                    <View style={styles.typeMetrics}>
                                        <Text style={[styles.typeCount, { color: secondaryTextColor }]}>
                                            {type.cantidad} {type.cantidad === 1 ? 'registro' : 'registros'}
                                        </Text>
                                        <Text style={[styles.typeCost, { color: accentColor }]}>
                                            ${Number(type.costo_total || 0).toFixed(2)}
                                        </Text>
                                    </View>
                                </View>

                                {/* Indicador visual de porcentaje */}
                                <View style={[styles.percentBar, { backgroundColor: highlightBgColor }]}>
                                    <View
                                        style={[
                                            styles.percentFill,
                                            {
                                                width: `${(type.costo_total / statistics.costo_total) * 100}%`,
                                                backgroundColor: accentColor
                                            }
                                        ]}
                                    />
                                </View>
                            </View>
                        ))}

                        {byType.length > 4 && (
                            <Text style={[styles.moreTypes, { color: accentColor }]}>
                                + {byType.length - 4} más
                            </Text>
                        )}
                    </View>
                )}

                {/* Botón de exportar */}
                {onExport && (
                    <TouchableOpacity
                        style={[
                            styles.exportButton,
                            {
                                backgroundColor: isExporting ? `${accentColor}80` : accentColor
                            }
                        ]}
                        onPress={handleExportClick}
                        activeOpacity={0.8}
                        disabled={isExporting}
                    >
                        <Text style={styles.exportButtonText}>
                            {isExporting ? 'Exportando...' : 'Exportar Reporte'}
                        </Text>
                    </TouchableOpacity>
                )}
            </Card>

            {/* Modal de selección de formato */}
            {showFormatSelector && (
                <ExportFormatSelector
                    onFormatSelected={handleFormatSelected}
                    onCancel={handleFormatCancel}
                    isExporting={isExporting}
                />
            )}
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        marginBottom: 16,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    header: {
        marginBottom: 16,
    },
    vehicleName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    dateRangeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 8,
        borderWidth: 1,
    },
    dateRangeLabel: {
        fontSize: 14,
        marginRight: 8,
    },
    dateRange: {
        fontSize: 14,
        fontWeight: '500',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        borderRadius: 10,
        borderWidth: 1,
        padding: 12,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
    },
    divider: {
        width: 1,
        height: '100%',
        marginHorizontal: 10,
    },
    typesContainer: {
        marginVertical: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    typeItem: {
        paddingVertical: 12,
    },
    typeInfo: {
        marginBottom: 6,
    },
    typeName: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 4,
    },
    typeMetrics: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    typeCount: {
        fontSize: 12,
    },
    typeCost: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    percentBar: {
        height: 6,
        borderRadius: 3,
        marginTop: 4,
        overflow: 'hidden',
    },
    percentFill: {
        height: '100%',
        borderRadius: 3,
    },
    moreTypes: {
        textAlign: 'center',
        marginTop: 12,
        fontSize: 14,
    },
    exportButton: {
        marginTop: 20,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    exportButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default ReportCard;