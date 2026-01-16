"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAlunosStore } from "@/stores/useAlunosStore"
import { RouteGuard } from "@/components/auth/RouteGuard"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label" // Assuming Label component exists or use standard label
import { User, Calendar, BookOpen, DollarSign, Trash2, Plus } from "lucide-react"
import { AlunoFormSheet } from "@/components/admin/AlunoFormSheet"
import { toast } from "sonner"

export default function AlunoDetalhesPage() {
  const params = useParams()
  const router = useRouter()
  const id = Number(params.id)
  
  const { 
    currentAluno, 
    isLoading, 
    error,
    getAlunoDetalhes,
    adicionarResponsavelAluno,
    removerResponsavelAluno
  } = useAlunosStore()

  const [newResponsavelId, setNewResponsavelId] = useState('')
  const [isAddingResp, setIsAddingResp] = useState(false)

  useEffect(() => {
    if (!isNaN(id)) {
        getAlunoDetalhes(id);
    }
  }, [id, getAlunoDetalhes])

  const handleAddResponsavel = async () => {
    if (!newResponsavelId) return;
    setIsAddingResp(true);
    const result = await adicionarResponsavelAluno(id, Number(newResponsavelId));
    setIsAddingResp(false);
    if (result.success) {
        toast.success(result.message);
        setNewResponsavelId('');
        getAlunoDetalhes(id); // Refresh
    } else {
        toast.error(result.message);
    }
  }

  const handleRemoveResponsavel = async (usuarioId: number) => {
    if (!confirm('Remover este responsável?')) return;
    const result = await removerResponsavelAluno(id, usuarioId);
    if (result.success) {
        toast.success(result.message);
        getAlunoDetalhes(id); // Refresh
    } else {
        toast.error(result.message);
    }
  }

  return (
    <RouteGuard allowedRoles={['ADMIN']}>
      <div className="min-h-screen bg-background p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6">
            <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.back()}
                className="w-full sm:w-auto"
            >
                Voltar
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold">Detalhes do Aluno</h1>
            <div className="ml-auto">
               <AlunoFormSheet 
                  aluno={currentAluno as any} // Type assertion if needed due to detailed vs list type diffs
                  onSuccess={() => getAlunoDetalhes(id)} 
                  trigger={<Button variant="primary" size="sm">Editar Aluno</Button>}
                />
            </div>
        </div>

        {isLoading ? (
             <div className="space-y-4 animate-pulse">
                <div className="h-40 bg-gray-100 rounded"></div>
             </div>
        ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                {error}
            </div>
        ) : currentAluno ? (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Informações Pessoais</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <p className="text-sm font-medium text-gray-500">Nome</p>
                            <p className="text-lg font-medium">{currentAluno.nome}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                <Calendar className="w-4 h-4" /> Data de Nascimento
                            </p>
                            <p className="text-lg">{new Date(currentAluno.dataNasc).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                <BookOpen className="w-4 h-4" /> Turma
                            </p>
                            <p className="text-lg">
                                {currentAluno.turma ? `${currentAluno.turma.nome} (${currentAluno.turma.turno})` : 'Sem turma'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                <DollarSign className="w-4 h-4" /> Mensalidade
                            </p>
                            <p className="text-lg">
                                {currentAluno.mensalidade ? 
                                    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentAluno.mensalidade) 
                                    : 'R$ 0,00'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Status</p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${currentAluno.isAtivo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {currentAluno.isAtivo ? 'Ativo' : 'Inativo'}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Responsáveis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Add Responsible Simple Form */}
                            <div className="flex gap-2 items-end max-w-sm mb-6 bg-gray-50 p-3 rounded-lg">
                                <div className="grid w-full gap-1.5">
                                    <span className="text-sm font-medium">Adicionar Responsável (ID Usuário)</span>
                                    <Input 
                                        type="number" 
                                        placeholder="ID do Usuário" 
                                        value={newResponsavelId}
                                        onChange={(e) => setNewResponsavelId(e.target.value)}
                                    />
                                </div>
                                <Button size="sm" onClick={handleAddResponsavel} disabled={isAddingResp}>
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>

                            {/* List Responsibles */}
                            {currentAluno.responsaveis?.length > 0 ? (
                                <div className="divide-y">
                                    {currentAluno.responsaveis.map((resp) => (
                                        <div key={resp.id} className="py-3 flex justify-between items-center">
                                            <div>
                                                <p className="font-medium">{resp.usuario.nome}</p>
                                                <p className="text-sm text-gray-500">{resp.usuario.email}</p>
                                            </div>
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleRemoveResponsavel(resp.usuarioId)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">Nenhum responsável vinculado.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        ) : (
             <div className="p-8 text-center text-gray-500">
                Aluno não encontrado.
            </div>
        )}
      </div>
    </RouteGuard>
  )
}
