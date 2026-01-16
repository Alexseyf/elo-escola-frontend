"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useUsuariosStore, Usuario } from "@/stores/useUsuariosStore"
import { RouteGuard } from "@/components/auth/RouteGuard"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Pencil } from "lucide-react"

export default function UsuarioDetalhesPage() {
  const params = useParams()
  const router = useRouter()
  const id = Number(params.id)
  
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  
  const { 
    isLoading, 
    error,
    fetchUsuarioDetalhes 
  } = useUsuariosStore()

  useEffect(() => {
    async function loadData() {
        if (!isNaN(id)) {
            const data = await fetchUsuarioDetalhes(id);
            setUsuario(data);
        }
    }
    loadData();
  }, [id, fetchUsuarioDetalhes])

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
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6">
            <Button 
                variant="primary" 
                size="sm"
                onClick={() => router.back()}
                className="w-full sm:w-auto"
            >
                Voltar
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold">Gerenciar Usuários</h1>
        </div>

        {isLoading ? (
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
                                {usuario.roles.map((role) => (
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
                            <p className="text-sm font-medium text-gray-500">ID</p>
                            <p className="text-base text-gray-600">#{usuario.id}</p>
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
                            <p className="text-base text-gray-600">{usuario.dataNascimento ? new Date(usuario.dataNascimento).toLocaleDateString('pt-BR') : '-'}</p>
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
                        <div>
                            <p className="text-sm font-medium text-gray-500">Primeiro Acesso</p>
                            <p className="text-base text-gray-600">{usuario.primeiroAcesso ? 'Sim' : 'Não'}</p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-gray-50 border-t p-4 flex justify-end">
                    <Button variant="primary" className="flex items-center gap-2">
                        <Pencil className="w-4 h-4" />
                        Editar
                    </Button>
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
