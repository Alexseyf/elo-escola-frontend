"use client";

import { useFinancasStore } from "@/stores/useFinancasStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Receipt, Calendar } from "lucide-react";
import { ExpenseForm } from "./ExpenseForm";
import { useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";

interface ExpenseManagementProps {
    mes: number;
    ano: number;
    isFechado: boolean;
}

export function ExpenseManagement({ mes, ano, isFechado }: ExpenseManagementProps) {
    const { pagamentos, deletePagamento, fetchPagamentos, fetchBalanco, isLoading } = useFinancasStore();
    const [isFormOpen, setIsFormOpen] = useState(false);

    const handleDelete = async (id: number) => {
        const success = await deletePagamento(id);
        if (success) {
            fetchPagamentos(mes, ano);
            fetchBalanco(mes, ano);
        }
    };

    const getTipoLabel = (tipo: string) => {
        const labels: Record<string, string> = {
            'SALARIO': 'Salário',
            'EXTRA': 'Extra',
            'VALE_TRANSPORTE': 'Vale Transporte',
            'ALUGUEL': 'Aluguel',
            'AGUA': 'Água',
            'LUZ': 'Luz',
            'INTERNET': 'Internet',
            'MANUTENCAO_REFORMA': 'Manutenção/Reforma',
            'OUTRO': 'Outro'
        };
        return labels[tipo] || tipo;
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold">Listagem de Pagamentos</h2>
                    <p className="text-sm text-muted-foreground">Todos os gastos registrados para o mês {mes}/{ano}.</p>
                </div>
                {!isFechado && (
                    <Button onClick={() => setIsFormOpen(true)} className="gap-2 bg-slate-900">
                        <Plus className="h-4 w-4" />
                        Novo Lançamento
                    </Button>
                )}
            </div>

            <Card>
                <CardContent className="p-0">
                    {/* Mobile View: Card List */}
                    <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
                        {isLoading && pagamentos.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground animate-pulse">
                                Carregando...
                            </div>
                        ) : pagamentos.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">
                                Nenhum pagamento registrado.
                            </div>
                        ) : (
                            pagamentos.map((p) => (
                                <div key={p.id} className="border rounded-xl p-4 space-y-3 bg-card shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(p.data).toLocaleDateString('pt-BR')}
                                            </div>
                                            <h3 className="font-semibold text-sm leading-tight text-slate-900">{p.descricao}</h3>
                                        </div>
                                        {!isFechado && (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 -mt-1 -mr-1">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="w-[90vw] rounded-2xl max-w-sm">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Excluir?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Deseja remover este registro?
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter className="flex flex-row gap-2">
                                                        <AlertDialogCancel className="w-full mt-0">Voltar</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(p.id)} className="w-full bg-rose-600">
                                                            Excluir
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-2 items-center justify-between pt-1 border-t border-slate-50 mt-2">
                                        <div className="flex flex-wrap gap-2">
                                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase">
                                                {getTipoLabel(p.tipo)}
                                            </span>
                                            {p.turma && (
                                                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase flex items-center gap-1">
                                                    <Receipt className="h-2.5 w-2.5" />
                                                    {p.turma.nome}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-base font-bold text-rose-600">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.valor)}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Desktop View: Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-muted/50 font-bold border-y text-slate-600">
                                <tr>
                                    <th className="px-6 py-4">Data</th>
                                    <th className="px-6 py-4">Descrição</th>
                                    <th className="px-6 py-4">Tipo</th>
                                    <th className="px-6 py-4">Turma / Geral</th>
                                    <th className="px-6 py-4">Valor</th>
                                    {!isFechado && <th className="px-6 py-4 text-right">Ações</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {isLoading && pagamentos.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground animate-pulse">
                                            Carregando lançamentos...
                                        </td>
                                    </tr>
                                ) : pagamentos.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                                            Nenhum pagamento registrado neste mês.
                                        </td>
                                    </tr>
                                ) : (
                                    pagamentos.map((p) => (
                                        <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                                    {new Date(p.data).toLocaleDateString('pt-BR')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-900">{p.descricao}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                                                    {getTipoLabel(p.tipo)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {p.turma ? (
                                                    <span className="flex items-center gap-1.5 text-blue-600 font-medium">
                                                        <Receipt className="h-3 w-3" />
                                                        {p.turma.nome}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground italic">Geral (Rateado)</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-rose-600">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.valor)}
                                            </td>
                                            {!isFechado && (
                                                <td className="px-6 py-4 text-right">
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="text-rose-500 hover:text-rose-700 hover:bg-rose-50">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Excluir Lançamento?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Tem certeza que deseja remover este registro? Esta ação não pode ser desfeita.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Voltar</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDelete(p.id)} className="bg-rose-600 hover:bg-rose-700">
                                                                    Excluir
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <ExpenseForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                mes={mes}
                ano={ano}
            />
        </div>
    );
}
