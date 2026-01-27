"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFinancasStore } from "@/stores/useFinancasStore";
import { FinancialDashboard } from "./components/FinancialDashboard";
import { ExpenseManagement } from "./components/ExpenseManagement";
import { MonthClosing } from "./components/MonthClosing";
import { Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function FinanceiroPage() {
    const [mes, setMes] = useState(new Date().getMonth() + 1);
    const [ano, setAno] = useState(new Date().getFullYear());
    const { fetchBalanco, fetchPagamentos, balanco, isLoading } = useFinancasStore();

    useEffect(() => {
        fetchBalanco(mes, ano);
        fetchPagamentos(mes, ano);
    }, [mes, ano, fetchBalanco, fetchPagamentos]);

    const meses = [
        { value: 1, label: "Janeiro" },
        { value: 2, label: "Fevereiro" },
        { value: 3, label: "Março" },
        { value: 4, label: "Abril" },
        { value: 5, label: "Maio" },
        { value: 6, label: "Junho" },
        { value: 7, label: "Julho" },
        { value: 8, label: "Agosto" },
        { value: 9, label: "Setembro" },
        { value: 10, label: "Outubro" },
        { value: 11, label: "Novembro" },
        { value: 12, label: "Dezembro" },
    ];

    const anos = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    const isFechado = balanco?.tipo === 'SNAPSHOT';

    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Módulo Financeiro</h1>
                    <p className="text-sm sm:text-base text-muted-foreground font-medium">
                        Gestão de despesas, balanço mensal e lucratividade por turma.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                    <div className="flex flex-1 items-center justify-between gap-2 bg-card border rounded-xl p-2 shadow-sm min-w-[280px]">
                        <div className="flex items-center gap-2 px-2">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <Select value={mes.toString()} onValueChange={(v) => setMes(parseInt(v))}>
                                <SelectTrigger className="w-[120px] border-none shadow-none focus:ring-0 h-8 font-bold text-slate-900">
                                    <SelectValue placeholder="Mês" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {meses.map((m) => (
                                        <SelectItem key={m.value} value={m.value.toString()} className="text-sm">
                                            {m.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="h-6 w-[1px] bg-slate-200" />

                        <div className="flex items-center gap-2 px-2">
                            <Select value={ano.toString()} onValueChange={(v) => setAno(parseInt(v))}>
                                <SelectTrigger className="w-[90px] border-none shadow-none focus:ring-0 h-8 font-bold text-slate-900">
                                    <SelectValue placeholder="Ano" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {anos.map((a) => (
                                        <SelectItem key={a} value={a.toString()} className="text-sm">
                                            {a}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="w-full sm:w-auto">
                        <MonthClosing mes={mes} ano={ano} isFechado={isFechado} />
                    </div>
                </div>
            </div>

            {isFechado && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg flex items-center gap-3 animate-pulse">
                    <div className="bg-amber-500 text-white p-1 rounded-full">
                        <Calendar className="h-4 w-4" />
                    </div>
                    <span className="font-semibold text-sm">
                        ESTE MÊS ESTÁ FECHADO. Novos lançamentos ou exclusões não são permitidos.
                    </span>
                </div>
            )}

            <Tabs defaultValue="balanco" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
                    <TabsTrigger value="balanco">Balanço Mensal</TabsTrigger>
                    <TabsTrigger value="pagamentos">Lançamentos</TabsTrigger>
                </TabsList>

                <TabsContent value="balanco" className="space-y-4">
                    <FinancialDashboard mes={mes} ano={ano} />
                </TabsContent>

                <TabsContent value="pagamentos" className="space-y-4">
                    <ExpenseManagement mes={mes} ano={ano} isFechado={isFechado} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
