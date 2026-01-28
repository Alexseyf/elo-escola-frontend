"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFinancasStore } from "@/stores/useFinancasStore";
import { FinancialDashboard } from "./components/FinancialDashboard";
import { ExpenseManagement } from "./components/ExpenseManagement";
import { MonthClosing } from "./components/MonthClosing";
import { Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/PageHeader";
import { StandardCard } from "@/components/StandardCard";

export default function FinanceiroPage() {
    const [mes, setMes] = useState(new Date().getMonth() + 1);
    const [ano, setAno] = useState(new Date().getFullYear());
    const { fetchBalanco, fetchPagamentos, balanco } = useFinancasStore();

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
        <div className="min-h-screen bg-soft-gray">
            <PageHeader
                title="Módulo Financeiro"
                subtitle="Gestão de despesas, balanço mensal e lucratividade por turma."
                actions={
                    <div className="flex items-center gap-2">
                        <div className="hidden sm:flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-3 py-1.5 shadow-sm">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <Select value={mes.toString()} onValueChange={(v) => setMes(parseInt(v))}>
                                <SelectTrigger className="w-[110px] border-none shadow-none focus:ring-0 h-8 font-semibold text-gray-700">
                                    <SelectValue placeholder="Mês" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {meses.map((m) => (
                                        <SelectItem key={m.value} value={m.value.toString()}>
                                            {m.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="h-4 w-[1px] bg-gray-200 mx-1" />
                            <Select value={ano.toString()} onValueChange={(v) => setAno(parseInt(v))}>
                                <SelectTrigger className="w-[80px] border-none shadow-none focus:ring-0 h-8 font-semibold text-gray-700">
                                    <SelectValue placeholder="Ano" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {anos.map((a) => (
                                        <SelectItem key={a} value={a.toString()}>
                                            {a}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <MonthClosing mes={mes} ano={ano} isFechado={isFechado} />
                    </div>
                }
            />

            <div className="max-w-screen-2xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
                {/* Mobile Date Filter (Sticky below PageHeader if needed or just inline) */}
                <div className="sm:hidden">
                    <StandardCard className="p-3">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-1">
                                <Calendar className="h-4 w-4 text-slate-400" />
                                <Select value={mes.toString()} onValueChange={(v) => setMes(parseInt(v))}>
                                    <SelectTrigger className="flex-1 border-none shadow-none focus:ring-0 h-8 font-bold text-slate-900">
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
                            <Select value={ano.toString()} onValueChange={(v) => setAno(parseInt(v))}>
                                <SelectTrigger className="w-[80px] border-none shadow-none focus:ring-0 h-8 font-bold text-slate-900">
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
                    </StandardCard>
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
                        <FinancialDashboard />
                    </TabsContent>

                    <TabsContent value="pagamentos" className="space-y-4">
                        <ExpenseManagement mes={mes} ano={ano} isFechado={isFechado} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
