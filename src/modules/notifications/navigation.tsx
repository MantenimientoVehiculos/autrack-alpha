// src/modules/notifications/navigation.tsx
import { Stack } from 'expo-router';

export type NotificationsStackParamList = {
    'index': undefined;
    'detail': { id: string };
};

export const NotificationsStack = () => {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    title: 'Notificaciones',
                    headerShown: false
                }}
            />
            <Stack.Screen
                name="detail"
                options={{
                    title: 'Detalle de Notificación',
                    headerShown: false
                }}
            />
        </Stack>
    );
};

export default NotificationsStack;