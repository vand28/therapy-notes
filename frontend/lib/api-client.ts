import type {
  AuthResponse,
  RegisterRequest,
  LoginRequest,
  Client,
  CreateClientRequest,
  Session,
  CreateSessionRequest,
  Template,
  UsageSummary,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  // Auth endpoints
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(response.token);
    return response;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(response.token);
    return response;
  }

  logout() {
    this.clearToken();
  }

  // Client endpoints
  async getClients(): Promise<Client[]> {
    return this.request<Client[]>('/api/clients');
  }

  async getClient(id: string): Promise<Client> {
    return this.request<Client>(`/api/clients/${id}`);
  }

  async createClient(data: CreateClientRequest): Promise<Client> {
    return this.request<Client>('/api/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateClient(id: string, data: CreateClientRequest): Promise<Client> {
    return this.request<Client>(`/api/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteClient(id: string): Promise<void> {
    return this.request<void>(`/api/clients/${id}`, {
      method: 'DELETE',
    });
  }

  async addGoal(clientId: string, description: string, targetDate?: string) {
    return this.request(`/api/clients/${clientId}/goals`, {
      method: 'POST',
      body: JSON.stringify({ description, targetDate }),
    });
  }

  async updateGoal(clientId: string, goalId: string, description: string, targetDate?: string) {
    return this.request(`/api/clients/${clientId}/goals/${goalId}`, {
      method: 'PUT',
      body: JSON.stringify({ description, targetDate }),
    });
  }

  async deleteGoal(clientId: string, goalId: string): Promise<void> {
    return this.request<void>(`/api/clients/${clientId}/goals/${goalId}`, {
      method: 'DELETE',
    });
  }

  async updateGoalProgress(clientId: string, goalId: string, newLevel: number): Promise<void> {
    return this.request<void>(`/api/clients/${clientId}/goals/${goalId}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ newLevel }),
    });
  }

  // Session endpoints
  async getSessions(clientId: string): Promise<Session[]> {
    return this.request<Session[]>(`/api/sessions?clientId=${clientId}`);
  }

  async getSession(id: string): Promise<Session> {
    return this.request<Session>(`/api/sessions/${id}`);
  }

  async createSession(data: CreateSessionRequest): Promise<Session> {
    return this.request<Session>('/api/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSession(id: string, data: Partial<CreateSessionRequest>): Promise<Session> {
    return this.request<Session>(`/api/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSession(id: string): Promise<void> {
    return this.request<void>(`/api/sessions/${id}`, {
      method: 'DELETE',
    });
  }

  // Template endpoints
  async getTemplates(category?: string): Promise<Template[]> {
    const query = category ? `?category=${category}` : '';
    return this.request<Template[]>(`/api/templates${query}`);
  }

  async getTemplate(id: string): Promise<Template> {
    return this.request<Template>(`/api/templates/${id}`);
  }

  // Media endpoints
  async uploadMedia(file: File, sessionId: string): Promise<{ fileKey: string; fileName: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sessionId', sessionId);

    const headers: HeadersInit = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}/api/media/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  }

  async getMediaUrl(fileKey: string): Promise<{ url: string }> {
    return this.request<{ url: string }>(`/api/media/${fileKey}`);
  }

  async deleteMedia(fileKey: string, sessionId: string): Promise<void> {
    return this.request<void>(`/api/media/${fileKey}?sessionId=${sessionId}`, {
      method: 'DELETE',
    });
  }

  // Usage endpoints
  async getUsageSummary(): Promise<UsageSummary> {
    return this.request<UsageSummary>('/api/usage/summary');
  }

  // Parent-specific endpoints
  async updateHomeActivity(sessionId: string, activityIndex: number, completed: boolean, parentNotes: string): Promise<void> {
    return this.request<void>(`/api/sessions/${sessionId}/activities/${activityIndex}`, {
      method: 'PATCH',
      body: JSON.stringify({ completedByParent: completed, parentNotes }),
    });
  }

  // Subscription endpoints
  async createCheckoutSession(tier: string): Promise<{ url: string }> {
    return this.request<{ url: string }>('/api/subscription/checkout', {
      method: 'POST',
      body: JSON.stringify({ tier }),
    });
  }

  async createPortalSession(): Promise<{ url: string }> {
    return this.request<{ url: string }>('/api/subscription/portal', {
      method: 'POST',
    });
  }

  async getSubscriptionStatus(): Promise<any> {
    return this.request('/api/subscription/status');
  }
}

export const apiClient = new ApiClient();

