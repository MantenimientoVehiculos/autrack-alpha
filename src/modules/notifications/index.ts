// src/modules/notifications/index.ts
// Exportar componentes principales
export { default as NotificationsScreen } from './screens/NotificationsScreen';

// Exportar componentes
export { default as NotificationItem } from './components/NotificationItem';

// Exportar servicios
export { default as notificationsApi } from './services/notificationsApi';

// Exportar hooks
export { default as useNotifications } from './hooks/useNotifications';

// Exportar tipos
export * from './models/notification';

// Exportar navegación
export { NotificationsStack, type NotificationsStackParamList } from './navigation';