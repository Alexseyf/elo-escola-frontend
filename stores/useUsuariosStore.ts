import { create } from 'zustand';
import { api } from '@/lib/api';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  roles: string[];
  primeiroAcesso: boolean;
  isAtivo: boolean;
  cpf: string;
  rg: string;
  dataNascimento: string;
  telefone: string;
  telefoneComercial?: string;
  enderecoLogradouro: string;
  enderecoNumero: string;
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

  fetchUsuarios: () => Promise<void>;
  fetchUsuarioDetalhes: (id: number) => Promise<Usuario | null>;
  criarUsuario: (usuario: Omit<Usuario, 'id' | 'isAtivo' | 'primeiroAcesso'> & { schoolId?: string }) => Promise<Usuario | null>;
  fetchUsuarioLogado: () => Promise<Usuario | null>;
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

  fetchUsuarios: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api('/api/v1/usuarios');

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
      const response = await api(`/api/v1/usuarios/${id}`, {
        method: 'GET',
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

  criarUsuario: async (usuario) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api('/api/v1/usuarios', {
        method: 'POST',
        body: JSON.stringify(usuario),
      });

      if (!response.ok) {
        throw new Error(`Erro ao criar usuário: ${response.status}`);
      }

      const novoUsuario = await response.json();
      
      // Update local state
      const currentUsers = get().usuarios;
      const updatedUsers = [...currentUsers, novoUsuario];
      
      const usuariosPorRole = { ...get().usuariosPorRole };
      novoUsuario.roles.forEach((role: string) => {
          if (role in usuariosPorRole && Array.isArray((usuariosPorRole as any)[role])) {
            (usuariosPorRole as any)[role].push(novoUsuario);
          }
      });
      usuariosPorRole.todos.push(novoUsuario);

      set({ 
        usuarios: updatedUsers,
        usuariosPorRole,
        isLoading: false,
        error: null 
      });
      
      return novoUsuario;
    } catch (error) {
       const message = error instanceof Error ? error.message : 'Erro ao criar usuário';
       set({ isLoading: false, error: message });
       console.error('Erro ao criar usuário:', error);
       return null;
    }
  },

  fetchUsuarioLogado: async () => {
      set({ isLoading: true, error: null });
      try {
          const response = await api('/api/v1/usuarios/usuario-logado');
          if (!response.ok) {
              throw new Error('Falha ao obter usuário logado');
          }
          const data = await response.json();
          set({ isLoading: false });
          return data;
      } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro ao obter usuário logado';
          set({ isLoading: false, error: message });
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
