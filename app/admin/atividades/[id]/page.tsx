import { Metadata } from 'next';
import { Suspense } from 'react';
import AtividadeDetails from '@/components/admin/atividades/AtividadeDetails';

export const metadata: Metadata = {
  title: 'Detalhes da Atividade | Elo Escola',
  description: 'Visualizar detalhes da atividade pedagógica',
};

export default function AdminAtividadeDetalhesPage() {
  // Note: We don't need params here because the client component uses useParams()
  // But if we wanted to pre-fetch, we could.
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    }>
      <AtividadeDetails />
    </Suspense>
  );
}
