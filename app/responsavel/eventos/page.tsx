"use client";

import { useEffect, useState, useMemo } from "react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { EventList } from "@/components/eventos/EventList";
import { Evento } from "@/types/evento";
import { getEventos } from "@/utils/eventos";
import { getAlunosDoResponsavel } from "@/utils/alunos";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { formatarNomeTurma } from "@/stores/useTurmasStore";

interface EventosPorTurma {
    turmaId: number;
    turmaNome: string;
    alunos: string[];
    eventos: Evento[];
}

export default function ResponsavelEventosPage() {
    const [eventosPorTurma, setEventosPorTurma] = useState<EventosPorTurma[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [todosEventos, alunos] = await Promise.all([
                getEventos(),
                getAlunosDoResponsavel()
            ]);

            const turmasMap = new Map<number, { nome: string; alunos: string[] }>();
            alunos.forEach(aluno => {
                if (aluno.turma) {
                    const info = turmasMap.get(aluno.turma.id) || {
                        nome: aluno.turma.nome,
                        alunos: []
                    };
                    info.alunos.push(aluno.nome);
                    turmasMap.set(aluno.turma.id, info);
                }
            });

            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);

            const resultado: EventosPorTurma[] = [];
            turmasMap.forEach((info, turmaId) => {
                const eventosDestaTurma = todosEventos
                    .filter(evt => {
                        const eventDate = new Date(evt.data);
                        eventDate.setHours(0, 0, 0, 0);
                        return evt.turmaId === turmaId && eventDate >= hoje && evt.isAtivo;
                    })
                    .sort((a, b) =>
                        new Date(a.data).getTime() - new Date(b.data).getTime()
                    );

                if (eventosDestaTurma.length > 0) {
                    resultado.push({
                        turmaId,
                        turmaNome: info.nome,
                        alunos: info.alunos,
                        eventos: eventosDestaTurma
                    });
                }
            });

            setEventosPorTurma(resultado);
        } catch (error) {
            console.error("Erro ao carregar eventos:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <RouteGuard allowedRoles={['RESPONSAVEL']}>
            <div className="p-4 md:p-8 space-y-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <Calendar className="w-8 h-8 text-blue-600" />
                        Avisos da Turma
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Acompanhe os próximos avisos da turma do seu filho(a).
                    </p>
                </div>

                {isLoading ? (
                    <div className="text-center py-10">Carregando avisos...</div>
                ) : eventosPorTurma.length === 0 ? (
                    <Card>
                        <CardContent className="py-10">
                            <div className="text-center text-muted-foreground">
                                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>Nenhum aviso encontrado para as turmas dos seus filhos.</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {eventosPorTurma.map(({ turmaId, turmaNome, alunos, eventos }) => (
                            <Card key={turmaId}>
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold text-gray-900">
                                        {formatarNomeTurma(turmaNome)}
                                    </CardTitle>
                                    <div className="space-y-0.5">
                                        {alunos.map((aluno, idx) => (
                                            <p key={idx} className="text-xs text-muted-foreground font-medium">
                                                {aluno}
                                            </p>
                                        ))}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <EventList events={eventos} showActions={false} />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </RouteGuard>
    );
}
