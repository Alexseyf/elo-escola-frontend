"use client";

import { useFinancasStore } from "@/stores/useFinancasStore";
import { formatarNomeTurma } from "@/stores/useTurmasStore";
import { Plus, Trash2, Receipt, Calendar, Info } from "lucide-react";
import { ExpenseForm } from "./ExpenseForm";
import { useState } from "react";
import { StandardCard } from "@/components/StandardCard";
import { Button } from "@/components/ui/button";
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Listagem de Pagamentos</h2>
                    <p className="text-sm text-gray-500 font-medium">Registros financeiros para {mes}/{ano}.</p>
                </div>
                {!isFechado && (
                    <Button onClick={() => setIsFormOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700 w-full sm:w-auto justify-center shadow-md">
                        <Plus className="h-4 w-4" />
                        Novo Lançamento
                    </Button>
                )}
            </div>

            <StandardCard className="p-0 overflow-hidden border-none sm:border">
                {/* Mobile View: Card List */}
                <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
                    {isLoading && (!pagamentos || pagamentos.length === 0) ? (
                        <div className="text-center py-20 flex flex-col items-center gap-4">
                            <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
                            <p className="text-gray-400 font-medium italic">Carregando lançamentos...</p>
                        </div>
                    ) : (!pagamentos || pagamentos.length === 0) ? (
                        <div className="text-center py-20 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">
                            <Info className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                            <p className="text-gray-400 font-medium">Nenhum pagamento registrado.</p>
                        </div>
                    ) : (
                        pagamentos.map((p) => (
                            <div key={p.id} className="border border-gray-100 rounded-2xl p-4 space-y-4 bg-white shadow-sm active:scale-[0.98] transition-all">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1.5 min-w-0">
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(p.data).toLocaleDateString('pt-BR')}
                                        </div>
                                        <h3 className="font-bold text-gray-900 leading-tight truncate">{p.descricao}</h3>
                                    </div>
                                    {!isFechado && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-9 w-9 text-rose-500 -mt-1 -mr-1 hover:bg-rose-50 rounded-xl">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="w-[90vw] rounded-2xl max-w-sm">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Excluir?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Deseja remover este registro? Esta ação não pode ser desfeita.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter className="flex flex-row gap-2">
                                                    <AlertDialogCancel className="w-full mt-0 rounded-xl">Voltar</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(p.id)} className="w-full bg-rose-600 hover:bg-rose-700 rounded-xl">
                                                        Excluir
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-3 items-center justify-between pt-3 border-t border-gray-50">
                                    <div className="flex flex-wrap gap-2">
                                        <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider">
                                            {getTipoLabel(p.tipo)}
                                        </span>
                                        {p.turma && (
                                            <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                                                <Receipt className="h-2.5 w-2.5" />
                                                {formatarNomeTurma(p.turma.nome)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-lg font-black text-rose-500 font-mono">
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
                        <thead className="text-[11px] uppercase bg-gray-50/50 font-bold border-y border-gray-100 text-gray-500 tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Data</th>
                                <th className="px-6 py-4">Descrição</th>
                                <th className="px-6 py-4">Tipo</th>
                                <th className="px-6 py-4">Turma / Geral</th>
                                <th className="px-6 py-4">Valor</th>
                                {!isFechado && <th className="px-6 py-4 text-right">Ações</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 bg-white">
                            {isLoading && (!pagamentos || pagamentos.length === 0) ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-gray-400 animate-pulse font-medium">
                                        Carregando lançamentos...
                                    </td>
                                </tr>
                            ) : (!pagamentos || pagamentos.length === 0) ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-gray-400 font-medium">
                                        Nenhum pagamento registrado neste mês.
                                    </td>
                                </tr>
                            ) : (
                                pagamentos.map((p) => (
                                    <tr key={p.id} className="hover:bg-blue-50/20 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-gray-500 font-medium">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(p.data).toLocaleDateString('pt-BR')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900">{p.descricao}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                                {getTipoLabel(p.tipo)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {p.turma ? (
                                                <span className="flex items-center gap-1.5 text-blue-600 font-bold text-xs uppercase tracking-tight">
                                                    <Receipt className="h-3 w-3" />
                                                    {formatarNomeTurma(p.turma.nome)}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 italic text-xs">Geral (Rateado)</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-black text-rose-500 font-mono">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.valor)}
                                        </td>
                                        {!isFechado && (
                                            <td className="px-6 py-4 text-right">
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className="rounded-2xl">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Excluir Lançamento?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Tem certeza que deseja remover este registro? Esta ação não pode ser desfeita.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel className="rounded-xl">Voltar</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(p.id)} className="bg-rose-600 hover:bg-rose-700 rounded-xl">
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
            </StandardCard>

            <ExpenseForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                mes={mes}
                ano={ano}
            />
        </div>
    );
}
