// src/modules/auth/screens/ResetPasswordScreen.tsx
import React, { useState, useEffect } from 'react';
import { Keyboard, TouchableWithoutFeedback, View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Text, Title, Paragraph, useTheme } from 'react-native-paper';
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
    const theme = useTheme();

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
            <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={{ marginTop: 16, color: theme.colors.onBackground }}>
                    Redireccionando...
                </Text>
            </View>
        );
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
                style={[styles.container, { backgroundColor: theme.colors.background }]}
                contentContainerStyle={styles.contentContainer}
            >
                <View style={styles.headerContainer}>
                    <Title style={[styles.title, { color: theme.colors.onBackground }]}>
                        Restablecer contraseña
                    </Title>
                    <Text style={{ color: theme.colors.onBackground }}>
                        Crea una nueva contraseña para tu cuenta
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
                            Ir al inicio de sesión
                        </Button>
                    </View>
                ) : (
                    <View style={styles.formContainer}>
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
                                    style={styles.input}
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
                            Cambiar contraseña
                        </Button>
                    </View>
                )}
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
});

export default ResetPasswordScreen;