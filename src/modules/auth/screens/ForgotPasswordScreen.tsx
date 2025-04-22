// src/modules/Auth/screens/ForgotPasswordScreen.tsx
import React, { useState } from 'react';
import { Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useRouter } from 'expo-router';
import { YStack, H1, Text, Form, Paragraph } from 'tamagui';
import * as Haptics from 'expo-haptics';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useAuth } from '../context/AuthContext';
import { Button } from '@/src/shared/components/ui/Button';
import { Input } from '@/src/shared/components/ui/Input';

// Definir el esquema de validación con Zod
const forgotPasswordSchema = z.object({
    correo: z.string()
        .min(1, { message: 'El correo es requerido' })
        .email({ message: 'Correo electrónico inválido' })
});

// Tipo derivado del esquema de validación
type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordScreen: React.FC = () => {
    const router = useRouter();
    const { forgotPassword, error, clearError, isLoading } = useAuth();
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Configurar React Hook Form con el resolver de Zod
    const {
        control,
        handleSubmit,
        formState: { errors }
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            correo: ''
        }
    });

    // Manejar solicitud de recuperación de contraseña
    const onSubmit = async (data: ForgotPasswordFormData) => {
        Keyboard.dismiss();
        clearError();
        setSuccessMessage(null);

        const result = await forgotPassword({
            correo: data.correo
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
                    <H1>Recuperar contraseña</H1>
                    <Text color="$color">
                        Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña
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
                            Volver al inicio de sesión
                        </Button>
                    </YStack>
                ) : (
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
                                Enviar instrucciones
                            </Button>
                        </YStack>
                    </Form>
                )}

                <Text
                    color="$primary"
                    textAlign="center"
                    onPress={navigateToLogin}
                    marginTop="$2"
                >
                    Volver al inicio de sesión
                </Text>
            </YStack>
        </TouchableWithoutFeedback>
    );
};

export default ForgotPasswordScreen;