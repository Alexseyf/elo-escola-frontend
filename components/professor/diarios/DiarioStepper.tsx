'use client';

import React, { useState } from 'react';
import { DiarioFormData } from '@/types/diario';
import CafeDaManha from './steps/CafeDaManha';
import Almoco from './steps/Almoco';
import LancheDaTarde from './steps/LancheDaTarde';
import Leite from './steps/Leite';
import Evacuacao from './steps/Evacuacao';
import Disposicao from './steps/Disposicao';
import Sono from './steps/Sono';
import ItemsRequest from './steps/ItemsRequest';
import Observacoes from './steps/Observacoes';
import DiarioSummary from './steps/DiarioSummary';

interface DiarioStepperProps {
  initialData?: Partial<DiarioFormData>;
  onSubmit: (data: DiarioFormData) => Promise<void>;
  isLoading?: boolean;
  alunoNome?: string;
  onCancel?: () => void;
}

const STEPS = [
  { title: 'Café da Manhã', field: 'cafeDaManha', Component: CafeDaManha },
  { title: 'Almoço', field: 'almoco', Component: Almoco },
  { title: 'Lanche da Tarde', field: 'lancheDaTarde', Component: LancheDaTarde },
  { title: 'Leite', field: 'leite', Component: Leite },
  { title: 'Evacuação', field: 'trocaFralda', Component: Evacuacao },
  { title: 'Disposição', field: 'sonoStatus', Component: Disposicao },
  { title: 'Sono', field: 'periodosSono', Component: Sono },
  { title: 'Providência', field: 'itensProvidencia', Component: ItemsRequest },
  { title: 'Observações', field: 'observacoes', Component: Observacoes },
  { title: 'Resumo', field: null, Component: DiarioSummary },
];

export default function DiarioStepper({
  initialData,
  onSubmit,
  isLoading = false,
  alunoNome = '',
  onCancel,
}: DiarioStepperProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<DiarioFormData>({
    trocaFralda: initialData?.trocaFralda || 'NORMAL',
    alimentacao: initialData?.alimentacao || 'COMEU_TUDO',
    sonoStatus: initialData?.sonoStatus || 'NORMAL',
    observacoes: initialData?.observacoes || '',
    periodosSono: initialData?.periodosSono || [],
    itensProvidencia: initialData?.itensProvidencia || [],
    data: initialData?.data || new Date().toISOString(),

    ...initialData,
  } as DiarioFormData);

  const step = STEPS[currentStep];
  const StepComponent = step.Component;

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Header with Progress */}
      <div className="bg-white border-b sticky top-0 z-20 px-6 py-4">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-gray-900 truncate">{alunoNome}</h1>
              <p className="text-sm text-gray-500">{step.title}</p>
            </div>
            {onCancel && (
              <button onClick={onCancel} className="md:hidden text-gray-400 hover:text-gray-600 p-2">
                ✕
              </button>
            )}
          </div>

          <div className="w-full md:flex-1 md:max-w-[150px] lg:max-w-[200px]">
            <div className="bg-gray-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs mt-1 text-gray-500 md:text-right">
              {currentStep + 1} / {STEPS.length}
            </p>
          </div>

          {onCancel && (
            <button onClick={onCancel} className="hidden md:block text-gray-400 hover:text-gray-600">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <StepComponent
              // @ts-expect-error - dynamic step component field typing
              value={step.field ? (formData[step.field as keyof DiarioFormData]) : formData}
              onChange={(val: unknown) => {
                if (step.field) {
                  setFormData({ ...formData, [step.field]: val });
                }
              }}
              data={formData}
            />
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="bg-white border-t p-6 sticky bottom-0 z-20">
        <div className="max-w-3xl mx-auto flex gap-4">
          {currentStep === 0 ? (
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-lg font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-all"
            >
              Cancelar
            </button>
          ) : (
            <button
              onClick={handlePrevious}
              className="flex-1 px-4 py-2.5 rounded-lg font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-all"
            >
              Anterior
            </button>
          )}
          {currentStep === STEPS.length - 1 ? (
            <button
              onClick={() => onSubmit(formData)}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 shadow-sm transition-all disabled:opacity-50"
            >
              {isLoading ? 'Salvando...' : 'Finalizar Diário'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex-1 px-4 py-2.5 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all"
            >
              Próximo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
