"use client";

import React, { useEffect } from 'react';
import { useFinancasStore } from '@/stores/useFinancasStore';
import { formatarNomeTurma } from '@/stores/useTurmasStore';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell
} from "recharts";
import { COLORS as CHART_COLORS } from '@/components/ui/chart';

interface MensalidadesChartProps {
  minimal?: boolean;
}

export default function MensalidadesChart({ minimal = false }: MensalidadesChartProps) {
  const { balanco, fetchBalanco, isLoading } = useFinancasStore();
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const COLORS = CHART_COLORS;

  useEffect(() => {
    fetchBalanco(currentMonth, currentYear);
  }, [fetchBalanco, currentMonth, currentYear]);

  if (isLoading && !balanco) {
    return (
      <div className="w-full h-48 animate-pulse bg-muted rounded-lg flex items-center justify-center">
        <span className="text-sm text-muted-foreground">Carregando dados financeiros...</span>
      </div>
    );
  }

  if (!balanco || balanco.turmas.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center border border-dashed rounded-lg bg-muted/30">
        <p className="text-sm text-muted-foreground text-center px-4">
          Nenhum dado financeiro registrado para {currentMonth}/{currentYear}.
        </p>
      </div>
    );
  }

  // Preparar dados: Saldo por Turma
  const chartData = balanco.turmas.map(t => ({
    name: formatarNomeTurma(t.nome),
    saldo: t.saldo,
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="space-y-4 w-full min-h-[350px] flex flex-col">
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="name"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              interval={0}
              angle={-45}
              textAnchor="end"
              hide={minimal}
            />
            <YAxis
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `R$${value}`}
            />

            <Bar dataKey="saldo" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legenda colorida por turmas */}
      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {chartData.map((entry, index) => (
          <div key={entry.name} className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-[11px] text-gray-700 truncate font-medium">
              {entry.name}: {formatCurrency(entry.saldo)}
            </span>
          </div>
        ))}
      </div>

      {!minimal && (
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
            <p className="text-[10px] uppercase font-semibold text-emerald-700">Receita Mês</p>
            <p className="text-lg font-semibold text-emerald-900">{formatCurrency(balanco.totalReceitas)}</p>
          </div>
          <div className="bg-rose-50 p-3 rounded-lg border border-rose-100">
            <p className="text-[10px] uppercase font-semibold text-rose-700">Despesa Mês</p>
            <p className="text-lg font-semibold text-rose-900">{formatCurrency(balanco.totalDespesasTurmas + balanco.totalDespesasGeral)}</p>
          </div>
        </div>
      )}
    </div>
  );
}