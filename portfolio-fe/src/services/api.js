const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1');

// Get Headers with Auth Token
const getHeaders = (isAuth = false) => {
  const headers = { 'Content-Type': 'application/json' };
  if (isAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

// API Configuration
const apiClient = {
  async get(endpoint, isAuth = true) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: getHeaders(isAuth),
    });
    return await response.json();
  },

  async post(endpoint, data, isAuth = false) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(isAuth),
      body: JSON.stringify(data),
    });
    return await response.json();
  },

  async put(endpoint, data, isAuth = true) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(isAuth),
      body: JSON.stringify(data),
    });
    return await response.json();
  },

  async patch(endpoint, isAuth = true) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: getHeaders(isAuth),
    });
    return await response.json();
  },

  async delete(endpoint, isAuth = true) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(isAuth),
    });
    return await response.json();
  }
};

// Auth APIs
export const authApi = {
  login: async (code) => apiClient.post('/auth/login', { code }, false),
  updateAvatar: async (avatarUrl) => apiClient.put('/auth/avatar', { avatarUrl }, true),
  getUserById: async (userId) => apiClient.get(`/auth/user/${userId}`, false),
};

// Health APIs
export const healthApi = {
  check: async () => apiClient.get('/health', false),
};

// Anniversary APIs
export const anniversaryApi = {
  getDaysCount: async () => apiClient.get('/anniversary/days', false),
  getDetails: async () => apiClient.get('/anniversary/details', false),
  getSettings: async () => apiClient.get('/anniversary/settings', true),
  updateSettings: async (data) => apiClient.put('/anniversary/settings', data, true),
};

// Chat APIs
export const chatApi = {
  getConversation: async (otherUserId, page = 0, size = 50) =>
    apiClient.get(`/chat/conversation/${otherUserId}?page=${page}&size=${size}`, true),
  sendMessage: async (receiverId, content) =>
    apiClient.post(`/chat/send/${receiverId}`, { content }, true),
};

// Bucket List APIs
export const bucketApi = {
  getAll: async () => apiClient.get('/bucket', true),
  create: async (text) => apiClient.post('/bucket', { text }, true),
  toggle: async (id) => apiClient.patch(`/bucket/${id}/toggle`, true),
  update: async (id, text) => apiClient.put(`/bucket/${id}`, { text }, true),
  delete: async (id) => apiClient.delete(`/bucket/${id}`, true),
};

// Family Rules APIs
export const rulesApi = {
  getAll: async () => apiClient.get('/rules', true),
  create: async (content) => apiClient.post('/rules', { content }, true),
  update: async (id, content) => apiClient.put(`/rules/${id}`, { content }, true),
  delete: async (id) => apiClient.delete(`/rules/${id}`, true),
};

// Events APIs
export const eventsApi = {
  getUpcoming: async () => apiClient.get('/events/upcoming', true),
  create: async (data) => apiClient.post('/events', data, true),
  delete: async (id) => apiClient.delete(`/events/${id}`, true),
};

// Spin Wheel APIs
export const spinApi = {
  getAll: async () => apiClient.get('/spin', true),
  getByCategory: async (category) => apiClient.get(`/spin/${category}`, true),
  create: async (data) => apiClient.post('/spin', data, true),
  delete: async (id) => apiClient.delete(`/spin/${id}`, true),
};

 // Photo Gallery APIs
 export const photoApi = {
   list: async () => apiClient.get('/photos', true),
   getOne: async (id) => apiClient.get(`/photos/${id}`, true),
   upload: async (data) => apiClient.post('/photos', data, true),
   delete: async (id) => apiClient.delete(`/photos/${id}`, true),
 };

 // Notes APIs
 export const notesApi = {
   getAll: async () => apiClient.get('/notes', true),
   create: async (data) => apiClient.post('/notes', data, true),
   update: async (id, data) => apiClient.put(`/notes/${id}`, data, true),
   togglePin: async (id) => apiClient.patch(`/notes/${id}/pin`, true),
   delete: async (id) => apiClient.delete(`/notes/${id}`, true),
 };

