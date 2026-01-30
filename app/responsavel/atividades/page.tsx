"use client";

import { useState, useEffect } from "react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAlunosDoResponsavel } from "@/utils/alunos";
import { Aluno } from "@/stores/useAlunosStore";
import { useAtividadesStore } from "@/stores/useAtividadesStore";
import { useTurmasStore, formatarNomeTurma } from "@/stores/useTurmasStore";
import { Atividade } from "@/types/atividades";
import { AtividadeCard } from "@/components/responsavel/AtividadeCard";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

export default function ResponsavelAtividadesPage() {
    return (
        <RouteGuard allowedRoles={["RESPONSAVEL"]}>
            <AtividadesContent />
        </RouteGuard>
    );
}

function AtividadesContent() {
    const [alunos, setAlunos] = useState<Aluno[]>([]);
    const [selectedAlunoId, setSelectedAlunoId] = useState<number | null>(null);
    const [atividades, setAtividades] = useState<Atividade[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingAtividades, setIsLoadingAtividades] = useState(false);

    // Pagination State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);
    const limit = 5;

    const fetchAtividadesPaginadas = useAtividadesStore(
        (state) => state.fetchAtividadesPaginadasPorTurma
    );

    // Carregar Alunos (Filhos)
    useEffect(() => {
        async function loadAlunos() {
            setIsLoading(true);
            const data = await getAlunosDoResponsavel();
            // Filtrar Turno Inverso se necessário (conforme padrão do projeto)
            const filtered = data.filter(aluno =>
                aluno.turma?.nome.toUpperCase().replace(/\s/g, '') !== 'TURNOINVERSO'
            );
            setAlunos(filtered);

            if (filtered.length === 1) {
                setSelectedAlunoId(filtered[0].id);
            }
            setIsLoading(false);
        }
        loadAlunos();
    }, []);

    // Carregar Atividades quando seleciona aluno ou muda página
    useEffect(() => {
        if (!selectedAlunoId) {
            setAtividades([]);
            return;
        }

        async function loadAtividades() {
            const aluno = alunos.find(a => a.id === selectedAlunoId);
            if (!aluno?.turma?.id) return;

            setIsLoadingAtividades(true);
            const result = await fetchAtividadesPaginadas(aluno.turma.id, page, limit);

            if (result) {
                setAtividades(result.atividades);
                setTotalPages(result.totalPages);
                setTotalRecords(result.total);
            } else {
                setAtividades([]);
                setTotalPages(0);
                setTotalRecords(0);
            }
            setIsLoadingAtividades(false);
        }

        loadAtividades();
    }, [selectedAlunoId, page, fetchAtividadesPaginadas, alunos]);

    const handleSelectAluno = (id: string) => {
        setSelectedAlunoId(Number(id));
        setPage(1); // Reset page when changing student
    };

    if (isLoading) {
        return (
            <div className="container mx-auto p-4 md:p-8 max-w-5xl space-y-6">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    const selectedAluno = alunos.find(a => a.id === selectedAlunoId);

    return (
        <div className="min-h-screen bg-gray-50/50 pb-12">
            <PageHeader
                title="Atividades Pedagógicas"
                subtitle="Confira o que foi trabalhado em sala de aula"
            />

            <div className="max-w-5xl mx-auto px-4 md:px-8 space-y-6 pt-6">
                {/* Seleção de Aluno (se múltiplos) */}
                {alunos.length > 1 && (
                    <Card className="border-gray-200 shadow-sm">
                        <CardHeader className="pb-3 text-center md:text-left">
                            <CardTitle className="text-lg font-bold flex items-center gap-2 justify-center md:justify-start">
                                <BookOpen className="h-5 w-5 text-blue-600" />
                                Selecione o Aluno
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Select
                                value={selectedAlunoId?.toString() || ""}
                                onValueChange={handleSelectAluno}
                            >
                                <SelectTrigger className="w-full md:max-w-xs">
                                    <SelectValue placeholder="Selecione um filho" />
                                </SelectTrigger>
                                <SelectContent>
                                    {alunos.map((aluno) => (
                                        <SelectItem key={aluno.id} value={aluno.id.toString()}>
                                            {aluno.nome}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>
                )}

                {/* Listagem de Atividades */}
                {selectedAlunoId && (
                    <div className="space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    Histórico de Atividades
                                </h2>
                                {selectedAluno?.turma && (
                                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100 font-medium px-2 py-0 mt-1 uppercase text-[10px]">
                                        Turma: {formatarNomeTurma(selectedAluno.turma.nome)}
                                    </Badge>
                                )}
                            </div>
                            {totalRecords > 0 && (
                                <span className="text-xs text-muted-foreground bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
                                    Total de {totalRecords} registros
                                </span>
                            )}
                        </div>

                        {isLoadingAtividades ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-28 w-full rounded-xl" />
                                ))}
                            </div>
                        ) : atividades.length === 0 ? (
                            <Card className="border-dashed border-2 py-12">
                                <CardContent className="flex flex-col items-center justify-center space-y-3">
                                    <div className="bg-gray-50 p-4 rounded-full">
                                        <Search className="h-10 w-10 text-gray-300" />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-semibold text-gray-900">Nenhuma atividade encontrada</p>
                                        <p className="text-sm text-muted-foreground">O professor ainda não registrou atividades para esta turma.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 gap-4">
                                    {atividades.map((atividade) => (
                                        <AtividadeCard key={atividade.id} atividade={atividade} />
                                    ))}
                                </div>

                                {/* Paginação */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-2 pt-6">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="gap-1 border-gray-200"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            Anterior
                                        </Button>

                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                                <Button
                                                    key={p}
                                                    variant={page === p ? "default" : "ghost"}
                                                    size="sm"
                                                    onClick={() => setPage(p)}
                                                    className={`w-9 h-9 p-0 ${page === p ? 'bg-blue-600 hover:bg-blue-700' : 'text-muted-foreground'}`}
                                                >
                                                    {p}
                                                </Button>
                                            ))}
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages}
                                            className="gap-1 border-gray-200"
                                        >
                                            Próximo
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {!selectedAlunoId && !isLoading && alunos.length > 1 && (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
                        <div className="bg-blue-50 p-4 rounded-full mb-4">
                            <BookOpen className="h-8 w-8 text-blue-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Acompanhe as Atividades</h3>
                        <p className="text-sm text-muted-foreground max-w-sm px-4">
                            Selecione um de seus filhos acima para visualizar o histórico de atividades pedagógicas desenvolvidas na escola.
                        </p>
                    </div>
                )}

                {alunos.length === 0 && !isLoading && (
                    <Card className="border-red-100 bg-red-50/30">
                        <CardContent className="pt-6">
                            <p className="text-center text-sm text-red-600 font-medium">
                                Nenhum aluno vinculado ao seu perfil foi encontrado. Por favor, entre em contato com a secretaria.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
