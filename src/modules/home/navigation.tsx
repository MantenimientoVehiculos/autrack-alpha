// src/modules/home/navigation.tsx
import { Stack } from 'expo-router';

export type HomeStackParamList = {
    'index': undefined;
    'summary': undefined;
};

export const HomeStack = () => {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    title: 'Inicio',
                    headerShown: false
                }}
            />
            <Stack.Screen
                name="summary"
                options={{
                    title: 'Resumen',
                    headerShown: false
                }}
            />
        </Stack>
    );
};

export default HomeStack;