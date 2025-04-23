// src/modules/notifications/components/WebSocketIndicator.tsx
import React, { useState, useEffect } from 'react';
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
    // Usar el hook de WebSocket con un delay para la UI
    const { isConnected, connect } = useWebSocket();
    const { theme } = useAppTheme();
    const [isReconnecting, setIsReconnecting] = useState(false);

    // Estado visual estable para evitar parpadeos
    const [stableConnectionState, setStableConnectionState] = useState(isConnected);

    // Actualizar el estado estable solo después de un breve retraso
    useEffect(() => {
        // Si estamos conectados, actualizamos inmediatamente
        if (isConnected) {
            setStableConnectionState(true);
            setIsReconnecting(false);
            return;
        }

        // Si nos desconectamos, esperamos un poco antes de mostrar como desconectado
        // para evitar parpadeos durante reconexiones rápidas
        const timer = setTimeout(() => {
            setStableConnectionState(isConnected);
        }, 2000);

        return () => clearTimeout(timer);
    }, [isConnected]);

    // Determinar color basado en el estado de conexión
    const getStatusColor = () => {
        if (stableConnectionState) {
            return '#4CAF50'; // Verde para conectado
        } else {
            return '#F44336'; // Rojo para desconectado
        }
    };

    // Intentar reconectar al hacer clic
    const handleReconnect = async () => {
        if (!stableConnectionState && !isReconnecting) {
            setIsReconnecting(true);
            try {
                await connect();
                // La actualización del estado se maneja en el efecto
            } catch (error) {
                console.error("Error reconnecting:", error);
            } finally {
                // Si después de 3 segundos no hay conexión, permitir reintentar
                setTimeout(() => {
                    if (!isConnected) {
                        setIsReconnecting(false);
                    }
                }, 3000);
            }
        }
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={handleReconnect}
            activeOpacity={0.7}
            disabled={stableConnectionState || isReconnecting}
        >
            <View
                style={[
                    styles.indicator,
                    {
                        backgroundColor: getStatusColor(),
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        opacity: isReconnecting ? 0.5 : 1
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
                    {isReconnecting
                        ? 'Conectando...'
                        : stableConnectionState
                            ? 'En línea'
                            : 'Fuera de línea'}
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