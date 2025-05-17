// src/shared/api/client.ts
import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import storage from '../storage';

export const API_BASE_URL = 'http://192.168.0.102:3000/api/v1';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

// Interceptor para añadir el token automáticamente
api.interceptors.request.use(
    async (config) => {
        const token = await storage.get('auth_token');
        if (token && config.headers) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Modelo de error que lanza el cliente
export interface ApiError {
    message: string;
    code?: string;
    details?: any;
    status: number;
}

async function handleError(error: AxiosError): Promise<never> {
    const response = error.response;
    const apiError: ApiError = {
        message: (response?.data as any)?.message || 'Error desconocido',
        code: (response?.data as any)?.code,
        details: (response?.data as any)?.details,
        status: response?.status || 0,
    };
    return Promise.reject(apiError);
}

// Cliente simplificado: cada método devuelve T directamente (por ejemplo {user, token})
const apiClient = {
    get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
        try {
            const res = await api.get<T>(url, config);
            return res.data;
        } catch (err: any) {
            return handleError(err);
        }
    },

    post: async <T = any>(
        url: string,
        data?: any,
        config?: AxiosRequestConfig
    ): Promise<T> => {
        try {
            const res = await api.post<T>(url, data, config);
            return res.data;
        } catch (err: any) {
            return handleError(err);
        }
    },

    patch: async <T = any>(
        url: string,
        data?: any,
        config?: AxiosRequestConfig
    ): Promise<T> => {
        try {
            const res = await api.patch<T>(url, data, config);
            return res.data;
        } catch (err: any) {
            return handleError(err);
        }
    },

    put: async <T = any>(
        url: string,
        data?: any,
        config?: AxiosRequestConfig
    ): Promise<T> => {
        try {
            const res = await api.put<T>(url, data, config);
            return res.data;
        } catch (err: any) {
            return handleError(err);
        }
    },

    delete: async <T = any>(
        url: string,
        config?: AxiosRequestConfig
    ): Promise<T> => {
        try {
            const res = await api.delete<T>(url, config);
            return res.data;
        } catch (err: any) {
            return handleError(err);
        }
    },
};

export default apiClient;
