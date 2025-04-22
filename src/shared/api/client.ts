// src/shared/api/client.ts
import axios from 'axios';
import storage from '../storage';

export const API_BASE_URL = 'http://192.168.100.39:3000/api/v1';

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
        const token = await storage.get('auth_token'); // 👈 usando el wrapper
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Tipado genérico
export interface ApiResponse<T = any> {
    data?: T;
    error?: {
        message: string;
        code?: string;
        details?: any;
    };
    status: number;
}

// Métodos API
const apiClient = {
    get: async <T>(url: string, config?: any): Promise<ApiResponse<T>> => {
        try {
            const res = await api.get(url, config);
            return { data: res.data, status: res.status };
        } catch (err: any) {
            return handleError<T>(err);
        }
    },

    post: async <T>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> => {
        try {
            const res = await api.post(url, data, config);
            return { data: res.data, status: res.status };
        } catch (err: any) {
            return handleError<T>(err);
        }
    },

    put: async <T>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> => {
        try {
            const res = await api.put(url, data, config);
            return { data: res.data, status: res.status };
        } catch (err: any) {
            return handleError<T>(err);
        }
    },

    delete: async <T>(url: string, config?: any): Promise<ApiResponse<T>> => {
        try {
            const res = await api.delete(url, config);
            return { data: res.data, status: res.status };
        } catch (err: any) {
            return handleError<T>(err);
        }
    },
};

function handleError<T>(err: any): ApiResponse<T> {
    const response = err.response;
    return {
        error: {
            message: response?.data?.message || 'Error desconocido',
            code: response?.data?.code,
            details: response?.data?.details,
        },
        status: response?.status || 0,
    };
}

export default apiClient;
