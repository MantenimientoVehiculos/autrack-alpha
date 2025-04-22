// app/auth/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';

export default function AuthLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="login"
                options={{
                    title: 'Iniciar sesión',
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="register"
                options={{
                    title: 'Registro',
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="forgot-password"
                options={{
                    title: 'Recuperar contraseña',
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="reset-password"
                options={{
                    title: 'Restablecer contraseña',
                    headerShown: false,
                }}
            />
        </Stack>
    );
}