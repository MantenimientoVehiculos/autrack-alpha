// src/modules/notifications/components/WebSocketIndicator.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useWebSocket } from '@/src/shared/services/websocket';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';

interface WebSocketIndicatorProps {
    showLabel?: boolean;
    size?: number;
}

export const WebSocketIndicator: React.FC<WebSocketIndicatorProps> = ({
    showLabel = true,
    size = 10
}) => {
    const { isConnected, connect } = useWebSocket();
    const { theme } = useAppTheme();

    // Determinar color basado en el estado de conexión
    const getStatusColor = () => {
        if (isConnected) {
            return '#4CAF50'; // Verde para conectado
        } else {
            return '#F44336'; // Rojo para desconectado
        }
    };

    // Intentar reconectar al hacer clic
    const handlePress = () => {
        if (!isConnected) {
            connect();
        }
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={handlePress}
            activeOpacity={0.7}
            disabled={isConnected}
        >
            <View
                style={[
                    styles.indicator,
                    {
                        backgroundColor: getStatusColor(),
                        width: size,
                        height: size,
                        borderRadius: size / 2
                    }
                ]}
            />

            {showLabel && (
                <Text
                    style={[
                        styles.label,
                        { color: theme === 'dark' ? '#BBBBBB' : '#666666' }
                    ]}
                >
                    {isConnected ? 'En línea' : 'Fuera de línea'}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 4,
    },
    indicator: {
        marginRight: 6,
    },
    label: {
        fontSize: 12,
    },
});

export default WebSocketIndicator;