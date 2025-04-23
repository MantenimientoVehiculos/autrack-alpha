// src/modules/maintenance/components/MaintenanceStatusCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { Card } from '@/src/shared/components/ui/Card';
import { Button } from '@/src/shared/components/ui/Button';
import { CarIcon } from '@/src/shared/components/ui/Icons';
import { Vehicle } from '@/src/modules/vehicles/models/vehicle';

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
            {/* Header del vehículo */}
            <View style={styles.vehicleHeader}>
                <View>
                    <Text style={[styles.vehicleName, { color: textColor }]}>
                        {vehicle.marca?.nombre} {vehicle.modelo?.nombre}
                    </Text>
                    <Text style={[styles.vehiclePlate, { color: secondaryTextColor }]}>
                        {vehicle.anio} {vehicle.placa}
                    </Text>
                </View>
            </View>

            {/* Imagen del vehículo / Icono */}
            <View style={styles.vehicleImageContainer}>
                <CarIcon size={48} color={theme === 'dark' ? '#B27046' : '#9D7E68'} />
            </View>

            {/* Información de kilometraje y servicio */}
            <View style={styles.infoRow}>
                <View style={styles.infoColumn}>
                    <Text style={[styles.infoLabel, { color: secondaryTextColor }]}>Kilometraje</Text>
                    <Text style={[styles.infoValue, { color: textColor }]}>
                        {vehicle.kilometraje_actual?.toLocaleString() || '0'}km
                    </Text>
                </View>

                <View style={styles.infoColumn}>
                    <Text style={[styles.infoLabel, { color: secondaryTextColor }]}>Último servicio</Text>
                    <Text style={[styles.infoValue, { color: textColor }]}>
                        {nextMaintenance ? formatDate(nextMaintenance.date) : 'No registrado'}
                    </Text>
                </View>
            </View>

            {/* Estado general con barra de progreso */}
            <View style={styles.statusContainer}>
                <View style={styles.statusLabelRow}>
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
                            { width: `${maintenanceStatus}%`, backgroundColor: getStatusColor() }
                        ]}
                    />
                </View>
            </View>

            {/* Próximo mantenimiento */}
            <View style={styles.nextMaintenanceContainer}>
                <View>
                    <Text style={[styles.nextMaintenanceLabel, { color: secondaryTextColor }]}>
                        Próximo Mantenimiento
                    </Text>
                    <Text style={[styles.nextMaintenanceDate, { color: textColor }]}>
                        {nextMaintenance ? formatDate(nextMaintenance.date) : '15/02/2025'}
                    </Text>
                </View>

                <Button
                    buttonVariant="primary"
                    buttonSize="small"
                    onPress={onScheduleMaintenance}
                    style={styles.scheduleButton}
                >
                    Programar
                </Button>
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginHorizontal: 0,
        marginVertical: 0,
        padding: 16,
        borderRadius: 12,
    },
    vehicleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    vehicleName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    vehiclePlate: {
        fontSize: 14,
    },
    vehicleImageContainer: {
        height: 120,
        backgroundColor: 'rgba(0,0,0,0.03)',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    infoColumn: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 14,
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '600',
    },
    statusContainer: {
        marginBottom: 16,
    },
    statusLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    statusLabel: {
        fontSize: 14,
    },
    statusPercentage: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    progressBarContainer: {
        height: 8,
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
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
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    nextMaintenanceLabel: {
        fontSize: 14,
        marginBottom: 4,
    },
    nextMaintenanceDate: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    scheduleButton: {
        paddingHorizontal: 16,
    },
});

export default MaintenanceStatusCard;