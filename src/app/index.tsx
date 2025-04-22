// app/index.tsx
import React, { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../modules/auth';
import { ActivityIndicator, View } from 'react-native';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  // Si está cargando, mostrar un indicador
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#9D7E68" />
      </View>
    );
  }

  // Redireccionar basado en el estado de autenticación
  if (!isAuthenticated) {
    return <Redirect href="/auth/login" />;
  }

  // Si está autenticado, redireccionar a la lista de vehículos
  return <Redirect href="/vehicles" />;
}