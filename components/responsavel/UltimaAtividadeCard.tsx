"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getAlunosDoResponsavel } from "@/utils/alunos";
import { useAtividadesStore } from "@/stores/useAtividadesStore";
import { formatarCampoExperiencia } from "@/stores/useCamposStore";
import { formatarNomeTurma } from "@/stores/useTurmasStore";
import { Atividade } from "@/types/atividades";
import { BookOpen, Calendar } from "lucide-react";

interface AtividadeComTurma {
    turma: { id: number; nome: string };
    alunos: string[];
    atividade: Atividade | null;
}

export function UltimaAtividadeCard() {
    const [atividadesPorTurma, setAtividadesPorTurma] = useState<AtividadeComTurma[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const fetchUltimaAtividade = useAtividadesStore((state) => state.fetchUltimaAtividadePorTurma);

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            try {
                const alunos = await getAlunosDoResponsavel();

                // Agrupar alunos por turma para evitar chamadas duplicadas para a mesma turma
                const turmasVistas = new Map<number, { nome: string; alunos: string[] }>();
                alunos.forEach(aluno => {
                    if (aluno.turma) {
                        const info = turmasVistas.get(aluno.turma.id) || { nome: aluno.turma.nome, alunos: [] };
                        info.alunos.push(aluno.nome);
                        turmasVistas.set(aluno.turma.id, info);
                    }
                });

                const promises = Array.from(turmasVistas.entries()).map(async ([id, info]) => {
                    const atividade = await fetchUltimaAtividade(id);
                    return {
                        turma: { id, nome: info.nome },
                        alunos: info.alunos,
                        atividade
                    };
                });

                const results = await Promise.all(promises);
                setAtividadesPorTurma(results);
            } catch (error) {
                console.error("Erro ao carregar últimas atividades:", error);
            } finally {
                setIsLoading(false);
            }
        }

        loadData();
    }, [fetchUltimaAtividade]);

    const formatarData = (dataISO: string) => {
        if (!dataISO) return "";
        const datePart = dataISO.split("T")[0];
        const [year, month, day] = datePart.split("-");
        return `${day}/${month}/${year}`;
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        Últimas Atividades Pedagógicas
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-32 w-full" />
                </CardContent>
            </Card>
        );
    }

    if (atividadesPorTurma.length === 0) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    Últimas Atividades Pedagógicas
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {atividadesPorTurma.map(({ turma, atividade, alunos }) => (
                    <div key={turma.id} className="space-y-3">
                        <div className="border-b pb-1">
                            <h3 className="font-semibold text-gray-900">
                                Turma: {formatarNomeTurma(turma.nome)}
                            </h3>
                            <p className="text-[10px] text-muted-foreground uppercase font-medium">
                                Aluno(s): {alunos.join(", ")}
                            </p>
                        </div>

                        {!atividade ? (
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <p className="text-sm text-muted-foreground text-center">
                                    Nenhuma atividade registrada para esta turma.
                                </p>
                            </div>
                        ) : (
                            <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm space-y-2 hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-start gap-4">
                                    <h4 className="text-sm font-bold text-blue-900 uppercase tracking-tight">
                                        {formatarCampoExperiencia(atividade.campoExperiencia)}
                                    </h4>
                                    <div className="flex items-center text-xs text-muted-foreground whitespace-nowrap">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        {formatarData(atividade.data)}
                                    </div>
                                </div>

                                <p className="text-sm text-gray-700 line-clamp-3">
                                    {atividade.descricao}
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
