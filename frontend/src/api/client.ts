import {
  User,
  UserProfile,
  HealthProfile,
  Conversation,
  ChatMessage,
  SymptomAssessmentResult,
  WhyConditionResult,
  MedicalReport,
  MedicalImage,
  MedicineInfo,
  HealthMemory,
  SystemMetrics,
  SystemAuditLog,
  Allergy,
  HealthCondition,
  Medication,
} from '../types/index.js';

const API_BASE = '/api/v1';

export function getToken(): string | null {
  return localStorage.getItem('healthcare_auth_token');
}

export function setToken(token: string): void {
  localStorage.setItem('healthcare_auth_token', token);
}

export function clearToken(): void {
  localStorage.removeItem('healthcare_auth_token');
}

export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const errorMsg = data?.error?.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg) as any;
    err.code = data?.error?.code || 'API_ERROR';
    err.status = response.status;
    err.details = data?.error?.details;
    throw err;
  }

  return data?.data ?? data;
}

// 1. Auth API
export const authApi = {
  register: (data: { email: string; password: string; fullName: string; preferredLanguage?: string }) =>
    apiFetch<{ user: User; profile: UserProfile; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  login: (data: { email: string; password: string }) =>
    apiFetch<{ user: User; profile: UserProfile; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMe: () =>
    apiFetch<{ user: User; profile: UserProfile; healthProfile: HealthProfile }>('/auth/me'),
  deleteAccount: () =>
    apiFetch<{ message: string }>('/auth/account', { method: 'DELETE' }),
};

// 2. Profile API
export const profileApi = {
  getProfile: () =>
    apiFetch<{ profile: UserProfile; healthProfile: HealthProfile }>('/profile'),
  updateProfile: (data: any) =>
    apiFetch<{ profile: UserProfile; healthProfile: HealthProfile }>('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  addAllergy: (item: Omit<Allergy, 'id' | 'healthProfileId'>) =>
    apiFetch<Allergy>('/profile/allergies', { method: 'POST', body: JSON.stringify(item) }),
  deleteAllergy: (id: string) =>
    apiFetch<{ message: string }>(`/profile/allergies/${id}`, { method: 'DELETE' }),
  addCondition: (item: Omit<HealthCondition, 'id' | 'healthProfileId'>) =>
    apiFetch<HealthCondition>('/profile/conditions', { method: 'POST', body: JSON.stringify(item) }),
  deleteCondition: (id: string) =>
    apiFetch<{ message: string }>(`/profile/conditions/${id}`, { method: 'DELETE' }),
  addMedication: (item: Omit<Medication, 'id' | 'healthProfileId'>) =>
    apiFetch<Medication>('/profile/medications', { method: 'POST', body: JSON.stringify(item) }),
  deleteMedication: (id: string) =>
    apiFetch<{ message: string }>(`/profile/medications/${id}`, { method: 'DELETE' }),
};

// 3. Chat API
export const chatApi = {
  getConversations: () =>
    apiFetch<Conversation[]>('/chat/conversations'),
  createConversation: (title?: string) =>
    apiFetch<Conversation>('/chat/conversations', { method: 'POST', body: JSON.stringify({ title }) }),
  getConversation: (id: string) =>
    apiFetch<Conversation>(`/chat/conversations/${id}`),
  renameConversation: (id: string, title: string) =>
    apiFetch<{ message: string }>(`/chat/conversations/${id}`, { method: 'PATCH', body: JSON.stringify({ title }) }),
  deleteConversation: (id: string) =>
    apiFetch<{ message: string }>(`/chat/conversations/${id}`, { method: 'DELETE' }),
  clearConversation: (id: string) =>
    apiFetch<{ message: string }>(`/chat/conversations/${id}/clear`, { method: 'POST' }),
  sendMessage: (conversationId: string, content: string) =>
    apiFetch<{ userMessage: ChatMessage; assistantMessage: ChatMessage }>(
      `/chat/conversations/${conversationId}/messages`,
      { method: 'POST', body: JSON.stringify({ content }) }
    ),
};

// 4. Symptoms API
export const symptomApi = {
  analyze: (data: any) =>
    apiFetch<SymptomAssessmentResult>('/symptoms/analyze', { method: 'POST', body: JSON.stringify(data) }),
  whyCondition: (conditionName: string, symptoms?: string) =>
    apiFetch<WhyConditionResult>('/symptoms/why-condition', {
      method: 'POST',
      body: JSON.stringify({ conditionName, symptoms }),
    }),
  getHistory: () =>
    apiFetch<any[]>('/symptoms/history'),
};

// 5. Reports API
export const reportApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiFetch<MedicalReport>('/reports/upload', {
      method: 'POST',
      body: formData,
    });
  },
  getReports: () =>
    apiFetch<MedicalReport[]>('/reports'),
  getReportById: (id: string) =>
    apiFetch<MedicalReport>(`/reports/${id}`),
  askQuestion: (id: string, question: string) =>
    apiFetch<{ answer: string; references: string[] }>(`/reports/${id}/ask`, {
      method: 'POST',
      body: JSON.stringify({ question }),
    }),
  deleteReport: (id: string) =>
    apiFetch<{ message: string }>(`/reports/${id}`, { method: 'DELETE' }),
};

// 6. Medical Images API
export const imageApi = {
  uploadAndAnalyze: (imageFile: File, notes?: string) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    if (notes) formData.append('notes', notes);
    return apiFetch<MedicalImage>('/images/upload-and-analyze', {
      method: 'POST',
      body: formData,
    });
  },
  getImages: () =>
    apiFetch<MedicalImage[]>('/images'),
  getImageById: (id: string) =>
    apiFetch<MedicalImage>(`/images/${id}`),
  deleteImage: (id: string) =>
    apiFetch<{ message: string }>(`/images/${id}`, { method: 'DELETE' }),
};

// 7. Medicines API
export const medicineApi = {
  search: (query: string) =>
    apiFetch<MedicineInfo[]>(`/medicines/search?q=${encodeURIComponent(query)}`),
  getByName: (name: string) =>
    apiFetch<MedicineInfo>(`/medicines/${encodeURIComponent(name)}`),
};

// 8. Memory API
export const memoryApi = {
  getMemories: () =>
    apiFetch<HealthMemory[]>('/memory'),
  deleteMemory: (id: string) =>
    apiFetch<{ message: string }>(`/memory/${id}`, { method: 'DELETE' }),
  clearAll: () =>
    apiFetch<{ message: string }>('/memory/clear', { method: 'POST' }),
};

// 9. RAG API
export const ragApi = {
  getSources: () =>
    apiFetch<any[]>('/rag/sources'),
  query: (query: string, topK = 4) =>
    apiFetch<any>('/rag/query', { method: 'POST', body: JSON.stringify({ query, topK }) }),
};

// 10. Admin API
export const adminApi = {
  getHealth: () =>
    apiFetch<any>('/admin/health'),
  getMetrics: () =>
    apiFetch<SystemMetrics>('/admin/metrics'),
  getAuditLogs: (limit = 50) =>
    apiFetch<SystemAuditLog[]>(`/admin/audit-logs?limit=${limit}`),
};
