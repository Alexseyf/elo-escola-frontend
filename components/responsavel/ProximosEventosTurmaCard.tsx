"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getAlunosDoResponsavel } from "@/utils/alunos";
import { getEventos } from "@/utils/eventos";
import { formatarNomeTurma } from "@/stores/useTurmasStore";
import { Evento } from "@/types/evento";
import { Calendar, Clock } from "lucide-react";
import { TipoEvento } from "@/types/cronograma";

interface EventoComTurma {
    turma: { id: number; nome: string };
    alunos: string[];
    eventos: Evento[];
}

const formatarTipoEvento = (tipo: string) => {
    const tipos: Record<string, string> = {
        'REUNIAO': "Reunião",
        'FERIADO': "Feriado",
        'RECESSO': "Recesso",
        'EVENTO_ESCOLAR': "Evento Escolar",
        'ATIVIDADE_PEDAGOGICA': "Atividade Pedagógica",
        'OUTRO': "Outro",
    };
    return tipos[tipo] || tipo.replace('_', ' ');
}

const getCorTipo = (tipo: string) => {
    const cores: Record<string, string> = {
        'REUNIAO': "bg-blue-100 text-blue-800 border-blue-200",
        'FERIADO': "bg-red-100 text-red-800 border-red-200",
        'RECESSO': "bg-yellow-100 text-yellow-800 border-yellow-200",
        'EVENTO_ESCOLAR': "bg-green-100 text-green-800 border-green-200",
        'ATIVIDADE_PEDAGOGICA': "bg-purple-100 text-purple-800 border-purple-200",
        'OUTRO': "bg-gray-100 text-gray-800 border-gray-200",
    };
    return cores[tipo] || "bg-gray-100 text-gray-800 border-gray-200";
}

export function ProximosEventosTurmaCard() {
    const [eventosPorTurma, setEventosPorTurma] = useState<EventoComTurma[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            try {
                const alunos = await getAlunosDoResponsavel();

                const turmasVistas = new Map<number, { nome: string; alunos: string[] }>();
                alunos.forEach(aluno => {
                    if (aluno.turma) {
                        const info = turmasVistas.get(aluno.turma.id) || { nome: aluno.turma.nome, alunos: [] };
                        info.alunos.push(aluno.nome);
                        turmasVistas.set(aluno.turma.id, info);
                    }
                });

                const todosEventos = await getEventos();

                const hoje = new Date();
                hoje.setHours(0, 0, 0, 0);

                const eventosFuturos = todosEventos
                    .filter(evt => {
                        const eventDate = new Date(evt.data);
                        eventDate.setHours(0, 0, 0, 0);
                        return eventDate >= hoje && evt.isAtivo;
                    })
                    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

                const results: EventoComTurma[] = [];
                turmasVistas.forEach((info, turmaId) => {
                    const eventosDestaTurma = eventosFuturos
                        .filter(evt => evt.turmaId === turmaId)
                        .slice(0, 1);

                    if (eventosDestaTurma.length > 0) {
                        results.push({
                            turma: { id: turmaId, nome: info.nome },
                            alunos: info.alunos,
                            eventos: eventosDestaTurma
                        });
                    }
                });

                setEventosPorTurma(results);
            } catch (error) {
                console.error("Erro ao carregar próximos eventos:", error);
            } finally {
                setIsLoading(false);
            }
        }

        loadData();
    }, []);

    const formatarData = (dataString: string) => {
        const data = new Date(dataString);
        return data.toLocaleDateString("pt-BR", {
            weekday: 'short',
            day: "numeric",
            month: "short",
            timeZone: "UTC",
        });
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        Próximo Aviso da Turma
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-32 w-full" />
                </CardContent>
            </Card>
        );
    }

    if (eventosPorTurma.length === 0) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Próximos Eventos da Turma
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {eventosPorTurma.map(({ turma, eventos, alunos }) => (
                    <div key={turma.id} className="space-y-3">
                        <div className="border-b pb-1">
                            <h3 className="font-semibold text-gray-900">
                                Turma: {formatarNomeTurma(turma.nome)}
                            </h3>
                            <p className="text-[10px] text-muted-foreground uppercase font-medium">
                                Aluno(s): {alunos.join(", ")}
                            </p>
                        </div>

                        <div className="space-y-2">
                            {eventos.map((evento) => (
                                <div
                                    key={evento.id}
                                    className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                        <h4 className="font-semibold text-gray-900 text-sm flex-1">
                                            {evento.titulo}
                                        </h4>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border uppercase whitespace-nowrap ${getCorTipo(evento.tipoEvento)}`}>
                                            {formatarTipoEvento(evento.tipoEvento)}
                                        </span>
                                    </div>

                                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                        {evento.descricao}
                                    </p>

                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            <span className="capitalize">{formatarData(evento.data)}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            <span>{evento.horaInicio} - {evento.horaFim}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
