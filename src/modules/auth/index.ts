// src/modules/Auth/index.ts
// Exportar componentes principales
export { default as LoginScreen } from './screens/LoginScreen';
export { default as RegisterScreen } from './screens/RegisterScreen';
export { default as ForgotPasswordScreen } from './screens/ForgotPasswordScreen';
export { default as ResetPasswordScreen } from './screens/ResetPasswordScreen';

// Exportar servicios
export { default as authApi } from './services/authApi';

// Exportar tipos de navegación
export { AuthStack, type AuthStackParamList } from './navigation';