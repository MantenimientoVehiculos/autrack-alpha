// src/shared/components/ui/NotificationBadge.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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

    // No mostrar nada si no hay notificaciones no leídas
    if (unreadCount <= 0) {
        return null;
    }

    // Formatear el contador (ej: 99+ si excede maxCount)
    const displayCount = unreadCount > maxCount ? `${maxCount}+` : `${unreadCount}`;

    // Ajustar tamaño según el número de dígitos
    const finalSize = displayCount.length > 2 ? size + 6 : size;

    return (
        <View style={[
            styles.badge,
            {
                width: finalSize,
                height: finalSize,
                borderRadius: finalSize / 2,
                // Si el número es mayor a 9, hacemos el badge un poco más ancho
                paddingHorizontal: displayCount.length > 1 ? 4 : 0
            }
        ]}>
            <Text style={[
                styles.text,
                { fontSize: finalSize > size ? size * 0.4 : size * 0.5 }
            ]}>
                {displayCount}
            </Text>
        </View>
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
    },
    text: {
        color: 'white',
        fontWeight: 'bold',
    }
});

export default NotificationBadge;