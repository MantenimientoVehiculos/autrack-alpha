// src/modules/reports/navigation.ts
import { Stack } from 'expo-router';

export type ReportsStackParamList = {
    'index': undefined;
    'filters': undefined;
    'results': { reportId?: string };
    'statistics': undefined;
    'vehicle-statistics': { vehicleId: number };
};

export const ReportsStack = () => {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    title: 'Reportes y Estadísticas',
                    headerShown: false
                }}
            />
            <Stack.Screen
                name="filters"
                options={{
                    title: 'Filtros',
                    headerShown: false
                }}
            />
            <Stack.Screen
                name="results"
                options={{
                    title: 'Resultados',
                    headerShown: false
                }}
            />
            <Stack.Screen
                name="statistics"
                options={{
                    title: 'Estadísticas',
                    headerShown: false
                }}
            />
            <Stack.Screen
                name="vehicle-statistics"
                options={{
                    title: 'Estadísticas de Vehículo',
                    headerShown: false
                }}
            />
        </Stack>
    );
};

export default ReportsStack;