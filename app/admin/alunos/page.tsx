"use client"

import { useState, useEffect } from "react"
import { useAlunosStore } from "@/stores/useAlunosStore"
import { useTurmasStore, formatarNomeTurma } from "@/stores/useTurmasStore"
import { RouteGuard } from "@/components/auth/RouteGuard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ChevronLeft, ChevronRight, Edit } from "lucide-react"
import { AlunoFormSheet } from "@/components/admin/AlunoFormSheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const ITEMS_PER_PAGE = 10;

export default function AlunosPage() {
  const { 
    alunos, 
    pagination, 
    isLoading, 
    error,
    fetchAlunos 
  } = useAlunosStore();

  const { turmas, fetchTurmas } = useTurmasStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTurma, setSelectedTurma] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchTurmas();
    fetchAlunos({ page: 1, limit: ITEMS_PER_PAGE });
  }, [fetchAlunos, fetchTurmas]);

  useEffect(() => {
    const turmaId = selectedTurma && selectedTurma !== 'all' ? Number(selectedTurma) : undefined;
    
    fetchAlunos({ 
        page: currentPage, 
        limit: ITEMS_PER_PAGE,
        turmaId: turmaId 
    });
  }, [fetchAlunos, currentPage, selectedTurma]);

  const filteredAlunos = alunos.filter(aluno => 
    aluno.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = pagination?.totalPages || 1;

  return (
    <RouteGuard allowedRoles={['ADMIN']}>
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold">Gerenciar Alunos</h1>
          <AlunoFormSheet onSuccess={() => fetchAlunos({ page: currentPage, limit: ITEMS_PER_PAGE })} />
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Listagem de Alunos</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Buscar por nome"
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="w-full sm:w-[200px]">
                        <Select value={selectedTurma} onValueChange={setSelectedTurma}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filtrar por Turma" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas as Turmas</SelectItem>
                                {turmas.map(turma => (
                                    <SelectItem key={turma.id} value={String(turma.id)}>{turma.nome}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                        ))}
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                        {error}
                    </div>
                ) : (
                    <div className="rounded-md border">
                        {/* Mobile View */}
                        <div className="block md:hidden divide-y divide-gray-200">
                             {filteredAlunos.length > 0 ? (
                                filteredAlunos.map((aluno) => (
                                    <div key={aluno.id} className="relative p-4 border rounded-lg bg-white shadow-sm">
                                        <div className="flex flex-col gap-1 pr-8">
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium text-gray-900">{aluno.nome}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${aluno.isAtivo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {aluno.isAtivo ? 'Ativo' : 'Inativo'}
                                                </span>
                                            </div>
                                            <span className="text-sm text-gray-500">{aluno.email}</span>
                                            {aluno.turma && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full w-fit">{formatarNomeTurma(aluno.turma.nome)}</span>}
                                        </div>
                                        <div className="flex justify-end gap-2 mt-2">
                                            <AlunoFormSheet 
                                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                aluno={aluno as any} 
                                                onSuccess={() => fetchAlunos({ page: currentPage, limit: ITEMS_PER_PAGE })}
                                                trigger={
                                                    <Button variant="outline" size="sm">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                }
                                            />
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                onClick={() => window.location.href = `/admin/alunos/${aluno.id}`}
                                            >
                                                <Search className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                             ) : (
                                <div className="p-8 text-center text-gray-500 text-sm">
                                    Nenhum aluno encontrado.
                                </div>
                             )}
                        </div>

                        {/* Desktop View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Turma</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredAlunos.length > 0 ? (
                                        filteredAlunos.map((aluno) => (
                                            <tr key={aluno.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {aluno.nome}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${aluno.isAtivo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                        {aluno.isAtivo ? 'Ativo' : 'Inativo'}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {aluno.turma ? (
                                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            {formatarNomeTurma(aluno.turma.nome)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                    <div className="flex justify-end gap-2">
                                                        <AlunoFormSheet 
                                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                            aluno={aluno as any} 
                                                            onSuccess={() => fetchAlunos({ page: currentPage, limit: ITEMS_PER_PAGE })}
                                                            trigger={
                                                                <Button 
                                                                    variant="outline" 
                                                                    size="sm"
                                                                >
                                                                    Editar
                                                                </Button>
                                                            }
                                                        />
                                                        <Button 
                                                            variant="default" // Changed from primary as primary is probably not defined in shadcn mostly default
                                                            size="sm"
                                                            onClick={() => window.location.href = `/admin/alunos/${aluno.id}`}
                                                        >
                                                            Detalhar
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500 text-sm">
                                                Nenhum aluno encontrado.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {!isLoading && (
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-gray-500">
                            Página {currentPage} de {totalPages}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </RouteGuard>
  )
}
