// src/modules/Auth/screens/ResetPasswordScreen.tsx
import React, { useState, useEffect } from 'react';
import { Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { YStack, H1, Text, Form, Paragraph } from 'tamagui';
import * as Haptics from 'expo-haptics';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useAuth } from '../context/AuthContext';
import { Button } from '@/src/shared/components/ui/Button';
import { Input } from '@/src/shared/components/ui/Input';

// Definir el esquema de validación con Zod
const resetPasswordSchema = z.object({
    nueva_contrasena: z.string()
        .min(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
        .max(50, { message: 'La contraseña es demasiado larga' }),
    confirmar_contrasena: z.string()
        .min(1, { message: 'Debe confirmar la contraseña' })
}).refine(data => data.nueva_contrasena === data.confirmar_contrasena, {
    message: "Las contraseñas no coinciden",
    path: ["confirmar_contrasena"]
});

// Tipo derivado del esquema de validación
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordScreen: React.FC = () => {
    const router = useRouter();
    const params = useLocalSearchParams<{ token: string }>();
    const { resetPassword, error, clearError, isLoading } = useAuth();
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        if (params.token) {
            setToken(params.token);
        } else {
            // Redirigir si no hay token
            router.replace('/auth/forgot-password');
        }
    }, [params.token, router]);

    // Configurar React Hook Form con el resolver de Zod
    const {
        control,
        handleSubmit,
        formState: { errors }
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            nueva_contrasena: '',
            confirmar_contrasena: ''
        }
    });

    // Manejar restablecimiento de contraseña
    const onSubmit = async (data: ResetPasswordFormData) => {
        if (!token) return;

        Keyboard.dismiss();
        clearError();
        setSuccessMessage(null);

        const result = await resetPassword({
            token,
            nueva_contrasena: data.nueva_contrasena
        });

        if (result.success) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setSuccessMessage(result.message);
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
    };

    // Navegar a la pantalla de inicio de sesión
    const navigateToLogin = () => {
        router.push('/auth/login');
    };

    if (!token) {
        return (
            <YStack
                flex={1}
                padding="$4"
                backgroundColor="$background"
                justifyContent="center"
                alignItems="center"
            >
                <Text>Redireccionando...</Text>
            </YStack>
        );
    }

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
                    <H1>Restablecer contraseña</H1>
                    <Text color="$color">
                        Crea una nueva contraseña para tu cuenta
                    </Text>
                </YStack>

                {successMessage ? (
                    <YStack space="$4" alignItems="center">
                        <Paragraph textAlign="center" color="$primary">
                            {successMessage}
                        </Paragraph>
                        <Button
                            buttonVariant="primary"
                            buttonSize="large"
                            onPress={navigateToLogin}
                        >
                            Ir al inicio de sesión
                        </Button>
                    </YStack>
                ) : (
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <YStack space="$4">
                            <Controller
                                control={control}
                                name="nueva_contrasena"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <Input
                                        label="Nueva contraseña"
                                        placeholder="Nueva contraseña"
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        error={errors.nueva_contrasena?.message}
                                        secureTextEntry
                                        autoCapitalize="none"
                                        autoComplete="password-new"
                                    />
                                )}
                            />

                            <Controller
                                control={control}
                                name="confirmar_contrasena"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <Input
                                        label="Confirmar contraseña"
                                        placeholder="Confirma tu nueva contraseña"
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        error={errors.confirmar_contrasena?.message}
                                        secureTextEntry
                                        autoCapitalize="none"
                                        autoComplete="password-new"
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
                                Cambiar contraseña
                            </Button>
                        </YStack>
                    </Form>
                )}
            </YStack>
        </TouchableWithoutFeedback>
    );
};

export default ResetPasswordScreen;