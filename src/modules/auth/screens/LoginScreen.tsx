// src/modules/Auth/screens/LoginScreen.tsx
import React from 'react';
import { Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useRouter } from 'expo-router';
import { XStack, YStack, H1, Text, Form } from 'tamagui';
import * as Haptics from 'expo-haptics';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useAuth } from '../context/AuthContext';
import { Button } from '@/src/shared/components/ui/Button';
import { Input } from '@/src/shared/components/ui/Input';

// Definir el esquema de validación con Zod
const loginSchema = z.object({
    correo: z.string()
        .min(1, { message: 'El correo es requerido' })
        .email({ message: 'Correo electrónico inválido' }),
    contrasena: z.string()
        .min(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
});

// Tipo derivado del esquema de validación
type LoginFormData = z.infer<typeof loginSchema>;

export const LoginScreen: React.FC = () => {
    const router = useRouter();
    const { login, error, clearError, isLoading } = useAuth();

    // Configurar React Hook Form con el resolver de Zod
    const {
        control,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            correo: '',
            contrasena: ''
        }
    });

    // Manejar inicio de sesión
    const onSubmit = async (data: LoginFormData) => {
        Keyboard.dismiss();
        clearError();

        const success = await login({
            correo: data.correo,
            contrasena: data.contrasena,
        });

        if (success) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.replace('/');
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
    };

    // Navegar a la pantalla de registro
    const navigateToRegister = () => {
        router.push('/auth/register');
    };

    // Navegar a la pantalla de recuperación de contraseña
    const navigateToForgotPassword = () => {
        router.push('/auth/forgot-password');
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <YStack
                flex={1}
                padding="$4"
                backgroundColor="$background"
                justifyContent="center"
                space="$4"
            >
                <YStack space="$2" marginBottom="$4">
                    <H1>Iniciar sesión</H1>
                    <Text color="$color">Ingresa tus credenciales para continuar</Text>
                </YStack>

                <Form onSubmit={handleSubmit(onSubmit)}>
                    <YStack space="$4">
                        <Controller
                            control={control}
                            name="correo"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <Input
                                    label="Correo electrónico"
                                    placeholder="correo@ejemplo.com"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    error={errors.correo?.message}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    autoComplete="email"
                                />
                            )}
                        />

                        <Controller
                            control={control}
                            name="contrasena"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <Input
                                    label="Contraseña"
                                    placeholder="Contraseña"
                                    value={value}
                                    onChangeText={onChange}
                                    onBlur={onBlur}
                                    error={errors.contrasena?.message}
                                    secureTextEntry
                                    autoCapitalize="none"
                                    autoComplete="password"
                                />
                            )}
                        />

                        {error && (
                            <Text color="red" textAlign="center">
                                {error}
                            </Text>
                        )}

                        <Button
                            buttonVariant="primary"
                            buttonSize="large"
                            onPress={handleSubmit(onSubmit)}
                            isLoading={isLoading}
                        >
                            Iniciar sesión
                        </Button>
                    </YStack>
                </Form>

                <XStack justifyContent="center" marginTop="$2">
                    <Text>¿No tienes una cuenta? </Text>
                    <Text color="$primary" onPress={navigateToRegister} fontWeight="bold">
                        Regístrate
                    </Text>
                </XStack>

                <Text
                    color="$primary"
                    textAlign="center"
                    onPress={navigateToForgotPassword}
                    marginTop="$2"
                >
                    ¿Olvidaste tu contraseña?
                </Text>
            </YStack>
        </TouchableWithoutFeedback>
    );
};

export default LoginScreen;