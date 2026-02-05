'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  ChartContainer,
  ChartPieChart,
  ChartPie,
  ChartCell,
  type ChartConfig,
} from '@/components/ui/chart';

import { useAuthStore } from '@/stores/useAuthStore';

interface TurmaComCampos {
  turmaId: number;
  turma: string;
  campos: Array<{
    campo: string;
    total: number;
    percentual: number;
  }>;
  totalAtividades: number;
}

interface TurmaChartCardProps {
  turma: TurmaComCampos;
  index: number;
  colors: string[];
  minimal?: boolean;
}

export default function TurmaChartCard({ turma, index: turmaIndex, colors: COLORS, minimal = false }: TurmaChartCardProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.roles?.includes('ADMIN');

  return (
    <div className={minimal ? "p-0" : "rounded-lg bg-white p-3 sm:p-6 shadow"}>
      {!minimal && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{turma.turma}</h3>
          {isAdmin && (
            <button
              onClick={() => router.push(`/admin/atividades?turmaId=${turma.turmaId}`)}
              className="px-3 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors whitespace-nowrap"
            >
              Detalhar
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-gray-700 mb-3 sm:mb-4">Distribuição por Campo</h4>
          <div className="w-full min-h-48 sm:min-h-64 lg:min-h-[350px] -mx-3 sm:-mx-6 px-3 sm:px-6 overflow-x-auto">
            <ChartContainer
              config={Object.fromEntries(
                turma.campos.map((campo, index) => [
                  campo.campo,
                  {
                    label: campo.campo,
                    color: COLORS[index % COLORS.length],
                  },
                ])
              ) as ChartConfig}
              className="h-48 sm:h-64 lg:h-[350px] w-full"
            >
              <ChartPieChart>
                <ChartPie
                  data={turma.campos}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={false}
                  outerRadius="75%"
                  fill="#8884d8"
                  dataKey="total"
                  isAnimationActive={false}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  activeShape={false as any}
                >
                  {turma.campos.map((campo, index) => (
                    <ChartCell
                      key={`cell-${turmaIndex}-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </ChartPie>
              </ChartPieChart>
            </ChartContainer>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div className="p-2 sm:p-3 bg-gray-50 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-600">Total de Atividades</p>
            <p className="text-lg sm:text-xl font-bold text-blue-600 mt-1">{turma.totalAtividades}</p>
          </div>

          <div className="space-y-2">
            {turma.campos.map((campo, index) => (
              <div key={campo.campo} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-xs sm:text-sm text-gray-700 truncate">{campo.campo}</span>
                </div>
                <div className="text-right ml-2">
                  <p className="text-xs sm:text-sm font-semibold text-gray-900">{campo.total}</p>
                  <p className="text-xs text-gray-500">{campo.percentual.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
