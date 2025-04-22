// src/modules/auth/screens/ForgotPasswordScreen.tsx
import React, { useState } from 'react';
import { Keyboard, TouchableWithoutFeedback, View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, Title, Paragraph, useTheme } from 'react-native-paper';
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
    const theme = useTheme();

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
            <ScrollView
                style={[styles.container, { backgroundColor: theme.colors.background }]}
                contentContainerStyle={styles.contentContainer}
            >
                <View style={styles.headerContainer}>
                    <Title style={[styles.title, { color: theme.colors.onBackground }]}>
                        Recuperar contraseña
                    </Title>
                    <Text style={{ color: theme.colors.onBackground }}>
                        Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña
                    </Text>
                </View>

                {successMessage ? (
                    <View style={styles.successContainer}>
                        <Paragraph style={[styles.successMessage, { color: theme.colors.primary }]}>
                            {successMessage}
                        </Paragraph>
                        <Button
                            buttonVariant="primary"
                            buttonSize="large"
                            onPress={navigateToLogin}
                            style={styles.button}
                        >
                            Volver al inicio de sesión
                        </Button>
                    </View>
                ) : (
                    <View style={styles.formContainer}>
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
                                    style={styles.input}
                                />
                            )}
                        />

                        {error && (
                            <Text style={[styles.errorText, { color: theme.colors.error }]}>
                                {error}
                            </Text>
                        )}

                        <Button
                            buttonVariant="primary"
                            buttonSize="large"
                            onPress={handleSubmit(onSubmit)}
                            isLoading={isLoading}
                            style={styles.button}
                        >
                            Enviar instrucciones
                        </Button>
                    </View>
                )}

                <Text
                    style={[styles.backToLogin, { color: theme.colors.primary }]}
                    onPress={navigateToLogin}
                >
                    Volver al inicio de sesión
                </Text>
            </ScrollView>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
        padding: 24,
        justifyContent: 'center',
    },
    headerContainer: {
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    formContainer: {
        width: '100%',
        gap: 16,
    },
    successContainer: {
        width: '100%',
        alignItems: 'center',
        gap: 16,
    },
    input: {
        marginBottom: 12,
    },
    errorText: {
        textAlign: 'center',
        marginBottom: 12,
    },
    button: {
        marginTop: 8,
    },
    successMessage: {
        textAlign: 'center',
        fontSize: 16,
        marginBottom: 16,
    },
    backToLogin: {
        textAlign: 'center',
        marginTop: 24,
    },
});

export default ForgotPasswordScreen;