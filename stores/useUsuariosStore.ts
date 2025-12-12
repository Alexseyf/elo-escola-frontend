import { create } from 'zustand';
import config from '@/config';
import { useAuthStore } from './useAuthStore';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  roles: string[];
  primeiroAcesso: boolean;
  isAtivo: boolean;
}

export interface UsuariosPorRole {
  ADMIN: Usuario[];
  PROFESSOR: Usuario[];
  RESPONSAVEL: Usuario[];
  todos: Usuario[];
}

interface UsuariosState {
  usuarios: Usuario[];
  usuariosPorRole: UsuariosPorRole;
  isLoading: boolean;
  error: string | null;

  fetchUsuariosAtivos: () => Promise<void>;
  fetchUsuarioDetalhes: (id: number) => Promise<Usuario | null>;
  limparCache: () => void;
}

const initialUsuariosPorRole: UsuariosPorRole = {
  ADMIN: [],
  PROFESSOR: [],
  RESPONSAVEL: [],
  todos: []
};

export const useUsuariosStore = create<UsuariosState>((set, get) => ({
  usuarios: [],
  usuariosPorRole: initialUsuariosPorRole,
  isLoading: false,
  error: null,

  fetchUsuariosAtivos: async () => {
    set({ isLoading: true, error: null });
    try {
      const authState = useAuthStore.getState();
      const token = authState.token;
      
      const response = await fetch(`${config.API_URL}/usuarios/ativos`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            set({ isLoading: false });
            return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const usuarios: Usuario[] = await response.json();
      
      const usuariosPorRole: UsuariosPorRole = {
        ADMIN: [],
        PROFESSOR: [],
        RESPONSAVEL: [],
        todos: usuarios
      };

      usuarios.forEach(usuario => {
        if (usuario.roles.includes('ADMIN')) {
          usuariosPorRole.ADMIN.push(usuario);
        }
        
        if (usuario.roles.includes('PROFESSOR')) {
          usuariosPorRole.PROFESSOR.push(usuario);
        }
        
        if (usuario.roles.includes('RESPONSAVEL')) {
          usuariosPorRole.RESPONSAVEL.push(usuario);
        }
      });

      set({ 
        usuarios, 
        usuariosPorRole,
        isLoading: false, 
        error: null 
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error fetching usuarios';
      set({ isLoading: false, error: message });
      console.error('Error fetching usuarios:', error);
    }
  },

  fetchUsuarioDetalhes: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const authState = useAuthStore.getState();
      const token = authState.token;

      const response = await fetch(`${config.API_URL}/usuarios/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
         set({ isLoading: false });
         if (response.status === 404) console.error('Usuário não encontrado');
         return null;
      }

      const data = await response.json();
      set({ isLoading: false, error: null });
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar detalhes do usuário';
      set({ isLoading: false, error: message });
      console.error('Erro ao buscar detalhes do usuário:', error);
      return null;
    }
  },

  limparCache: () => {
    set({ 
      usuarios: [], 
      usuariosPorRole: initialUsuariosPorRole,
      error: null 
    });
  }
}));
