import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import config from '@/config';

interface User {
  id: number;
  email: string;
  roles: string[];
  primeiroAcesso?: boolean;
}

interface LoginCredentials {
  email: string;
  senha: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        try {
          const emailSemEspacos = credentials.email.trim();
          
          const response = await fetch(`${config.API_URL}/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: emailSemEspacos,
              senha: credentials.senha
            }),
          });

          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
             throw new Error('Resposta inválida do servidor');
          }

          const data = await response.json();

          if (response.ok && data.token) {
            set({
              token: data.token,
              user: {
                id: data.id,
                email: credentials.email,
                roles: data.roles,
                primeiroAcesso: data.primeiroAcesso
              },
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
            return true;
          } else {
            set({ 
              isLoading: false, 
              error: data.message || 'Usuário ou senha inválidos'
            });
            return false;
          }
        } catch (error: any) {
          console.error('Login error:', error);
          set({ 
            isLoading: false, 
            error: error.message || 'Erro ao conectar com o servidor'
          });
          return false;
        }
      },

      logout: () => {
        set({ token: null, user: null, isAuthenticated: false, error: null });
        localStorage.removeItem('auth-storage');
      },

      checkAuth: () => {
        const state = get();
        return state.isAuthenticated && !!state.token;
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);
