'use client';

import React from 'react';

interface ObservacoesProps {
  value: string;
  onChange: (value: string) => void;
}

export default function Observacoes({ value, onChange }: ObservacoesProps) {
  return (
    <div className="space-y-4 pt-4">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Digite aqui as observações do dia..."
        className="w-full h-48 p-4 border-2 border-gray-100 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all resize-none text-gray-700"
      />
    </div>
  );
}
