
"use client";

import { useFinancasStore } from "@/stores/useFinancasStore";
import { StandardCard } from "@/components/StandardCard";
import { formatarNomeTurma } from "@/stores/useTurmasStore";
import { cn } from "@/lib/utils";
import { generateClosingPDF } from "@/lib/utils/generateClosingPDF";
import { Button } from "@/components/ui/button";
import { Download, FileText, TrendingDown, TrendingUp, Users } from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

export function ClosingReport() {
    const { balanco } = useFinancasStore();

    if (!balanco) return null;

    const handleDownload = () => {
        generateClosingPDF(balanco);
    };

    const totalDespesas = (balanco.totalDespesasTurmas || 0) + (balanco.totalDespesasGeral || 0);
    const saldoGeral = (balanco.totalReceitas || 0) - totalDespesas;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-16">
            {/* Header com Ação */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-gray-500" />
                        Relatório de Fechamento
                    </h2>
                    <p className="text-sm text-gray-500">
                        Referência: {balanco.mes.toString().padStart(2, '0')}/{balanco.ano} • Status: Fechado
                    </p>
                </div>
                <Button onClick={handleDownload} variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Baixar PDF
                </Button>
            </div>

            {/* 1. Resumo Executivo */}
            <section className="space-y-3">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">1. Resumo Executivo</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StandardCard className="p-4 border-l-4 border-l-emerald-500">
                        <p className="text-sm text-gray-500">Receita Total</p>
                        <p className="text-xl font-bold text-gray-900">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balanco.totalReceitas)}
                        </p>
                    </StandardCard>
                    <StandardCard className="p-4 border-l-4 border-l-rose-500">
                        <p className="text-sm text-gray-500">Despesas Totais</p>
                        <p className="text-xl font-bold text-gray-900">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalDespesas)}
                        </p>
                    </StandardCard>
                    <StandardCard className="p-4 border-l-4 border-l-indigo-500">
                        <p className="text-sm text-gray-500">Rateio Geral</p>
                        <p className="text-xl font-bold text-gray-900">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balanco.totalDespesasGeral)}
                        </p>
                    </StandardCard>
                    <StandardCard className={cn(
                        "p-4 border-l-4",
                        saldoGeral >= 0 ? "border-l-blue-500 bg-blue-50/20" : "border-l-amber-500 bg-amber-50/20"
                    )}>
                        <p className="text-sm text-gray-500">Saldo Líquido</p>
                        <p className={cn("text-xl font-bold", saldoGeral >= 0 ? "text-blue-700" : "text-amber-700")}>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldoGeral)}
                        </p>
                    </StandardCard>
                </div>
            </section>

            {/* 2. Despesas Gerais */}
            <section className="space-y-3">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">2. Despesas Gerais Detalhadas</h3>
                <StandardCard className="overflow-hidden p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-3 w-[120px]">Data</th>
                                    <th className="px-6 py-3">Descrição</th>
                                    <th className="px-6 py-3 w-[150px]">Categoria</th>
                                    <th className="px-6 py-3 text-right w-[150px]">Valor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-gray-700">
                                {balanco.pagamentosGerais && balanco.pagamentosGerais.length > 0 ? (
                                    balanco.pagamentosGerais.map((pg, index) => (
                                        <tr key={`${pg.id}-${index}`} className="hover:bg-gray-50/50">
                                            <td className="px-6 py-3 text-gray-500 font-mono text-xs">
                                                {new Date(pg.data).toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="px-6 py-3 font-medium">{pg.descricao}</td>
                                            <td className="px-6 py-3">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                    {pg.tipo.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-right font-mono font-medium">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pg.valor)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-400 italic">
                                            Nenhuma despesa geral registrada neste mês.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </StandardCard>
            </section>

            {/* 3. Detalhamento por Turma */}
            <section className="space-y-3">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">3. Detalhamento por Turma</h3>
                <div className="space-y-4">
                    <Accordion type="multiple" className="space-y-4">
                        {balanco.turmas.map((turma) => (
                            <AccordionItem key={turma.turmaId} value={turma.turmaId.toString()} className="border border-gray-200 rounded-lg bg-white px-4 shadow-sm">
                                <AccordionTrigger className="hover:no-underline py-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full pr-4 gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "p-2 rounded-lg",
                                                turma.saldo >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                            )}>
                                                <Users className="h-5 w-5" />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-semibold text-gray-900">{formatarNomeTurma(turma.nome)}</p>
                                                <p className="text-xs text-gray-500 font-normal">
                                                    {turma.detalhesDespesas?.length || 0} lançamentos • {turma.quantidadeAlunos} alunos
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 text-sm">
                                            <div className="text-right hidden sm:block">
                                                <p className="text-xs text-gray-400 uppercase font-semibold">Receita</p>
                                                <p className="text-emerald-600 font-mono font-medium">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(turma.receita)}
                                                </p>
                                            </div>
                                            <div className="w-px h-8 bg-gray-100 hidden sm:block" />
                                            <div className="text-right hidden sm:block">
                                                <p className="text-xs text-gray-400 uppercase font-semibold">Despesas</p>
                                                <p className="text-rose-600 font-mono font-medium">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(turma.despesaDireta)}
                                                </p>
                                            </div>
                                            <div className="w-px h-8 bg-gray-100 hidden sm:block" />
                                            <div className="text-right bg-gray-50 px-3 py-1 rounded-md">
                                                <p className="text-xs text-gray-400 uppercase font-semibold">Resultado</p>
                                                <p className={cn("font-mono font-bold", turma.saldo >= 0 ? "text-emerald-700" : "text-rose-700")}>
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(turma.saldo)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pb-4 pt-1">
                                    <Separator className="my-3" />

                                    {/* Mini Dashboard da Turma */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                        <div className="p-3 bg-gray-50 rounded border border-gray-100">
                                            <span className="text-xs text-gray-500 block">Mensalidades</span>
                                            <span className="font-medium text-emerald-600">+ {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(turma.receita)}</span>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded border border-gray-100">
                                            <span className="text-xs text-gray-500 block">Despesas Diretas</span>
                                            <span className="font-medium text-rose-600">- {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(turma.despesaDireta)}</span>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded border border-gray-100">
                                            <span className="text-xs text-gray-500 block">Rateio Custos Fixo</span>
                                            <span className="font-medium text-orange-600">- {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(turma.rateioGeral)}</span>
                                        </div>
                                        <div className="p-3 bg-gray-100 rounded border border-gray-200">
                                            <span className="text-xs text-gray-600 block font-bold">Saldo Final</span>
                                            <span className={cn("font-bold", turma.saldo >= 0 ? "text-emerald-700" : "text-rose-700")}>
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(turma.saldo)}
                                            </span>
                                        </div>
                                    </div>

                                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                                        <TrendingDown className="h-3 w-3" />
                                        Despesas desta turma
                                    </h4>

                                    {turma.detalhesDespesas && turma.detalhesDespesas.length > 0 ? (
                                        <div className="border border-gray-100 rounded-md overflow-hidden">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-gray-50 text-gray-500 font-semibold">
                                                    <tr>
                                                        <th className="px-4 py-2 font-normal text-xs uppercase">Data</th>
                                                        <th className="px-4 py-2 font-normal text-xs uppercase">Descrição</th>
                                                        <th className="px-4 py-2 font-normal text-xs uppercase text-right">Valor</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {turma.detalhesDespesas.map((d, idx) => (
                                                        <tr key={idx} className="hover:bg-gray-50/50">
                                                            <td className="px-4 py-2 text-gray-500 font-mono text-xs w-[100px]">
                                                                {new Date(d.data).toLocaleDateString('pt-BR')}
                                                            </td>
                                                            <td className="px-4 py-2 text-gray-700">
                                                                {d.descricao}
                                                            </td>
                                                            <td className="px-4 py-2 text-right font-mono font-medium text-rose-600 w-[120px]">
                                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(d.valor)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-gray-50 rounded-md border border-dashed border-gray-200 text-center text-sm text-gray-400">
                                            Nenhuma despesa direta lançada para esta turma.
                                        </div>
                                    )}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </section>
        </div>
    );
}
