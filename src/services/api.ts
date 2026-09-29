import { User, AuthResponse, PredictionResult, PredictionRecord, ModelVersion, SystemHealth } from '../types';

const API_BASE = '/api';

function getHeaders(isFormData = false): HeadersInit {
  const token = localStorage.getItem('dermascan_token');
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    localStorage.removeItem('dermascan_token');
    localStorage.removeItem('dermascan_user');
    window.dispatchEvent(new Event('dermascan_auth_changed'));
    throw new Error('Your session has expired. Please login again.');
  }

  let text = '';
  try {
    text = await res.text();
  } catch {
    throw new Error('Failed to read response from server.');
  }

  let data: any = null;
  let parseSuccess = false;
  try {
    data = JSON.parse(text);
    parseSuccess = true;
  } catch {
    parseSuccess = false;
  }

  if (!res.ok) {
    if (parseSuccess && data) {
      throw new Error(data.detail || data.message || `Request failed with status ${res.status}`);
    }
    if (res.status === 403) {
      throw new Error('Access denied. You do not have permission to perform this action.');
    }
    if (res.status === 404) {
      throw new Error('The requested API endpoint was not found.');
    }
    if (res.status === 413) {
      throw new Error('Image size exceeds the allowed limit (10MB).');
    }
    if (res.status === 422) {
      throw new Error('Please upload a valid image file (JPEG, PNG, or WEBP).');
    }
    if (res.status === 500) {
      throw new Error('Something went wrong while processing the image.');
    }
    throw new Error(`Server error (${res.status}). Please try again.`);
  }

  if (parseSuccess) {
    return data as T;
  }

  throw new Error('Server returned an invalid response. Please refresh the page and try again.');
}

export const api = {
  // System Health
  async getHealth(): Promise<SystemHealth> {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse<SystemHealth>(res);
  },

  // Auth
  async register(data: { name: string; email: string; password: string; role?: string }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<AuthResponse>(res);
  },

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<AuthResponse>(res);
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    return handleResponse<User>(res);
  },

  async changePassword(current_password: string, new_password: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ current_password, new_password }),
    });
    return handleResponse<{ message: string }>(res);
  },

  async updateProfile(name: string): Promise<User> {
    const res = await fetch(`${API_BASE}/users/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ name }),
    });
    return handleResponse<User>(res);
  },

  // Admin
  async getAdminUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: getHeaders(),
    });
    return handleResponse<User[]>(res);
  },

  async updateUserRoleOrStatus(id: number, updates: { is_active?: boolean; role?: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse<any>(res);
  },

  async activateModel(modelId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/models/${modelId}/activate`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },

  // Predictions
  async predict(imageFile: File, notes?: string): Promise<PredictionResult> {
    const formData = new FormData();
    formData.append('image', imageFile);
    if (notes) {
      formData.append('notes', notes);
    }

    const res = await fetch(`${API_BASE}/predictions/predict`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData,
    });
    return handleResponse<PredictionResult>(res);
  },

  async getPredictions(): Promise<PredictionRecord[]> {
    const res = await fetch(`${API_BASE}/predictions`, {
      headers: getHeaders(),
    });
    return handleResponse<PredictionRecord[]>(res);
  },

  async getPredictionDetail(id: number): Promise<PredictionRecord> {
    const res = await fetch(`${API_BASE}/predictions/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse<PredictionRecord>(res);
  },

  async deletePrediction(id: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/predictions/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<{ message: string }>(res);
  },

  // Models
  async getModels(): Promise<ModelVersion[]> {
    const res = await fetch(`${API_BASE}/models`);
    return handleResponse<ModelVersion[]>(res);
  },

  async getActiveModel(): Promise<ModelVersion> {
    const res = await fetch(`${API_BASE}/models/active`);
    return handleResponse<ModelVersion>(res);
  },

  async getModelMetrics(): Promise<any> {
    const res = await fetch(`${API_BASE}/models/metrics`);
    return handleResponse<any>(res);
  },
};
