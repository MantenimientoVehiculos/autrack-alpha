// src/modules/notifications/components/NotificationToast.tsx
import React, { useEffect, useState } from 'react';
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

    const [visible, setVisible] = useState(false);
    const translateY = new Animated.Value(-TOAST_HEIGHT - 20);
    const opacity = new Animated.Value(0);

    // Mostrar toast cuando llega una nueva notificación no leída
    useEffect(() => {
        if (latestNotification && !latestNotification.leida) {
            // Vibrar para alertar al usuario
            Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
            );

            // Mostrar toast
            setVisible(true);

            // Animar entrada
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: Platform.OS === 'ios' ? 50 : 10, // Ajustar para iOS notch
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();

            // Configurar temporizador para ocultar automáticamente
            const timer = setTimeout(() => {
                hideToast();
            }, TOAST_DURATION);

            // Limpiar temporizador al desmontar
            return () => clearTimeout(timer);
        }
    }, [latestNotification]);

    // Ocultar toast con animación
    const hideToast = () => {
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
            setVisible(false);
        });
    };

    // Manejar toque en la notificación
    const handlePress = () => {
        // Marcar como leída
        if (latestNotification) {
            markAsRead(latestNotification.id_notificacion);
        }

        // Ocultar toast
        hideToast();

        // Navegar a la pantalla de notificaciones
        router.push('/notifications');
    };

    // Si no hay notificación o no es visible, no renderizar nada
    if (!latestNotification || !visible) {
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