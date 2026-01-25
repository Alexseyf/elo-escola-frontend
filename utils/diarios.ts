import { api } from '@/lib/api';
import { CreateDiarioDTO, Diario } from '@/types/diario';

export async function getDiariosByAlunoId(alunoId: number, data?: string): Promise<Diario[]> {
  try {
    const endpoint = data 
      ? `/api/v1/diarios/aluno/${alunoId}?data=${data}`
      : `/api/v1/diarios/aluno/${alunoId}`;
      
    const response = await api(endpoint);
    
    if (!response.ok) {
      if (response.status === 403) {
        console.warn('Usuário não tem permissão para ver diários deste aluno');
        return [];
      }
      return [];
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar diários:', error);
    return [];
  }
}

export async function createDiario(data: CreateDiarioDTO): Promise<{ success: boolean; data?: Diario; message?: string }> {
  try {
    const response = await api('/api/v1/diarios', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      let msg = result.message || result.erro || 'Erro ao criar diário';
      if (typeof msg !== 'string') {
        if (msg.issues && Array.isArray(msg.issues)) {
          msg = msg.issues.map((i: any) => i.message).join(', ');
        } else {
          msg = JSON.stringify(msg);
        }
      }
      return { 
        success: false, 
        message: msg 
      };
    }
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Erro ao criar diário:', error);
    return { success: false, message: 'Erro de conexão ao criar diário' };
  }
}

export async function getDiario(id: number): Promise<Diario | null> {
  try {
    const response = await api(`/api/v1/diarios/${id}`);
    
    if (!response.ok) return null;
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar diário:', error);
    return null;
  }
}

export async function updateDiario(id: number, data: Partial<CreateDiarioDTO>): Promise<{ success: boolean; data?: Diario; message?: string }> {
  try {
    const response = await api(`/api/v1/diarios/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      let msg = result.message || result.erro || 'Erro ao atualizar diário';
      if (typeof msg !== 'string') {
        if (msg.issues && Array.isArray(msg.issues)) {
          msg = msg.issues.map((i: any) => i.message).join(', ');
        } else {
          msg = JSON.stringify(msg);
        }
      }
      
      if (msg.includes('Unique constraint failed')) {
        msg = 'Conflito de dados: Já existe um registro para esta data. (Duplicidade detectada)';
      }
      
      return { 
        success: false, 
        message: msg 
      };
    }
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Erro ao atualizar diário:', error);
    return { success: false, message: 'Erro de conexão ao atualizar diário' };
  }
}
