import { apiClient } from './apiClient';

// ─── Type Helpers ─────────────────────────────────────────────────────────────
type ApiRes<T = unknown> = Promise<T>;

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { name: string; email: string; password: string; roleName?: string }) =>
    apiClient.post('/auth/register', data),
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
  logout: () => apiClient.post('/auth/logout', {}),
  me: () => apiClient.get('/auth/me'),
  refreshToken: (refreshToken: string) =>
    apiClient.post('/auth/refresh', { refreshToken }),
  requestPasswordChangeOtp: () =>
    apiClient.post('/auth/change-password/request-otp', {}),
  verifyPasswordChangeOtp: (otpCode: string, newPassword: string) =>
    apiClient.post('/auth/change-password/verify-otp', { otpCode, newPassword }),
  setupPassword: (data: { token: string; password: string }) =>
    apiClient.post('/auth/setup-password', data),
  requestForgotPasswordOtp: (email: string) =>
    apiClient.post('/auth/forgot-password/request-otp', { email }),
  verifyForgotPasswordOtp: (email: string, otpCode: string, newPassword: string) =>
    apiClient.post('/auth/forgot-password/verify-otp', { email, otpCode, newPassword }),
};

// ─── Users ────────────────────────────────────────────────────────────────────
export const userApi = {
  getAll: (page = 1, limit = 20) => apiClient.get(`/users?page=${page}&limit=${limit}`),
  getById: (id: number) => apiClient.get(`/users/${id}`),
  create: (data: unknown) => apiClient.post('/users', data),
  update: (id: number, data: unknown) => apiClient.put(`/users/${id}`, data),
  remove: (id: number) => apiClient.delete(`/users/${id}`),
};

// ─── Courses ──────────────────────────────────────────────────────────────────
export const courseApi = {
  getAll: (page = 1, limit = 20, status?: string) =>
    apiClient.get(`/courses?page=${page}&limit=${limit}${status ? `&status=${status}` : ''}`),
  getBySlug: (slug: string) => apiClient.get(`/courses/${slug}`),
  getById: (id: number) => apiClient.get(`/courses/${id}`),
  create: (data: unknown) => apiClient.post('/courses', data),
  update: (id: number, data: unknown) => apiClient.put(`/courses/${id}`, data),
  remove: (id: number) => apiClient.delete(`/courses/${id}`),
};

// ─── Departments ──────────────────────────────────────────────────────────────
export const departmentApi = {
  getAll: (page = 1, limit = 50) => apiClient.get(`/departments?page=${page}&limit=${limit}`),
  getBySlug: (slug: string) => apiClient.get(`/departments/${slug}`),
  getById: (id: number) => apiClient.get(`/departments/${id}`),
  create: (data: unknown) => apiClient.post('/departments', data),
  update: (id: number, data: unknown) => apiClient.put(`/departments/${id}`, data),
  remove: (id: number) => apiClient.delete(`/departments/${id}`),
};

