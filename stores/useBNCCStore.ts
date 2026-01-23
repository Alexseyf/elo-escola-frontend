import { create } from 'zustand';
import { api } from '@/lib/api';
import type { 
  CampoExperiencia, 
  Objetivo,
  CreateCampoInput,
  UpdateCampoInput,
  CreateObjetivoInput,
  UpdateObjetivoInput,
  ApiResponse
} from '@/types/bncc';

interface BNCCState {
  campos: CampoExperiencia[];
  isLoadingCampos: boolean;
  errorCampos: string | null;
  objetivos: Objetivo[];
  isLoadingObjetivos: boolean;
  errorObjetivos: string | null;

  fetchCampos: () => Promise<void>;
  createCampo: (data: CreateCampoInput) => Promise<ApiResponse<CampoExperiencia>>;
  updateCampo: (id: number, data: UpdateCampoInput) => Promise<ApiResponse<CampoExperiencia>>;
  deleteCampo: (id: number) => Promise<ApiResponse>;

  fetchObjetivos: () => Promise<void>;
  createObjetivo: (data: CreateObjetivoInput) => Promise<ApiResponse<Objetivo>>;
  updateObjetivo: (id: number, data: UpdateObjetivoInput) => Promise<ApiResponse<Objetivo>>;
  deleteObjetivo: (id: number) => Promise<ApiResponse<Objetivo>>;
}

export const useBNCCStore = create<BNCCState>((set, get) => ({
  campos: [],
  isLoadingCampos: false,
  errorCampos: null,

  objetivos: [],
  isLoadingObjetivos: false,
  errorObjetivos: null,

  fetchCampos: async () => {
    set({ isLoadingCampos: true, errorCampos: null });
    try {
      const response = await api('/api/v1/campos', {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.erro || `Erro ao buscar campos: ${response.status}`);
      }

      const data = await response.json();
      set({ campos: data, isLoadingCampos: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar campos';
      set({ isLoadingCampos: false, errorCampos: message });
      console.error('Error fetching campos:', error);
    }
  },

  createCampo: async (data: CreateCampoInput) => {
    try {
      const response = await api('/api/v1/campos', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        
        if (response.status === 403) {
          return { success: false, message: 'Sem permissão. Apenas PLATFORM_ADMIN pode criar campos.' };
        }
        
        return { 
          success: false, 
          message: errorData?.erro || 'Erro ao criar campo de experiência' 
        };
      }

      const campo = await response.json();
      
      await get().fetchCampos();
      
      return { success: true, message: 'Campo criado com sucesso', data: campo };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar campo';
      return { success: false, message };
    }
  },

  updateCampo: async (id: number, data: UpdateCampoInput) => {
    try {
      const response = await api(`/api/v1/campos/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        
        if (response.status === 403) {
          return { success: false, message: 'Sem permissão. Apenas PLATFORM_ADMIN pode editar campos.' };
        }
        
        if (response.status === 404) {
          return { success: false, message: 'Campo não encontrado' };
        }
        
        return { 
          success: false, 
          message: errorData?.erro || 'Erro ao atualizar campo' 
        };
      }

      const campo = await response.json();
      
      await get().fetchCampos();
      
      return { success: true, message: 'Campo atualizado com sucesso', data: campo };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar campo';
      return { success: false, message };
    }
  },

  deleteCampo: async (id: number) => {
    try {
      const response = await api(`/api/v1/campos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        
        if (response.status === 403) {
          return { success: false, message: 'Sem permissão. Apenas PLATFORM_ADMIN pode deletar campos.' };
        }
        
        if (response.status === 404) {
          return { success: false, message: 'Campo não encontrado' };
        }
        
        if (response.status === 400) {
          return { 
            success: false, 
            message: errorData?.erro || 'Não é possível deletar este campo pois existem objetivos associados.' 
          };
        }
        
        return { 
          success: false, 
          message: errorData?.erro || 'Erro ao deletar campo' 
        };
      }

      await get().fetchCampos();
      
      return { success: true, message: 'Campo deletado com sucesso' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao deletar campo';
      return { success: false, message };
    }
  },

  fetchObjetivos: async () => {
    set({ isLoadingObjetivos: true, errorObjetivos: null });
    try {
      const response = await api('/api/v1/objetivos', {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.erro || `Erro ao buscar objetivos: ${response.status}`);
      }

      const data = await response.json();
      set({ objetivos: data, isLoadingObjetivos: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar objetivos';
      set({ isLoadingObjetivos: false, errorObjetivos: message });
      console.error('Error fetching objetivos:', error);
    }
  },

  createObjetivo: async (data: CreateObjetivoInput) => {
    try {
      const response = await api('/api/v1/objetivos', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        
        if (response.status === 403) {
          return { success: false, message: 'Sem permissão. Apenas PLATFORM_ADMIN pode criar objetivos.' };
        }
        
        if (response.status === 400) {
          return { 
            success: false, 
            message: errorData?.erro || 'Dados inválidos. Verifique o código único e IDs de grupo/campo.' 
          };
        }
        
        return { 
          success: false, 
          message: errorData?.erro || 'Erro ao criar objetivo' 
        };
      }

      const objetivo = await response.json();
      
      await get().fetchObjetivos();
      
      return { success: true, message: 'Objetivo criado com sucesso', data: objetivo };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar objetivo';
      return { success: false, message };
    }
  },

  updateObjetivo: async (id: number, data: UpdateObjetivoInput) => {
    try {
      const response = await api(`/api/v1/objetivos/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        
        if (response.status === 403) {
          return { success: false, message: 'Sem permissão. Apenas PLATFORM_ADMIN pode editar objetivos.' };
        }
        
        if (response.status === 404) {
          return { success: false, message: 'Objetivo não encontrado' };
        }
        
        if (response.status === 400) {
          return { 
            success: false, 
            message: errorData?.erro || 'Dados inválidos ou código duplicado' 
          };
        }
        
        return { 
          success: false, 
          message: errorData?.erro || 'Erro ao atualizar objetivo' 
        };
      }

      const objetivo = await response.json();
      
      await get().fetchObjetivos();
      
      return { success: true, message: 'Objetivo atualizado com sucesso', data: objetivo };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar objetivo';
      return { success: false, message };
    }
  },

  deleteObjetivo: async (id: number) => {
    try {
      const response = await api(`/api/v1/objetivos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        
        if (response.status === 403) {
          return { success: false, message: 'Sem permissão. Apenas PLATFORM_ADMIN pode deletar objetivos.' };
        }
        
        if (response.status === 404) {
          return { success: false, message: 'Objetivo não encontrado' };
        }
        
        if (response.status === 400) {
          return { 
            success: false, 
            message: errorData?.erro || 'Objetivo já está inativo' 
          };
        }
        
        return { 
          success: false, 
          message: errorData?.erro || 'Erro ao deletar objetivo' 
        };
      }

      const objetivo = await response.json();
      
      await get().fetchObjetivos();
      
      return { success: true, message: 'Objetivo marcado como inativo com sucesso', data: objetivo };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao deletar objetivo';
      return { success: false, message };
    }
  },
}));
