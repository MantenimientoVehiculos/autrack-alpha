// src/shared/components/ui/NotificationBadge.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useNotificationContext } from '@/src/modules/notifications/context/NotificationProvider';

interface NotificationBadgeProps {
    size?: number;
    maxCount?: number;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
    size = 20,
    maxCount = 99
}) => {
    const { unreadCount } = useNotificationContext();
    const [shouldRender, setShouldRender] = useState(false);

    // Referencias para animaciones
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const prevUnreadCountRef = useRef(unreadCount);
    const animationRef = useRef<Animated.CompositeAnimation | null>(null);

    // Detectar cambios en el contador
    useEffect(() => {
        // Si había 0 y ahora hay notificaciones, animar entrada
        if (prevUnreadCountRef.current === 0 && unreadCount > 0) {
            setShouldRender(true);

            // Pequeño retraso para asegurar que el componente está renderizado
            setTimeout(() => {
                if (animationRef.current) {
                    animationRef.current.stop();
                }

                animationRef.current = Animated.spring(scaleAnim, {
                    toValue: 1,
                    useNativeDriver: true,
                    friction: 6,
                    tension: 300
                });

                animationRef.current.start();
            }, 10);
        }
        // Si había notificaciones y ahora hay 0, animar salida
        else if (prevUnreadCountRef.current > 0 && unreadCount === 0) {
            if (animationRef.current) {
                animationRef.current.stop();
            }

            animationRef.current = Animated.timing(scaleAnim, {
                toValue: 0,
                useNativeDriver: true,
                duration: 200
            });

            animationRef.current.start(({ finished }) => {
                if (finished) {
                    setShouldRender(false);
                }
            });
        }
        // Si ya había notificaciones y cambia el número, hacer un pequeño efecto de "bounce"
        else if (prevUnreadCountRef.current > 0 && unreadCount > 0 && prevUnreadCountRef.current !== unreadCount) {
            if (animationRef.current) {
                animationRef.current.stop();
            }

            // Secuencia de animación: pequeño -> grande -> normal
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 0.8,
                    useNativeDriver: true,
                    duration: 100
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1.2,
                    useNativeDriver: true,
                    friction: 8,
                    tension: 200
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    useNativeDriver: true,
                    friction: 6,
                    tension: 200
                })
            ]).start();
        }

        prevUnreadCountRef.current = unreadCount;
    }, [unreadCount, scaleAnim]);

    // No mostrar nada si no hay notificaciones no leídas o no debe renderizarse
    if (unreadCount <= 0 || !shouldRender) {
        return null;
    }

    // Formatear el contador (ej: 99+ si excede maxCount)
    const displayCount = unreadCount > maxCount ? `${maxCount}+` : `${unreadCount}`;

    // Ajustar tamaño según el número de dígitos
    const finalSize = displayCount.length > 2 ? size + 6 : size;

    return (
        <Animated.View
            style={[
                styles.badge,
                {
                    width: finalSize,
                    height: finalSize,
                    borderRadius: finalSize / 2,
                    paddingHorizontal: displayCount.length > 1 ? 4 : 0,
                    transform: [{ scale: scaleAnim }]
                }
            ]}
        >
            <Text
                style={[
                    styles.text,
                    { fontSize: finalSize > size ? size * 0.4 : size * 0.5 }
                ]}
                numberOfLines={1}
            >
                {displayCount}
            </Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    badge: {
        backgroundColor: '#F44336', // Rojo para notificaciones
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: -8,
        right: -8,
        zIndex: 10,
        elevation: 2,
        // Sombra para iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        // Asegurar que el texto no se salga
        overflow: 'hidden'
    },
    text: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    }
});

export default NotificationBadge;