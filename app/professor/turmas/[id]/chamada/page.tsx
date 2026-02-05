"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useTurmasStore } from "@/stores/useTurmasStore"
import { RouteGuard } from "@/components/auth/RouteGuard"
import { PageHeader } from "@/components/PageHeader"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Check, X, Calendar as CalendarIcon, Save } from "lucide-react"
import { api } from "@/lib/api"
import { FrequenciaBatchInput } from "@/types/diario"

interface PresencaMap {
    [alunoId: number]: boolean;
}

export default function ChamadaPage() {
    const params = useParams();
    const router = useRouter();
    const id = Number(params.id);
    const { fetchTurmaById } = useTurmasStore();

    const [turma, setTurma] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [loadingFrequencia, setLoadingFrequencia] = useState(false);
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [presencas, setPresencas] = useState<PresencaMap>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (id) {
            loadTurma();
        }
    }, [id]);


    async function loadTurma() {
        setLoading(true);
        const data = await fetchTurmaById(id);
        setTurma(data);
        await loadFrequencia(data);
        setLoading(false);
    }

    async function loadFrequencia(turmaOverride?: any) {
        const currentTurma = turmaOverride || turma;

        if (!id || !date || !currentTurma) return;
        if (!loading) setLoadingFrequencia(true);

        try {
            const response = await api(`/api/v1/frequencias/turmas/${id}/data/${date}`);
            if (response.ok) {
                const data: { alunoId: number, presente: boolean }[] = await response.json();

                if (data && data.length > 0) {
                    const loadedPresencas: PresencaMap = {};
                    data.forEach(item => {
                        loadedPresencas[item.alunoId] = item.presente;
                    });
                    setPresencas(loadedPresencas);
                    return;
                }
            }
        } catch (error) {
            console.error("Erro ao carregar frequencia:", error);
        } finally {
            setLoadingFrequencia(false);
        }

        if (currentTurma?.alunos) {
            const initialPresencas: PresencaMap = {};
            currentTurma.alunos.forEach((aluno: any) => {
                initialPresencas[aluno.id] = true;
            });
            setPresencas(initialPresencas);
        }
    }

    useEffect(() => {
        if (turma) {
            loadFrequencia();
        }
    }, [date]);

    const togglePresenca = (alunoId: number) => {
        setPresencas(prev => ({
            ...prev,
            [alunoId]: !prev[alunoId]
        }));
    };

    async function handleSave() {
        if (!turma) return;

        setSaving(true);
        try {
            const payload: FrequenciaBatchInput = {
                data: date,
                turmaId: id,
                frequencias: Object.entries(presencas).map(([alunoId, presente]) => ({
                    alunoId: Number(alunoId),
                    presente
                }))
            };

            const response = await api('/api/v1/frequencias/batch', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Falha ao salvar chamada');
            }

            toast.success('Chamada realizada com sucesso!');
            router.push('/professor/chamada');
        } catch (error) {
            toast.error('Erro ao salvar chamada');
            console.error(error);
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-center p-4">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-500 font-medium mt-4">Carregando dados da turma...</p>
            </div>
        );
    }

    if (!turma) return <div>Turma não encontrada</div>;

    if (!turma.temDiarioClasse) {
        return (
            <RouteGuard allowedRoles={['PROFESSOR', 'ADMIN']}>
                <div className="min-h-screen bg-gray-50/50 p-4 flex items-center justify-center">
                    <Card className="w-full max-w-md">
                        <CardHeader className="text-center">
                            <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                                <CalendarIcon className="w-6 h-6 text-yellow-600" />
                            </div>
                            <CardTitle>Funcionalidade Não Habilitada</CardTitle>
                            <CardDescription>
                                O diário de classe não está habilitado para esta turma.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-center">
                            <Button variant="outline" onClick={() => router.back()}>Voltar</Button>
                        </CardContent>
                    </Card>
                </div>
            </RouteGuard>
        )
    }

    return (
        <RouteGuard allowedRoles={['PROFESSOR', 'ADMIN']}>
            <div className="min-h-screen bg-gray-50/50 pb-24">
                {/* Header Section */}
                <PageHeader
                    title={`Chamada - ${turma.nome}`}
                    subtitle="Registro de frequência"
                    backHref="/professor/chamada"
                    sticky={false}
                    actions={
                        <div className="relative w-full sm:w-48">
                            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="date"
                                id="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="pl-10 bg-white"
                            />
                        </div>
                    }
                />

                <div className="max-w-4xl mx-auto p-4 space-y-4 mt-4">
                    {/* Stats / Summary (Optional enhancement) */}
                    <div className="flex justify-between items-center px-2 text-sm text-gray-500 font-medium">
                        <span>Total de Alunos: {turma.alunos?.length || 0}</span>
                        <span>Presentes: {Object.values(presencas).filter(Boolean).length}</span>
                    </div>

                    {/* Student List */}
                    <div className="space-y-3">
                        {loadingFrequencia ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                <p className="text-gray-500 font-medium mt-4">Carregando chamada...</p>
                            </div>
                        ) : (
                            turma.alunos && turma.alunos.map((aluno: any) => {
                                const isPresent = presencas[aluno.id];
                                return (
                                    <div
                                        key={aluno.id}
                                        className={`
                                            flex items-center justify-between p-4 rounded-xl border transition-all duration-200
                                            ${isPresent
                                                ? 'bg-white border-gray-200 shadow-sm'
                                                : 'bg-red-50 border-red-100'
                                            }
                                        `}
                                        onClick={() => togglePresenca(aluno.id)}
                                    >
                                        <div className="flex items-center gap-3 md:gap-4">
                                            <div className={`
                                                h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center font-bold text-white shrink-0 shadow-sm transition-colors
                                                ${isPresent ? 'bg-blue-500' : 'bg-red-400'}
                                            `}>
                                                {aluno.nome.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className={`font-semibold text-base md:text-lg ${isPresent ? 'text-gray-900' : 'text-red-700'}`}>
                                                    {aluno.nome}
                                                </h3>
                                                <p className={`text-xs md:text-sm font-medium ${isPresent ? 'text-green-600' : 'text-red-500'}`}>
                                                    {isPresent ? 'PRESENTE' : 'AUSENTE'}
                                                </p>
                                            </div>
                                        </div>

                                        <div onClick={(e) => e.stopPropagation()}>
                                            <Switch
                                                checked={isPresent || false}
                                                onCheckedChange={() => togglePresenca(aluno.id)}
                                                className="data-[state=checked]:bg-green-500"
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Sticky Footer for Mobile Actions */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-20 md:static md:bg-transparent md:border-0 md:p-0 md:mt-8">
                    <div className="max-w-4xl mx-auto flex justify-end">
                        <Button
                            size="lg"
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full md:w-auto text-lg md:text-base font-semibold shadow-lg"
                        >
                            <Save className="mr-2 h-5 w-5 md:h-4 md:w-4" />
                            {saving ? 'Salvando...' : 'Salvar Chamada'}
                        </Button>
                    </div>
                </div>
            </div>
        </RouteGuard>
    )
}
