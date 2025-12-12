import React, { useEffect } from 'react';
import { useTurmasStore, formatarNomeTurma } from '@/stores/useTurmasStore';
import {
  ChartContainer,
  ChartBarChart,
  ChartBar,
  ChartXAxis,
  ChartYAxis,
  ChartCartesianGrid,
  ChartCell,
  COLORS as CHART_COLORS,
  type ChartConfig,
} from '@/components/ui/chart';

const COLORS = CHART_COLORS;

interface MensalidadesChartProps {
  minimal?: boolean;
}

export default function MensalidadesChart({ minimal = false }: MensalidadesChartProps) {
  const mensalidadesPorTurma = useTurmasStore((state) => state.mensalidadesPorTurma);
  const isLoading = useTurmasStore((state) => state.isLoading);
  const error = useTurmasStore((state) => state.error);
  const fetchMensalidadesPorTurma = useTurmasStore((state) => state.fetchMensalidadesPorTurma);

  useEffect(() => {
    fetchMensalidadesPorTurma();
  }, [fetchMensalidadesPorTurma]);

  if (isLoading && !mensalidadesPorTurma) {
    return (
      <div className="space-y-4 w-full">
        <div className="rounded-lg bg-white p-6 shadow animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (error && !mensalidadesPorTurma) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-6">
        <p className="text-base text-red-700 font-medium">Erro ao carregar dados</p>
        <p className="text-sm text-red-600 mt-2">{error}</p>
      </div>
    );
  }

  if (!mensalidadesPorTurma || mensalidadesPorTurma.turmas.length === 0) {
    return (
      <div className="rounded-lg bg-amber-50 border border-amber-200 p-6 text-center">
        <p className="text-base text-amber-700 font-medium">Nenhum dado disponível</p>
        <p className="text-sm text-amber-600 mt-2">Não há dados de mensalidades registrados.</p>
      </div>
    );
  }

  const { turmas, totalGeral } = mensalidadesPorTurma;

  const chartData = turmas.map((turma) => ({
    turma: turma.turmaNome,
    total: turma.totalMensalidade,
  }));

  const chartConfig: ChartConfig = {
    total: {
      label: "Total (R$)",
      color: "hsl(var(--primary))",
    },
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="space-y-6 w-full">
      {!minimal && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4 w-fit">
            <p className="text-sm font-medium text-green-700">Total Geral de Mensalidades</p>
            <p className="text-2xl font-bold text-green-900 mt-2">{formatCurrency(totalGeral)}</p>
        </div>
      )}

      <div className="rounded-lg bg-white p-3 sm:p-6 shadow">
        <h3 className="text-lg font-semibold mb-3 sm:mb-4 text-gray-900">Total de Mensalidades por Turma</h3>
        <div className="w-full min-h-56 sm:min-h-80 -mx-3 sm:-mx-6 px-3 sm:px-6 overflow-x-auto min-w-0">
          <ChartContainer config={chartConfig} className="h-56 sm:h-80 w-full">
            <ChartBarChart data={chartData} margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
              <ChartCartesianGrid vertical={false} />
              <ChartXAxis
                dataKey="turma"
                tick={false}
                axisLine={false}
              />
              <ChartYAxis 
                tickFormatter={(value) => `R$ ${value}`}
                axisLine={false}
                tickLine={false}
              />

              <ChartBar 
                dataKey="total" 
                fill="var(--color-total)" 
                radius={[8, 8, 0, 0]} 
                isAnimationActive={false}
                activeBar={false}
              >
                 {chartData.map((entry, index) => (
                    <ChartCell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
              </ChartBar>
            </ChartBarChart>
          </ChartContainer>
        </div>

        <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 px-3 sm:px-0">
          {chartData.map((entry, index) => (
            <div key={entry.turma} className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shrink-0"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-xs sm:text-sm text-gray-700 truncate">{entry.turma}: {formatCurrency(entry.total)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}