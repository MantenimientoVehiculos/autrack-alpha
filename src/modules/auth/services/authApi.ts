// src/modules/Auth/services/authApi.ts
import apiClient from '@/src/shared/api/client';
import storage from '@/src/shared/storage';

// Tipos para la autenticación
export interface User {
    id_usuario: number;
    correo: string;
    nombre_completo: string;
    fecha_creacion: string;
    fecha_actualizacion: string;
    ultimo_inicio_sesion?: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface LoginCredentials {
    correo: string;
    contrasena: string;
}

export interface RegisterData {
    correo: string;
    nombre_completo: string;
    contrasena: string;
}

export interface ForgotPasswordData {
    correo: string;
}

export interface ResetPasswordData {
    token: string;
    nueva_contrasena: string;
}

class AuthApi {
    // Registro de usuario
    async register(userData: RegisterData): Promise<AuthResponse> {
        const { user, token } = await apiClient.post<AuthResponse>('/auth/register', userData);
        await this.saveAuthData({ user, token });
        return { user, token };
    }

    // Inicio de sesión
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const { user, token } = await apiClient.post<AuthResponse>('/auth/login', credentials);
        await this.saveAuthData({ user, token });
        return { user, token };
    }

    // Recuperación de contraseña
    async forgotPassword(data: ForgotPasswordData): Promise<{ message: string }> {
        return apiClient.post<{ message: string }>('/auth/forgot-password', data);
    }

    // Restablecimiento de contraseña
    async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
        return apiClient.post<{ message: string }>('/auth/reset-password', data);
    }

    // Cerrar sesión
    async logout(): Promise<void> {
        await storage.delete('auth_token');
        await storage.delete('user_data');
    }

    // Guardar datos de autenticación
    private async saveAuthData(authData: AuthResponse): Promise<void> {
        await storage.set('auth_token', authData.token);
        await storage.set('user_data', JSON.stringify(authData.user));
    }

    // Verificar si hay una sesión activa
    async isAuthenticated(): Promise<boolean> {
        const token = await storage.get('auth_token');
        return Boolean(token);
    }

    // Obtener datos del usuario actual
    async getCurrentUser(): Promise<User | null> {
        const userData = await storage.get('user_data');
        return userData ? (JSON.parse(userData) as User) : null;
    }
}

export const authApi = new AuthApi();
export default AuthApi;
