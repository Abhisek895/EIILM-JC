import { apiClient } from './apiClient';

export const authApi = {
  register: async (data: {
    name: string;
    email: string;
    password: string;
    roleName?: string;
  }) => {
    return apiClient.post('/auth/register', data);
  },

  login: async (email: string, password: string) => {
    return apiClient.post('/auth/login', { email, password });
  },

  logout: async () => {
    return apiClient.post('/auth/logout', {});
  },

  me: async () => {
    return apiClient.get('/auth/me');
  },

  refreshToken: async (refreshToken: string) => {
    return apiClient.post('/auth/refresh', { refreshToken });
  },
};

export const courseApi = {
  getAll: async (page: number = 1, limit: number = 10) => {
    return apiClient.get(`/courses?page=${page}&limit=${limit}`);
  },

  getById: async (id: number) => {
    return apiClient.get(`/courses/${id}`);
  },

  create: async (data: any) => {
    return apiClient.post('/courses', data);
  },

  update: async (id: number, data: any) => {
    return apiClient.put(`/courses/${id}`, data);
  },

  delete: async (id: number) => {
    return apiClient.delete(`/courses/${id}`);
  },
};

export const departmentApi = {
  getAll: async () => {
    return apiClient.get('/departments');
  },

  getById: async (id: number) => {
    return apiClient.get(`/departments/${id}`);
  },
};

export const facultyApi = {
  getAll: async (departmentId?: number) => {
    const url = departmentId ? `/faculty?departmentId=${departmentId}` : '/faculty';
    return apiClient.get(url);
  },

  getById: async (id: number) => {
    return apiClient.get(`/faculty/${id}`);
  },
};

export const inquiryApi = {
  create: async (data: any) => {
    return apiClient.post('/inquiries', data);
  },

  getAll: async (page: number = 1, limit: number = 10) => {
    return apiClient.get(`/inquiries?page=${page}&limit=${limit}`);
  },

  update: async (id: number, data: any) => {
    return apiClient.put(`/inquiries/${id}`, data);
  },
};

export const dashboardApi = {
  getStats: async () => {
    return apiClient.get('/dashboard/stats');
  },
  getRecentInquiries: async (limit: number = 5) => {
    return apiClient.get(`/dashboard/recent-inquiries?limit=${limit}`);
  },
};

export const studentApi = {
  me: async () => {
    return apiClient.get('/student/me');
  },
  courses: async (page: number = 1, limit: number = 10) => {
    return apiClient.get(`/student/courses?page=${page}&limit=${limit}`);
  },
};
