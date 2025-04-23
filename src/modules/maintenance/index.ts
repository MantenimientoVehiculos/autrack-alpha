// src/modules/maintenance/index.ts
// Exportar componentes principales
export { default as MaintenanceFormScreen } from './screens/MaintenanceFormScreen';
export { default as MaintenanceListScreen } from './screens/MaintenanceListScreen';
export { default as MaintenanceScheduleScreen } from './screens/MaintenanceScheduleScreen';

// Exportar componentes
export { default as MaintenanceForm } from './components/MaintenanceForm';
export { default as MaintenanceCard } from './components/MaintenanceCard';
export { default as MaintenanceStatusCard } from './components/MaintenanceStatusCard';
export { default as MaintenanceReminderCard } from './components/MaintenanceReminderCard';
export { default as TypeCategorySelect } from './components/TypeCategorySelect';

// Exportar servicios
export { default as maintenanceApi } from './services/maintenanceApi';

// Exportar hooks
export { useMaintenance } from './hooks/useMaintenance';

// Exportar tipos
export * from './models/maintenance';

// Exportar navegación
export { MaintenanceStack, type MaintenanceStackParamList } from './navigation';