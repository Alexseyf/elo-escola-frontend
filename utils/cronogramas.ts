import { api } from '@/lib/api';
import { Cronograma, CreateCronogramaDTO, TipoEvento } from '@/types/cronograma';

export async function getCronogramas(params?: {
  data?: string;
  tipoEvento?: TipoEvento;
  isAtivo?: boolean;
}): Promise<Cronograma[]> {
  try {
    let endpoint = '/api/v1/cronogramas';
    const queryParams: string[] = [];
    
    if (params?.data) queryParams.push(`data=${params.data}`);
    if (params?.tipoEvento) queryParams.push(`tipoEvento=${params.tipoEvento}`);
    if (params?.isAtivo !== undefined) queryParams.push(`isAtivo=${params.isAtivo}`);
    
    if (queryParams.length > 0) {
      endpoint += `?${queryParams.join('&')}`;
    }
    
    const response = await api(endpoint);
    
    if (!response.ok) {
      console.error('Erro ao buscar cronogramas:', response.status);
      return [];
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : data.cronogramas || [];
  } catch (error) {
    console.error('Erro ao buscar cronogramas:', error);
    return [];
  }
}

export async function getCronogramaById(id: number): Promise<Cronograma | null> {
  try {
    const response = await api(`/api/v1/cronogramas/${id}`);
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar detalhes do cronograma:', error);
    return null;
  }
}

export async function createCronograma(data: CreateCronogramaDTO): Promise<{ success: boolean; data?: Cronograma; message?: string }> {
  try {
    const response = await api('/api/v1/cronogramas', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return { 
        success: false, 
        message: result.message || 'Erro ao criar cronograma' 
      };
    }
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Erro ao criar cronograma:', error);
    return { success: false, message: 'Erro de conexão ao criar cronograma' };
  }
}

export async function updateCronograma(id: number, data: Partial<CreateCronogramaDTO>): Promise<{ success: boolean; data?: Cronograma; message?: string }> {
  try {
    const response = await api(`/api/v1/cronogramas/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return { 
        success: false, 
        message: result.message || 'Erro ao atualizar cronograma' 
      };
    }
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Erro ao atualizar cronograma:', error);
    return { success: false, message: 'Erro de conexão ao atualizar cronograma' };
  }
}

export async function deleteCronograma(id: number): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await api(`/api/v1/cronogramas/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const result = await response.json();
      return { 
        success: false, 
        message: result.message || 'Erro ao desativar cronograma' 
      };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao desativar cronograma:', error);
    return { success: false, message: 'Erro de conexão ao desativar cronograma' };
  }
}
