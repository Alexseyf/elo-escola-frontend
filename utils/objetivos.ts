import { useObjetivosStore } from '@/stores/useObjetivosStore';
import { mapearTurmaParaGrupo, mapearGrupoParaId } from './turmas';
import { mapearCampoExperienciaParaId, CAMPO_EXPERIENCIA } from './campos';

export async function getObjetivos(): Promise<any[]> {
  try {
    const store = useObjetivosStore.getState();
    await store.fetchObjetivos();
    return store.getObjetivos();
  } catch (error: any) {
    console.error('Erro ao buscar objetivos:', error);
    return [];
  }
}

export async function getObjetivosPorGrupoIdCampoId(grupoId: number, campoId: number): Promise<any[]> {
  try {
    const store = useObjetivosStore.getState();
    await store.fetchObjetivosPorGrupoIdCampoId(grupoId, campoId);
    return store.objetivosPorGrupoECampo;
  } catch (error: any) {
    console.error('Erro ao buscar objetivos por grupoId e campoId:', error);
    return [];
  }
}

export async function getObjetivosPorTurmaECampo(nomeTurma: string, campoExperiencia: string): Promise<any[]> {
  try {
    const grupo = mapearTurmaParaGrupo(nomeTurma);
    if (!grupo) {
      console.error('Turma não mapeada para grupo:', nomeTurma);
      return [];
    }

    const grupoId = await mapearGrupoParaId(grupo);
    if (!grupoId) {
      console.error('Grupo não mapeado para ID:', grupo);
      return [];
    }

    const campoId = await mapearCampoExperienciaParaId(campoExperiencia as CAMPO_EXPERIENCIA);
    if (!campoId) {
      console.error('Campo não mapeado para ID:', campoExperiencia);
      return [];
    }

    return await getObjetivosPorGrupoIdCampoId(grupoId, campoId);
  } catch (error: any) {
    console.error('Erro ao buscar objetivos por turma e campo:', error);
    return [];
  }
}
