// src/modules/home/components/ReportsSummaryWidget.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { Card } from '@/src/shared/components/ui/Card';
import { BarChartIcon } from '@/src/shared/components/ui/Icons';
import { useVehicles } from '@/src/modules/vehicles/hooks/useVehicles';

interface MaintenanceSummary {
    totalRegistros: number;
    costoTotal: number;
    ultimoMantenimiento: string;
}

export const ReportsSummaryWidget: React.FC = () => {
    const router = useRouter();
    const { theme } = useAppTheme();
    const { vehicles } = useVehicles();
    const [summary, setSummary] = useState<MaintenanceSummary>({
        totalRegistros: 0,
        costoTotal: 0,
        ultimoMantenimiento: ''
    });

    // Colores según el tema
    const textColor = theme === 'dark' ? '#F9F9F9' : '#313131';
    const secondaryTextColor = theme === 'dark' ? '#BBBBBB' : '#666666';
    const accentColor = theme === 'dark' ? '#B27046' : '#9D7E68';
    const cardColor = theme === 'dark' ? '#222222' : '#FFFFFF';

    // Generar datos de resumen para el ejemplo
    // En una implementación real, estos datos vendrían del backend
    useEffect(() => {
        if (vehicles.length > 0) {
            // Simular datos de mantenimiento para la demo
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 30));

            setSummary({
                totalRegistros: Math.floor(Math.random() * 20) + 5,
                costoTotal: Math.floor(Math.random() * 1000) + 200,
                ultimoMantenimiento: date.toLocaleDateString()
            });
        }
    }, [vehicles]);

    // Función para navegar a la pantalla de reportes
    const navigateToReports = () => {
        router.push('/reports');
    };

    return (
        <Card
            variant="elevated"
            style={[styles.container, { backgroundColor: cardColor }]}
            onPress={navigateToReports}
        >
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <BarChartIcon size={20} color={accentColor} />
                    <Text style={[styles.title, { color: textColor }]}>
                        Resumen de Mantenimientos
                    </Text>
                </View>
            </View>

            <View style={styles.content}>
                <View style={styles.statRow}>
                    <View style={styles.stat}>
                        <Text style={[styles.statValue, { color: textColor }]}>
                            {summary.totalRegistros}
                        </Text>
                        <Text style={[styles.statLabel, { color: secondaryTextColor }]}>
                            Registros
                        </Text>
                    </View>

                    <View style={styles.stat}>
                        <Text style={[styles.statValue, { color: textColor }]}>
                            ${summary.costoTotal}
                        </Text>
                        <Text style={[styles.statLabel, { color: secondaryTextColor }]}>
                            Costo Total
                        </Text>
                    </View>

                    <View style={styles.stat}>
                        <Text style={[styles.statValue, { color: textColor, fontSize: 14 }]}>
                            {summary.ultimoMantenimiento}
                        </Text>
                        <Text style={[styles.statLabel, { color: secondaryTextColor }]}>
                            Último Registro
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: accentColor }]}
                    onPress={navigateToReports}
                >
                    <Text style={styles.buttonText}>
                        Ver Reportes
                    </Text>
                </TouchableOpacity>
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    content: {

    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    stat: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
    },
    button: {
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
    }
});

export default ReportsSummaryWidget;