"use client"

import { useEffect, useState } from "react"
import { useTurmasStore } from "@/stores/useTurmasStore"
import { RouteGuard } from "@/components/auth/RouteGuard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { TurmaFormSheet } from "@/components/admin/TurmaFormSheet"

export default function TurmasPage() {
  const { 
    turmas, 
    isLoading, 
    error,
    fetchTurmas,
    fetchTotalAlunosPorTurma,
    turmasComTotal
  } = useTurmasStore();

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTurmas();
    fetchTotalAlunosPorTurma();
  }, [fetchTurmas, fetchTotalAlunosPorTurma]);

  const turmasList = turmas.map(t => {
    const total = turmasComTotal.find(tt => tt.id === t.id)?.totalAlunosAtivos || 0;
    return { ...t, totalAlunosAtivos: total };
  });

  const filteredTurmas = turmasList.filter(t => 
    t.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <RouteGuard allowedRoles={['ADMIN']}>
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold">Gerenciar Turmas</h1>
          <TurmaFormSheet onSuccess={() => { fetchTurmas(); fetchTotalAlunosPorTurma(); }} />
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Listagem de Turmas</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Buscar turma..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
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
                    <div className="rounded-md border overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome da Turma</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ano</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Professores</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alunos Ativos</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredTurmas.length > 0 ? (
                                    filteredTurmas.map((turma) => (
                                        <tr key={turma.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {turma.nome}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {turma.ano}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {turma.professores?.length || 0}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {turma.totalAlunosAtivos}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                <Button 
                                                    variant="primary" 
                                                    size="sm"
                                                    onClick={() => window.location.href = `/admin/turmas/${turma.id}`}
                                                >
                                                    Detalhar
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500 text-sm">
                                            Nenhuma turma encontrada.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </RouteGuard>
  )
}
