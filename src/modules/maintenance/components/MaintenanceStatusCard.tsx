// src/modules/maintenance/components/MaintenanceStatusCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { Card } from '@/src/shared/components/ui/Card';
import { Button } from '@/src/shared/components/ui/Button';
import { MaintenanceRecord } from '../models/maintenance';
import { Vehicle } from '@/src/modules/vehicles/models/vehicle';
import { CarIcon } from '@/src/shared/components/ui/Icons';

interface MaintenanceStatusCardProps {
    vehicle: Vehicle;
    nextMaintenance?: {
        date: string;
        type: string;
    };
    maintenanceStatus: number; // Porcentaje de 0 a 100
    onScheduleMaintenance: () => void;
}

export const MaintenanceStatusCard: React.FC<MaintenanceStatusCardProps> = ({
    vehicle,
    nextMaintenance,
    maintenanceStatus,
    onScheduleMaintenance
}) => {
    const { theme } = useAppTheme();

    // Colores según el tema
    const textColor = theme === 'dark' ? '#F9F9F9' : '#313131';
    const secondaryTextColor = theme === 'dark' ? '#BBBBBB' : '#666666';
    const bgColor = theme === 'dark' ? '#222222' : '#FFFFFF';

    // Formatear fecha
    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        return date.toLocaleDateString();
    };

    // Calcular el color de la barra de progreso basado en el estado
    const getStatusColor = () => {
        if (maintenanceStatus > 80) return '#4CAF50'; // Verde
        if (maintenanceStatus > 40) return '#FFC107'; // Amarillo
        return '#F44336'; // Rojo
    };

    return (
        <Card variant="elevated" style={styles.card}>
            <View style={styles.headerContainer}>
                <View style={styles.vehicleInfo}>
                    <Text style={[styles.vehicleName, { color: textColor }]}>
                        {vehicle.marca?.nombre} {vehicle.modelo?.nombre}
                    </Text>
                    <Text style={[styles.vehicleDetails, { color: secondaryTextColor }]}>
                        {vehicle.anio} - {vehicle.placa}
                    </Text>
                </View>
                <View style={styles.iconContainer}>
                    <CarIcon
                        size={32}
                        color={theme === 'dark' ? '#B27046' : '#9D7E68'}
                    />
                    {vehicle.color && (
                        <View
                            style={[styles.colorIndicator, { backgroundColor: vehicle.color }]}
                        />
                    )}
                </View>
            </View>

            <View style={styles.statusSection}>
                <View style={styles.statusRow}>
                    <Text style={[styles.statusLabel, { color: secondaryTextColor }]}>
                        Kilometraje
                    </Text>
                    <Text style={[styles.statusValue, { color: textColor }]}>
                        {vehicle.kilometraje_actual?.toLocaleString()} km
                    </Text>
                </View>

                <View style={styles.statusRow}>
                    <Text style={[styles.statusLabel, { color: secondaryTextColor }]}>
                        Último servicio
                    </Text>
                    <Text style={[styles.statusValue, { color: textColor }]}>
                        {nextMaintenance ? formatDate(nextMaintenance.date) : 'No registrado'}
                    </Text>
                </View>

                <View style={styles.statusRow}>
                    <Text style={[styles.statusLabel, { color: secondaryTextColor }]}>
                        Estado general
                    </Text>
                    <Text style={[styles.statusPercentage, { color: textColor }]}>
                        {maintenanceStatus}%
                    </Text>
                </View>

                <View style={styles.progressBarContainer}>
                    <View
                        style={[
                            styles.progressBar,
                            {
                                width: `${maintenanceStatus}%`,
                                backgroundColor: getStatusColor()
                            }
                        ]}
                    />
                </View>
            </View>

            <View style={styles.nextMaintenanceContainer}>
                <Text style={[styles.nextMaintenanceLabel, { color: textColor }]}>
                    Próximo Mantenimiento
                </Text>
                <Text style={[styles.nextMaintenanceDate, { color: theme === 'dark' ? '#B27046' : '#9D7E68' }]}>
                    {nextMaintenance ? formatDate(nextMaintenance.date) : 'No programado'}
                </Text>
            </View>

            <Button
                buttonVariant="primary"
                buttonSize="medium"
                onPress={onScheduleMaintenance}
                style={styles.scheduleButton}
            >
                Programar
            </Button>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginHorizontal: 16,
        marginVertical: 8,
        padding: 16,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    vehicleInfo: {
        flex: 1,
    },
    vehicleName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    vehicleDetails: {
        fontSize: 14,
    },
    iconContainer: {
        position: 'relative',
    },
    colorIndicator: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#FFF',
    },
    statusSection: {
        marginBottom: 16,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    statusLabel: {
        fontSize: 14,
    },
    statusValue: {
        fontSize: 14,
        fontWeight: '500',
    },
    statusPercentage: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    progressBarContainer: {
        height: 8,
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
        marginTop: 4,
        marginBottom: 8,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 4,
    },
    nextMaintenanceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    nextMaintenanceLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    nextMaintenanceDate: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    scheduleButton: {
        alignSelf: 'flex-end',
    },
});

export default MaintenanceStatusCard;