import { useUsuariosStore } from '@/stores/useUsuariosStore';
import type { Usuario, UsuariosPorRole } from '@/stores/useUsuariosStore';

export type { Usuario, UsuariosPorRole };

export async function fetchUsuariosAtivos(): Promise<{
  success: boolean;
  data?: UsuariosPorRole;
  error?: string;
}> {
  try {
    const store = useUsuariosStore.getState();
    await store.fetchUsuariosAtivos();
    
    if (store.error) {
      return {
        success: false,
        error: store.error
      };
    }

    return {
      success: true,
      data: store.usuariosPorRole
    };
  } catch (error) {
    console.error('Erro ao buscar usuários ativos:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao buscar usuários ativos'
    };
  }
}

export async function fetchUsuarioDetalhes(usuarioId: number): Promise<{
  success: boolean;
  data?: Usuario;
  error?: string;
}> {
  try {
    const store = useUsuariosStore.getState();
    const usuario = await store.fetchUsuarioDetalhes(usuarioId);
    
    if (!usuario && store.error) {
      return {
        success: false,
        error: store.error
      };
    }
    
    if (!usuario) {
        return {
            success: false,
            error: 'Usuário não encontrado'
        };
    }

    return {
      success: true,
      data: usuario
    };
  } catch (error) {
    console.error('Erro ao buscar detalhes do usuário:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao buscar detalhes do usuário'
    };
  }
}

export async function fetchResponsaveis(): Promise<Usuario[]> {
  try {
    const store = useUsuariosStore.getState();
    
    await store.fetchUsuariosAtivos();
    
    return store.usuariosPorRole.RESPONSAVEL || [];
  } catch (error) {
    console.error('Erro ao buscar responsáveis:', error);
    return [];
  }
}
