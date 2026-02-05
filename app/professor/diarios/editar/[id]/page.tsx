'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getDiario, updateDiario } from '@/utils/diarios';
import DiarioStepper from '@/components/professor/diarios/DiarioStepper';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { DiarioFormData, ItemProvidencia, CreateDiarioDTO } from '@/types/diario';
import { toast } from 'sonner';

export default function EditarDiarioPage() {
    const router = useRouter();
    const params = useParams();
    const id = Number(params.id);
    const [loading, setLoading] = useState(false);
    const [initialData, setInitialData] = useState<Partial<DiarioFormData> | null>(null);
    const [alunoNome, setAlunoNome] = useState('');

    useEffect(() => {
        const loadDiario = async () => {
            if (!id) return;

            try {
                const diario = await getDiario(id);
                if (!diario) {
                    toast.error('Diário não encontrado');
                    router.push('/professor/diarios');
                    return;
                }

                if (diario.aluno) {
                    setAlunoNome(diario.aluno.nome);

                    const isTurnoInverso = diario.aluno.turma?.nome.toUpperCase().replace(/\s/g, '') === 'TURNOINVERSO';
                    if (isTurnoInverso) {
                        toast.error('Esta turma não possui mais acesso aos diários.');
                        router.push('/professor/dashboard');
                        return;
                    }
                }

                const mappedData: Partial<DiarioFormData> = {
                    alunoId: diario.alunoId,
                    data: diario.data,
                    trocaFralda: diario.evacuacao,
                    cafeDaManha: diario.lancheManha,
                    almoco: diario.almoco,
                    lancheDaTarde: diario.lancheTarde,
                    leite: diario.leite,
                    sonoStatus: diario.disposicao,
                    observacoes: diario.observacoes,
                    periodosSono: (diario.periodosSono || []).map(p => {
                        const [sleepH, sleepM] = (p.horaDormiu || '00:00').split(':').map(Number);
                        const [wakeH, wakeM] = (p.horaAcordou || '00:00').split(':').map(Number);

                        return {
                            id: typeof p.id === 'string' ? parseInt(p.id) : p.id,
                            horaDormiu: p.horaDormiu,
                            horaAcordou: p.horaAcordou,
                            tempoTotal: p.tempoTotal,
                            sleepHour: sleepH,
                            sleepMinute: sleepM,
                            wakeHour: wakeH,
                            wakeMinute: wakeM,
                            saved: true
                        };
                    }),
                    itensProvidencia: (diario.itensProvidencia || []).map((item: ItemProvidencia) =>
                        typeof item === 'string' ? item : (item.itemProvidencia?.nome || String(item.itemProvidenciaId))
                    ),
                };

                setInitialData(mappedData);

            } catch (error) {
                console.error('Error loading diary:', error);
                toast.error('Erro ao carregar diário');
            }
        };

        loadDiario();
    }, [id, router]);

    const handleSubmit = async (formData: DiarioFormData) => {
        setLoading(true);
        try {
            // garantir que a data esteja no formato YYYY-MM-DD para evitar timezone
            let dataPayload = formData.data;
            if (dataPayload && dataPayload.includes('T')) {
                dataPayload = dataPayload.split('T')[0];
            }

            const payload: Partial<CreateDiarioDTO> = {
                alunoId: formData.alunoId,
                data: dataPayload,
                evacuacao: formData.trocaFralda?.toUpperCase() || 'NORMAL',
                lancheManha: formData.cafeDaManha?.toUpperCase() || 'NAO_SE_APLICA',
                almoco: formData.almoco?.toUpperCase() || 'NAO_SE_APLICA',
                lancheTarde: formData.lancheDaTarde?.toUpperCase() || 'NAO_SE_APLICA',
                leite: formData.leite?.toUpperCase() || 'NAO_SE_APLICA',
                disposicao: formData.sonoStatus?.toUpperCase() || 'NORMAL',
                observacoes: formData.observacoes,
                periodosSono: (formData.periodosSono || []).map((p: { id?: number; horaDormiu: string; horaAcordou: string; tempoTotal: string }) => ({
                    id: p.id,
                    horaDormiu: p.horaDormiu,
                    horaAcordou: p.horaAcordou,
                    tempoTotal: p.tempoTotal
                })),
                itensProvidencia: formData.itensProvidencia || []
            };

            const res = await updateDiario(id, payload);

            if (res.success) {
                toast.success('Diário atualizado com sucesso!');
                router.push('/professor/diarios');
            } else {
                toast.error(res.message || 'Erro ao atualizar diário');
            }
        } catch (error) {
            console.error('Error updating diary:', error);
            toast.error('Erro de conexão ao atualizar diário');
        } finally {
            setLoading(false);
        }
    };

    if (!initialData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-500 font-medium italic mt-4">Carregando diário...</p>
            </div>
        );
    }

    return (
        <RouteGuard allowedRoles={['PROFESSOR']}>
            <div className="p-6 space-y-6">
                <DiarioStepper
                    alunoNome={alunoNome}
                    initialData={initialData}
                    onSubmit={handleSubmit}
                    isLoading={loading}
                    onCancel={() => router.push('/professor/diarios')}
                />
            </div>
        </RouteGuard>
    );
}
