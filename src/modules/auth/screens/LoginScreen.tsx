// src/modules/auth/screens/LoginScreen.tsx
import React from 'react';
import { Keyboard, TouchableWithoutFeedback, View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, Title, useTheme } from 'react-native-paper';
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
    const theme = useTheme();

    // Configurar React Hook Form con el resolver de Zod
    const {
        control,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            correo: 'kennyp41234@gmail.com',
            contrasena: 'Agente50@'
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
            <ScrollView
                style={[styles.container, { backgroundColor: theme.colors.background }]}
                contentContainerStyle={styles.contentContainer}
            >
                <View style={styles.headerContainer}>
                    <Title style={[styles.title, { color: theme.colors.onBackground }]}>
                        Iniciar sesión
                    </Title>
                    <Text style={{ color: theme.colors.onBackground }}>
                        Ingresa tus credenciales para continuar
                    </Text>
                </View>

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
                        Iniciar sesión
                    </Button>
                </View>

                <View style={styles.footerContainer}>
                    <View style={styles.registerContainer}>
                        <Text style={{ color: theme.colors.onBackground }}>
                            ¿No tienes una cuenta?{' '}
                        </Text>
                        <Text
                            style={[styles.link, { color: theme.colors.primary }]}
                            onPress={navigateToRegister}
                        >
                            Regístrate
                        </Text>
                    </View>

                    <Text
                        style={[styles.forgotPassword, { color: theme.colors.primary }]}
                        onPress={navigateToForgotPassword}
                    >
                        ¿Olvidaste tu contraseña?
                    </Text>
                </View>
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
        gap: 5,
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
    footerContainer: {
        marginTop: 24,
        alignItems: 'center',
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 16,
    },
    link: {
        fontWeight: 'bold',
    },
    forgotPassword: {
        textAlign: 'center',
    },
});

export default LoginScreen;