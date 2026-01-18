'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAlunosStore } from '@/stores/useAlunosStore';
import { createDiario } from '@/utils/diarios';
import DiarioStepper from '@/components/professor/diarios/DiarioStepper';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { DiarioFormData } from '@/types/diario';
import { toast } from 'sonner';

export default function NovoDiarioPage() {
  const router = useRouter();
  const params = useParams();
  const alunoId = Number(params.alunoId);
  const { currentAluno, getAlunoDetalhes } = useAlunosStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (alunoId) {
      getAlunoDetalhes(alunoId);
    }
  }, [alunoId, getAlunoDetalhes]);

  const handleSubmit = async (formData: DiarioFormData & { [key: string]: any }) => {
    setLoading(true);
    try {
      const today = new Date();
      const localDate = today.getFullYear() + '-' + 
        String(today.getMonth() + 1).padStart(2, '0') + '-' + 
        String(today.getDate()).padStart(2, '0');

      const payload: any = {
        alunoId,
        data: localDate, // YYYY-MM-DD local
        evacuacao: formData.trocaFralda?.toUpperCase() || 'NORMAL',
        lancheManha: formData.cafeDaManha?.toUpperCase() || 'NAO_SE_APLICA',
        almoco: formData.almoco?.toUpperCase() || 'NAO_SE_APLICA',
        lancheTarde: formData.lancheDaTarde?.toUpperCase() || 'NAO_SE_APLICA',
        leite: formData.leite?.toUpperCase() || 'NAO_SE_APLICA',
        disposicao: formData.sonoStatus?.toUpperCase() || 'NORMAL',
        observacoes: formData.observacoes,
        periodosSono: (formData.periodosSono || []).map((p: any) => ({
          horaDormiu: p.horaDormiu,
          horaAcordou: p.horaAcordou,
          tempoTotal: p.tempoTotal
        })),
        itensProvidencia: formData.itensProvidencia || []
      };

      const res = await createDiario(payload);

      if (res.success) {
        toast.success('Diário salvo com sucesso!');
        router.push('/professor/diarios');
      } else {
        toast.error(res.message || 'Erro ao salvar diário');
      }
    } catch (error) {
      console.error('Error saving diary:', error);
      toast.error('Erro de conexão ao salvar diário');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RouteGuard allowedRoles={['PROFESSOR']}>
      <div className="min-h-screen bg-gray-50/30">
        <DiarioStepper
          alunoNome={currentAluno?.nome}
          onSubmit={handleSubmit}
          isLoading={loading}
          onCancel={() => router.push('/professor/diarios')}
        />
      </div>
    </RouteGuard>
  );
}
