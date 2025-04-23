// src/modules/reports/components/ReportCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { Card } from '@/src/shared/components/ui/Card';
import { ReportStatistics, ReportByType } from '../models/report';

interface ReportCardProps {
    statistics: ReportStatistics;
    byType?: ReportByType[];
    vehicleName?: string;
    dateRange?: { start: string, end: string };
    onExport?: () => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({
    statistics,
    byType = [],
    vehicleName,
    dateRange,
    onExport
}) => {
    const { theme } = useAppTheme();
    const textColor = theme === 'dark' ? '#F9F9F9' : '#313131';
    const secondaryTextColor = theme === 'dark' ? '#BBBBBB' : '#666666';
    const accentColor = theme === 'dark' ? '#B27046' : '#9D7E68';

    // Formatear fechas
    const formatDate = (dateString?: string) => {
        if (!dateString) return '';

        try {
            const date = new Date(dateString);
            return date.toLocaleDateString();
        } catch (error) {
            return dateString;
        }
    };

    return (
        <Card style={styles.container}>
            {/* Encabezado con información del vehículo y período */}
            {(vehicleName || dateRange) && (
                <View style={styles.header}>
                    {vehicleName && (
                        <Text style={[styles.vehicleName, { color: textColor }]}>
                            {vehicleName}
                        </Text>
                    )}

                    {dateRange && (
                        <Text style={[styles.dateRange, { color: secondaryTextColor }]}>
                            {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
                        </Text>
                    )}
                </View>
            )}

            {/* Estadísticas generales */}
            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: textColor }]}>
                        {statistics.total_registros}
                    </Text>
                    <Text style={[styles.statLabel, { color: secondaryTextColor }]}>
                        Registros
                    </Text>
                </View>

                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: textColor }]}>
                        ${statistics.costo_total.toFixed(2)}
                    </Text>
                    <Text style={[styles.statLabel, { color: secondaryTextColor }]}>
                        Costo Total
                    </Text>
                </View>

                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: textColor }]}>
                        ${statistics.costo_promedio.toFixed(2)}
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
                        Por Tipo de Mantenimiento
                    </Text>

                    {byType.slice(0, 3).map(type => (
                        <View key={type.id} style={styles.typeItem}>
                            <View style={styles.typeInfo}>
                                <Text
                                    style={[styles.typeName, { color: textColor }]}
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                >
                                    {type.nombre}
                                </Text>
                                <Text style={[styles.typeCount, { color: secondaryTextColor }]}>
                                    {type.cantidad} {type.cantidad === 1 ? 'registro' : 'registros'}
                                </Text>
                            </View>
                            <Text style={[styles.typeCost, { color: accentColor }]}>
                                ${type.costo_total.toFixed(2)}
                            </Text>
                        </View>
                    ))}

                    {byType.length > 3 && (
                        <Text style={[styles.moreTypes, { color: accentColor }]}>
                            + {byType.length - 3} más
                        </Text>
                    )}
                </View>
            )}

            {/* Botón de exportar */}
            {onExport && (
                <TouchableOpacity
                    style={[styles.exportButton, { backgroundColor: accentColor }]}
                    onPress={onExport}
                >
                    <Text style={styles.exportButtonText}>
                        Exportar Reporte
                    </Text>
                </TouchableOpacity>
            )}
        </Card>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        marginBottom: 16,
    },
    header: {
        marginBottom: 16,
    },
    vehicleName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    dateRange: {
        fontSize: 14,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
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
    typesContainer: {
        marginVertical: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    typeItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    typeInfo: {
        flex: 1,
    },
    typeName: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 2,
    },
    typeCount: {
        fontSize: 12,
    },
    typeCost: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    moreTypes: {
        textAlign: 'center',
        marginTop: 8,
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