'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Diario, ItemProvidencia } from '@/types/diario';
import {
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface DiarioCardProps {
  diario: Diario;
}

const getDisposicaoLabel = (disposicao?: string) => {
  const labels: Record<string, string> = {
    AGITADO: 'Agitado',
    NORMAL: 'Normal',
    CALMO: 'Calmo',
    SONOLENTO: 'Sonolento',
    CANSADO: 'Cansado'
  };
  return labels[disposicao || 'NORMAL'] || 'Normal';
};

const getRefeicaoLabel = (refeicao?: string) => {
  const labels: Record<string, string> = {
    OTIMO: 'Ótimo',
    BOM: 'Bom',
    REGULAR: 'Regular',
    NAO_ACEITOU: 'Não aceitou',
    NAO_SE_APLICA: 'Não se aplica'
  };
  return labels[refeicao || 'NAO_SE_APLICA'] || 'Não se aplica';
};

const getEvacuacaoLabel = (evacuacao?: string) => {
  const labels: Record<string, string> = {
    NORMAL: 'Normal',
    LIQUIDA: 'Líquida',
    DURA: 'Dura',
    NAO_EVACUOU: 'Não evacuou'
  };
  return labels[evacuacao || 'NAO_EVACUOU'] || 'Não informado';
};

const getItemProvidenciaLabel = (item: string) => {
  const labels: Record<string, string> = {
    FRALDA: 'Fralda',
    LENCO_UMEDECIDO: 'Lenços Umedecidos',
    LEITE: 'Leite',
    CREME_DENTAL: 'Creme Dental',
    ESCOVA_DE_DENTE: 'Escova de Dente',
    POMADA: 'Pomada'
  };
  return labels[item] || item;
};

const formatItemsList = (items: ItemProvidencia[]): string => {
  const formattedItems = items.map(item => {
    const nome = typeof item === 'string' ? item : item.itemProvidencia?.nome || '';
    return getItemProvidenciaLabel(nome);
  });

  if (formattedItems.length === 0) return '';
  if (formattedItems.length === 1) return formattedItems[0];
  if (formattedItems.length === 2) return `${formattedItems[0]} e ${formattedItems[1]}`;
  return `${formattedItems.slice(0, -1).join(', ')} e ${formattedItems[formattedItems.length - 1]}`;
};

export function DiarioCard({ diario }: DiarioCardProps) {
  const [expanded, setExpanded] = useState(false);

  const formatarData = (dataISO: string) => {
    const datePart = dataISO.split('T')[0];
    const [year, month, day] = datePart.split('-');
    return `${day}/${month}/${year}`;
  };

  const dataFormatada = formatarData(diario.data);

  const calcularTempoTotalSono = () => {
    if (diario.periodosSono.length === 0) return '0h 0m';

    let totalMinutos = 0;
    diario.periodosSono.forEach(periodo => {
      const [horas, minutos] = periodo.tempoTotal.split(':').map(Number);
      totalMinutos += (horas * 60) + minutos;
    });

    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;
    return `${horas}h ${minutos}m`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">{dataFormatada}</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Ocultar
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Ver detalhes
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {!expanded ? (
          null
        ) : (
          <div className="space-y-4">
            {/* Refeições - Azul */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="font-semibold text-gray-800 mb-3">Refeições</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Lanche da manhã:</span>
                  <span className="font-medium">{getRefeicaoLabel(diario.lancheManha)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Almoço:</span>
                  <span className="font-medium">{getRefeicaoLabel(diario.almoco)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Lanche da tarde:</span>
                  <span className="font-medium">{getRefeicaoLabel(diario.lancheTarde)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Leite:</span>
                  <span className="font-medium">{getRefeicaoLabel(diario.leite)}</span>
                </div>
              </div>
            </div>

            {/* Saúde - Verde */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <h3 className="font-semibold text-gray-800 mb-3">Saúde</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Evacuação:</span>
                  <span className="font-medium">{getEvacuacaoLabel(diario.evacuacao)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Disposição:</span>
                  <span className="font-medium">{getDisposicaoLabel(diario.disposicao)}</span>
                </div>
              </div>
            </div>

            {/* Sono - Roxo */}
            {diario.periodosSono.length > 0 && (
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <h3 className="font-semibold text-gray-800 mb-3">Sono</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Total de períodos:</span>
                    <span className="font-medium">{diario.periodosSono.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Tempo total:</span>
                    <span className="font-medium">{calcularTempoTotalSono()}</span>
                  </div>
                  {diario.periodosSono.map((periodo, idx) => (
                    <div key={periodo.id || idx} className="text-gray-600 ml-4">
                      • Período {idx + 1}: {periodo.horaDormiu} → {periodo.horaAcordou} ({periodo.tempoTotal})
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Itens para Providenciar - Amarelo */}
            {diario.itensProvidencia.length > 0 && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                <h3 className="font-semibold text-gray-800 mb-3">Itens Solicitados</h3>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-700">
                    {formatItemsList(diario.itensProvidencia)}
                  </p>
                </div>
              </div>
            )}

            {/* Observações - Cinza */}
            {diario.observacoes && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-2">Observações</h3>
                <p className="text-gray-700 text-sm whitespace-pre-wrap">{diario.observacoes}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
