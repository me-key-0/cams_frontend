import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import jwtDecode from 'jwt-decode';
import { getLecturerIdFromUserId } from '../api/services/userService';

// Type for the decoded JWT token
interface JwtPayload {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  exp: number;
  sub: string;
}

interface User {
  id: number;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

interface Lecturer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
};

interface AuthState {
  token: string | null;
  user: User | null;
  lecturer: Lecturer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setToken: (token: string) => Promise<void>;
  clearToken: () => void;
  getUserFromToken: () => User | null;
  getLecturerId: () => Promise<number | null>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: localStorage.getItem('token') || null,
      user: null,
      lecturer: null,
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
          localStorage.setItem('token', token);
          
          set((state) => ({
            token,
            user: {
              id: parseInt(decodedUser.sub),
              email: decodedUser.email,
              role: decodedUser.role,
              firstName: decodedUser.firstName,
              lastName: decodedUser.lastName
            },
            isAuthenticated: true,
            isLoading: false,
            error: null
          }));

          // If user is lecturer, fetch lecturer ID
          if (decodedUser.role === 'LECTURER') {
            const lecturerId = await getLecturerIdFromUserId(decodedUser.sub);
            if (lecturerId) {
              set((state) => ({ lecturer: { id: lecturerId, firstName: decodedUser.firstName, lastName: decodedUser.lastName, email: decodedUser.email, department: '' } }));
            }
          }
        } catch (error) {
          console.error('Error setting token:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to authenticate'
          });
          throw error;
        }
      },
      getLecturerId: async (): Promise<number | null> => {
        const state = useAuthStore.getState();
        if (!state.user || state.user.role !== 'LECTURER') return null;
        return getLecturerIdFromUserId(state.user.id.toString());
      },
      clearToken: () => {
        localStorage.removeItem('token');
        set({
          token: null,
          user: null,
          lecturer: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
      },      getUserFromToken: () => {
        const token = localStorage.getItem('token');
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
      storage: createJSONStorage(() => localStorage)
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
