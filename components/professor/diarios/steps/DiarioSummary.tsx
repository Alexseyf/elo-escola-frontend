'use client';

import React from 'react';
import { DiarioFormData } from '@/types/diario';

interface DiarioSummaryProps {
  data: DiarioFormData;
}

export default function DiarioSummary({ data }: DiarioSummaryProps) {
  const formatLabel = (val: string) => {
    const map: Record<string, string> = {
      'OTIMO': 'Ótimo',
      'BOM': 'Bom',
      'REGULAR': 'Regular',
      'NAO_ACEITOU': 'Não aceitou',
      'NAO_SE_APLICA': 'Não se aplica',
      'NORMAL': 'Normal',
      'LIQUIDA': 'Líquida',
      'DURA': 'Dura',
      'NAO_EVACUOU': 'Não evacuou',
      'AGITADO': 'Agitado',
      'CALMO': 'Calmo',
      'SONOLENTO': 'Sonolento',
      'CANSADO': 'Cansado',
      'FRALDA': 'Fralda',
      'LENCO_UMEDECIDO': 'Lenço Umedecido',
      'LEITE': 'Leite',
      'CREME_DENTAL': 'Creme Dental',
      'ESCOVA_DE_DENTE': 'Escova de Dente',
      'POMADA': 'Pomada',
    };
    return map[val] || val;
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {/* Refeições - Azul */}
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
          <h3 className="text-xs font-semibold text-gray-700 mb-2">Refeições</h3>
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Lanche manhã:</span>
              <span className="font-medium">{formatLabel(data.cafeDaManha || 'NAO_SE_APLICA')}</span>
            </div>
            <div className="flex justify-between">
              <span>Almoço:</span>
              <span className="font-medium">{formatLabel(data.almoco || 'NAO_SE_APLICA')}</span>
            </div>
            <div className="flex justify-between">
              <span>Lanche tarde:</span>
              <span className="font-medium">{formatLabel(data.lancheDaTarde || 'NAO_SE_APLICA')}</span>
            </div>
            <div className="flex justify-between">
              <span>Leite:</span>
              <span className="font-medium">{formatLabel(data.leite || 'NAO_SE_APLICA')}</span>
            </div>
          </div>
        </div>

        {/* Saúde - Verde */}
        <div className="bg-green-50 p-3 rounded-lg border border-green-100">
          <h3 className="text-xs font-semibold text-gray-700 mb-2">Saúde</h3>
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Evacuação:</span>
              <span className="font-medium">{formatLabel(data.trocaFralda)}</span>
            </div>
            <div className="flex justify-between">
              <span>Disposição:</span>
              <span className="font-medium">{formatLabel(data.sonoStatus)}</span>
            </div>
          </div>
        </div>

        {/* Sono - Roxo */}
        {data.periodosSono.length > 0 && (
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
            <h3 className="text-xs font-semibold text-gray-700 mb-2">Sono</h3>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Total de períodos:</span>
                <span className="font-medium">{data.periodosSono.length}</span>
              </div>
              {data.periodosSono.map((p, i) => (
                <div key={i} className="text-gray-600 ml-4">
                  • Período {i + 1}: {p.horaDormiu} → {p.horaAcordou}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Itens Solicitados - Amarelo */}
        {data.itensProvidencia.length > 0 && (
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
            <h3 className="text-xs font-semibold text-gray-700 mb-1">Itens Solicitados</h3>
            <p className="text-xs text-gray-600">
              {data.itensProvidencia.map(item => formatLabel(item)).join(', ')}
            </p>
          </div>
        )}

        {/* Observações - Cinza */}
        {data.observacoes && (
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <h3 className="text-xs font-semibold text-gray-700 mb-2">Observações</h3>
            <p className="text-xs text-gray-600 whitespace-pre-wrap">{data.observacoes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
