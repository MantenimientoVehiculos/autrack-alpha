// src/modules/maintenance/navigation.tsx
import { Stack } from 'expo-router';

export type MaintenanceStackParamList = {
    'add': { vehicleId: string; typeId?: string };
    'history': { vehicleId: string };
    'detail': { recordId: string };
    'schedule': { vehicleId: string };
};

export const MaintenanceStack = () => {
    return (
        <Stack>
            <Stack.Screen
                name="add"
                options={{
                    title: 'Registrar Mantenimiento',
                    headerShown: false
                }}
            />
            <Stack.Screen
                name="history"
                options={{
                    title: 'Historial de Mantenimiento',
                    headerShown: false
                }}
            />
            <Stack.Screen
                name="detail"
                options={{
                    title: 'Detalle de Mantenimiento',
                    headerShown: false
                }}
            />
            <Stack.Screen
                name="schedule"
                options={{
                    title: 'Programación de Mantenimiento',
                    headerShown: false
                }}
            />
        </Stack>
    );
};

export default MaintenanceStack;