'use client';

import React from 'react';

const OPTIONS = [
  { id: 'NORMAL', label: 'Normal', color: 'border-blue-200 bg-blue-50 text-blue-600' },
  { id: 'AGITADO', label: 'Agitado', color: 'border-blue-200 bg-blue-50 text-blue-600' },
  { id: 'CALMO', label: 'Calmo', color: 'border-blue-200 bg-blue-50 text-blue-600' },
  { id: 'SONOLENTO', label: 'Sonolento', color: 'border-blue-200 bg-blue-50 text-blue-600' },
  { id: 'CANSADO', label: 'Cansado', color: 'border-blue-200 bg-blue-50 text-blue-600' },
];

interface DisposicaoProps {
  value: string;
  onChange: (value: string) => void;
}

export default function Disposicao({ value, onChange }: DisposicaoProps) {
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
