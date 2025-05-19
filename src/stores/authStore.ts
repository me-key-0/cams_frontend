import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import jwtDecode from 'jwt-decode';

// Type for the decoded JWT token
interface JwtPayload {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  exp: number;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setToken: (token: string) => Promise<void>;
  clearToken: () => void;
  getUserFromToken: () => User | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      setToken: async (token) => {
        try {
          set({ isLoading: true, error: null });
          
          // Validate token
          const decodedUser = jwtDecode<JwtPayload>(token);
          const currentTime = Math.floor(Date.now() / 1000);
          if (decodedUser.exp && decodedUser.exp < currentTime) {
            throw new Error('Token has expired');
          }

          // Store in localStorage
          localStorage.setItem('auth_token', token);
          
          set((state) => ({
            token,
            user: decodedUser,
            isAuthenticated: true,
            isLoading: false,
            error: null
          }));
        } catch (error) {
          console.error('Error setting token:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to authenticate'
          });
          throw error;
        }
      },
      clearToken: () => {
        localStorage.removeItem('auth_token');
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
      },      getUserFromToken: () => {
        const token = localStorage.getItem('auth_token');
        if (!token) return null;
        try {
          return jwtDecode<User>(token);
        } catch (error) {
          console.error('Error decoding token:', error);
          return null;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
);

export const authInterceptor = (config: any) => {
  const { token } = useAuthStore.getState();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};
