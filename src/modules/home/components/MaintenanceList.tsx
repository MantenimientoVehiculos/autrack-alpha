// src/modules/home/components/MaintenanceList.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { Vehicle } from '@/src/modules/vehicles/models/vehicle';
import { NextMaintenanceItem } from '@/src/modules/maintenance/models/maintenance';

interface MaintenanceListProps {
  upcomingMaintenance: { 
    vehicle: Vehicle; 
    maintenanceItems: NextMaintenanceItem[] 
  }[];
  isLoading: boolean;
}

const MaintenanceList: React.FC<MaintenanceListProps> = ({
  upcomingMaintenance,
  isLoading
}) => {
  const { theme } = useAppTheme();
  const router = useRouter();

  // Navegación a la pantalla de mantenimiento
  const navigateToMaintenance = (vehicleId?: number, maintenanceTypeId?: number) => {
    if (vehicleId && maintenanceTypeId) {
      router.push(`/maintenance/add?vehicleId=${vehicleId}&typeId=${maintenanceTypeId}`);
    } else if (vehicleId) {
      router.push(`/maintenance/add?vehicleId=${vehicleId}`);
    }
  };

  // Determinar el color de estado de mantenimiento
  const getMaintenanceStatusColor = (item: NextMaintenanceItem) => {
    if (item.status.time_status.is_due || item.status.km_status.is_due) {
      return '#F44336'; // Rojo
    }
    if (item.status.time_status.is_upcoming || item.status.km_status.is_upcoming) {
      return '#FFC107'; // Amarillo
    }
    return '#4CAF50'; // Verde
  };

  // Formatear fecha
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Colores según el tema
  const primaryColor = theme === 'dark' ? '#B27046' : '#9D7E68';
  const cardColor = theme === 'dark' ? '#222222' : '#FFFFFF';
  const textColor = theme === 'dark' ? '#F9F9F9' : '#313131';
  const secondaryTextColor = theme === 'dark' ? '#BBBBBB' : '#666666';

  if (isLoading) {
    return (
      <View style={[styles.emptyStateContainer, { backgroundColor: cardColor }]}>
        <ActivityIndicator size="large" color={primaryColor} />
        <Text style={[styles.emptyStateText, { color: textColor, marginTop: 16 }]}>
          Cargando mantenimientos...
        </Text>
      </View>
    );
  }

  if (upcomingMaintenance.length === 0 || upcomingMaintenance.every(vm => vm.maintenanceItems.length === 0)) {
    return (
      <View style={[styles.emptyStateContainer, { backgroundColor: cardColor }]}>
        <Text style={[styles.emptyStateText, { color: textColor }]}>
          No hay mantenimientos programados
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: primaryColor }]}
          onPress={() => router.push('/maintenance/add')}
        >
          <Text style={styles.addButtonText}>Programar mantenimiento</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {upcomingMaintenance.map((vehicleMaintenance, vIndex) => 
        vehicleMaintenance.maintenanceItems.map((item, index) => {
          const statusColor = getMaintenanceStatusColor(item);
          
          return (
            <TouchableOpacity
              key={`maintenance-${vIndex}-${index}`}
              style={[styles.maintenanceCard, { backgroundColor: cardColor }]}
              onPress={() => navigateToMaintenance(vehicleMaintenance.vehicle.id_vehiculo, item.type_id)}
              activeOpacity={0.7}
            >
              <View style={[styles.maintenanceStatusIndicator, { backgroundColor: statusColor }]} />
              <View style={styles.maintenanceCardContent}>
                <View>
                  <Text style={[styles.maintenanceType, { color: textColor }]}>
                    {item.type.nombre}
                  </Text>
                  <Text style={[styles.maintenanceVehicle, { color: secondaryTextColor }]}>
                    {vehicleMaintenance.vehicle.marca?.nombre} {vehicleMaintenance.vehicle.modelo?.nombre}
                  </Text>
                </View>
                
                <View style={styles.maintenanceDetails}>
                  <Text style={[styles.maintenanceDate, { color: textColor }]}>
                    {formatDate(item.next_maintenance.by_date)}
                  </Text>
                  <Text style={[styles.maintenanceKm, { color: secondaryTextColor }]}>
                    {item.next_maintenance.by_km.toLocaleString()} km
                  </Text>
                </View>
                
                <TouchableOpacity
                  style={[styles.scheduleButton, { backgroundColor: primaryColor }]}
                  onPress={() => navigateToMaintenance(vehicleMaintenance.vehicle.id_vehiculo, item.type_id)}
                >
                  <Text style={styles.scheduleButtonText}>Agendar</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 8,
  },
  maintenanceCard: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 12,
    marginHorizontal: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  maintenanceStatusIndicator: {
    width: 6,
    height: '100%',
  },
  maintenanceCardContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  maintenanceType: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  maintenanceVehicle: {
    fontSize: 14,
  },
  maintenanceDetails: {
    marginHorizontal: 12,
    flex: 1,
  },
  maintenanceDate: {
    fontSize: 14,
    fontWeight: '500',
  },
  maintenanceKm: {
    fontSize: 12,
    marginTop: 2,
  },
  scheduleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyStateContainer: {
    borderRadius: 12,
    padding: 24,
    marginHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  addButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
});

export default MaintenanceList;