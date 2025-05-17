// src/modules/reports/components/ReportChart.tsx
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { Card } from '@/src/shared/components/ui/Card';
import { ReportByType } from '../models/report';

interface ReportChartProps {
    data: ReportByType[];
    title: string;
    type: 'bar' | 'pie';
}

export const ReportChart: React.FC<ReportChartProps> = ({
    data,
    title,
    type = 'bar'
}) => {
    const { theme } = useAppTheme();
    const textColor = theme === 'dark' ? '#F9F9F9' : '#313131';
    const screenWidth = Dimensions.get('window').width - 64; // Ajustar para padding

    // Colores para los gráficos
    const COLORS = [
        '#9D7E68', // Primary
        '#B27046', // Primary variant
        '#955D3B', // Secondary
        '#774A2F', // Secondary variant
        '#3D85C6', // Blue
        '#6AA84F', // Green
        '#C27BA0', // Pink
        '#674EA7', // Purple
        '#E69138', // Orange
        '#999999', // Gray
    ];

    // Calcular altura máxima para normalizar barras
    const maxValue = data.length > 0
        ? Math.max(...data.map(item => item.costo_total))
        : 0;

    // Calcular suma total para porcentajes del gráfico de pastel
    const total = data.reduce((sum, item) => sum + item.costo_total, 0);

    return (
        <Card style={styles.container}>
            <Text style={[styles.title, { color: textColor }]}>{title}</Text>

            <View style={styles.chartContainer}>
                {type === 'bar' ? (
                    // Gráfico de barras
                    <View style={styles.barChart}>
                        {data.map((item, index) => {
                            const barHeight = maxValue > 0
                                ? (item.costo_total / maxValue) * 200
                                : 0;

                            return (
                                <View key={item.id} style={styles.barItemContainer}>
                                    <Text
                                        style={[styles.barValue, { color: textColor }]}
                                        numberOfLines={1}
                                    >
                                        ${item.costo_total.toFixed(2)}
                                    </Text>

                                    <View style={styles.barWrapper}>
                                        <View
                                            style={[
                                                styles.bar,
                                                {
                                                    height: barHeight,
                                                    backgroundColor: COLORS[index % COLORS.length]
                                                }
                                            ]}
                                        />
                                    </View>

                                    <Text
                                        style={[styles.barLabel, { color: textColor }]}
                                        numberOfLines={2}
                                        ellipsizeMode="tail"
                                    >
                                        {item.nombre}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                ) : (
                    // Gráfico de pastel
                    <View style={styles.pieChartContainer}>
                        <View style={styles.pieChart}>
                            {data.map((item, index) => {
                                const percentage = total > 0 ? (item.costo_total / total) * 100 : 0;
                                // Simplificado para implementación básica - en una app real
                                // usaríamos una librería de gráficos como Victory o react-native-charts
                                const size = 30 + (percentage / 2);

                                return (
                                    <View
                                        key={item.id}
                                        style={[
                                            styles.pieSlice,
                                            {
                                                width: size,
                                                height: size,
                                                backgroundColor: COLORS[index % COLORS.length],
                                                position: 'absolute',
                                                top: 70 - size / 2,
                                                left: index % 2 === 0 ? 80 - size / 2 : 120 - size / 2,
                                                borderRadius: size / 2,
                                                zIndex: Math.round(percentage)
                                            }
                                        ]}
                                    />
                                );
                            })}
                        </View>

                        <View style={styles.pieLegend}>
                            {data.map((item, index) => {
                                const percentage = total > 0 ? (item.costo_total / total) * 100 : 0;

                                return (
                                    <View key={item.id} style={styles.legendItem}>
                                        <View
                                            style={[
                                                styles.legendColor,
                                                { backgroundColor: COLORS[index % COLORS.length] }
                                            ]}
                                        />
                                        <Text
                                            style={[styles.legendText, { color: textColor }]}
                                            numberOfLines={1}
                                            ellipsizeMode="middle"
                                        >
                                            {item.nombre} ({percentage.toFixed(1)}%)
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                )}
            </View>

            <Text style={[styles.note, { color: theme === 'dark' ? '#BBBBBB' : '#666666' }]}>
                Basado en costos totales por tipo de mantenimiento
            </Text>
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
    chartContainer: {
        marginTop: 8,
        alignItems: 'center',
    },
    barChart: {
        flexDirection: 'row',
        height: 270,
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
    },
    barItemContainer: {
        flex: 1,
        alignItems: 'center',
        maxWidth: 80,
    },
    barValue: {
        fontSize: 10,
        marginBottom: 4,
        height: 30,
        textAlign: 'center',
    },
    barWrapper: {
        height: 200,
        width: '80%',
        justifyContent: 'flex-end',
    },
    bar: {
        width: '100%',
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
    },
    barLabel: {
        fontSize: 10,
        textAlign: 'center',
        marginTop: 6,
        height: 30,
    },
    pieChartContainer: {
        height: 250,
        width: '100%',
        alignItems: 'center',
    },
    pieChart: {
        height: 140,
        width: 200,
        position: 'relative',
        marginBottom: 16,
    },
    pieSlice: {
        // Los estilos específicos se aplican inline
    },
    pieLegend: {
        width: '100%',
        paddingHorizontal: 16,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    legendColor: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginRight: 8,
    },
    legendText: {
        fontSize: 12,
    },
    note: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: 16,
        fontStyle: 'italic',
    }
});

export default ReportChart;