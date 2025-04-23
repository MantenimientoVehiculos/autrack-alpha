// src/modules/notifications/components/NotificationToast.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Platform } from 'react-native';
import { useNotificationContext } from '../context/NotificationProvider';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const TOAST_HEIGHT = 80;
const TOAST_DURATION = 5000; // 5 segundos

export const NotificationToast: React.FC = () => {
    const { latestNotification, markAsRead, formatNotificationDate } = useNotificationContext();
    const router = useRouter();
    const { theme } = useAppTheme();

    // Refs para evitar actualizaciones de estado innecesarias
    const visibleRef = useRef(false);
    const processingRef = useRef(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastNotificationIdRef = useRef<number | null>(null);

    // Estados animados
    const translateY = useRef(new Animated.Value(-TOAST_HEIGHT - 20)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    // Estado para controlar el renderizado condicional
    const [shouldRender, setShouldRender] = useState(false);

    // Mostrar toast cuando llega una nueva notificación
    useEffect(() => {
        // Si no hay notificación, ya estamos procesando, o es la misma notificación ya mostrada, no hacer nada
        if (!latestNotification ||
            processingRef.current ||
            latestNotification.id_notificacion === lastNotificationIdRef.current ||
            latestNotification.leida) {
            return;
        }

        // Marcar como en procesamiento y guardar el ID
        processingRef.current = true;
        lastNotificationIdRef.current = latestNotification.id_notificacion;

        // Vibrar para alertar al usuario (solo una vez)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            .catch(error => console.error("Haptics error:", error));

        // Limpiar timeout anterior si existe
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        // Hacer visible el toast
        setShouldRender(true);
        visibleRef.current = true;

        // Animar entrada
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: Platform.OS === 'ios' ? 50 : 10,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            // Configurar temporizador para ocultarlo automáticamente
            timeoutRef.current = setTimeout(() => {
                hideToast();
            }, TOAST_DURATION);

            // Liberar flag de procesamiento
            processingRef.current = false;
        });

        // Limpiar al desmontar
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, [latestNotification]);

    // Ocultar toast con animación
    const hideToast = () => {
        if (!visibleRef.current) return;

        // Evitar múltiples animaciones
        visibleRef.current = false;

        // Limpiar timeout si existe
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        // Animar salida
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: -TOAST_HEIGHT - 20,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setShouldRender(false);
        });
    };

    // Manejar toque en la notificación
    const handlePress = async () => {
        // Marcar como leída y ocultar primero antes de navegar
        if (latestNotification) {
            try {
                await markAsRead(latestNotification.id_notificacion);
            } catch (error) {
                console.error("Error marking notification as read:", error);
            }
        }

        // Ocultar toast
        hideToast();

        // Pequeño retraso para la animación antes de navegar
        setTimeout(() => {
            // Navegar a la pantalla de notificaciones
            router.push('/notifications/index');
        }, 300);
    };

    // Si no hay notificación o no se debe renderizar, no mostrar nada
    if (!latestNotification || !shouldRender) {
        return null;
    }

    // Colores según el tema
    const bgColor = theme === 'dark' ? 'rgba(34, 34, 34, 0.95)' : 'rgba(255, 255, 255, 0.95)';
    const textColor = theme === 'dark' ? '#F9F9F9' : '#313131';
    const secondaryTextColor = theme === 'dark' ? '#BBBBBB' : '#666666';
    const borderColor = theme === 'dark' ? '#3A3A3A' : '#E0E0E0';

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    backgroundColor: bgColor,
                    borderColor: borderColor,
                    transform: [{ translateY }],
                    opacity,
                },
            ]}
        >
            <TouchableOpacity
                style={styles.touchable}
                onPress={handlePress}
                activeOpacity={0.8}
            >
                <View style={styles.content}>
                    <View style={styles.indicator} />
                    <View style={styles.textContainer}>
                        <Text
                            style={[styles.title, { color: textColor }]}
                            numberOfLines={1}
                        >
                            {latestNotification.titulo}
                        </Text>
                        <Text
                            style={[styles.message, { color: textColor }]}
                            numberOfLines={1}
                        >
                            {latestNotification.mensaje}
                        </Text>
                        <Text style={[styles.time, { color: secondaryTextColor }]}>
                            {formatNotificationDate(latestNotification.fecha_creacion)}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 16,
        right: 16,
        height: TOAST_HEIGHT,
        borderRadius: 12,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        zIndex: 9999,
    },
    touchable: {
        flex: 1,
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#9D7E68',
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    message: {
        fontSize: 14,
        marginBottom: 2,
    },
    time: {
        fontSize: 12,
    },
});

export default NotificationToast;