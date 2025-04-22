// src/modules/Auth/services/authApi.ts
import apiClient from "@/src/shared/api/client";
import storage from "@/src/shared/storage";

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
    async register(userData: RegisterData) {
        const response = await apiClient.post<AuthResponse>('/auth/register', userData, false);

        if (response.data) {
            await this.saveAuthData(response.data);
        }

        return response;
    }

    // Inicio de sesión
    async login(credentials: LoginCredentials) {
        const response = await apiClient.post<AuthResponse>('/auth/login', credentials, false);

        if (response.data) {
            await this.saveAuthData(response.data);
        }

        return response;
    }

    // Recuperación de contraseña
    async forgotPassword(data: ForgotPasswordData) {
        return apiClient.post<{ message: string }>('/auth/forgot-password', data, false);
    }

    // Restablecimiento de contraseña
    async resetPassword(data: ResetPasswordData) {
        return apiClient.post<{ message: string }>('/auth/reset-password', data, false);
    }

    // Cerrar sesión
    async logout() {
        await storage.delete('auth_token');
        await storage.delete('user_data');
    }

    // Guardar datos de autenticación
    private async saveAuthData(authData: AuthResponse) {
        await storage.set('auth_token', authData.token);
        await storage.set('user_data', JSON.stringify(authData.user));
    }

    // Verificar si hay una sesión activa
    async isAuthenticated(): Promise<boolean> {
        const token = await storage.get('auth_token');
        return !!token;
    }

    // Obtener datos del usuario actual
    async getCurrentUser(): Promise<User | null> {
        const userData = await storage.get('user_data');
        if (userData) {
            return JSON.parse(userData);
        }
        return null;
    }
}

export const authApi = new AuthApi();
export default AuthApi;
