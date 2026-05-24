import axios, {
  AxiosInstance,
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

// ─── Config ───────────────────────────────────────────────────────────────────
// Use a single env var. No dynamic port probing — it adds latency and is unreliable.
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';

// ─── Token helpers ────────────────────────────────────────────────────────────
const getToken = (): string | null =>
  typeof window !== 'undefined' ? localStorage.getItem('token') : null;

const getRefreshToken = (): string | null =>
  typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;

const clearAuth = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

const setTokens = (token: string, refreshToken: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
  localStorage.setItem('refreshToken', refreshToken);
};

// ─── Refresh token queue ──────────────────────────────────────────────────────
// While a refresh is in progress, queue failed requests and replay them
// after the new token is obtained — instead of firing multiple refresh calls.
let isRefreshing = false;
let failedRequestQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null): void => {
  failedRequestQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else if (token) {
      resolve(token);
    }
  });
  failedRequestQueue = [];
};

// ─── Axios instance ───────────────────────────────────────────────────────────
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: { 'Content-Type': 'application/json' },
      timeout: 30_000,
    });

    this.setupRequestInterceptor();
    this.setupResponseInterceptor();
  }

  // ── Request interceptor: attach Bearer token ────────────────────────────────
  private setupRequestInterceptor(): void {
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  // ── Response interceptor: auto-refresh on 401 ──────────────────────────────
  private setupResponseInterceptor(): void {
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        // Only attempt refresh on 401, not on the refresh endpoint itself
        const isRefreshEndpoint = originalRequest?.url?.includes('/auth/refresh');
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !isRefreshEndpoint &&
          typeof window !== 'undefined'
        ) {
          const refreshToken = getRefreshToken();

          if (!refreshToken) {
            clearAuth();
            window.location.href = '/auth/login';
            return Promise.reject(error);
          }

          if (isRefreshing) {
            // Queue this request to replay after refresh completes
            return new Promise((resolve, reject) => {
              failedRequestQueue.push({ resolve, reject });
            })
              .then((token) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                return this.client(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            const response = await axios.post(`${API_URL}/auth/refresh`, {
              refreshToken,
            });

            const { token: newToken, refreshToken: newRefreshToken } =
              response.data?.data || {};

            if (!newToken) throw new Error('Refresh response missing token');

            setTokens(newToken, newRefreshToken || refreshToken);
            processQueue(null, newToken);

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return this.client(originalRequest);
          } catch (refreshError) {
            processQueue(refreshError, null);
            clearAuth();
            window.location.href = '/auth/login';
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // ── HTTP methods ─────────────────────────────────────────────────────────────
  async get<T>(url: string, config: AxiosRequestConfig = {}): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }

  async post<T>(
    url: string,
    data?: unknown,
    config: AxiosRequestConfig = {}
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(
      url,
      data,
      config
    );
    return response.data;
  }

  async put<T>(
    url: string,
    data?: unknown,
    config: AxiosRequestConfig = {}
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(
      url,
      data,
      config
    );
    return response.data;
  }

  async patch<T>(
    url: string,
    data?: unknown,
    config: AxiosRequestConfig = {}
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(
      url,
      data,
      config
    );
    return response.data;
  }

  async delete<T>(url: string, config: AxiosRequestConfig = {}): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }

  // Upload with multipart/form-data
  async upload<T>(url: string, formData: FormData): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }
}

export const apiClient = new ApiClient();