// ─── Faculty ─────────────────────────────────────────────────────────────────
export const facultyApi = {
  getAll: (page = 1, limit = 50, departmentId?: number, search?: string) => {
    let url = `/faculty?page=${page}&limit=${limit}`;
    if (departmentId) url += `&departmentId=${departmentId}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return apiClient.get(url);
  },
  getById: (id: number) => apiClient.get(`/faculty/${id}`),
  create: (data: unknown) => apiClient.post('/faculty', data),
  update: (id: number, data: unknown) => apiClient.put(`/faculty/${id}`, data),
  remove: (id: number) => apiClient.delete(`/faculty/${id}`),
};

// ─── Infrastructures ──────────────────────────────────────────────────────────
export const infrastructureApi = {
  getAll: (page = 1, limit = 50, category?: string) =>
    apiClient.get(`/infrastructures?page=${page}&limit=${limit}${category ? `&category=${category}` : ''}`),
  getById: (id: number) => apiClient.get(`/infrastructures/${id}`),
  create: (data: unknown) => apiClient.post('/infrastructures', data),
  update: (id: number, data: unknown) => apiClient.put(`/infrastructures/${id}`, data),
  remove: (id: number) => apiClient.delete(`/infrastructures/${id}`),
};

// ─── Notices ─────────────────────────────────────────────────────────────────
export const noticeApi = {
  getAll: (page = 1, limit = 20) => apiClient.get(`/notices?page=${page}&limit=${limit}`),
  getById: (id: number) => apiClient.get(`/notices/${id}`),
  create: (data: unknown) => apiClient.post('/notices', data),
  update: (id: number, data: unknown) => apiClient.put(`/notices/${id}`, data),
  remove: (id: number) => apiClient.delete(`/notices/${id}`),
};

// ─── Events ──────────────────────────────────────────────────────────────────
export const eventApi = {
  getAll: (page = 1, limit = 20) => apiClient.get(`/events?page=${page}&limit=${limit}`),
  getById: (id: number) => apiClient.get(`/events/${id}`),
  create: (data: unknown) => apiClient.post('/events', data),
  update: (id: number, data: unknown) => apiClient.put(`/events/${id}`, data),
  remove: (id: number) => apiClient.delete(`/events/${id}`),
};

// ─── Site Settings ────────────────────────────────────────────────────────────
export const siteSettingsApi = {
  // Public — returns {college_name: '...', address: '...', ...}
  getMap: (): ApiRes<Record<string, string>> => apiClient.get('/site-settings/map'),
  // Admin — full list
  getAll: () => apiClient.get('/site-settings'),
  update: (key: string, value: string) => apiClient.put(`/site-settings/${key}`, { value }),
  bulkUpdate: (settings: Array<{ key: string; value: string }>) =>
    apiClient.put('/site-settings/bulk', { settings }),
};

// ─── CMS Page Sections ────────────────────────────────────────────────────────
export const cmsApi = {
  getPageSections: (pageKey: string) =>
    apiClient.get(`/cms/page-sections?pageKey=${pageKey}`),
  getAllSections: (page = 1, limit = 50) =>
    apiClient.get(`/cms/page-sections/all?page=${page}&limit=${limit}`),
  upsertSection: (data: {
    pageKey: string;
    sectionKey: string;
    config: object;
    sortOrder?: number;
  }) => apiClient.post('/cms/page-sections', data),
  updateSection: (id: number, data: unknown) =>
    apiClient.put(`/cms/page-sections/${id}`, data),
  deleteSection: (id: number) => apiClient.delete(`/cms/page-sections/${id}`),
};

// ─── Inquiries ────────────────────────────────────────────────────────────────
export const inquiryApi = {
  create: (data: unknown) => apiClient.post('/inquiries', data),
  getAll: (page = 1, limit = 20, search?: string, status?: string) => {
    let url = `/inquiries?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (status && status !== 'all') url += `&status=${encodeURIComponent(status)}`;
    return apiClient.get(url);
  },
  update: (id: number, data: unknown) => apiClient.put(`/inquiries/${id}`, data),
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardApi = {
  getStats: () => apiClient.get('/dashboard/stats'),
  getRecentInquiries: (limit = 5) =>
    apiClient.get(`/dashboard/recent-inquiries?limit=${limit}`),
  getAnalytics: () => apiClient.get('/dashboard/analytics'),
  trackPageView: (path: string) => apiClient.post('/dashboard/track', { path }),
};

// ─── Student ─────────────────────────────────────────────────────────────────
export const studentApi = {
  me: () => apiClient.get('/student/me'),
  courses: (page = 1, limit = 10) =>
    apiClient.get(`/student/courses?page=${page}&limit=${limit}`),
  grades: () => apiClient.get('/student/grades'),
  fees: () => apiClient.get('/student/fees'),
  payFee: (feeId: number) => apiClient.post('/student/fees/pay', { feeId }),
};

// ─── Media ────────────────────────────────────────────────────────────────────
export const mediaApi = {
  upload: (formData: FormData, onUploadProgress?: (progressEvent: any) => void) => apiClient.upload('/media/upload', formData, onUploadProgress),
  getAll: (page = 1, limit = 30) => apiClient.get(`/media?page=${page}&limit=${limit}`),
  replace: (id: number, formData: FormData) => apiClient.put(`/media/${id}/replace`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove: (id: number) => apiClient.delete(`/media/${id}`),
};

// ─── Chatbot ──────────────────────────────────────────────────────────────────
export const chatbotApi = {
  chat: (sessionId: string, message: string) => apiClient.post('/chatbot/chat', { sessionId, message }),
  getAllKnowledge: () => apiClient.get('/chatbot/knowledge'),
  createKnowledge: (data: unknown) => apiClient.post('/chatbot/knowledge', data),
  updateKnowledge: (id: number, data: unknown) => apiClient.put(`/chatbot/knowledge/${id}`, data),
  deleteKnowledge: (id: number) => apiClient.delete(`/chatbot/knowledge/${id}`),
  uploadDocument: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/chatbot/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getAnalytics: () => apiClient.get('/chatbot/analytics'),
};

// ─── Placements ───────────────────────────────────────────────────────────────
export const placementApi = {
  getAll: (page = 1, limit = 50, status?: string, search?: string, placementType?: string) => {
    let url = `/placements?page=${page}&limit=${limit}`;
    if (status && status !== 'all') url += `&status=${encodeURIComponent(status)}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (placementType && placementType !== 'all') url += `&placementType=${encodeURIComponent(placementType)}`;
    return apiClient.get(url);
  },
  getById: (id: number) => apiClient.get(`/placements/${id}`),
  create: (data: unknown) => apiClient.post('/placements', data),
  update: (id: number, data: unknown) => apiClient.put(`/placements/${id}`, data),
  remove: (id: number) => apiClient.delete(`/placements/${id}`),
};
