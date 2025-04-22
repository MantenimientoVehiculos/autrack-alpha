// src/modules/auth/screens/RegisterScreen.tsx
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
const registerSchema = z.object({
    nombre_completo: z.string()
        .min(1, { message: 'El nombre completo es requerido' })
        .max(100, { message: 'El nombre es demasiado largo' }),
    correo: z.string()
        .min(1, { message: 'El correo es requerido' })
        .email({ message: 'Correo electrónico inválido' }),
    contrasena: z.string()
        .min(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
        .max(50, { message: 'La contraseña es demasiado larga' }),
    confirmar_contrasena: z.string()
        .min(1, { message: 'Debe confirmar la contraseña' })
}).refine(data => data.contrasena === data.confirmar_contrasena, {
    message: "Las contraseñas no coinciden",
    path: ["confirmar_contrasena"]
});

// Tipo derivado del esquema de validación
type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterScreen: React.FC = () => {
    const router = useRouter();
    const { register, error, clearError, isLoading } = useAuth();
    const theme = useTheme();

    // Configurar React Hook Form con el resolver de Zod
    const {
        control,
        handleSubmit,
        formState: { errors }
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            nombre_completo: '',
            correo: '',
            contrasena: '',
            confirmar_contrasena: ''
        }
    });

    // Manejar registro
    const onSubmit = async (data: RegisterFormData) => {
        Keyboard.dismiss();
        clearError();

        const success = await register({
            nombre_completo: data.nombre_completo,
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
                        Crear cuenta
                    </Title>
                    <Text style={{ color: theme.colors.onBackground }}>
                        Completa tus datos para registrarte
                    </Text>
                </View>

                <View style={styles.formContainer}>
                    <Controller
                        control={control}
                        name="nombre_completo"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <Input
                                label="Nombre completo"
                                placeholder="Nombre y apellido"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                error={errors.nombre_completo?.message}
                                autoCapitalize="words"
                                autoComplete="name"
                                style={styles.input}
                            />
                        )}
                    />

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
                                placeholder="Confirma tu contraseña"
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
                        Registrarme
                    </Button>
                </View>

                <View style={styles.footerContainer}>
                    <View style={styles.loginContainer}>
                        <Text style={{ color: theme.colors.onBackground }}>
                            ¿Ya tienes una cuenta?{' '}
                        </Text>
                        <Text
                            style={[styles.link, { color: theme.colors.primary }]}
                            onPress={navigateToLogin}
                        >
                            Iniciar sesión
                        </Text>
                    </View>
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
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 16,
    },
    link: {
        fontWeight: 'bold',
    },
});

export default RegisterScreen;