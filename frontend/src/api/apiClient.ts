import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';

class ApiClient {
  private client: AxiosInstance;
  private baseUrlCandidates: string[];
  private resolvedBaseUrl: string | null = null;
  private resolveBaseUrlPromise: Promise<string> | null = null;

  constructor() {
    this.baseUrlCandidates = Array.from(
      new Set([
        API_URL,
        'http://localhost:5000/api/v1',
        'http://localhost:5001/api/v1',
        'http://localhost:5002/api/v1',
      ])
    );

    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        config.baseURL = await this.resolveBaseUrl();

        if (typeof window === 'undefined') {
          return config;
        }

        const token = window.localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (typeof window !== 'undefined' && error.response?.status === 401) {
          // Handle token refresh or redirect to login
          window.localStorage.removeItem('token');
          window.localStorage.removeItem('refreshToken');
          window.localStorage.removeItem('user');
          window.location.href = '/auth/login';
        }
        return Promise.reject(error);
      }
    );
  }

  private async resolveBaseUrl(): Promise<string> {
    if (this.resolvedBaseUrl) {
      return this.resolvedBaseUrl;
    }

    if (typeof window === 'undefined') {
      return API_URL;
    }

    if (!this.resolveBaseUrlPromise) {
      this.resolveBaseUrlPromise = (async () => {
        for (const candidate of this.baseUrlCandidates) {
          try {
            const origin = new URL(candidate).origin;
            const response = await fetch(`${origin}/health`, {
              method: 'GET',
            });
            if (response.ok) {
              this.resolvedBaseUrl = candidate;
              return candidate;
            }
          } catch (error) {
            // Ignore and continue probing next local candidate.
          }
        }

        this.resolvedBaseUrl = API_URL;
        return API_URL;
      })();
    }

    return this.resolveBaseUrlPromise;
  }

  // Generic methods
  async get<T>(url: string, config = {}): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data: any, config = {}): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data: any, config = {}): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config = {}): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }

  async patch<T>(url: string, data: any, config = {}): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(url, data, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();
