import React, { useEffect, useMemo } from 'react';
import { useCamposStore, formatarCampoExperiencia } from '@/stores/useCamposStore';
import { formatarNomeTurma } from '@/stores/useTurmasStore';
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
import TurmaChartCard from './TurmaChartCard';

interface AtividadesChartProps {
  turmaId?: number;
  minimal?: boolean;
}

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

const COLORS = CHART_COLORS;

export default function AtividadesChart({ turmaId, minimal = false }: AtividadesChartProps) {
  const relatorioLegacy = useCamposStore((state) => state.relatorio);
  const relatoriosCache = useCamposStore((state) => state.relatoriosCache);
  const isLoading = useCamposStore((state) => state.isLoading);
  const error = useCamposStore((state) => state.error);
  const fetchRelatorio = useCamposStore((state) => state.fetchRelatorioAtividades);

  const activeRelatorio = useMemo(() => {
    if (turmaId) {
      return relatoriosCache[String(turmaId)];
    }
    return relatorioLegacy;
  }, [turmaId, relatoriosCache, relatorioLegacy]);

  useEffect(() => {
    fetchRelatorio(turmaId);
  }, [fetchRelatorio, turmaId]);

  const relatorio = activeRelatorio;
  const turmasComCampos = useMemo(() => {
    if (!relatorio || !relatorio.relatorio) return [];

    const turmasMap = new Map<number, TurmaComCampos>();

    relatorio.relatorio.forEach((campoRelatorio) => {
      const campoFormatado = formatarCampoExperiencia(campoRelatorio.campoExperiencia);

      campoRelatorio.detalhesPorTurma.forEach((detalhe) => {
        if (turmaId && detalhe.turmaId !== turmaId) return;

        const turmaFormatada = formatarNomeTurma(detalhe.turma);

        if (!turmasMap.has(detalhe.turmaId)) {
          turmasMap.set(detalhe.turmaId, {
            turmaId: detalhe.turmaId,
            turma: turmaFormatada,
            campos: [],
            totalAtividades: 0,
          });
        }

        const turmaData = turmasMap.get(detalhe.turmaId)!;
        turmaData.totalAtividades += detalhe.total;
        turmaData.campos.push({
          campo: campoFormatado,
          total: detalhe.total,
          percentual: 0,
        });
      });
    });

    turmasMap.forEach((turma) => {
      turma.campos.forEach((campo) => {
        campo.percentual = (campo.total / turma.totalAtividades) * 100;
      });
    });

    return Array.from(turmasMap.values());
  }, [relatorio, turmaId]);

  if (isLoading && !relatorio) {
    return (
      <div className="space-y-3 sm:space-y-4 w-full">
        {!minimal && (
          <div className="rounded-lg bg-white p-3 sm:p-6 shadow animate-pulse">
            <div className="h-5 sm:h-6 bg-gray-200 rounded w-1/3 mb-3 sm:mb-4"></div>
            <div className="space-y-2 sm:space-y-3">
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg bg-white p-3 sm:p-4 shadow animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && !relatorio) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-3 sm:p-6">
        <p className="text-sm sm:text-base text-red-700 font-medium">Erro ao carregar dados</p>
        <p className="text-xs sm:text-sm text-red-600 mt-2">{error}</p>
      </div>
    );
  }

  if (!relatorio || !relatorio.relatorio || relatorio.relatorio.length === 0) {
    return (
      <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 sm:p-6 text-center">
        <p className="text-sm sm:text-base text-amber-700 font-medium">Nenhum dado disponível</p>
        <p className="text-xs sm:text-sm text-amber-600 mt-2">Não há atividades registradas no sistema.</p>
      </div>
    );
  }

  const totalAtividades = relatorio.resumo.totalAtividades;

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {!minimal && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 sm:p-4">
            <p className="text-xs sm:text-sm font-medium text-blue-700">Total de Atividades</p>
            <p className="text-xl sm:text-2xl font-semibold text-blue-900 mt-1 sm:mt-2">{totalAtividades}</p>
          </div>
          <div className="rounded-lg bg-green-50 border border-green-200 p-3 sm:p-4">
            <p className="text-xs sm:text-sm font-medium text-green-700">Campos de Experiência</p>
            <p className="text-xl sm:text-2xl font-semibold text-green-900 mt-1 sm:mt-2">{relatorio.resumo.totalCampos}</p>
          </div>
          <div className="rounded-lg bg-purple-50 border border-purple-200 p-3 sm:p-4">
            <p className="text-xs sm:text-sm font-medium text-purple-700">Turmas</p>
            <p className="text-xl sm:text-2xl font-semibold text-purple-900 mt-1 sm:mt-2">{turmasComCampos.length}</p>
          </div>
        </div>
      )}

      <div className={minimal ? "" : "rounded-lg bg-white p-3 sm:p-6 shadow"}>
        {!minimal && <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900">Total de Atividades por Campo de Experiência</h3>}
        <div className="w-full min-h-56 sm:min-h-80 -mx-3 sm:-mx-6 px-3 sm:px-6 overflow-x-auto min-w-0">
          <ChartContainer
            config={Object.fromEntries(
              relatorio.relatorio.map((campo, index) => [
                campo.campoExperiencia,
                {
                  label: formatarCampoExperiencia(campo.campoExperiencia),
                  color: COLORS[index % COLORS.length],
                },
              ])
            ) as ChartConfig}
            className="h-56 sm:h-80 w-full"
          >
            <ChartBarChart
              data={relatorio.relatorio.map((campo) => ({
                campo: formatarCampoExperiencia(campo.campoExperiencia),
                total: campo.totalGeral,
                fill: COLORS[relatorio.relatorio.indexOf(campo) % COLORS.length],
              }))}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
            >
              <ChartCartesianGrid vertical={false} />
              <ChartXAxis
                dataKey="campo"
                tick={false}
                axisLine={false}
              />
              <ChartYAxis />
              <ChartBar dataKey="total" fill="#3b82f6" radius={[8, 8, 0, 0]} isAnimationActive={false} activeBar={false}>
                {relatorio.relatorio.map((campo, index) => (
                  <ChartCell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </ChartBar>
            </ChartBarChart>
          </ChartContainer>
        </div>

        <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 px-3 sm:px-0">
          {relatorio.relatorio.map((campo, index) => (
            <div key={campo.campoExperiencia} className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shrink-0"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-xs sm:text-sm text-gray-700 truncate">{formatarCampoExperiencia(campo.campoExperiencia)}</span>
            </div>
          ))}
        </div>
      </div>

      {turmasComCampos.map((turma, turmaIndex) => (
        <TurmaChartCard
          key={turma.turmaId}
          turma={turma}
          index={turmaIndex}
          colors={COLORS}
          minimal={minimal}
        />
      ))}
    </div>
  );
}
