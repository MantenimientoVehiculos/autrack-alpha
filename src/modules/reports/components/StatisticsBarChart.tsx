import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { Card } from '@/src/shared/components/ui/Card';

interface DataItem {
    id: number;
    name: string;
    value: number;
    color: string;
    borderColor: string;
}

interface StatisticsBarChartProps {
    data: DataItem[];
    valuePrefix?: string;
    colors?: string[];
    borderColors?: string[];
    title?: string;
    maxVisibleBars?: number;
}

const StatisticsBarChart: React.FC<StatisticsBarChartProps> = ({
    data,
    valuePrefix = '$',
    title,
    maxVisibleBars = 6
}) => {
    const { theme } = useAppTheme();
    const textColor = theme === 'dark' ? '#F9F9F9' : '#313131';
    const secondaryTextColor = theme === 'dark' ? '#BBBBBB' : '#666666';
    const cardBgColor = theme === 'dark' ? '#222222' : '#FFFFFF';
    const bgHighlight = theme === 'dark' ? '#333333' : '#F9F9F9';

    if (!data || data.length === 0) {
        return (
            <Card style={[styles.container, { backgroundColor: cardBgColor }]}>
                <Text style={[styles.emptyText, { color: secondaryTextColor }]}>
                    No hay datos disponibles para mostrar
                </Text>
            </Card>
        );
    }

    // Ordenar datos por valor de mayor a menor
    const sortedData = [...data].sort((a, b) => b.value - a.value);

    // Limitar la cantidad de barras mostradas
    const visibleData = sortedData.slice(0, maxVisibleBars);

    // Calcular valor máximo para normalizar las barras
    const maxValue = Math.max(...visibleData.map(item => item.value));

    // Calcular total para porcentajes
    const total = visibleData.reduce((sum, item) => sum + item.value, 0);

    return (
        <View style={[ { backgroundColor: cardBgColor }]}>
            {title && (
                <Text style={[styles.title, { color: textColor }]}>
                    {title}
                </Text>
            )}

            <View style={styles.chartContainer}>
                {/* Gráfico de barras */}
                <View style={styles.barsContainer}>
                    {visibleData.map((item, index) => {
                        const barHeight = maxValue > 0 ? (item.value / maxValue) * 180 : 0;
                        const percentage = (item.value / total) * 100;

                        return (
                            <View key={index} style={styles.barColumn}>
                                <Text style={[styles.barValue, { color: textColor }]}>
                                    {valuePrefix}{item.value.toFixed(0)}
                                </Text>

                                <View style={styles.barWrapper}>
                                    <View
                                        style={[
                                            styles.bar,
                                            {
                                                height: barHeight,
                                                backgroundColor: item.color,
                                                borderColor: item.borderColor
                                            }
                                        ]}
                                    />
                                </View>

                                <Text
                                    style={[styles.barLabel, { color: secondaryTextColor }]}
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                >
                                    {item.name}
                                </Text>

                                <Text style={[styles.barPercent, { color: secondaryTextColor }]}>
                                    {percentage.toFixed(1)}%
                                </Text>
                            </View>
                        );
                    })}
                </View>
            </View>

            {/* Indicador adicional - sección de tabla */}
            {visibleData.length > 0 && (
                <View style={[styles.table, { backgroundColor: bgHighlight }]}>
                    <Text style={[styles.tableHeader, { color: textColor }]}>
                        {data.length > maxVisibleBars ? `Mostrando los ${maxVisibleBars} mayores valores de ${data.length} totales` : 'Detalle de valores'}
                    </Text>

                    <View style={styles.tableContent}>
                        <View style={styles.tableColumn}>
                            <Text style={[styles.tableColumnHeader, { color: secondaryTextColor }]}>
                                Nombre
                            </Text>
                            {visibleData.map((item, index) => (
                                <Text
                                    key={`name-${index}`}
                                    style={[styles.tableCell, { color: textColor }]}
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                >
                                    {item.name}
                                </Text>
                            ))}
                        </View>

                        <View style={[styles.tableColumn, styles.valueColumn]}>
                            <Text style={[styles.tableColumnHeader, { color: secondaryTextColor }]}>
                                Valor
                            </Text>
                            {visibleData.map((item, index) => (
                                <Text
                                    key={`value-${index}`}
                                    style={[styles.tableCell, styles.valueCell, { color: textColor }]}
                                >
                                    {valuePrefix}{item.value.toFixed(2)}
                                </Text>
                            ))}
                        </View>

                        <View style={[styles.tableColumn, styles.percentColumn]}>
                            <Text style={[styles.tableColumnHeader, { color: secondaryTextColor }]}>
                                %
                            </Text>
                            {visibleData.map((item, index) => (
                                <Text
                                    key={`percent-${index}`}
                                    style={[styles.tableCell, styles.percentCell, { color: secondaryTextColor }]}
                                >
                                    {((item.value / total) * 100).toFixed(1)}%
                                </Text>
                            ))}
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
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
        alignItems: 'center',
        marginBottom: 16,
    },
    barsContainer: {
        width: '100%',
        height: 250,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingTop: 30, // Espacio para valores sobre las barras
    },
    barColumn: {
        flex: 1,
        alignItems: 'center',
        height: '100%',
    },
    barValue: {
        fontSize: 12,
        marginBottom: 4,
        fontWeight: '500',
    },
    barWrapper: {
        width: '70%',
        height: 180, // Altura máxima para las barras
        justifyContent: 'flex-end',
    },
    bar: {
        width: '100%',
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
        borderWidth: 1,
        borderBottomWidth: 0, // Sin borde inferior
    },
    barLabel: {
        fontSize: 11,
        textAlign: 'center',
        marginTop: 6,
        width: '100%',
        paddingHorizontal: 2,
    },
    barPercent: {
        fontSize: 10,
        textAlign: 'center',
        marginTop: 2,
    },
    table: {
        marginTop: 16,
        borderRadius: 8,
        padding: 12,
    },
    tableHeader: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 12,
        textAlign: 'center',
    },
    tableContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    tableColumn: {
        flex: 1,
    },
    valueColumn: {
        flex: 0.6,
        alignItems: 'flex-end',
    },
    percentColumn: {
        flex: 0.4,
        alignItems: 'flex-end',
    },
    tableColumnHeader: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    tableCell: {
        fontSize: 12,
        marginBottom: 6,
    },
    valueCell: {
        fontWeight: '500',
    },
    percentCell: {
        fontSize: 11,
    },
    emptyText: {
        textAlign: 'center',
        padding: 40,
        fontSize: 14,
    }
});

export default StatisticsBarChart;