'use client';

import React from 'react';

interface Option {
  id: string;
  label: string;
  color: string;
  icon: string;
}

const OPTIONS: Option[] = [
  { id: 'OTIMO', label: 'Ótimo', color: 'border-emerald-200 bg-emerald-50/50 text-emerald-600', icon: '' },
  { id: 'BOM', label: 'Bom', color: 'border-blue-200 bg-blue-50/50 text-blue-600', icon: '' },
  { id: 'REGULAR', label: 'Regular', color: 'border-amber-200 bg-amber-50/50 text-amber-600', icon: '' },
  { id: 'NAO_ACEITOU', label: 'Não aceitou', color: 'border-rose-200 bg-rose-50/50 text-rose-600', icon: '' },
  { id: 'NAO_SE_APLICA', label: 'Não se aplica', color: 'border-slate-200 bg-slate-50/50 text-slate-500', icon: '' },
];

interface MealSelectorProps {
  value: string;
  onChange: (value: string) => void;
  title: string;
}

export default function MealSelector({ value, onChange, title }: MealSelectorProps) {
  return (
    <div className="space-y-3">
      {OPTIONS.map((option) => (
        <button
          key={option.id}
          onClick={() => onChange(option.id)}
          className={`flex items-center gap-4 w-full p-5 rounded-3xl border-2 transition-all duration-300 ${
            value === option.id
              ? `${option.color} font-bold shadow-sm`
              : 'bg-white text-gray-400 border-gray-50 hover:border-gray-100 hover:text-gray-500'
          }`}
        >
          <span className="font-bold text-base flex-1 text-left">{option.label}</span>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
            value === option.id ? 'bg-current' : 'border-2 border-gray-50'
          }`}>
            {value === option.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
          </div>
        </button>
      ))}
    </div>
  );
}
