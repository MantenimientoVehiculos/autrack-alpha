// src/shared/api/client.ts
import { MMKV } from 'react-native-mmkv';

// Constantes para la API
export const API_BASE_URL = 'http://192.168.100.39:3000/api/v1';
export const HTTPS_API_BASE_URL = 'https://192.168.100.39:3443/api/v1';

// Storage para tokens y datos de sesión
export const storage = new MMKV();

// Tipos básicos para las respuestas
export interface ApiResponse<T = any> {
    data?: T;
    error?: {
        message: string;
        code?: string;
        details?: any;
    };
    status: number;
}

// Cliente base para peticiones API
class ApiClient {
    private baseUrl: string;

    constructor(useHttps = false) {
        this.baseUrl = useHttps ? HTTPS_API_BASE_URL : API_BASE_URL;
    }

    // Obtener token de autenticación del storage
    private getAuthToken(): string | null {
        return storage.getString('auth_token') || null;
    }

    // Preparar headers para las peticiones
    private getHeaders(requiresAuth = true): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };

        if (requiresAuth) {
            const token = this.getAuthToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    // Método genérico para hacer peticiones
    private async request<T>(
        endpoint: string,
        method: string,
        data?: any,
        requiresAuth = true
    ): Promise<ApiResponse<T>> {
        try {
            const url = `${this.baseUrl}${endpoint}`;
            const options: RequestInit = {
                method,
                headers: this.getHeaders(requiresAuth),
            };

            if (data) {
                options.body = JSON.stringify(data);
            }

            const response = await fetch(url, options);
            const responseData = await response.json();

            if (!response.ok) {
                return {
                    error: {
                        message: responseData.message || 'Ha ocurrido un error',
                        code: responseData.code,
                        details: responseData.details,
                    },
                    status: response.status,
                };
            }

            return {
                data: responseData,
                status: response.status,
            };
        } catch (error) {
            return {
                error: {
                    message: error instanceof Error ? error.message : 'Error de red',
                },
                status: 0,
            };
        }
    }

    // Métodos HTTP
    async get<T>(endpoint: string, requiresAuth = true): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, 'GET', undefined, requiresAuth);
    }

    async post<T>(endpoint: string, data: any, requiresAuth = true): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, 'POST', data, requiresAuth);
    }

    async put<T>(endpoint: string, data: any, requiresAuth = true): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, 'PUT', data, requiresAuth);
    }

    async delete<T>(endpoint: string, requiresAuth = true): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, 'DELETE', undefined, requiresAuth);
    }
}

// Exportar una instancia por defecto
export const apiClient = new ApiClient();

// Exportar la clase para casos donde se necesite personalización
export default ApiClient;