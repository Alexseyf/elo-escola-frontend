import { SchoolsTable } from '@/components/platform/escolas/schools-table';

export default function EscolasPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Gerenciamento de Escolas</h1>
        <p className="text-gray-600">Área restrita da plataforma.</p>
      </div>
      
      <SchoolsTable />
    </div>
  );
}
