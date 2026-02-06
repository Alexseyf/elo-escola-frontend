'use client';

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Loader2, X, Info } from "lucide-react"
import config from "../../../config"

interface Log {
    id: number;
    descricao: string;
    complemento: string;
    createdAt: string;
    usuarioId: number;
    usuario: {
        nome: string;
        email: string;
    }
}

interface Meta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

import { useTenantStore } from "@/stores/useTenantStore";
import { useAuthStore } from "@/stores/useAuthStore";


export default function LogsPage() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);
    const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 20, totalPages: 1 });
    const [selectedAction, setSelectedAction] = useState<string>("all");
    const [selectedLog, setSelectedLog] = useState<Log | null>(null);
    const tenantSlug = useTenantStore((state) => state.tenantSlug);
    const token = useAuthStore((state) => state.token);

    const fetchLogs = async (page = 1, actionFilter = selectedAction) => {
        setLoading(true);
        try {
            if (!token) {
                console.error('Token não encontrado no AuthStore');
                setLoading(false);
                return;
            }
            const headers: HeadersInit = {
                'Authorization': `Bearer ${token}`
            };

            if (tenantSlug) {
                headers['x-tenant-id'] = tenantSlug;
            }

            let url = `${config.API_URL}/api/v1/logs?page=${page}&limit=20`;
            if (actionFilter && actionFilter !== "all") {
                url += `&descricao=${encodeURIComponent(actionFilter)}`;
            }

            const response = await fetch(url, {
                headers,
                cache: 'no-store'
            });

            if (!response.ok) {
                const errorBody = await response.text();
                console.error('Erro na resposta do backend:', {
                    status: response.status,
                    statusText: response.statusText,
                    body: errorBody
                });
                throw new Error(`Falha ao buscar logs: ${response.status} ${errorBody}`);
            }

            const data = await response.json();
            setLogs(data.data);
            setMeta(data.meta);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (tenantSlug) {
            fetchLogs(1, selectedAction);
        }
    }, [tenantSlug, selectedAction]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= meta.totalPages) {
            fetchLogs(newPage, selectedAction);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <PageHeader
                title="Logs do Sistema"
                subtitle="Histórico de ações e alterações importantes no sistema"
                backHref="/admin/dashboard"
            />

            <div className="flex justify-between items-center">
                <div className="w-72">
                    <Select
                        value={selectedAction}
                        onValueChange={(value) => {
                            setSelectedAction(value);
                            fetchLogs(1, value);
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Filtrar por ação" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas as ações</SelectItem>
                            <SelectItem value="Login Realizado">Login Realizado</SelectItem>
                            <SelectItem value="Pagamento Registrado">Pagamento Registrado</SelectItem>
                            <SelectItem value="Pagamento Removido">Pagamento Removido</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {selectedAction !== "all" && (
                    <Button
                        variant="ghost"
                        onClick={() => {
                            setSelectedAction("all");
                            fetchLogs(1, "all");
                        }}
                        className="text-gray-500"
                    >
                        Limpar Filtro <X className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Histórico de Atividades</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                    ) : (
                        <>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="hidden md:table-cell">Data/Hora</TableHead>
                                            <TableHead>Usuário</TableHead>
                                            <TableHead>Ação</TableHead>
                                            <TableHead className="hidden md:table-cell">Detalhes</TableHead>
                                            <TableHead className="w-[50px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {logs.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center h-24">
                                                    Nenhum registro encontrado.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            logs.map((log) => (
                                                <TableRow key={log.id}>
                                                    <TableCell className="whitespace-nowrap hidden md:table-cell">
                                                        {new Date(log.createdAt).toLocaleString('pt-BR')}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-sm md:text-base">{log.usuario.nome}</span>
                                                            <span className="text-xs text-gray-500 hidden md:inline">{log.usuario.email}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-medium text-sm md:text-base">
                                                        {log.descricao}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-gray-600 hidden md:table-cell">
                                                        {log.complemento}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => setSelectedLog(log)}
                                                        >
                                                            <Info className="h-4 w-4 text-blue-600" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {meta.totalPages > 1 && (
                                <div className="flex items-center justify-end space-x-2 py-4">
                                    <div className="text-sm text-gray-500">
                                        Página {meta.page} de {meta.totalPages}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(meta.page - 1)}
                                        disabled={meta.page === 1}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(meta.page + 1)}
                                        disabled={meta.page === meta.totalPages}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Detalhes do Log</DialogTitle>
                        <DialogDescription>
                            Informações completas sobre o registro selecionado.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedLog && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-3 gap-4">
                                <span className="font-medium text-gray-500 col-span-1">Data/Hora:</span>
                                <span className="col-span-2">{new Date(selectedLog.createdAt).toLocaleString('pt-BR')}</span>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <span className="font-medium text-gray-500 col-span-1">Usuário:</span>
                                <div className="col-span-2 flex flex-col">
                                    <span>{selectedLog.usuario.nome}</span>
                                    <span className="text-xs text-gray-400">{selectedLog.usuario.email}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <span className="font-medium text-gray-500 col-span-1">Ação:</span>
                                <span className="col-span-2 font-medium">{selectedLog.descricao}</span>
                            </div>

                            <div className="space-y-2">
                                <span className="font-medium text-gray-500 block">Detalhes Adicionais:</span>
                                <div className="bg-gray-50 p-3 rounded-md border text-sm text-gray-700 whitespace-pre-wrap">
                                    {selectedLog.complemento}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
