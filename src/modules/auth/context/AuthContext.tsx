// src/modules/Auth/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi, User, LoginCredentials, RegisterData, ForgotPasswordData, ResetPasswordData } from '../services/authApi';

// Interfaz para el contexto de autenticación
interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (credentials: LoginCredentials) => Promise<boolean>;
    register: (userData: RegisterData) => Promise<boolean>;
    logout: () => void;
    forgotPassword: (data: ForgotPasswordData) => Promise<{ success: boolean; message: string }>;
    resetPassword: (data: ResetPasswordData) => Promise<{ success: boolean; message: string }>;
    error: string | null;
    clearError: () => void;
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Proveedor del contexto
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Cargar usuario al inicio
    useEffect(() => {
        loadUser();
    }, []);

    // Cargar usuario desde el storage
    const loadUser = () => {
        setIsLoading(true);
        try {
            const currentUser = authApi.getCurrentUser();
            setUser(currentUser);
        } catch (err) {
            setError('Error al cargar datos de usuario');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // Iniciar sesión
    const login = async (credentials: LoginCredentials): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await authApi.login(credentials);

            if (response.error) {
                setError(response.error.message);
                return false;
            }

            if (response.data) {
                setUser(response.data.user);
                return true;
            }

            return false;
        } catch (err) {
            setError('Error durante el inicio de sesión');
            console.error(err);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // Registrar usuario
    const register = async (userData: RegisterData): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await authApi.register(userData);

            if (response.error) {
                setError(response.error.message);
                return false;
            }

            if (response.data) {
                setUser(response.data.user);
                return true;
            }

            return false;
        } catch (err) {
            setError('Error durante el registro');
            console.error(err);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // Cerrar sesión
    const logout = () => {
        authApi.logout();
        setUser(null);
    };

    // Recuperar contraseña
    const forgotPassword = async (data: ForgotPasswordData): Promise<{ success: boolean; message: string }> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await authApi.forgotPassword(data);

            if (response.error) {
                setError(response.error.message);
                return { success: false, message: response.error.message };
            }

            return {
                success: true,
                message: response.data?.message || 'Instrucciones enviadas a tu correo'
            };
        } catch (err) {
            const errorMsg = 'Error al procesar la solicitud';
            setError(errorMsg);
            console.error(err);
            return { success: false, message: errorMsg };
        } finally {
            setIsLoading(false);
        }
    };

    // Restablecer contraseña
    const resetPassword = async (data: ResetPasswordData): Promise<{ success: boolean; message: string }> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await authApi.resetPassword(data);

            if (response.error) {
                setError(response.error.message);
                return { success: false, message: response.error.message };
            }

            return {
                success: true,
                message: response.data?.message || 'Contraseña actualizada correctamente'
            };
        } catch (err) {
            const errorMsg = 'Error al restablecer la contraseña';
            setError(errorMsg);
            console.error(err);
            return { success: false, message: errorMsg };
        } finally {
            setIsLoading(false);
        }
    };

    // Limpiar errores
    const clearError = () => {
        setError(null);
    };

    // Valor del contexto
    const value = {
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        error,
        clearError
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizado para usar el contexto
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }

    return context;
};

export default AuthContext;