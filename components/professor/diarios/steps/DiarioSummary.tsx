'use client';

import React from 'react';
import { DiarioFormData } from '@/types/diario';

interface DiarioSummaryProps {
  data: DiarioFormData & { [key: string]: any };
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
    <div className="space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Refeições */}
        <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex flex-col gap-4">
          <h3 className="font-bold text-blue-800 uppercase text-[10px] tracking-widest">Alimentação</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-600 font-medium">Café:</span>
              <span className="font-bold text-gray-700">{formatLabel(data.cafeDaManha || 'NAO_SE_APLICA')}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-600 font-medium">Almoço:</span>
              <span className="font-bold text-gray-700">{formatLabel(data.almoco || 'NAO_SE_APLICA')}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-600 font-medium">Lanche:</span>
              <span className="font-bold text-gray-700">{formatLabel(data.lancheDaTarde || 'NAO_SE_APLICA')}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-blue-600 font-medium">Leite:</span>
              <span className="font-bold text-gray-700">{formatLabel(data.leite || 'NAO_SE_APLICA')}</span>
            </div>
          </div>
        </div>

        {/* Saúde */}
        <div className="bg-green-50 p-6 rounded-3xl border border-green-100 flex flex-col gap-4">
          <h3 className="font-bold text-green-800 uppercase text-[10px] tracking-widest">Saúde & Bem-estar</h3>
          <div className="space-y-3">
            <div className="flex flex-col text-sm border-b border-green-100 pb-2">
              <span className="text-green-600 font-medium mb-1">Evacuação:</span>
              <span className="font-bold text-gray-700">{formatLabel(data.trocaFralda)}</span>
            </div>
            <div className="flex flex-col text-sm">
              <span className="text-green-600 font-medium mb-1">Disposição:</span>
              <span className="font-bold text-gray-700">{formatLabel(data.sonoStatus)}</span>
            </div>
          </div>
        </div>

        {/* Sono */}
        <div className="bg-purple-50 p-6 rounded-3xl border border-purple-100 md:col-span-2 space-y-3">
          <h3 className="font-bold text-purple-800 uppercase text-[10px] tracking-widest">Sono</h3>
          {data.periodosSono.length === 0 ? (
            <p className="text-sm text-purple-400 italic">Nenhum período registrado</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {data.periodosSono.map((p, i) => (
                <div key={i} className="bg-white px-3 py-1 rounded-full text-xs font-bold text-purple-700 border border-purple-200">
                  {p.horaDormiu} - {p.horaAcordou}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Itens */}
      {data.itensProvidencia.length > 0 && (
        <div className="bg-yellow-50 p-6 rounded-3xl border border-yellow-100">
          <h3 className="font-bold text-yellow-800 uppercase text-[10px] tracking-widest mb-3">Itens Solicitados</h3>
          <div className="flex flex-wrap gap-2">
            {data.itensProvidencia.map(item => (
              <span key={item} className="bg-white px-3 py-1 rounded-full text-xs font-bold text-yellow-700 border border-yellow-200">
                {formatLabel(item)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Observações */}
      {data.observacoes && (
        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
          <h3 className="font-bold text-gray-600 uppercase text-[10px] tracking-widest mb-3">Observações</h3>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{data.observacoes}</p>
        </div>
      )}
    </div>
  );
}
