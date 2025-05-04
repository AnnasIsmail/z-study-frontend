import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { API_URL } from '../config';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        try {
          set({ isLoading: true, error: null });
          const response = await axios.post(`${API_URL}/api/auth/login`, {
            email,
            password,
          });
          
          const { token, user } = response.data;
          
          // Set axios default header for future requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.error?.message || 'Login failed',
          });
          throw error;
        }
      },

      register: async (username, email, password) => {
        try {
          set({ isLoading: true, error: null });
          const response = await axios.post(`${API_URL}/api/auth/register`, {
            username,
            email,
            password,
          });
          
          set({
            isLoading: false,
          });
          
          // After registration, login the user
          await get().login(email, password);
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.error?.message || 'Registration failed',
          });
          throw error;
        }
      },

      logout: () => {
        // Remove token from axios defaults
        delete axios.defaults.headers.common['Authorization'];
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      checkAuth: () => {
        const { token } = get();
        if (token) {
          // Set axios default header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          set({ isAuthenticated: true });
        }
      },

      updateProfile: async (data) => {
        try {
          set({ isLoading: true, error: null });
          const response = await axios.put(`${API_URL}/api/user/profile`, data);
          
          set({
            user: response.data.user,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.error?.message || 'Profile update failed',
          });
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);