"use client"

import { useState, useEffect } from "react"
import { useUsuariosStore, Usuario } from "@/stores/useUsuariosStore"
import { RouteGuard } from "@/components/auth/RouteGuard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ChevronLeft, ChevronRight, User, Shield, GraduationCap, Users, Plus } from "lucide-react"
import { UserFormSheet } from "@/components/admin/UserFormSheet"

const ITEMS_PER_PAGE = 10;

type TabType = 'todos' | 'ADMIN' | 'PROFESSOR' | 'RESPONSAVEL';

export default function UsuariosPage() {
  const { 
    usuarios, 
    usuariosPorRole, 
    isLoading, 
    error,
    fetchUsuarios 
  } = useUsuariosStore();

  const [activeTab, setActiveTab] = useState<TabType>('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  const getFilteredUsers = () => {
    let list: Usuario[] = [];
    
    if (activeTab === 'todos') {
      list = usuarios;
    } else {
      list = usuariosPorRole[activeTab];
    }

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      list = list.filter(u => 
        u.nome.toLowerCase().includes(lowerTerm) || 
        u.email.toLowerCase().includes(lowerTerm)
      );
    }

    return list;
  };

  const filteredUsers = getFilteredUsers();
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'PROFESSOR': return 'bg-blue-100 text-blue-800';
      case 'RESPONSAVEL': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs: { id: TabType, label: string, icon: React.ReactNode }[] = [
    { id: 'todos', label: 'Todos', icon: <Users className="w-4 h-4" /> },
    { id: 'ADMIN', label: 'Administradores', icon: <Shield className="w-4 h-4" /> },
    { id: 'PROFESSOR', label: 'Professores', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'RESPONSAVEL', label: 'Responsáveis', icon: <User className="w-4 h-4" /> },
  ];

  return (
    <RouteGuard allowedRoles={['ADMIN']}>
      <div className="p-6 space-y-6">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold">Gerenciar Usuários</h1>
          <UserFormSheet onSuccess={() => fetchUsuarios()} />
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Listagem de Usuários</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2 mb-6 border-b pb-4">
                    {tabs.map((tab) => (
                        <Button
                            key={tab.id}
                            variant={activeTab === tab.id ? 'primary' : 'secondary'}
                            onClick={() => setActiveTab(tab.id)}
                            className="flex items-center gap-2"
                        >
                            {tab.icon}
                            {tab.label}
                        </Button>
                    ))}
                </div>

                <div className="flex items-center gap-2 mb-6">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Buscar por nome ou email..."
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
                    <div className="rounded-md border">
                        {/* Mobile View */}
                        <div className="block md:hidden divide-y divide-gray-200">
                             {paginatedUsers.length > 0 ? (
                                paginatedUsers.map((usuario) => (
                                    <div key={usuario.id} className="relative p-4 border rounded-lg bg-white shadow-sm">
                                        <div className="flex flex-col gap-1 pr-8">
                                            <span className="font-medium text-gray-900">{usuario.nome}</span>
                                            <span className="text-sm text-gray-500">{usuario.email}</span>
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="icon-sm"
                                            className="absolute top-4 right-4 text-gray-500 hover:text-primary"
                                            onClick={() => window.location.href = `/admin/usuarios/${usuario.id}`}
                                        >
                                            <Plus className="h-5 w-5" />
                                        </Button>
                                    </div>
                                ))
                             ) : (
                                <div className="p-8 text-center text-gray-500 text-sm">
                                    Nenhum usuário encontrado.
                                </div>
                             )}
                        </div>

                        {/* Desktop View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perfil</th>
                                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedUsers.length > 0 ? (
                                        paginatedUsers.map((usuario) => (
                                            <tr key={usuario.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {usuario.nome}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {usuario.email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <div className="flex flex-wrap gap-1">
                                                        {usuario.roles.map((role) => (
                                                            <span
                                                                key={role}
                                                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(role)}`}
                                                            >
                                                                {role}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${usuario.isAtivo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                        {usuario.isAtivo ? 'Ativo' : 'Inativo'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                     <Button 
                                                        variant="primary" 
                                                        size="sm"
                                                        onClick={() => window.location.href = `/admin/usuarios/${usuario.id}`}
                                                    >
                                                        Detalhar
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500 text-sm">
                                                Nenhum usuário encontrado.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {!isLoading && totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-gray-500">
                            Página {currentPage} de {totalPages} ({filteredUsers.length} total)
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="primary"
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
