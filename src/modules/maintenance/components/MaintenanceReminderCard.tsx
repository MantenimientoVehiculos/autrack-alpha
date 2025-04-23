// src/modules/maintenance/components/MaintenanceReminderCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { Card } from '@/src/shared/components/ui/Card';
import { Button } from '@/src/shared/components/ui/Button';
import { NextMaintenanceItem } from '../models/maintenance';

interface MaintenanceReminderCardProps {
    item: NextMaintenanceItem;
    onScheduleMaintenance: (typeId: number) => void;
}

export const MaintenanceReminderCard: React.FC<MaintenanceReminderCardProps> = ({
    item,
    onScheduleMaintenance
}) => {
    const { theme } = useAppTheme();

    // Formatear fecha
    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        return date.toLocaleDateString();
    };

    // Determinar color de estado basado en días restantes y km restantes
    const getStatusColor = () => {
        // Si está vencido por tiempo o por km
        if (item.status.time_status.is_due || item.status.km_status.is_due) {
            return '#F44336'; // Rojo
        }

        // Si está próximo por tiempo o por km
        if (item.status.time_status.is_upcoming || item.status.km_status.is_upcoming) {
            return '#FFC107'; // Amarillo
        }

        // Si está a tiempo
        return '#4CAF50'; // Verde
    };

    // Determinar texto del estado
    const getStatusText = () => {
        // Si está vencido por tiempo
        if (item.status.time_status.is_due) {
            return 'Vencido';
        }

        // Si está vencido por km
        if (item.status.km_status.is_due) {
            return 'Kilometraje excedido';
        }

        // Si está próximo por tiempo
        if (item.status.time_status.is_upcoming) {
            return `Próximo en ${item.status.time_status.days_remaining} días`;
        }

        // Si está próximo por km
        if (item.status.km_status.is_upcoming) {
            return `Próximo en ${item.status.km_status.km_remaining} km`;
        }

        // Si está a tiempo
        return 'Al día';
    };

    // Colores según el tema
    const textColor = theme === 'dark' ? '#F9F9F9' : '#313131';
    const secondaryTextColor = theme === 'dark' ? '#BBBBBB' : '#666666';
    const statusColor = getStatusColor();

    return (
        <Card variant="elevated" style={styles.card}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: textColor }]}>
                    {item.type.nombre}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                    <Text style={styles.statusText}>
                        {getStatusText()}
                    </Text>
                </View>
            </View>

            <View style={styles.infoContainer}>
                <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: secondaryTextColor }]}>
                        Último servicio:
                    </Text>
                    <Text style={[styles.infoValue, { color: textColor }]}>
                        {formatDate(item.last_maintenance_date)}
                    </Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: secondaryTextColor }]}>
                        Kilometraje último servicio:
                    </Text>
                    <Text style={[styles.infoValue, { color: textColor }]}>
                        {item.last_maintenance_km.toLocaleString()} km
                    </Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: secondaryTextColor }]}>
                        Próximo servicio por fecha:
                    </Text>
                    <Text style={[styles.infoValue, { color: textColor }]}>
                        {formatDate(item.next_maintenance.by_date)}
                    </Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: secondaryTextColor }]}>
                        Próximo servicio por km:
                    </Text>
                    <Text style={[styles.infoValue, { color: textColor }]}>
                        {item.next_maintenance.by_km.toLocaleString()} km
                    </Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: secondaryTextColor }]}>
                        Costo estimado:
                    </Text>
                    <Text style={[styles.infoValue, { color: textColor }]}>
                        ${item.config.estimated_cost.toFixed(2)}
                    </Text>
                </View>
            </View>

            <Button
                buttonVariant="outline"
                buttonSize="medium"
                onPress={() => onScheduleMaintenance(item.type_id)}
                style={styles.scheduleButton}
            >
                Registrar mantenimiento
            </Button>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginVertical: 8,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    infoContainer: {
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    infoLabel: {
        fontSize: 14,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '500',
    },
    scheduleButton: {
        marginTop: 8,
    },
});

export default MaintenanceReminderCard;