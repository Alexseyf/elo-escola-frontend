'use client';

import { useState, useEffect } from 'react';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAlunosDoResponsavel } from '@/utils/alunos';
import { getDiariosByAlunoId } from '@/utils/diarios';
import { Diario } from '@/types/diario';
import { Aluno } from '@/stores/useAlunosStore';
import { Calendar, X } from 'lucide-react';
import { DiarioCard } from '@/components/responsavel/DiarioCard';

export default function DiariosPage() {
  return (
    <RouteGuard allowedRoles={['RESPONSAVEL']}>
      <DiariosContent />
    </RouteGuard>
  );
}

function DiariosContent() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [selectedAlunoId, setSelectedAlunoId] = useState<number | null>(null);
  const [diarios, setDiarios] = useState<Diario[]>([]);
  const [filtroData, setFiltroData] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDiarios, setIsLoadingDiarios] = useState(false);

  useEffect(() => {
    async function loadAlunos() {
      setIsLoading(true);
      const data = await getAlunosDoResponsavel();
      const filtered = data.filter(aluno =>
        aluno.turma?.nome.toUpperCase().replace(/\s/g, '') !== 'TURNOINVERSO'
      );
      setAlunos(filtered);

      if (filtered.length === 1) {
        setSelectedAlunoId(filtered[0].id);
      }

      setIsLoading(false);
    }

    loadAlunos();
  }, []);

  useEffect(() => {
    if (!selectedAlunoId) {
      setDiarios([]);
      return;
    }

    async function loadDiarios() {
      if (!selectedAlunoId) return;

      setIsLoadingDiarios(true);
      const data = await getDiariosByAlunoId(selectedAlunoId, filtroData || undefined);
      setDiarios(data);
      setIsLoadingDiarios(false);
    }

    loadDiarios();
  }, [selectedAlunoId, filtroData]);

  const selectedAluno = alunos.find(a => a.id === selectedAlunoId);
  const titulo = alunos.length === 1 ? 'Diários do Meu Filho' : 'Diários dos Meus Filhos';

  const handleLimparFiltro = () => {
    setFiltroData('');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-5xl">
        <Skeleton className="h-8 w-64 mb-6" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (alunos.length === 0) {
    return (
      <div className="container mx-auto p-6 max-w-5xl">
        <Card>
          <CardHeader>
            <CardTitle>Diários Escolares</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Nenhum aluno vinculado encontrado.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">{titulo}</h1>

      {/* Seleção de filho (se múltiplos) */}
      {alunos.length > 1 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Selecione o aluno</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedAlunoId?.toString() || ''}
              onValueChange={(value: string) => setSelectedAlunoId(Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um filho" />
              </SelectTrigger>
              <SelectContent>
                {alunos.map(aluno => (
                  <SelectItem key={aluno.id} value={aluno.id.toString()}>
                    {aluno.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Filtro de data */}
      {selectedAlunoId && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filtrar por data</CardTitle>
            <CardDescription>
              {filtroData ? 'Mostrando diário da data selecionada' : 'Mostrando os 5 últimos registros'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={filtroData}
                  onChange={(e) => setFiltroData(e.target.value)}
                  className="pl-10"
                />
              </div>
              {filtroData && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleLimparFiltro}
                  title="Limpar filtro"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de diários */}
      {selectedAlunoId && (
        <div className="space-y-4">
          {isLoadingDiarios ? (
            <>
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
            </>
          ) : diarios.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  {filtroData
                    ? 'Nenhum diário encontrado para esta data.'
                    : 'Nenhum diário registrado ainda.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            diarios.map((diario) => (
              <DiarioCard key={diario.id} diario={diario} />
            ))
          )}
        </div>
      )}

      {!selectedAlunoId && alunos.length > 1 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Selecione um aluno para visualizar os diários.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
