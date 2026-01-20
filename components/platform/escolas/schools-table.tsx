'use client';

import { useEffect, useState, useCallback } from 'react';
import { getSchools } from '@/utils/escolas';
import { SchoolFormSheet } from '@/components/platform/escolas/school-form-sheet';
import { Loader2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface School {
  id: number;
  name: string;
  slug: string;
  email?: string;
  subscriptionPlan: string;
  legalName?: string;
  cnpj?: string;
  logoUrl?: string;
  primaryColor?: string;
  timezone?: string;
  active: boolean;
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
        const sortedData = data.sort((a: School, b: School) => {
            if (a.active === b.active) return 0;
            return a.active ? -1 : 1;
        });
        setSchools(sortedData);
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

      <div className="rounded-lg border md:border-none border-none">
        {/* Mobile View */}
        <div className="block md:hidden space-y-4">
          {loading ? (
             <div className="flex justify-center items-center py-8 text-gray-500">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Carregando escolas...
            </div>
          ) : schools.length === 0 ? (
            <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border">
                Nenhuma escola encontrada.
            </div>
          ) : (
            schools.map((school) => (
                <div key={school.id} className="bg-white dark:bg-gray-950 p-4 rounded-lg border shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-medium text-gray-900 dark:text-gray-100">{school.name}</h3>
                            <p className="text-sm text-gray-500">{school.slug}</p>
                        </div>
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                            school.active 
                                ? 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-900/20 dark:text-green-400 dark:ring-green-400/20' 
                                : 'bg-red-50 text-red-700 ring-red-600/10 dark:bg-red-900/10 dark:text-red-400 dark:ring-red-400/20 ring-red-600/20'
                        }`}>
                            {school.active ? 'Ativa' : 'Inativa'}
                        </span>
                    </div>
                    
                    <div>
                         <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${school.subscriptionPlan === 'BASIC' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 
                              school.subscriptionPlan === 'PRO' ? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200' :
                              'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'}`}>
                            {school.subscriptionPlan}
                        </span>
                    </div>

                    <div className="pt-2 border-t flex justify-end">
                         <SchoolFormSheet 
                            school={school} 
                            onSuccess={fetchSchools} 
                            trigger={
                              <Button variant="outline" size="sm" className="w-full">
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                              </Button>
                            }
                          />
                    </div>
                </div>
            ))
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block border rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plano</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-950 divide-y divide-gray-200 dark:divide-gray-800">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  <div className="flex justify-center items-center">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    Carregando escolas...
                  </div>
                </td>
              </tr>
            ) : schools.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Nenhuma escola encontrada.
                </td>
              </tr>
            ) : (
                schools.map((school) => (
                  <tr 
                    key={school.id} 
                    className={`hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${!school.active ? 'bg-gray-50 dark:bg-gray-900/50 text-muted-foreground' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {school.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{school.slug}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                       <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${school.subscriptionPlan === 'BASIC' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 
                          school.subscriptionPlan === 'PRO' ? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200' :
                          'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'}`}>
                        {school.subscriptionPlan}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                      <SchoolFormSheet 
                        school={school} 
                        onSuccess={fetchSchools} 
                        trigger={
                          <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </Button>
                        }
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                       <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                          school.active 
                            ? 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-900/20 dark:text-green-400 dark:ring-green-400/20' 
                            : 'bg-red-50 text-red-700 ring-red-600/10 dark:bg-red-900/10 dark:text-red-400 dark:ring-red-400/20 ring-red-600/20'
                        }`}>
                          {school.active ? 'Ativa' : 'Inativa'}
                       </span>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
        </div>
    </div>
    </div>
  );
}
