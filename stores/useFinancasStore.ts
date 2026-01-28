import { create } from 'zustand';
import { api } from '@/lib/api';
import { BalancoMensal, Pagamento, CreatePagamentoDTO } from '@/types/financas';
import { toast } from 'sonner';

interface FinancasState {
  balanco: BalancoMensal | null;
  pagamentos: Pagamento[];
  isLoading: boolean;
  error: string | null;

  fetchBalanco: (mes: number, ano: number) => Promise<void>;
  fetchPagamentos: (mes: number, ano: number) => Promise<void>;
  addPagamento: (data: CreatePagamentoDTO) => Promise<boolean>;
  deletePagamento: (id: number) => Promise<boolean>;
  fecharMes: (mes: number, ano: number) => Promise<boolean>;
}

export const useFinancasStore = create<FinancasState>((set) => ({
  balanco: null,
  pagamentos: [],
  isLoading: false,
  error: null,

  fetchBalanco: async (mes, ano) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api(`/api/v1/financas/balanco?mes=${mes}&ano=${ano}`);
      if (!response.ok) throw new Error('Erro ao buscar balanço financeiro');
      const data = await response.json();
      set({ balanco: data, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ocorreu um erro';
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  fetchPagamentos: async (mes, ano) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api(`/api/v1/financas/pagamentos?mes=${mes}&ano=${ano}`);
      if (!response.ok) throw new Error('Erro ao buscar listagem de pagamentos');
      const data = await response.json();
      set({ pagamentos: data, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ocorreu um erro';
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  addPagamento: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api('/api/v1/financas/pagamentos', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao registrar pagamento');
      }

      toast.success('Pagamento registrado com sucesso!');
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro');
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  deletePagamento: async (id) => {
    try {
      const response = await api(`/api/v1/financas/pagamentos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao excluir pagamento');
      }

      toast.success('Pagamento removido com sucesso!');
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir pagamento');
      return false;
    }
  },

  fecharMes: async (mes, ano) => {
    set({ isLoading: true });
    try {
      const response = await api('/api/v1/financas/fechamento', {
        method: 'POST',
        body: JSON.stringify({ mes, ano }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao efetuar fechamento do mês');
      }

      toast.success('Mês fechado com sucesso! Os dados agora são permanentes.');
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro');
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
}));
