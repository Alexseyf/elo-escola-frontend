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

interface AlunosChartProps {
  minimal?: boolean;
}

export default function AlunosChart({ minimal = false }: AlunosChartProps) {
  const turmasComTotal = useTurmasStore((state) => state.turmasComTotal);
  const isLoading = useTurmasStore((state) => state.isLoading);
  const error = useTurmasStore((state) => state.error);
  const fetchTotalAlunosPorTurma = useTurmasStore((state) => state.fetchTotalAlunosPorTurma);

  useEffect(() => {
    fetchTotalAlunosPorTurma();
  }, [fetchTotalAlunosPorTurma]);

  if (isLoading && turmasComTotal.length === 0) {
    return (
      <div className="space-y-4 w-full">
        <div className="rounded-lg bg-white p-6 shadow animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (error && turmasComTotal.length === 0) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-6">
        <p className="text-base text-red-700 font-medium">Erro ao carregar dados</p>
        <p className="text-sm text-red-600 mt-2">{error}</p>
      </div>
    );
  }

  if (!turmasComTotal || turmasComTotal.length === 0) {
    return (
      <div className="rounded-lg bg-amber-50 border border-amber-200 p-6 text-center">
        <p className="text-base text-amber-700 font-medium">Nenhum dado disponível</p>
        <p className="text-sm text-amber-600 mt-2">Não há turmas ou alunos registrados no sistema.</p>
      </div>
    );
  }

  const totalAlunos = turmasComTotal.reduce((acc, curr) => acc + curr.totalAlunosAtivos, 0);

  const chartData = turmasComTotal.map((turma) => ({
    turma: formatarNomeTurma(turma.nome),
    total: turma.totalAlunosAtivos,
  }));

  const chartConfig: ChartConfig = {
    total: {
      label: "Alunos",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <div className="space-y-6 w-full">
      {!minimal && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 w-fit">
          <p className="text-sm font-medium text-blue-700">Total de Alunos</p>
          <p className="text-2xl font-semibold text-blue-900 mt-2">{totalAlunos}</p>
        </div>
      )}

      <div className={minimal ? "" : "rounded-lg bg-white p-3 sm:p-6 shadow"}>
        {!minimal && <h3 className="text-lg font-semibold mb-3 sm:mb-4 text-gray-900">Quantidade de Alunos por Turma</h3>}
        <div className="w-full min-h-56 sm:min-h-80 -mx-3 sm:-mx-6 px-3 sm:px-6 overflow-x-auto min-w-0">
          <ChartContainer config={chartConfig} className="h-56 sm:h-80 w-full">
            <ChartBarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <ChartCartesianGrid vertical={false} />
              <ChartXAxis
                dataKey="turma"
                tick={false}
                axisLine={false}
              />
              <ChartYAxis allowDecimals={false} />

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
              <span className="text-xs sm:text-sm text-gray-700 truncate">{entry.turma}</span>
            </div>
          ))}
        </div>
      </div>

      {!minimal && turmasComTotal.length > 0 && (
        <div className="rounded-lg bg-white shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Turma
                </th>
                <th
                  scope="col"
                  className="px-4 md:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Alunos
                </th>
                <th
                  scope="col"
                  className="hidden sm:table-cell px-4 md:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Percentual
                </th>
                <th
                  scope="col"
                  className="px-4 md:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {turmasComTotal.map((turma, index) => {
                const percentual = ((turma.totalAlunosAtivos / totalAlunos) * 100).toFixed(1);
                let status = '';
                let statusColor = '';

                if (turma.totalAlunosAtivos <= 7) {
                  status = 'Muito Baixo';
                  statusColor = 'text-red-600 bg-red-50';
                } else if (turma.totalAlunosAtivos <= 11) {
                  status = 'Baixo';
                  statusColor = 'text-orange-600 bg-orange-50';
                } else if (turma.totalAlunosAtivos <= 15) {
                  status = 'Normal';
                  statusColor = 'text-green-600 bg-green-50';
                } else {
                  status = 'Excelente';
                  statusColor = 'text-blue-600 bg-blue-50';
                }

                return (
                  <tr key={turma.id} className="hover:bg-gray-50">
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        {formatarNomeTurma(turma.nome)}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-gray-900">
                      {turma.totalAlunosAtivos}
                    </td>
                    <td className="hidden sm:table-cell px-4 md:px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                      {percentual}%
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}