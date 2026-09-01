const API_BASE = import.meta.env.VITE_API_URL || '/api';

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('vesa_token');

  const headers = {
    ...options.headers
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = 
        data?.error?.message || 
        (typeof data?.error === 'string' ? data.error : null) || 
        data?.message || 
        res.statusText || 
        `Request failed with status code ${res.status}`;
      const error = new Error(errorMsg);
      error.status = res.status;
      error.details = data?.error?.details || data?.details;
      throw error;
    }

    return data;
  } catch (err) {
    console.error(`[API Error ${endpoint}]:`, err.message);
    throw err;
  }
}

export const api = {
  // Auth
  login: (credentials) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (payload) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  getCurrentUser: () => apiFetch('/auth/me'),

  // Metadata
  getDepartments: () => apiFetch('/departments'),
  getRequestTypes: () => apiFetch('/departments/request-types'),
  getUsers: (params = '') => apiFetch(`/users${params ? '?' + params : ''}`),

  // Requests
  createRequest: (payload) => apiFetch('/requests', { method: 'POST', body: JSON.stringify(payload) }),
  getRequests: (params = '') => apiFetch(`/requests${params ? '?' + params : ''}`),
  getRequestById: (id) => apiFetch(`/requests/${id}`),
  executeWorkflowAction: (id, payload) => apiFetch(`/requests/${id}/action`, { method: 'POST', body: JSON.stringify(payload) }),

  // Comments
  getComments: (requestId) => apiFetch(`/comments/request/${requestId}`),
  addComment: (requestId, comment_text) => apiFetch(`/comments/request/${requestId}`, { method: 'POST', body: JSON.stringify({ comment_text }) }),

  // Attachments
  uploadAttachment: (requestId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiFetch(`/attachments/upload/request/${requestId}`, {
      method: 'POST',
      body: formData
    });
  },

  // Notifications
  getNotifications: () => apiFetch('/notifications'),
  markNotificationRead: (id) => apiFetch(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => apiFetch('/notifications/read-all', { method: 'PATCH' }),

  // Analytics & Audit
  getDashboardMetrics: () => apiFetch('/analytics/dashboard'),
  getAuditLogs: (params = '') => apiFetch(`/audit${params ? '?' + params : ''}`)
};
