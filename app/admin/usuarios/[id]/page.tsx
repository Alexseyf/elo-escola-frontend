"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useUsuariosStore, Usuario } from "@/stores/useUsuariosStore"
import { RouteGuard } from "@/components/auth/RouteGuard"
import { formatarNomeTurma } from "@/stores/useTurmasStore"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, Pencil, ChevronLeft, Users } from "lucide-react"
import { UserFormSheet } from "@/components/admin/UserFormSheet"

export default function UsuarioDetalhesPage() {
    const params = useParams()
    const router = useRouter()
    const id = Number(params.id)

    const [usuario, setUsuario] = useState<Usuario | null>(null)
    const [isInitializing, setIsInitializing] = useState(true)

    const {
        isLoading,
        error,
        fetchUsuarioDetalhes
    } = useUsuariosStore()

    const loadData = useCallback(async () => {
        try {
            if (!isNaN(id)) {
                const data = await fetchUsuarioDetalhes(id);
                setUsuario(data);
            }
        } finally {
            setIsInitializing(false);
        }
    }, [id, fetchUsuarioDetalhes])

    useEffect(() => {
        loadData();
    }, [loadData])

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'bg-red-100 text-red-800';
            case 'PROFESSOR': return 'bg-blue-100 text-blue-800';
            case 'RESPONSAVEL': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <RouteGuard allowedRoles={['ADMIN']}>
            <div className="min-h-screen bg-background p-3 sm:p-6">
                <div className="flex items-center gap-2 mb-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="h-8 w-8"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-xl sm:text-2xl font-bold">Gerenciar Usuários</h1>
                </div>

                {isLoading || isInitializing ? (
                    <Card className="mb-6 w-full">
                        <CardContent className="p-3 sm:p-6">
                            <div className="flex flex-col space-y-4 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                            </div>
                        </CardContent>
                    </Card>
                ) : error ? (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                        {error}
                    </div>
                ) : usuario ? (
                    <Card className="mb-6 w-full">
                        <CardHeader className="p-3 sm:p-6">
                            <CardTitle className="text-lg sm:text-xl">Detalhes do Usuário</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 p-3 sm:p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Nome</p>
                                    <p className="text-base">{usuario.nome}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Email</p>
                                    <p className="text-base">{usuario.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Status</p>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${usuario.isAtivo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {usuario.isAtivo ? 'Ativo' : 'Inativo'}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Perfis</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {(usuario.roles || []).map((role) => (
                                            <span
                                                key={role}
                                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(role)}`}
                                            >
                                                {role}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-gray-500">CPF</p>
                                    <p className="text-base text-gray-600">{usuario.cpf || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">RG</p>
                                    <p className="text-base text-gray-600">{usuario.rg || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Data de Nascimento</p>
                                    <p className="text-base text-gray-600">
                                        {(() => {
                                            if (!usuario.dataNascimento) return '-';
                                            const [year, month, day] = usuario.dataNascimento.split('T')[0].split('-').map(Number);
                                            return new Date(year, month - 1, day).toLocaleDateString('pt-BR');
                                        })()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Telefones</p>
                                    <p className="text-base text-gray-600">
                                        {usuario.telefone && <span>Cel: {usuario.telefone}</span>}
                                        {usuario.telefoneComercial && <span> / Com: {usuario.telefoneComercial}</span>}
                                        {!usuario.telefone && !usuario.telefoneComercial && '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Endereço</p>
                                    <p className="text-base text-gray-600">
                                        {usuario.enderecoLogradouro ? `${usuario.enderecoLogradouro}, ${usuario.enderecoNumero}` : '-'}
                                    </p>
                                </div>

                                {usuario?.roles?.includes('RESPONSAVEL') && usuario.alunos && usuario.alunos.length > 0 && (
                                    <div className="md:col-span-2 pt-4 border-t border-slate-100 mt-2">
                                        <p className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                                            <Users className="w-4 h-4" /> Alunos Vinculados
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {usuario.alunos.map((aluno) => (
                                                <div
                                                    key={aluno.id}
                                                    className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all border border-slate-200 rounded-xl group bg-white overflow-hidden"
                                                    onClick={() => router.push(`/admin/alunos/${aluno.id}`)}
                                                >
                                                    <div className="p-2.5 flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                                                            <User className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex-1 overflow-hidden">
                                                            <p className="font-semibold text-slate-900 truncate text-xs">{aluno.nome}</p>
                                                            <div className="mt-0.5">
                                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 font-normal text-[9px] h-4 py-0 px-1.5">
                                                                    {aluno.turma?.nome ? formatarNomeTurma(aluno.turma.nome) : 'Sem turma'}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            </div>
                        </CardContent>
                        <CardFooter className="bg-gray-50 border-t p-4 flex justify-end">
                            <UserFormSheet
                                usuario={usuario}
                                onSuccess={loadData}
                                trigger={
                                    <Button variant="primary" className="flex items-center gap-2">
                                        <Pencil className="w-4 h-4" />
                                        Editar
                                    </Button>
                                }
                            />
                        </CardFooter>
                    </Card>
                ) : (
                    <div className="p-8 text-center text-gray-500">
                        Usuário não encontrado.
                    </div>
                )}
            </div>
        </RouteGuard>
    )
}
