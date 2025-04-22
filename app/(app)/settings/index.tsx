// app/settings/index.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useAuth } from '@/src/modules/auth/context/AuthContext';
import { RequireAuth } from '@/src/shared/components/RequireAuth';
import { GradientHeader } from '@/src/shared/components/ui/GradientHeader';
import { Card } from '@/src/shared/components/ui/Card';
import { Button } from '@/src/shared/components/ui/Button';
import { useAppTheme } from '@/src/shared/theme/ThemeProvider';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useAppTheme();
  const router = useRouter();
  
  const isDarkMode = theme === 'dark';
  const textColor = isDarkMode ? '#F9F9F9' : '#313131';
  const secondaryTextColor = isDarkMode ? '#BBBBBB' : '#666666';
  const backgroundColor = isDarkMode ? '#111111' : '#FFFFFF';
  
  const handleLogout = () => {
    logout();
    router.replace('/auth/login');
  };
  
  return (
    <RequireAuth>
      <View style={[styles.container, { backgroundColor }]}>
        <GradientHeader title="Configuración" showBackButton={false} />
        
        <ScrollView contentContainerStyle={styles.content}>
          {/* Perfil */}
          <Card style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Perfil</Text>
            
            <View style={styles.profileInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.nombre_completo ? user.nombre_completo.charAt(0).toUpperCase() : '?'}
                </Text>
              </View>
              
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: textColor }]}>
                  {user?.nombre_completo || 'Usuario'}
                </Text>
                <Text style={[styles.userEmail, { color: secondaryTextColor }]}>
                  {user?.correo || 'correo@ejemplo.com'}
                </Text>
              </View>
            </View>
            
            <Button 
              buttonVariant="outline" 
              buttonSize="medium" 
              onPress={() => {}}
              style={styles.editProfileButton}
            >
              Editar Perfil
            </Button>
          </Card>
          
          {/* Tema */}
          <Card style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Tema</Text>
            
            <View style={styles.themeOption}>
              <Text style={[styles.themeText, { color: textColor }]}>
                Modo oscuro
              </Text>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: '#D9D9D9', true: '#B27046' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </Card>
          
          {/* Notificaciones */}
          <Card style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Notificaciones</Text>
            
            <View style={styles.notificationOption}>
              <Text style={[styles.notificationText, { color: textColor }]}>
                Recordatorios de mantenimiento
              </Text>
              <Switch
                value={true}
                trackColor={{ false: '#D9D9D9', true: '#B27046' }}
                thumbColor="#FFFFFF"
              />
            </View>
            
            <View style={styles.notificationOption}>
              <Text style={[styles.notificationText, { color: textColor }]}>
                Actualizaciones de la app
              </Text>
              <Switch
                value={false}
                trackColor={{ false: '#D9D9D9', true: '#B27046' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </Card>
          
          {/* Acerca de */}
          <Card style={styles.section}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Acerca de</Text>
            
            <TouchableOpacity style={styles.aboutOption}>
              <Text style={[styles.aboutText, { color: textColor }]}>
                Términos y condiciones
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.aboutOption}>
              <Text style={[styles.aboutText, { color: textColor }]}>
                Política de privacidad
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.aboutOption}>
              <Text style={[styles.aboutText, { color: textColor }]}>
                Contacto
              </Text>
            </TouchableOpacity>
            
            <Text style={[styles.versionText, { color: secondaryTextColor }]}>
              Versión 1.0.0
            </Text>
          </Card>
          
          {/* Botón de cierre de sesión */}
          <Button 
            buttonVariant="outline" 
            buttonSize="large" 
            onPress={handleLogout}
            style={styles.logoutButton}
          >
            Cerrar sesión
          </Button>
        </ScrollView>
      </View>
    </RequireAuth>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#9D7E68',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  editProfileButton: {
    marginTop: 8,
  },
  themeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  themeText: {
    fontSize: 16,
  },
  notificationOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  notificationText: {
    fontSize: 16,
  },
  aboutOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  aboutText: {
    fontSize: 16,
  },
  versionText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
  },
  logoutButton: {
    marginVertical: 16,
  },
});