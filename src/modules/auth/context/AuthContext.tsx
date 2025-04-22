// src/modules/Auth/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    authApi,
    User,
    LoginCredentials,
    RegisterData,
    ForgotPasswordData,
    ResetPasswordData,
} from '../services/authApi';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (credentials: LoginCredentials) => Promise<boolean>;
    register: (userData: RegisterData) => Promise<boolean>;
    logout: () => Promise<void>;
    forgotPassword: (
        data: ForgotPasswordData
    ) => Promise<{ success: boolean; message: string }>;
    resetPassword: (
        data: ResetPasswordData
    ) => Promise<{ success: boolean; message: string }>;
    error: string | null;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Al montar, cargamos usuario si existe
    useEffect(() => {
        (async () => {
            setIsLoading(true);
            try {
                const currentUser = await authApi.getCurrentUser();
                setUser(currentUser);
            } catch (err) {
                console.error(err);
                setError('Error al cargar usuario');
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    const login = async (credentials: LoginCredentials): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        try {
            const { user: u } = await authApi.login(credentials);
            setUser(u);
            return true;
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Error durante inicio de sesión');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData: RegisterData): Promise<boolean> => {
        setIsLoading(true);
        setError(null);
        try {
            const { user: u } = await authApi.register(userData);
            setUser(u);
            return true;
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Error durante registro');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async (): Promise<void> => {
        await authApi.logout();
        setUser(null);
    };

    const forgotPassword = async (
        data: ForgotPasswordData
    ): Promise<{ success: boolean; message: string }> => {
        setIsLoading(true);
        setError(null);
        try {
            const { message } = await authApi.forgotPassword(data);
            return { success: true, message };
        } catch (err: any) {
            console.error(err);
            const msg = err.message || 'Error al solicitar recuperación';
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setIsLoading(false);
        }
    };

    const resetPassword = async (
        data: ResetPasswordData
    ): Promise<{ success: boolean; message: string }> => {
        setIsLoading(true);
        setError(null);
        try {
            const { message } = await authApi.resetPassword(data);
            return { success: true, message };
        } catch (err: any) {
            console.error(err);
            const msg = err.message || 'Error al restablecer contraseña';
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setIsLoading(false);
        }
    };

    const clearError = () => setError(null);

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                register,
                logout,
                forgotPassword,
                resetPassword,
                error,
                clearError,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return context;
};

export default AuthContext;
