import React, { useEffect } from 'react';
import { useAuthStore } from './authStore';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Initialize auth state from localStorage on mount
    const token = localStorage.getItem('auth_token');
    if (token) {
      useAuthStore.getState().setToken(token);
    }
  }, []);

  return <>{children}</>;
};
