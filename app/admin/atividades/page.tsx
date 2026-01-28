import { Metadata } from 'next';
import { Suspense } from 'react';
import AtividadesList from '@/components/admin/atividades/AtividadesList';

export const metadata: Metadata = {
  title: 'Atividades Pedagógicas | Elo Escola',
  description: 'Gerencie as atividades cadastradas no sistema',
};

export default function AdminAtividadesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    }>
      <AtividadesList />
    </Suspense>
  );
}
