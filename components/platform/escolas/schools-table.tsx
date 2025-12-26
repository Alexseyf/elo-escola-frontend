'use client';

import { useEffect, useState, useCallback } from 'react';
import { getSchools } from '@/utils/escolas';
import { SchoolFormSheet } from '@/components/platform/escolas/school-form-sheet';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface School {
  id: number;
  name: string;
  slug: string;
  subscriptionPlan: string;
  _count?: {
    users: number;
    students: number;
  }
}

export function SchoolsTable() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSchools = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getSchools();
      const data = await res.json();
      if (res.ok) {
        setSchools(data);
      } else {
        toast.error('Erro ao carregar escolas.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Todas as Escolas</h2>
        <SchoolFormSheet onSuccess={fetchSchools} />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plano</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-950 divide-y divide-gray-200 dark:divide-gray-800">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  <div className="flex justify-center items-center">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    Carregando escolas...
                  </div>
                </td>
              </tr>
            ) : schools.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  Nenhuma escola encontrada.
                </td>
              </tr>
            ) : (
                schools.map((school) => (
                  <tr key={school.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{school.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{school.slug}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                       <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {school.subscriptionPlan}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                        Editar
                      </button>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
