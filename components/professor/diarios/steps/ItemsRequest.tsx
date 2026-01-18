'use client';

import React from 'react';

const OPTIONS = [
  { id: 'FRALDA', label: 'Fralda' },
  { id: 'LENCO_UMEDECIDO', label: 'Lenço Umedecido' },
  { id: 'POMADA', label: 'Pomada' },
  { id: 'LEITE', label: 'Leite' },
  { id: 'ESCOVA_DE_DENTE', label: 'Escova de Dente' },
  { id: 'CREME_DENTAL', label: 'Creme Dental' },
];

interface ItemsRequestProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export default function ItemsRequest({ value = [], onChange }: ItemsRequestProps) {
  // Defensive check for value
  const selectedItems = Array.isArray(value) ? value : [];

  const toggleItem = (id: string) => {
    if (selectedItems.includes(id)) {
      onChange(selectedItems.filter((i) => i !== id));
    } else {
      onChange([...selectedItems, id]);
    }
  };

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {OPTIONS.map((option) => {
          const isSelected = selectedItems.includes(option.id);
          return (
            <button
              key={option.id}
              onClick={() => toggleItem(option.id)}
              className={`flex items-center gap-4 p-5 rounded-3xl border-2 transition-all duration-300 ${
                isSelected
                  ? 'bg-blue-50/50 border-blue-200 text-blue-600 font-bold shadow-sm'
                  : 'bg-white text-gray-400 border-gray-50 hover:border-gray-100'
              }`}
            >
              <span className="font-bold text-base flex-1 text-left">{option.label}</span>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                isSelected ? 'bg-white' : 'border-2 border-gray-100'
              }`}>
                {isSelected && (
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {selectedItems.length > 0 && (
        <div className="mt-8 p-6 bg-blue-50/30 rounded-3xl border border-blue-50">
          <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-3">Itens Selecionados</p>
          <div className="flex flex-wrap gap-2">
            {selectedItems.map(id => {
              const opt = OPTIONS.find(o => o.id === id);
              return (
                <span key={id} className="bg-white px-4 py-2 rounded-2xl text-sm font-bold text-blue-800 border border-blue-100 shadow-sm">
                  {opt?.label}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
