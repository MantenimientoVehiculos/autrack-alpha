// src/modules/maintenance/screens/MaintenanceScheduleScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { GradientHeader } from '@/src/shared/components/ui/GradientHeader';
import { Button } from '@/src/shared/components/ui/Button';
import { Card } from '@/src/shared/components/ui/Card';
import { useVehicles } from '@/src/modules/vehicles/hooks/useVehicles';
import { useMaintenance } from '../hooks/useMaintenance';
import MaintenanceReminderCard from '../components/MaintenanceReminderCard';

export const MaintenanceScheduleScreen: React.FC = () => {
    const router = useRouter();
    const params = useLocalSearchParams<{ vehicleId: string }>();
    const { theme } = useAppTheme();

    const vehicleId = params.vehicleId ? parseInt(params.vehicleId) : 0;
    const { vehicles, loadVehicles } = useVehicles();
    const {
        nextMaintenance,
        loadNextMaintenance,
        checkMaintenance,
        isLoading,
        error
    } = useMaintenance(vehicleId);

    const [refreshing, setRefreshing] = useState(false);
    const vehicle = vehicles.find(v => v.id_vehiculo === vehicleId);

    // Cargar datos al montar el componente
    useEffect(() => {
        if (vehicleId) {
            if (!vehicle) {
                loadVehicles();
            }
            loadNextMaintenance(vehicleId);
        } else {
            router.replace('/vehicles');
        }
    }, [vehicleId, vehicle, loadVehicles, loadNextMaintenance, router]);

    // Manejar recarga manual
    const handleRefresh = async () => {
        setRefreshing(true);
        await loadNextMaintenance(vehicleId);
        setRefreshing(false);
    };

    // Verificar mantenimientos manualmente
    const handleCheckMaintenance = async () => {
        try {
            const result = await checkMaintenance(vehicleId);
            if (result.success) {
                Alert.alert('Éxito', result.message);
                // Recargar información del próximo mantenimiento
                loadNextMaintenance(vehicleId);
            } else {
                Alert.alert('Error', result.error || 'No se pudo verificar el mantenimiento');
            }
        } catch (error) {
            Alert.alert('Error', 'Ocurrió un error al verificar el mantenimiento');
        }
    };

    // Navegar a la pantalla de añadir mantenimiento
    const handleScheduleMaintenance = (typeId?: number) => {
        const route = `/maintenance/add?vehicleId=${vehicleId}${typeId ? `&typeId=${typeId}` : ''}`;
        router.push(route as any);
    };

    // Colores según el tema
    const textColor = theme === 'dark' ? '#F9F9F9' : '#313131';
    const subtitleColor = theme === 'dark' ? '#BBBBBB' : '#666666';
    const bgColor = theme === 'dark' ? '#111111' : '#FFFFFF';

    // Mostrar pantalla de carga
    if (isLoading && !refreshing) {
        return (
            <View style={[styles.container, { backgroundColor: bgColor }]}>
                <GradientHeader
                    title="Programación de Mantenimiento"
                    showBackButton={true}
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme === 'dark' ? '#B27046' : '#9D7E68'} />
                    <Text style={[styles.loadingText, { color: textColor }]}>
                        Cargando información de mantenimiento...
                    </Text>
                </View>
            </View>
        );
    }

    // Mostrar error
    if (error) {
        return (
            <View style={[styles.container, { backgroundColor: bgColor }]}>
                <GradientHeader
                    title="Programación de Mantenimiento"
                    showBackButton={true}
                />
                <View style={styles.errorContainer}>
                    <Text style={[styles.errorText, { color: theme === 'dark' ? '#CF6679' : '#CF6679' }]}>
                        {error}
                    </Text>
                    <Button
                        buttonVariant="primary"
                        buttonSize="medium"
                        onPress={handleRefresh}
                        style={styles.retryButton}
                    >
                        Reintentar
                    </Button>
                </View>
            </View>
        );
    }

    // Si no hay vehículo
    if (!vehicle) {
        return (
            <View style={[styles.container, { backgroundColor: bgColor }]}>
                <GradientHeader
                    title="Programación de Mantenimiento"
                    showBackButton={true}
                />
                <View style={styles.errorContainer}>
                    <Text style={[styles.errorText, { color: textColor }]}>
                        No se encontró el vehículo
                    </Text>
                    <Button
                        buttonVariant="primary"
                        buttonSize="medium"
                        onPress={() => router.replace('/vehicles')}
                        style={styles.retryButton}
                    >
                        Volver a mis vehículos
                    </Button>
                </View>
            </View>
        );
    }

    // Si no hay información de próximo mantenimiento
    if (!nextMaintenance) {
        return (
            <View style={[styles.container, { backgroundColor: bgColor }]}>
                <GradientHeader
                    title="Programación de Mantenimiento"
                    showBackButton={true}
                />
                <ScrollView
                    style={styles.scrollContainer}
                    contentContainerStyle={styles.contentContainer}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            colors={[theme === 'dark' ? '#B27046' : '#9D7E68']}
                            tintColor={theme === 'dark' ? '#B27046' : '#9D7E68'}
                        />
                    }
                >
                    <Card variant="filled" style={styles.vehicleInfoCard}>
                        <Text style={[styles.vehicleTitle, { color: textColor }]}>
                            {vehicle.marca?.nombre} {vehicle.modelo?.nombre}
                        </Text>
                        <Text style={[styles.vehicleSubtitle, { color: subtitleColor }]}>
                            {vehicle.placa} - {vehicle.anio}
                        </Text>
                    </Card>

                    <View style={styles.emptyStateContainer}>
                        <Text style={[styles.emptyStateText, { color: textColor }]}>
                            No hay información de mantenimiento programado para este vehículo
                        </Text>
                        <Text style={[styles.emptyStateSubtext, { color: subtitleColor }]}>
                            Registre un mantenimiento para comenzar a programar futuros servicios
                        </Text>
                        <Button
                            buttonVariant="primary"
                            buttonSize="medium"
                            onPress={() => handleScheduleMaintenance()}
                            style={styles.addButton}
                        >
                            Registrar mantenimiento
                        </Button>
                    </View>
                </ScrollView>
            </View>
        );
    }

    // Renderizar pantalla con información de próximo mantenimiento
    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <GradientHeader
                title="Programación de Mantenimiento"
                showBackButton={true}
            />
            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.contentContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[theme === 'dark' ? '#B27046' : '#9D7E68']}
                        tintColor={theme === 'dark' ? '#B27046' : '#9D7E68'}
                    />
                }
            >
                <Card variant="filled" style={styles.vehicleInfoCard}>
                    <Text style={[styles.vehicleTitle, { color: textColor }]}>
                        {nextMaintenance.vehicle.brand} {nextMaintenance.vehicle.model}
                    </Text>
                    <Text style={[styles.vehicleSubtitle, { color: subtitleColor }]}>
                        {nextMaintenance.vehicle.plate} - {nextMaintenance.vehicle.year}
                    </Text>
                    <Text style={[styles.kilometrageText, { color: textColor }]}>
                        {nextMaintenance.vehicle.current_km.toLocaleString()} km
                    </Text>
                </Card>

                <View style={styles.summaryContainer}>
                    <Text style={[styles.sectionTitle, { color: textColor }]}>
                        Resumen de mantenimiento
                    </Text>
                    <View style={styles.summaryGrid}>
                        <View style={[styles.summaryItem, { backgroundColor: theme === 'dark' ? '#222222' : '#F5F5F5' }]}>
                            <Text style={[styles.summaryValue, { color: textColor }]}>
                                {nextMaintenance.summary.total_items}
                            </Text>
                            <Text style={[styles.summaryLabel, { color: subtitleColor }]}>
                                Total
                            </Text>
                        </View>
                        <View style={[styles.summaryItem, { backgroundColor: theme === 'dark' ? '#222222' : '#F5F5F5' }]}>
                            <Text style={[styles.summaryValue, { color: '#F44336' }]}>
                                {nextMaintenance.summary.due_items}
                            </Text>
                            <Text style={[styles.summaryLabel, { color: subtitleColor }]}>
                                Vencidos
                            </Text>
                        </View>
                        <View style={[styles.summaryItem, { backgroundColor: theme === 'dark' ? '#222222' : '#F5F5F5' }]}>
                            <Text style={[styles.summaryValue, { color: '#FFC107' }]}>
                                {nextMaintenance.summary.upcoming_items}
                            </Text>
                            <Text style={[styles.summaryLabel, { color: subtitleColor }]}>
                                Próximos
                            </Text>
                        </View>
                    </View>
                </View>

                <Text style={[styles.sectionTitle, { color: textColor }]}>
                    Mantenimientos programados
                </Text>

                {nextMaintenance.maintenance_items.length > 0 ? (
                    <View style={styles.maintenanceItemsList}>
                        {nextMaintenance.maintenance_items.map((item) => (
                            <MaintenanceReminderCard
                                key={item.type_id}
                                item={item}
                                onScheduleMaintenance={handleScheduleMaintenance}
                            />
                        ))}
                    </View>
                ) : (
                    <View style={styles.emptyListContainer}>
                        <Text style={[styles.emptyListText, { color: textColor }]}>
                            No hay mantenimientos programados
                        </Text>
                    </View>
                )}

                <View style={styles.buttonsContainer}>
                    <Button
                        buttonVariant="outline"
                        buttonSize="medium"
                        onPress={handleCheckMaintenance}
                        style={styles.checkButton}
                    >
                        Verificar mantenimientos
                    </Button>

                    <Button
                        buttonVariant="primary"
                        buttonSize="medium"
                        onPress={() => handleScheduleMaintenance()}
                        style={styles.scheduleButton}
                    >
                        Registrar nuevo mantenimiento
                    </Button>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        marginTop: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 16,
    },
    retryButton: {
        marginTop: 16,
    },
    scrollContainer: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 40,
    },
    vehicleInfoCard: {
        marginVertical: 8,
        padding: 16,
    },
    vehicleTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    vehicleSubtitle: {
        fontSize: 14,
        marginBottom: 4,
    },
    kilometrageText: {
        fontSize: 16,
        fontWeight: '500',
    },
    summaryContainer: {
        marginTop: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    summaryGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    summaryItem: {
        flex: 1,
        padding: 16,
        borderRadius: 8,
        marginHorizontal: 4,
        alignItems: 'center',
    },
    summaryValue: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    summaryLabel: {
        fontSize: 12,
    },
    maintenanceItemsList: {
        marginBottom: 24,
    },
    emptyListContainer: {
        alignItems: 'center',
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
        borderRadius: 8,
        marginBottom: 24,
    },
    emptyListText: {
        fontSize: 16,
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        marginTop: 24,
    },
    emptyStateText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 8,
    },
    emptyStateSubtext: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 16,
    },
    addButton: {
        marginTop: 16,
    },
    buttonsContainer: {
        marginBottom: 16,
    },
    checkButton: {
        marginBottom: 12,
    },
    scheduleButton: {
        marginBottom: 8,
    },
});

export default MaintenanceScheduleScreen;