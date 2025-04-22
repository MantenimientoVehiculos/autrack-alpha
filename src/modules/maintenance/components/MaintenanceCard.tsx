// src/modules/maintenance/components/MaintenanceCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { Card } from '@/src/shared/components/ui/Card';
import { TrashIcon } from '@/src/shared/components/ui/Icons';
import { MaintenanceRecord } from '../models/maintenance';

interface MaintenanceCardProps {
    record: MaintenanceRecord;
    onDelete?: (id: number) => void;
}

export const MaintenanceCard: React.FC<MaintenanceCardProps> = ({ record, onDelete }) => {
    const { theme } = useAppTheme();

    const {
        id_registro,
        fecha,
        kilometraje,
        costo,
        tipo_mantenimiento
    } = record;

    // Formatear la fecha
    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        return date.toLocaleDateString();
    };

    // Manejar la eliminación
    const handleDelete = (e: any) => {
        e.stopPropagation();
        if (id_registro && onDelete) {
            onDelete(id_registro);
        }
    };

    // Colores según el tema
    const textColor = theme === 'dark' ? '#F9F9F9' : '#313131';
    const secondaryTextColor = theme === 'dark' ? '#BBBBBB' : '#666666';

    return (
        <Card variant="elevated" style={styles.card}>
            <View style={styles.cardContent}>
                <View style={styles.mainInfo}>
                    <Text style={[styles.maintenanceType, { color: textColor }]}>
                        {tipo_mantenimiento?.nombre || 'Mantenimiento'}
                    </Text>

                    <View style={styles.dateKmContainer}>
                        <Text style={[styles.infoText, { color: secondaryTextColor }]}>
                            {formatDate(fecha)}
                        </Text>
                        <Text style={[styles.infoText, { color: secondaryTextColor }]}>
                            {kilometraje.toLocaleString()} km
                        </Text>
                    </View>
                </View>

                <View style={styles.costContainer}>
                    <Text style={[styles.costText, { color: theme === 'dark' ? '#B27046' : '#9D7E68' }]}>
                        ${costo.toFixed(2)}
                    </Text>

                    {onDelete && (
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={handleDelete}
                            accessibilityLabel="Eliminar mantenimiento"
                        >
                            <TrashIcon
                                size={18}
                                color="#CF6679"
                            />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginVertical: 6,
        marginHorizontal: 16,
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    mainInfo: {
        flex: 1,
    },
    maintenanceType: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    dateKmContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoText: {
        fontSize: 14,
        marginRight: 12,
    },
    costContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    costText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 8,
    },
    deleteButton: {
        padding: 4,
    },
});

export default MaintenanceCard;