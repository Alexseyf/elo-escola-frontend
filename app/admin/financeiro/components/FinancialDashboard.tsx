"use client";

import { useFinancasStore } from "@/stores/useFinancasStore";
import { StandardCard } from "@/components/StandardCard";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { ArrowDownRight, ArrowUpRight, Banknote, Users, TrendingUp } from "lucide-react";
import { COLORS as CHART_COLORS } from "@/components/ui/chart";
import { formatarNomeTurma } from "@/stores/useTurmasStore";
import { cn } from "@/lib/utils";

export function FinancialDashboard() {
    const { balanco, isLoading } = useFinancasStore();

    if (isLoading && !balanco) {
        return <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 animate-pulse bg-gray-100 rounded-2xl" />)}
        </div>;
    }

    if (!balanco) return null;

    const totalDespesas = balanco.totalDespesasTurmas + balanco.totalDespesasGeral;
    const saldoGeral = balanco.totalReceitas - totalDespesas;

    const chartData = balanco.turmas.map(t => ({
        name: formatarNomeTurma(t.nome),
        saldo: t.saldo,
        receita: t.receita,
        despesa: t.despesaDireta + t.rateioGeral
    }));

    return (
        <div className="space-y-6 overflow-x-hidden max-w-full pb-8">
            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StandardCard className="border-t-4 border-t-emerald-500 py-5">
                    <div className="flex flex-row items-center justify-between pb-2">
                        <span className="text-sm font-semibold text-gray-500">Receita Total</span>
                        <div className="p-1.5 bg-emerald-50 rounded-lg">
                            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                        </div>
                    </div>
                    <div className="text-2xl font-semibold text-gray-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balanco.totalReceitas)}
                    </div>
                    <p className="text-xs text-gray-400 mt-1 uppercase font-semibold tracking-wider">Mensalidades</p>
                </StandardCard>

                <StandardCard className="border-t-4 border-t-rose-500 py-5">
                    <div className="flex flex-row items-center justify-between pb-2">
                        <span className="text-sm font-semibold text-gray-500">Despesa Total</span>
                        <div className="p-1.5 bg-rose-50 rounded-lg">
                            <ArrowDownRight className="h-4 w-4 text-rose-500" />
                        </div>
                    </div>
                    <div className="text-2xl font-semibold text-gray-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalDespesas)}
                    </div>
                    <p className="text-xs text-gray-400 mt-1 uppercase font-semibold tracking-wider">Custos Globais</p>
                </StandardCard>

                <StandardCard className={cn(
                    "border-t-4 py-5",
                    saldoGeral >= 0 ? 'border-t-blue-500' : 'border-t-amber-500'
                )}>
                    <div className="flex flex-row items-center justify-between pb-2">
                        <span className="text-sm font-semibold text-gray-500">Saldo Final</span>
                        <div className={cn("p-1.5 rounded-lg", saldoGeral >= 0 ? 'bg-blue-50' : 'bg-amber-50')}>
                            <Banknote className={cn("h-4 w-4", saldoGeral >= 0 ? 'text-blue-500' : 'text-amber-500')} />
                        </div>
                    </div>
                    <div className={cn("text-2xl font-semibold", saldoGeral < 0 ? 'text-amber-600' : 'text-gray-900')}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldoGeral)}
                    </div>
                    <p className="text-xs text-gray-400 mt-1 uppercase font-semibold tracking-wider">Lucro Líquido</p>
                </StandardCard>

                <StandardCard className="border-t-4 border-t-indigo-500 py-5">
                    <div className="flex flex-row items-center justify-between pb-2">
                        <span className="text-sm font-semibold text-gray-500">Rateio Geral</span>
                        <div className="p-1.5 bg-indigo-50 rounded-lg">
                            <Users className="h-4 w-4 text-indigo-500" />
                        </div>
                    </div>
                    <div className="text-2xl font-semibold text-gray-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balanco.totalDespesasGeral)}
                    </div>
                    <p className="text-xs text-gray-400 mt-1 uppercase font-semibold tracking-wider">Fixo + Administrativo</p>
                </StandardCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico de Barras: Comparativo Receita vs Despesa */}
                <StandardCard className="overflow-hidden flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 leading-tight">Rentabilidade por Turma</h3>
                            <p className="text-sm text-gray-500">Comparativo de saldo final após rateio de custos.</p>
                        </div>
                    </div>

                    <div className="flex-1 min-h-[300px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" hide />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value}`} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    formatter={(value: number) => [
                                        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value),
                                        "Saldo Final"
                                    ]}
                                />
                                <Bar dataKey="saldo" radius={[6, 6, 0, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Legenda colorida por turmas */}
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6 border-t border-gray-50">
                        {chartData.map((entry, index) => (
                            <div key={entry.name} className="flex items-center gap-2.5">
                                <div
                                    className="w-3 h-3 rounded-full shrink-0"
                                    style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                                />
                                <span className="text-xs text-gray-600 truncate font-medium max-w-full block">
                                    {formatarNomeTurma(entry.name)}: <span className={entry.saldo >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(entry.saldo)}
                                    </span>
                                </span>
                            </div>
                        ))}
                    </div>
                </StandardCard>

                {/* Tabela de Detalhes por Turma */}
                <StandardCard className="p-0 overflow-hidden flex flex-col">
                    <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/30">
                        <h3 className="text-lg font-semibold text-gray-900 leading-tight">Detalhamento por Turma</h3>
                        <p className="text-sm text-gray-500 text-pretty">Performance financeira individual por turma após rateio.</p>
                    </div>

                    <div className="flex-1">
                        {/* Mobile View: Premium Cards */}
                        <div className="md:hidden p-4 space-y-4 bg-gray-50/50">
                            {balanco.turmas.map((t) => (
                                <div
                                    key={t.turmaId}
                                    className={cn(
                                        "p-4 rounded-2xl border border-gray-200 bg-white shadow-sm border-l-4 transition-all active:scale-[0.98]",
                                        t.saldo >= 0 ? 'border-l-emerald-500' : 'border-l-rose-500'
                                    )}
                                >
                                    <div className="mb-4">
                                        <h4 className="font-semibold text-gray-900 text-base">{formatarNomeTurma(t.nome)}</h4>
                                        <div className="flex items-center gap-1.5 mt-1 text-gray-500">
                                            <Users className="w-3.5 h-3.5" />
                                            <span className="text-xs font-medium">{t.quantidadeAlunos} alunos registrados</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-50">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-tight">Receita</span>
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(t.receita)}
                                        </div>
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-tight">Despesa</span>
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(t.despesaDireta + t.rateioGeral)}
                                        </div>
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-tight">Saldo</span>
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(t.saldo)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop View: Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-[11px] uppercase bg-gray-50/50 font-semibold border-y border-gray-100 text-gray-500 tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Turma</th>
                                        <th className="px-6 py-4">Despesa</th>
                                        <th className="px-6 py-4">Receita</th>
                                        <th className="px-6 py-4">Saldo Final</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {balanco.turmas.map((t) => (
                                        <tr key={t.turmaId} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="px-6 py-4 font-semibold text-gray-900">{formatarNomeTurma(t.nome)}</td>
                                            <td className="px-6 py-4 text-rose-600 font-medium font-mono text-xs">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.despesaDireta + t.rateioGeral)}
                                            </td>
                                            <td className="px-6 py-4 text-emerald-600 font-medium font-mono text-xs">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.receita)}
                                            </td>
                                            <td className={cn("px-6 py-4 font-semibold font-mono text-xs", t.saldo >= 0 ? 'text-blue-600' : 'text-rose-600')}>
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.saldo)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </StandardCard>
            </div>
        </div>
    );
}
