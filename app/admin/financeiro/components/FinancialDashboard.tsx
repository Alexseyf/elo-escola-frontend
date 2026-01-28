"use client";

import { useFinancasStore } from "@/stores/useFinancasStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie
} from "recharts";
import { ArrowDownRight, ArrowUpRight, Banknote, Users, TrendingUp } from "lucide-react";
import { COLORS as CHART_COLORS } from "@/components/ui/chart";
import { formatarNomeTurma } from "@/stores/useTurmasStore";

export function FinancialDashboard({ mes, ano }: { mes: number; ano: number }) {
    const { balanco, isLoading } = useFinancasStore();

    if (isLoading && !balanco) {
        return <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <Card key={i} className="h-32 animate-pulse bg-muted" />)}
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
        <div className="space-y-6 overflow-x-hidden max-w-full">
            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-emerald-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                        <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balanco.totalReceitas)}
                        </div>
                        <p className="text-xs text-muted-foreground">Mensalidades recebidas</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-rose-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Despesa Total</CardTitle>
                        <ArrowDownRight className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalDespesas)}
                        </div>
                        <p className="text-xs text-muted-foreground">Custos diretos + fixos</p>
                    </CardContent>
                </Card>

                <Card className={`border-l-4 ${saldoGeral >= 0 ? 'border-l-blue-500' : 'border-l-amber-500'}`}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Saldo Final</CardTitle>
                        <Banknote className={`h-4 w-4 ${saldoGeral >= 0 ? 'text-blue-500' : 'text-amber-500'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${saldoGeral < 0 ? 'text-amber-600' : ''}`}>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldoGeral)}
                        </div>
                        <p className="text-xs text-muted-foreground">Lucro líquido do mês</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-indigo-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">Rateio Geral</CardTitle>
                        <Users className="h-4 w-4 text-indigo-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balanco.totalDespesasGeral)}
                        </div>
                        <p className="text-xs text-muted-foreground">Dividido p/ todas turmas</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico de Barras: Comparativo Receita vs Despesa */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Rentabilidade por Turma
                        </CardTitle>
                        <CardDescription>Comparativo de saldo final após rateio de custos.</CardDescription>
                    </CardHeader>
                    <CardContent className="overflow-hidden">
                        <div className="h-[300px] w-full mt-4 overflow-hidden">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" hide />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value}`} />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        formatter={(value: number) => [
                                            new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value),
                                            "Saldo Final"
                                        ]}
                                    />
                                    <Bar dataKey="saldo" radius={[4, 4, 0, 0]}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Legenda colorida por turmas */}
                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-50">
                            {chartData.map((entry, index) => (
                                <div key={entry.name} className="flex items-center gap-2.5">
                                    <div
                                        className="w-3 h-3 rounded-full shrink-0"
                                        style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                                    />
                                    <span className="text-xs text-slate-700 truncate font-medium max-w-full block">
                                        {formatarNomeTurma(entry.name)}: <span className={entry.saldo >= 0 ? 'text-blue-600' : 'text-rose-600'}>
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(entry.saldo)}
                                        </span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Tabela de Detalhes por Turma */}
                <Card className="shadow-sm overflow-hidden border-none sm:border">
                    <CardHeader className="px-4 py-4 sm:px-6">
                        <CardTitle className="text-lg">Detalhamento por Turma</CardTitle>
                        <CardDescription>Performance financeira individual por turma.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {/* Mobile View: Premium Cards */}
                        <div className="md:hidden p-3 space-y-4 bg-slate-50/50 overflow-hidden">
                            {balanco.turmas.map((t) => (
                                <div
                                    key={t.turmaId}
                                    className={`p-4 rounded-xl border border-slate-200 bg-white shadow-sm border-l-4 ${t.saldo >= 0 ? 'border-l-green-500' : 'border-l-rose-500'
                                        }`}
                                >
                                    <div className="mb-4">
                                        <h4 className="font-bold text-slate-900 text-base">{formatarNomeTurma(t.nome)}</h4>
                                        <div className="flex items-center gap-1.5 mt-1 text-slate-500">
                                            <Users className="w-3.5 h-3.5" />
                                            <span className="text-xs font-medium">{t.quantidadeAlunos} alunos registrados</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-tight">Receita</span>
                                            <p className="text-xs font-bold text-emerald-600">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(t.receita)}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-tight">Despesa</span>
                                            <p className="text-xs font-bold text-rose-600">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(t.despesaDireta + t.rateioGeral)}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-tight">Saldo</span>
                                            <p className={`text-xs font-black ${t.saldo >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(t.saldo)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop View: Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs uppercase bg-muted/50 font-bold border-y text-slate-600">
                                    <tr>
                                        <th className="px-6 py-4">Turma</th>
                                        <th className="px-6 py-4">Despesa</th>
                                        <th className="px-6 py-4">Receita</th>
                                        <th className="px-6 py-4">Saldo Final</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {balanco.turmas.map((t) => (
                                        <tr key={t.turmaId} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900">{formatarNomeTurma(t.nome)}</td>
                                            <td className="px-6 py-4 text-rose-600 font-medium">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.despesaDireta + t.rateioGeral)}
                                            </td>
                                            <td className="px-6 py-4 text-emerald-600 font-medium">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.receita)}
                                            </td>
                                            <td className={`px-6 py-4 font-bold ${t.saldo >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.saldo)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
