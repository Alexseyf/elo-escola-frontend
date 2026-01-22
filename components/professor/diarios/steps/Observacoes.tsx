'use client';

import React from 'react';

interface ObservacoesProps {
  value: string;
  onChange: (value: string) => void;
}

export default function Observacoes({ value, onChange }: ObservacoesProps) {
  return (
    <div className="space-y-2">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Digite aqui as observações do dia..."
        className="w-full h-48 p-3 border border-gray-200 rounded-lg focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none text-sm text-gray-700"
      />
    </div>
  );
}
