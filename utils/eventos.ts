import { api } from '@/lib/api';
import { Evento, CreateEventoDTO, UpdateEventoDTO } from '@/types/evento';
import { TipoEvento } from '@/types/cronograma'; // Assuming reuse of Enum

export async function getEventos(params?: {
  data?: string;
  tipoEvento?: TipoEvento;
  turmaId?: number;
  isAtivo?: boolean;
}): Promise<Evento[]> {
  try {
    let endpoint = '/api/v1/eventos';
    const queryParams: string[] = [];
    
    if (params?.data) queryParams.push(`data=${params.data}`);
    if (params?.tipoEvento) queryParams.push(`tipoEvento=${params.tipoEvento}`);
    if (params?.turmaId) queryParams.push(`turmaId=${params.turmaId}`);
    if (params?.isAtivo !== undefined) queryParams.push(`isAtivo=${params.isAtivo}`);
    
    if (queryParams.length > 0) {
      endpoint += `?${queryParams.join('&')}`;
    }
    
    const response = await api(endpoint);
    
    if (!response.ok) {
      console.error('Erro ao buscar eventos:', response.status);
      return [];
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    return [];
  }
}

export async function getEventoById(id: number): Promise<Evento | null> {
  try {
    const response = await api(`/api/v1/eventos/${id}`);
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar detalhes do evento:', error);
    return null;
  }
}

export async function getEventosByTurma(turmaId: number): Promise<Evento[]> {
  try {
    const response = await api(`/api/v1/eventos/turma/${turmaId}`);

    if (!response.ok) {
        console.error('Erro ao buscar eventos da turma:', response.status);
        return [];
    }

    return await response.json();
  } catch (error) {
      console.error('Erro ao buscar eventos da turma:', error);
      return [];
  }
}

export async function createEvento(data: CreateEventoDTO): Promise<{ success: boolean; data?: Evento; message?: string }> {
  try {
    const response = await api('/api/v1/eventos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return { 
        success: false, 
        message: result.erro?.message || result.error || 'Erro ao criar evento' 
      };
    }
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    return { success: false, message: 'Erro de conexão ao criar evento' };
  }
}

export async function updateEvento(id: number, data: UpdateEventoDTO): Promise<{ success: boolean; data?: Evento; message?: string }> {
  try {
    const response = await api(`/api/v1/eventos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return { 
        success: false, 
        message: result.erro?.message || result.error || 'Erro ao atualizar evento' 
      };
    }
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Erro ao atualizar evento:', error);
    return { success: false, message: 'Erro de conexão ao atualizar evento' };
  }
}

export async function deleteEvento(id: number): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await api(`/api/v1/eventos/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const result = await response.json();
      return { 
        success: false, 
        message: result.erro?.message || result.error || 'Erro ao excluir evento' 
      };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao excluir evento:', error);
    return { success: false, message: 'Erro de conexão ao excluir evento' };
  }
}
