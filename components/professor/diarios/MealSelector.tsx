'use client';

import React from 'react';

interface Option {
  id: string;
  label: string;
  color: string;
  icon: string;
}

const OPTIONS: Option[] = [
  { id: 'OTIMO', label: 'Ótimo', color: 'border-blue-300 bg-blue-100 text-blue-800', icon: '' },
  { id: 'BOM', label: 'Bom', color: 'border-blue-200 bg-blue-50 text-blue-700', icon: '' },
  { id: 'REGULAR', label: 'Regular', color: 'border-blue-200 bg-blue-50 text-blue-600', icon: '' },
  { id: 'NAO_ACEITOU', label: 'Não aceitou', color: 'border-blue-200 bg-blue-50 text-blue-600', icon: '' },
  { id: 'NAO_SE_APLICA', label: 'Não se aplica', color: 'border-gray-200 bg-gray-50 text-gray-600', icon: '' },
];

interface MealSelectorProps {
  value: string;
  onChange: (value: string) => void;
  title: string;
}

export default function MealSelector({ value, onChange, title }: MealSelectorProps) {
  return (
    <div className="space-y-2">
      {OPTIONS.map((option) => (
        <button
          key={option.id}
          onClick={() => onChange(option.id)}
          className={`flex items-center justify-between w-full p-3 rounded-lg border transition-all ${
            value === option.id
              ? `${option.color} font-medium`
              : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <span className="text-sm">{option.label}</span>
          <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
            value === option.id ? 'bg-current' : 'border-2 border-gray-200'
          }`}>
            {value === option.id && <div className="w-2 h-2 rounded-full bg-white" />}
          </div>
        </button>
      ))}
    </div>
  );
}
