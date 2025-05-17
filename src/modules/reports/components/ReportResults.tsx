// src/modules/reports/components/ReportResults.tsx
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { Card } from '@/src/shared/components/ui/Card';
import { ReportMaintenanceRecord } from '../models/report';

interface ReportResultsProps {
    records: ReportMaintenanceRecord[];
    title?: string;
    onRecordPress?: (record: ReportMaintenanceRecord) => void;
}

export const ReportResults: React.FC<ReportResultsProps> = ({
    records,
    title = 'Registros de Mantenimiento',
    onRecordPress
}) => {
    const { theme } = useAppTheme();
    const textColor = theme === 'dark' ? '#F9F9F9' : '#313131';
    const secondaryTextColor = theme === 'dark' ? '#BBBBBB' : '#666666';
    const accentColor = theme === 'dark' ? '#B27046' : '#9D7E68';
    const borderColor = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

    // Formatear fecha para mostrar
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString();
        } catch (error) {
            return dateString;
        }
    };

    // Renderizar cada elemento de mantenimiento
    const renderMaintenanceItem = ({ item }: { item: ReportMaintenanceRecord }) => (
        <TouchableOpacity
            style={[styles.recordItem, { borderBottomColor: borderColor }]}
            onPress={() => onRecordPress && onRecordPress(item)}
            disabled={!onRecordPress}
        >
            <View style={styles.recordHeader}>
                <Text style={[styles.recordType, { color: textColor }]}>
                    {item.tipo_mantenimiento.nombre}
                </Text>
                <Text style={[styles.recordCost, { color: accentColor }]}>
                    ${item.costo.toFixed(2)}
                </Text>
            </View>

            <View style={styles.recordDetails}>
                <View style={styles.recordDetail}>
                    <Text style={[styles.recordDetailLabel, { color: secondaryTextColor }]}>
                        Fecha:
                    </Text>
                    <Text style={[styles.recordDetailValue, { color: textColor }]}>
                        {formatDate(item.fecha)}
                    </Text>
                </View>

                <View style={styles.recordDetail}>
                    <Text style={[styles.recordDetailLabel, { color: secondaryTextColor }]}>
                        Kilometraje:
                    </Text>
                    <Text style={[styles.recordDetailValue, { color: textColor }]}>
                        {item.kilometraje.toLocaleString()} km
                    </Text>
                </View>
            </View>

            {item.notas && (
                <Text style={[styles.recordNotes, { color: textColor }]}>
                    {item.notas}
                </Text>
            )}
        </TouchableOpacity>
    );

    return (
        <Card style={styles.container}>
            <Text style={[styles.title, { color: textColor }]}>
                {title} ({records.length})
            </Text>

            {records.length === 0 ? (
                <Text style={[styles.emptyText, { color: secondaryTextColor }]}>
                    No se encontraron registros de mantenimiento con los filtros seleccionados.
                </Text>
            ) : (
                <FlatList
                    data={records}
                    renderItem={renderMaintenanceItem}
                    keyExtractor={(item) => item.id_registro.toString()}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={false} // La pantalla principal ya tiene scroll
                    style={styles.list}
                />
            )}
        </Card>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    list: {
        maxHeight: 500, // Limitar altura máxima
    },
    recordItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        marginBottom: 8,
    },
    recordHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    recordType: {
        fontSize: 16,
        fontWeight: '600',
    },
    recordCost: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    recordDetails: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    recordDetail: {
        flexDirection: 'row',
        marginRight: 16,
        marginBottom: 4,
    },
    recordDetailLabel: {
        fontSize: 14,
        marginRight: 4,
    },
    recordDetailValue: {
        fontSize: 14,
    },
    recordNotes: {
        fontSize: 14,
        fontStyle: 'italic',
        marginTop: 8,
    },
    emptyText: {
        textAlign: 'center',
        padding: 16,
    }
});

export default ReportResults;