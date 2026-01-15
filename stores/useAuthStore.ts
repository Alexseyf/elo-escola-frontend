import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import config from '@/config';
import { api } from '@/lib/api';

interface User {
  nome: string;
  id: number;
  email: string;
  roles: string[];
  primeiroAcesso?: boolean;
  school?: {
    id?: number;
    slug: string;
  };
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
  tempPassword?: string;
  
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
          
          const response = await api('/api/v1/login', {
            method: 'POST',
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
            if (data.schoolSlug) {
              localStorage.setItem('schoolSlug', data.schoolSlug);
              
              const { useTenantStore } = await import('./useTenantStore');
              useTenantStore.getState().setTenantSlug(data.schoolSlug);
            }

            set({
              token: data.token,
              user: {
                nome: data.nome,
                id: data.id,
                email: data.email,
                roles: data.roles,
                primeiroAcesso: data.primeiroAcesso,
                school: data.schoolSlug ? { slug: data.schoolSlug } : undefined
              },
              isAuthenticated: true,
              isLoading: false,
              error: null,
              tempPassword: data.primeiroAcesso ? credentials.senha : undefined
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
        
        if (typeof window !== 'undefined') {
          import('./useTenantStore').then(({ useTenantStore }) => {
            useTenantStore.getState().clearTenant();
            
            setTimeout(() => {
              localStorage.clear();
              window.location.href = '/login';
            }, 50);
          });
        }
      },

      checkAuth: () => {
        const state = get();
        return state.isAuthenticated && !!state.token;
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token, 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
