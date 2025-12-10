import { useCamposStore, CAMPO_EXPERIENCIA, formatarCampoExperiencia, textoParaCampoExperiencia } from '@/stores/useCamposStore';

export { CAMPO_EXPERIENCIA, formatarCampoExperiencia, textoParaCampoExperiencia } from '@/stores/useCamposStore';

export interface CreateCampoExperienciaResult {
  success: boolean;
  message: string;
  data?: {
    id: number;
    campoExperiencia: CAMPO_EXPERIENCIA;
  };
}

export async function createCampoExperiencia(campo: CAMPO_EXPERIENCIA): Promise<CreateCampoExperienciaResult> {
  const store = useCamposStore.getState();
  try {
    store.fetchCampos();
    return {
      success: true,
      message: 'Campo de experiência sincronizado com sucesso'
    };
  } catch (error) {
    console.error('Error creating campo de experiência:', error);
    return {
      success: false,
      message: 'Erro ao cadastrar campo de experiência'
    };
  }
}

export interface CampoExperienciaResponse {
  id: number;
  campoExperiencia: CAMPO_EXPERIENCIA;
}

export interface GetCamposExperienciaResult {
  success: boolean;
  message: string;
  data?: CampoExperienciaResponse[];
}

export async function getCamposExperiencia(): Promise<GetCamposExperienciaResult> {
  try {
    const store = useCamposStore.getState();
    await store.fetchCampos();
    
    return {
      success: true,
      message: 'Campos de experiência obtidos com sucesso',
      data: store.campos
    };
  } catch (error) {
    console.error('Error fetching campos de experiência:', error);
    return {
      success: false,
      message: 'Erro ao buscar campos de experiência'
    };
  }
}

export async function mapearCampoExperienciaParaId(nomeCampo: CAMPO_EXPERIENCIA): Promise<number> {
  try {
    const store = useCamposStore.getState();

    if (store.campos.length === 0) {
      await store.fetchCampos();
    }

    const id = store.mapearCampoParaId(nomeCampo);
    
    if (!id) {
      console.error('Campo não encontrado:', nomeCampo);
      return 0;
    }

    return id;
  } catch (error) {
    console.error('Erro ao mapear campo de experiência para ID:', error);
    return 0;
  }
}

export interface DetalheTurmaRelatorio {
  turmaId: number;
  turma: string;
  total: number;
}

export interface CampoExperienciaRelatorio {
  campoExperiencia: CAMPO_EXPERIENCIA;
  totalGeral: number;
  detalhesPorTurma: DetalheTurmaRelatorio[];
}

export interface ResumoRelatorio {
  totalAtividades: number;
  totalCampos: number;
}

export interface RelatorioAtividadesCampoExperiencia {
  resumo: ResumoRelatorio;
  relatorio: CampoExperienciaRelatorio[];
}

export interface GetRelatorioAtividadesResult {
  success: boolean;
  message: string;
  data?: RelatorioAtividadesCampoExperiencia;
}

export async function getRelatorioAtividadesPorCampoExperiencia(): Promise<GetRelatorioAtividadesResult> {
  try {
    const store = useCamposStore.getState();
    await store.fetchRelatorioAtividades();
    
    return {
      success: true,
      message: 'Relatório de atividades obtido com sucesso',
      data: store.relatorio || undefined
    };
  } catch (error) {
    console.error('Error fetching relatório de atividades por campo de experiência:', error);
    return {
      success: false,
      message: 'Erro ao buscar relatório de atividades'
    };
  }
}

export function limparCachesCampos(): void {
  const store = useCamposStore.getState();
  store.limparCache();
}
