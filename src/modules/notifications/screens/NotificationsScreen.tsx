// src/modules/notifications/screens/NotificationsScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { GradientHeader } from '@/src/shared/components/ui/GradientHeader';
import { Button } from '@/src/shared/components/ui/Button';
import { useNotificationContext } from '../context/NotificationProvider';
import NotificationItem from '../components/NotificationItem';
import { Notification } from '../models/notification';
import { WebSocketIndicator } from '../components/WebSocketIndicator';

export const NotificationsScreen: React.FC = () => {
    const router = useRouter();
    const { theme } = useAppTheme();
    const {
        notifications,
        unreadCount,
        isLoading,
        error,
        loadNotifications,
        loadUnreadNotifications,
        markAsRead,
        markAllAsRead,
        formatNotificationDate,
        wsConnected
    } = useNotificationContext();

    const [refreshing, setRefreshing] = useState(false);
    const [showOnlyUnread, setShowOnlyUnread] = useState(false);

    // Manejar recarga manual
    const handleRefresh = async () => {
        setRefreshing(true);
        if (showOnlyUnread) {
            await loadUnreadNotifications();
        } else {
            await loadNotifications();
        }
        setRefreshing(false);
    };

    // Manejar cambio de filtro
    const toggleFilter = async () => {
        const newFilterState = !showOnlyUnread;
        setShowOnlyUnread(newFilterState);

        if (newFilterState) {
            await loadUnreadNotifications();
        } else {
            await loadNotifications();
        }
    };

    // Manejar marcar todas como leídas
    const handleMarkAllAsRead = async () => {
        if (unreadCount === 0) {
            Alert.alert('Información', 'No hay notificaciones sin leer');
            return;
        }

        Alert.alert(
            'Marcar todas como leídas',
            '¿Estás seguro que deseas marcar todas las notificaciones como leídas?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Marcar todas',
                    onPress: async () => {
                        const result = await markAllAsRead();
                        if (result.success) {
                            Alert.alert('Éxito', `Se marcaron ${result.affected} notificaciones como leídas`);
                        } else {
                            Alert.alert('Error', result.error || 'No se pudieron marcar las notificaciones');
                        }
                    }
                }
            ]
        );
    };

    // Manejar selección de notificación
    const handleNotificationPress = async (notification: Notification) => {
        // Si no está leída, marcarla como leída
        if (!notification.leida) {
            await markAsRead(notification.id_notificacion);
        }

        // Aquí podrías navegar a una vista detallada o implementar otra acción
        Alert.alert(
            notification.titulo,
            notification.mensaje,
            [{ text: 'Cerrar', style: 'cancel' }]
        );
    };

    // Colores según el tema
    const textColor = theme === 'dark' ? '#F9F9F9' : '#313131';
    const bgColor = theme === 'dark' ? '#111111' : '#FFFFFF';
    const secondaryBgColor = theme === 'dark' ? '#222222' : '#F5F5F5';
    const activeFilterColor = theme === 'dark' ? '#B27046' : '#9D7E68';
    const inactiveFilterColor = theme === 'dark' ? '#444444' : '#DDDDDD';

    // Renderizar cada notificación
    const renderNotification = ({ item }: { item: Notification }) => (
        <NotificationItem
            notification={item}
            onPress={handleNotificationPress}
            formatDate={formatNotificationDate}
        />
    );

    // Renderizar mensaje cuando no hay notificaciones
    const renderEmptyState = () => (
        <View style={styles.emptyStateContainer}>
            <Text style={[styles.emptyStateText, { color: textColor }]}>
                {showOnlyUnread
                    ? 'No tienes notificaciones sin leer'
                    : 'No tienes notificaciones'
                }
            </Text>
        </View>
    );

    // Renderizar encabezado con filtros
    const renderHeader = () => (
        <View style={styles.headerContainer}>
            {/* Indicador de estado WebSocket */}
            <View style={styles.wsIndicatorContainer}>
                <WebSocketIndicator />
            </View>

            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        {
                            backgroundColor: !showOnlyUnread ? activeFilterColor : 'transparent',
                            borderColor: !showOnlyUnread ? activeFilterColor : inactiveFilterColor
                        }
                    ]}
                    onPress={toggleFilter}
                    disabled={isLoading}
                >
                    <Text style={[
                        styles.filterText,
                        {
                            color: !showOnlyUnread
                                ? (theme === 'dark' ? '#FFFFFF' : '#FFFFFF')
                                : (theme === 'dark' ? '#BBBBBB' : '#666666')
                        }
                    ]}>
                        Todas
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        {
                            backgroundColor: showOnlyUnread ? activeFilterColor : 'transparent',
                            borderColor: showOnlyUnread ? activeFilterColor : inactiveFilterColor
                        }
                    ]}
                    onPress={toggleFilter}
                    disabled={isLoading}
                >
                    <Text style={[
                        styles.filterText,
                        {
                            color: showOnlyUnread
                                ? (theme === 'dark' ? '#FFFFFF' : '#FFFFFF')
                                : (theme === 'dark' ? '#BBBBBB' : '#666666')
                        }
                    ]}>
                        Sin leer {unreadCount > 0 && `(${unreadCount})`}
                    </Text>
                </TouchableOpacity>
            </View>

            <Button
                buttonVariant="outline"
                buttonSize="small"
                onPress={handleMarkAllAsRead}
                style={styles.markAllButton}
                disabled={unreadCount === 0 || isLoading}
            >
                Marcar todas como leídas
            </Button>
        </View>
    );

    // Mostrar error
    if (error && !refreshing) {
        return (
            <View style={[styles.container, { backgroundColor: bgColor }]}>
                <GradientHeader title="Notificaciones" showBackButton={false} />
                <View style={styles.errorContainer}>
                    <Text style={[styles.errorText, { color: theme === 'dark' ? '#CF6679' : '#CF6679' }]}>
                        {error}
                    </Text>
                    <Button
                        buttonVariant="primary"
                        buttonSize="medium"
                        onPress={handleRefresh}
                        style={styles.retryButton}
                    >
                        Reintentar
                    </Button>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <GradientHeader
                title="Notificaciones"
                showBackButton={false}
                rightComponent={
                    <WebSocketIndicator size={8} showLabel={false} />
                }
            />

            <FlatList
                data={notifications}
                renderItem={renderNotification}
                keyExtractor={(item) => item.id_notificacion.toString()}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={!isLoading ? renderEmptyState : null}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[theme === 'dark' ? '#B27046' : '#9D7E68']}
                        tintColor={theme === 'dark' ? '#B27046' : '#9D7E68'}
                    />
                }
            />

            {isLoading && !refreshing && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={theme === 'dark' ? '#B27046' : '#9D7E68'} />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        padding: 16,
        paddingBottom: 8,
    },
    wsIndicatorContainer: {
        alignItems: 'flex-end',
        marginBottom: 8,
    },
    filterContainer: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '500',
    },
    markAllButton: {
        alignSelf: 'flex-end',
    },
    listContent: {
        flexGrow: 1,
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        marginTop: 48,
    },
    emptyStateText: {
        fontSize: 16,
        textAlign: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 16,
    },
    retryButton: {
        marginTop: 16,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
});

export default NotificationsScreen;