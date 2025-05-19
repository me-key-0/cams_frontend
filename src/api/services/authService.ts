// Token is automatically stored in localStorage
import { LoginCredentials } from '../../types/auth';
import { useAuthStore } from '../../stores/authStore';
import api from '../config';

const API_URL = '/api/auth/login';

export async function login(credentials: LoginCredentials) {
  try {
    const response = await api.post(`${API_URL}`, credentials);
    const { token } = response.data;
    
    // Store token in auth store
    useAuthStore.getState().setToken(token);
    
    return { token };
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

export function logout() {
  useAuthStore.getState().clearToken();
}

export function getCurrentUser() {
  return useAuthStore.getState().user;
}

export function getToken() {
  return useAuthStore.getState().token;
}

export function isAuthenticated() {
  return useAuthStore.getState().isAuthenticated;
} 