import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
    name: string;
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
  
  activeRole: string | null;
  setActiveRole: (role: string) => void;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => boolean;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      _hasHydrated: false,
      activeRole: null,
      setActiveRole: (role: string) => set({ activeRole: role }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),

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
                school: data.schoolSlug ? { slug: data.schoolSlug, name: data.schoolName } : undefined
              },
              activeRole: data.roles.length === 1 ? data.roles[0] : null,
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
        } catch (error) {
          console.error('Login error:', error);
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Erro ao conectar com o servidor'
          });
          return false;
        }
      },

      logout: () => {
        set({ token: null, user: null, activeRole: null, isAuthenticated: false, error: null });
        
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
        user: state.user ? {
          nome: state.user.nome,
          id: state.user.id,
          email: state.user.email,
          roles: state.user.roles,
          primeiroAcesso: state.user.primeiroAcesso
        } : null, 
        activeRole: state.activeRole,
        isAuthenticated: state.isAuthenticated 
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
