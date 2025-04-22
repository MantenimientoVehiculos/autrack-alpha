// src/modules/Auth/navigation.ts
import { Stack } from 'expo-router';

export type AuthStackParamList = {
  login: undefined;
  register: undefined;
  'forgot-password': undefined;
  'reset-password': { token: string };
};

export const AuthStack = () => {
  return (
    <Stack>
      <Stack.Screen
        name="login"
        options={{
          title: 'Iniciar sesión',
          headerShown: false
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: 'Registro',
          headerShown: false
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          title: 'Recuperar contraseña',
          headerShown: false
        }}
      />
      <Stack.Screen
        name="reset-password"
        options={{
          title: 'Restablecer contraseña',
          headerShown: false
        }}
      />
    </Stack>
  );
};

export default AuthStack;