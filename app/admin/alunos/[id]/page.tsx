"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAlunosStore, type AlunoDetalhes } from "@/stores/useAlunosStore"
import { formatarNomeTurma } from "@/stores/useTurmasStore"
import { RouteGuard } from "@/components/auth/RouteGuard"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { User, Calendar, BookOpen, DollarSign, Trash2, Plus, ChevronLeft } from "lucide-react"
import { AlunoFormSheet } from "@/components/admin/AlunoFormSheet"
import { useUsuariosStore } from "@/stores/useUsuariosStore"
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

    const { usuarios, fetchUsuarios } = useUsuariosStore()

    const [newResponsavelId, setNewResponsavelId] = useState('')
    const [isAddingResp, setIsAddingResp] = useState(false)
    const [responsibleToDelete, setResponsibleToDelete] = useState<number | null>(null)
    const [isInitializing, setIsInitializing] = useState(true)

    useEffect(() => {
        async function loadData() {
            try {
                if (!isNaN(id)) {
                    await getAlunoDetalhes(id);
                }
                await fetchUsuarios('RESPONSAVEL');
            } finally {
                setIsInitializing(false);
            }
        }
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])

    const handleAddResponsavel = async () => {
        if (!newResponsavelId) return;
        setIsAddingResp(true);
        const result = await adicionarResponsavelAluno(id, Number(newResponsavelId));
        setIsAddingResp(false);
        if (result.success) {
            toast.success(result.message);
            setNewResponsavelId('');
            // Refresh to get updated responsibles list
            getAlunoDetalhes(id);
        } else {
            toast.error(result.message);
        }
    }

    const confirmRemoveResponsavel = async () => {
        if (!responsibleToDelete) return;

        const result = await removerResponsavelAluno(id, responsibleToDelete);
        if (result.success) {
            toast.success(result.message);
            // Refresh to get updated responsibles list
            getAlunoDetalhes(id);
        } else {
            toast.error(result.message);
        }
        setResponsibleToDelete(null);
    }

    return (
        <RouteGuard allowedRoles={['ADMIN']}>
            <div className="min-h-screen bg-background p-3 sm:p-6">
                <AlertDialog open={!!responsibleToDelete} onOpenChange={() => setResponsibleToDelete(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Remover responsável?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta ação irá remover o vínculo deste responsável com o aluno. O usuário não será excluído do sistema.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmRemoveResponsavel} className="bg-red-600 hover:bg-red-700">
                                Remover
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <div className="flex items-center gap-2 mb-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="h-8 w-8"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-xl sm:text-2xl font-bold">Detalhes do Aluno</h1>
                    <div className="ml-auto">
                        <AlunoFormSheet aluno={currentAluno}
                            onSuccess={() => getAlunoDetalhes(id)}
                            trigger={<Button variant="primary" size="sm">Editar Aluno</Button>}
                        />
                    </div>
                </div>

                {isLoading || isInitializing ? (
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
                                    <p className="text-lg">
                                        {(() => {
                                            if (!currentAluno.dataNasc) return '-';
                                            const [year, month, day] = currentAluno.dataNasc.split('T')[0].split('-').map(Number);
                                            return new Date(year, month - 1, day).toLocaleDateString('pt-BR');
                                        })()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                        <BookOpen className="w-4 h-4" /> Turma
                                    </p>
                                    <p className="text-lg">
                                        {currentAluno.turma ? `${formatarNomeTurma(currentAluno.turma.nome)}${currentAluno.turma.turno ? ` (${currentAluno.turma.turno})` : ''}` : 'Sem turma'}
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
                                                        onClick={() => setResponsibleToDelete(resp.usuarioId)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-sm">Nenhum responsável vinculado.</p>
                                    )}

                                    {/* Add Responsible Form */}
                                    <div className="flex gap-2 items-end max-w-sm bg-gray-50 p-3 rounded-lg">
                                        <div className="grid w-full gap-1.5">
                                            <span className="text-sm font-medium">Adicionar Responsável</span>
                                            <Select
                                                value={newResponsavelId}
                                                onValueChange={setNewResponsavelId}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Selecione um responsável" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {usuarios.map((user) => (
                                                        <SelectItem key={user.id} value={String(user.id)}>
                                                            {user.nome}
                                                        </SelectItem>
                                                    ))}
                                                    {usuarios.length === 0 && (
                                                        <div className="p-2 text-sm text-gray-500 text-center">Nenhum responsável encontrado</div>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button size="sm" onClick={handleAddResponsavel} disabled={isAddingResp}>
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
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
