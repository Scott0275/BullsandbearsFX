
import { API_URL, getHeaders } from './apiService';

/**
 * Maps user roles to their respective dashboard paths.
 * Centralized for easy maintenance and scalability.
 */
export const getRedirectPath = (role: string): string => {
  switch (role) {
    case 'SUPER_ADMIN':
      return '/super-admin';
    case 'TENANT_ADMIN':
      return '/admin';
    case 'INVESTOR':
    default:
      return '/dashboard';
  }
};

/**
 * Service to handle all Authentication flows connecting to the backend API.
 */
export const authService = {
  async signup(data: any) {
    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        password: data.password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Registration failed. Please check your details.');
    }

    return response.json();
  },

  async login(data: any) {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        email: data.email,
        password: data.password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Login failed. Please verify your credentials.');
    }

    const result = await response.json();
    if (result.token) {
      // Securely persist token and user metadata in local storage.
      localStorage.setItem('auth_token', result.token);
      localStorage.setItem('user_data', JSON.stringify(result.user));
    }
    return result;
  },

  getRedirectPath,

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  },

  getCurrentUser() {
    try {
      const user = localStorage.getItem('user_data');
      return user ? JSON.parse(user) : null;
    } catch (e) {
      console.error("Failed to parse user data from storage", e);
      return null;
    }
  },

  getToken() {
    return localStorage.getItem('auth_token');
  }
};
