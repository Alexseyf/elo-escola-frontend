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
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {OPTIONS.map((option) => {
          const isSelected = selectedItems.includes(option.id);
          return (
            <button
              key={option.id}
              onClick={() => toggleItem(option.id)}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                isSelected
                  ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="text-sm">{option.label}</span>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                isSelected ? 'bg-white' : 'border-2 border-gray-200'
              }`}>
                {isSelected && (
                  <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {selectedItems.length > 0 && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs font-semibold text-gray-700 mb-2">Itens Selecionados</p>
          <p className="text-xs text-gray-600">
            {selectedItems.map(id => {
              const opt = OPTIONS.find(o => o.id === id);
              return opt?.label;
            }).join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}
