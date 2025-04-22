// src/modules/Auth/services/authApi.ts
import { apiClient } from "@/src/shared/theme/api/client";
import { storage } from "@/src/shared/theme/api/client";

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
            // Guardar token y datos de usuario en el storage
            this.saveAuthData(response.data);
        }

        return response;
    }

    // Inicio de sesión
    async login(credentials: LoginCredentials) {
        const response = await apiClient.post<AuthResponse>('/auth/login', credentials, false);

        if (response.data) {
            // Guardar token y datos de usuario en el storage
            this.saveAuthData(response.data);
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
    logout() {
        // Limpiar datos de autenticación
        storage.delete('auth_token');
        storage.delete('user_data');
    }

    // Guardar datos de autenticación
    private saveAuthData(authData: AuthResponse) {
        storage.set('auth_token', authData.token);
        storage.set('user_data', JSON.stringify(authData.user));
    }

    // Verificar si hay una sesión activa
    isAuthenticated(): boolean {
        return !!storage.getString('auth_token');
    }

    // Obtener datos del usuario actual
    getCurrentUser(): User | null {
        const userData = storage.getString('user_data');
        if (userData) {
            return JSON.parse(userData);
        }
        return null;
    }
}

export const authApi = new AuthApi();
export default AuthApi;