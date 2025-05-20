import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { Card } from '@/src/shared/components/ui/Card';

// Interfaces para los tipos de datos de gráficos
interface ChartData {
    name: string;
    value: number;
}

interface StatisticsChartProps {
    data: ChartData[];
    title: string;
    type: 'bar' | 'pie';
    valuePrefix?: string; // Para moneda ($) o porcentajes (%)
    valueFormatter?: (value: number) => string;
}

export const ReportChart: React.FC<StatisticsChartProps> = ({
    data,
    title,
    type = 'bar',
    valuePrefix = '',
    valueFormatter = (value) => `${valuePrefix}${value.toFixed(2)}`
}) => {
    const { theme } = useAppTheme();
    const textColor = theme === 'dark' ? '#F9F9F9' : '#313131';
    const secondaryTextColor = theme === 'dark' ? '#BBBBBB' : '#666666';
    const cardBgColor = theme === 'dark' ? '#222222' : '#FFFFFF';

    // Colores pasteles para gráficos
    const PASTEL_COLORS = [
        '#FFD6E0', // rosa claro
        '#FFEFCF', // amarillo pastel
        '#D1F0FF', // azul cielo
        '#E2D6FF', // lavanda
        '#D6FFE2', // menta
        '#FFE2D6', // melocotón 
        '#F0F0F0', // gris claro
        '#E6F9FF', // celeste
        '#FFF9E6', // crema
        '#F9E6FF'  // lila claro
    ];

    // Bordes más oscuros para los colores pastel
    const BORDER_COLORS = [
        '#FFA6C0', // rosa más oscuro
        '#FFCF8F', // amarillo más oscuro
        '#A1D0FF', // azul más oscuro
        '#B2A6FF', // lavanda más oscuro
        '#A6FFB2', // menta más oscuro
        '#FFB2A6', // melocotón más oscuro
        '#D0D0D0', // gris más oscuro
        '#B6E9FF', // celeste más oscuro
        '#FFE9B6', // crema más oscuro
        '#E9B6FF'  // lila más oscuro
    ];

    // Calcular valores máximos y totales para normalización
    const maxValue = data.length > 0
        ? Math.max(...data.map(item => item.value))
        : 0;

    const totalValue = data.reduce((sum, item) => sum + item.value, 0);

    // Calcular porcentajes para el gráfico circular
    const pieData = data.map((item, index) => ({
        ...item,
        percent: totalValue > 0 ? (item.value / totalValue) * 100 : 0,
        color: PASTEL_COLORS[index % PASTEL_COLORS.length],
        borderColor: BORDER_COLORS[index % BORDER_COLORS.length]
    }));

    const renderPieChart = () => {
        // Determinar ángulos para los segmentos del gráfico circular
        let startAngle = 0;
        const segments = pieData.map((item) => {
            const angle = (item.value / totalValue) * 360;
            const segment = {
                ...item,
                startAngle,
                endAngle: startAngle + angle
            };
            startAngle += angle;
            return segment;
        });

        return (
            <View style={styles.pieChartContainer}>
                <View style={styles.pieChart}>
                    {segments.map((segment, index) => {
                        // Cálculo mejorado de la posición del segmento
                        const angle = ((segment.startAngle + segment.endAngle) / 2) * Math.PI / 180;
                        const radius = 70;
                        const distance = segment.percent > 10 ? radius * 0.7 : radius * 0.5; // Segmentos pequeños se acercan más al centro

                        const centerX = 100;
                        const centerY = 100;

                        const x = centerX + Math.cos(angle) * distance;
                        const y = centerY + Math.sin(angle) * distance;

                        // Tamaño basado en el porcentaje, con mínimo para visibilidad
                        const size = Math.max(30, 30 + (segment.percent / 2));

                        return (
                            <View
                                key={index}
                                style={[
                                    styles.pieSlice,
                                    {
                                        width: size,
                                        height: size,
                                        backgroundColor: segment.color,
                                        borderColor: segment.borderColor,
                                        borderWidth: 1,
                                        position: 'absolute',
                                        top: y - size / 2,
                                        left: x - size / 2,
                                        borderRadius: size / 2,
                                        zIndex: Math.round(segment.percent)
                                    }
                                ]}
                            />
                        );
                    })}
                </View>

                <View style={styles.pieLegend}>
                    {pieData.map((item, index) => (
                        <View key={index} style={styles.legendItem}>
                            <View
                                style={[
                                    styles.legendColor,
                                    {
                                        backgroundColor: item.color,
                                        borderColor: item.borderColor,
                                        borderWidth: 1
                                    }
                                ]}
                            />
                            <Text
                                style={[styles.legendText, { color: textColor }]}
                                numberOfLines={1}
                                ellipsizeMode="middle"
                            >
                                {item.name} ({item.percent.toFixed(1)}%)
                            </Text>
                            <Text style={[styles.legendValue, { color: textColor }]}>
                                {valueFormatter(item.value)}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    const renderBarChart = () => {
        return (
            <View style={styles.barChart}>
                {data.map((item, index) => {
                    const barHeight = maxValue > 0
                        ? (item.value / maxValue) * 200
                        : 0;

                    return (
                        <View key={index} style={styles.barItemContainer}>
                            <Text
                                style={[styles.barValue, { color: textColor }]}
                                numberOfLines={1}
                            >
                                {valueFormatter(item.value)}
                            </Text>

                            <View style={styles.barWrapper}>
                                <View
                                    style={[
                                        styles.bar,
                                        {
                                            height: barHeight,
                                            backgroundColor: PASTEL_COLORS[index % PASTEL_COLORS.length],
                                            borderColor: BORDER_COLORS[index % BORDER_COLORS.length],
                                            borderWidth: 1
                                        }
                                    ]}
                                />
                            </View>

                            <Text
                                style={[styles.barLabel, { color: textColor }]}
                                numberOfLines={2}
                                ellipsizeMode="tail"
                            >
                                {item.name}
                            </Text>
                        </View>
                    );
                })}
            </View>
        );
    };

    return (
        <Card style={[styles.container, { backgroundColor: cardBgColor }]}>
            <Text style={[styles.title, { color: textColor }]}>{title}</Text>

            <View style={styles.chartContainer}>
                {type === 'bar' ? renderBarChart() : renderPieChart()}
            </View>

            <Text style={[styles.note, { color: secondaryTextColor }]}>
                {`Total: ${valueFormatter(totalValue)}`}
            </Text>
        </Card>
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
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    barLabel: {
        fontSize: 10,
        textAlign: 'center',
        marginTop: 6,
        height: 30,
    },
    pieChartContainer: {
        height: 300,
        width: '100%',
        alignItems: 'center',
    },
    pieChart: {
        height: 200,
        width: 200,
        position: 'relative',
        marginBottom: 16,
    },
    pieSlice: {
        // Estilos aplicados inline
    },
    pieLegend: {
        width: '100%',
        paddingHorizontal: 16,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        justifyContent: 'space-between',
    },
    legendColor: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginRight: 8,
    },
    legendText: {
        fontSize: 12,
        flex: 1,
    },
    legendValue: {
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    note: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: 16,
        fontStyle: 'italic',
    }
});

export default ReportChart;