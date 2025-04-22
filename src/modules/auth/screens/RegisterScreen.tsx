// src/modules/Auth/screens/RegisterScreen.tsx
import React from 'react';
import { Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useRouter } from 'expo-router';
import { XStack, YStack, H1, Text, Form, ScrollView } from 'tamagui';
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
                flex={1}
                backgroundColor="$background"
                contentContainerStyle={{ flexGrow: 1 }}
            >
                <YStack
                    flex={1}
                    padding="$4"
                    justifyContent="center"
                    space="$4"
                >
                    <YStack space="$2" marginBottom="$4">
                        <H1>Crear cuenta</H1>
                        <Text color="$color">Completa tus datos para registrarte</Text>
                    </YStack>

                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <YStack space="$4">
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
                                Registrarme
                            </Button>
                        </YStack>
                    </Form>

                    <XStack justifyContent="center" marginTop="$2">
                        <Text>¿Ya tienes una cuenta? </Text>
                        <Text color="$primary" onPress={navigateToLogin} fontWeight="bold">
                            Iniciar sesión
                        </Text>
                    </XStack>
                </YStack>
            </ScrollView>
        </TouchableWithoutFeedback>
    );
};

export default RegisterScreen;