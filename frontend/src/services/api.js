import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  login: async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await axios.post(`${API_URL}/login`, formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      
      // Décoder le token
      const tokenData = JSON.parse(atob(response.data.access_token.split('.')[1]));
      const user = {
        username: tokenData.preferred_username,
        email: tokenData.email,
        name: tokenData.name,
        roles: tokenData.resource_access?.['ent-backend']?.roles || []
      };
      localStorage.setItem('user', JSON.stringify(user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },

  hasRole: (role) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.roles?.includes(role) || false;
  },

  getProfile: async () => {
    const response = await api.get('/me');
    return response.data;
  },

  testStudentRoute: async () => {
    const response = await api.get('/student-only');
    return response.data;
  },

  testTeacherRoute: async () => {
    const response = await api.get('/teacher-only');
    return response.data;
  },

  testAdminRoute: async () => {
    const response = await api.get('/admin-only');
    return response.data;
  },
};

export default api;