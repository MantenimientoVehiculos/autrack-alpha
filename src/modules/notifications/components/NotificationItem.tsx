// src/modules/notifications/components/NotificationItem.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { Notification } from '../models/notification';

interface NotificationItemProps {
    notification: Notification;
    onPress: (notification: Notification) => void;
    formatDate: (date: string) => string;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
    notification,
    onPress,
    formatDate
}) => {
    const { theme } = useAppTheme();
    const { titulo, mensaje, leida, fecha_creacion } = notification;

    // Calcular colores según el tema
    const backgroundColor = theme === 'dark'
        ? leida ? '#222222' : 'rgba(178, 112, 70, 0.2)'
        : leida ? '#FFFFFF' : 'rgba(157, 126, 104, 0.1)';

    const textColor = theme === 'dark' ? '#F9F9F9' : '#313131';
    const secondaryTextColor = theme === 'dark' ? '#BBBBBB' : '#666666';
    const borderColor = theme === 'dark' ? '#333333' : '#EEEEEE';

    // Indicador de no leído
    const unreadIndicatorColor = theme === 'dark' ? '#B27046' : '#9D7E68';

    return (
        <TouchableOpacity
            style={[
                styles.container,
                { backgroundColor, borderColor },
                leida ? null : styles.unreadContainer
            ]}
            onPress={() => onPress(notification)}
            activeOpacity={0.7}
        >
            {!leida && (
                <View style={[styles.unreadIndicator, { backgroundColor: unreadIndicatorColor }]} />
            )}

            <View style={styles.contentContainer}>
                <View style={styles.headerContainer}>
                    <Text style={[
                        styles.title,
                        { color: textColor },
                        !leida && styles.boldText
                    ]}>
                        {titulo}
                    </Text>
                    <Text style={[styles.date, { color: secondaryTextColor }]}>
                        {formatDate(fecha_creacion)}
                    </Text>
                </View>

                <Text style={[
                    styles.message,
                    { color: textColor },
                    !leida && styles.boldText
                ]} numberOfLines={2}>
                    {mensaje}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        position: 'relative',
    },
    unreadContainer: {
        borderLeftWidth: 3,
    },
    unreadIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        position: 'absolute',
        top: 18,
        left: 16,
    },
    contentContainer: {
        flex: 1,
        marginLeft: 16,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        fontSize: 16,
        flex: 1,
        marginRight: 8,
    },
    boldText: {
        fontWeight: '700',
    },
    date: {
        fontSize: 12,
    },
    message: {
        fontSize: 14,
        lineHeight: 20,
    },
});

export default NotificationItem;