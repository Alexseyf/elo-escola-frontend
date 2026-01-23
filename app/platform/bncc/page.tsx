'use client';

import { useState } from 'react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CamposTab from './components/CamposTab';
import ObjetivosTab from './components/ObjetivosTab';

export default function BNCCPage() {
  const [activeTab, setActiveTab] = useState('campos');

  return (
    <RouteGuard allowedRoles={['PLATFORM_ADMIN']}>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-medium text-gray-900">Gerenciamento BNCC</h1>
            <p className="text-gray-600 mt-1">
              Gerenciar campos de experiência e objetivos de aprendizagem
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="campos">Campos de Experiência</TabsTrigger>
              <TabsTrigger value="objetivos">Objetivos de Aprendizagem</TabsTrigger>
            </TabsList>

            <TabsContent value="campos" className="mt-6">
              <CamposTab />
            </TabsContent>

            <TabsContent value="objetivos" className="mt-6">
              <ObjetivosTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </RouteGuard>
  );
}
