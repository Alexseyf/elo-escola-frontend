'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getAlunosDoResponsavel } from '@/utils/alunos';
import { getDiariosByAlunoId } from '@/utils/diarios';
import { Diario } from '@/types/diario';
import { Calendar, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';

const getRefeicaoLabel = (refeicao?: string) => {
  const labels: Record<string, string> = {
    OTIMO: 'Ótimo',
    BOM: 'Bom',
    REGULAR: 'Regular',
    NAO_ACEITOU: 'Não aceitou',
    NAO_SE_APLICA: 'Não se aplica'
  };
  return labels[refeicao || 'NAO_SE_APLICA'] || 'Não se aplica';
};

const getDisposicaoLabel = (disposicao?: string) => {
  const labels: Record<string, string> = {
    AGITADO: 'Agitado',
    NORMAL: 'Normal',
    CALMO: 'Calmo',
    SONOLENTO: 'Sonolento',
    CANSADO: 'Cansado'
  };
  return labels[disposicao || 'NORMAL'] || 'Normal';
};

interface DiarioComAluno {
  aluno: { id: number; nome: string };
  diario: Diario | null;
}

export function UltimosDiariosCard() {
  const [diarios, setDiarios] = useState<DiarioComAluno[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadUltimosDiarios() {
      setIsLoading(true);

      const data = await getAlunosDoResponsavel();
      const alunos = data.filter(aluno =>
        aluno.turma?.nome.toUpperCase().replace(/\s/g, '') !== 'TURNOINVERSO'
      );

      const diariosPromises = alunos.map(async (aluno) => {
        const diariosDoAluno = await getDiariosByAlunoId(aluno.id);
        return {
          aluno: { id: aluno.id, nome: aluno.nome },
          diario: diariosDoAluno.length > 0 ? diariosDoAluno[0] : null
        };
      });

      const resultado = await Promise.all(diariosPromises);
      setDiarios(resultado);
      setIsLoading(false);
    }

    loadUltimosDiarios();
  }, []);

  const formatarData = (dataISO: string) => {
    const datePart = dataISO.split('T')[0];
    const [year, month, day] = datePart.split('-');
    return `${day}/${month}/${year}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Últimos Diários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (diarios.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Últimos Diários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nenhum aluno vinculado encontrado.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Últimos Diários
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {diarios.map(({ aluno, diario }) => (
          <div key={aluno.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{aluno.nome}</h3>
              {diario && (
                <span className="text-xs text-muted-foreground">
                  {formatarData(diario.data)}
                </span>
              )}
            </div>

            {!diario ? (
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">Nenhum diário registrado ainda</p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Refeições - Azul */}
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">Refeições</h4>
                  <div className="space-y-1 text-xs text-gray-600">
                    {diario.lancheManha && diario.lancheManha !== 'NAO_SE_APLICA' && (
                      <div className="flex justify-between">
                        <span>Lanche manhã:</span>
                        <span className="font-medium">{getRefeicaoLabel(diario.lancheManha)}</span>
                      </div>
                    )}
                    {diario.almoco && diario.almoco !== 'NAO_SE_APLICA' && (
                      <div className="flex justify-between">
                        <span>Almoço:</span>
                        <span className="font-medium">{getRefeicaoLabel(diario.almoco)}</span>
                      </div>
                    )}
                    {diario.lancheTarde && diario.lancheTarde !== 'NAO_SE_APLICA' && (
                      <div className="flex justify-between">
                        <span>Lanche tarde:</span>
                        <span className="font-medium">{getRefeicaoLabel(diario.lancheTarde)}</span>
                      </div>
                    )}
                    {diario.leite && diario.leite !== 'NAO_SE_APLICA' && (
                      <div className="flex justify-between">
                        <span>Leite:</span>
                        <span className="font-medium">{getRefeicaoLabel(diario.leite)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Saúde - Verde */}
                <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">Saúde</h4>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Evacuação:</span>
                      <span className="font-medium">
                        {diario.evacuacao === 'NORMAL' ? 'Normal' :
                          diario.evacuacao === 'LIQUIDA' ? 'Líquida' :
                            diario.evacuacao === 'DURA' ? 'Dura' : 'Não evacuou'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Disposição:</span>
                      <span className="font-medium">{getDisposicaoLabel(diario.disposicao)}</span>
                    </div>
                    {diario.periodosSono.length > 0 && (
                      <div className="flex justify-between">
                        <span>Tempo total de sono:</span>
                        <span className="font-medium">
                          {(() => {
                            let totalMinutos = 0;
                            diario.periodosSono.forEach(periodo => {
                              const [horas, minutos] = periodo.tempoTotal.split(':').map(Number);
                              totalMinutos += (horas * 60) + minutos;
                            });
                            const horas = Math.floor(totalMinutos / 60);
                            const minutos = totalMinutos % 60;
                            return `${horas}h ${minutos}m`;
                          })()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Itens Solicitados - Amarelo */}
                {diario.itensProvidencia.length > 0 && (
                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                    <h4 className="text-xs font-semibold text-gray-700 mb-1">Itens Solicitados</h4>
                    <p className="text-xs text-gray-600">
                      {diario.itensProvidencia.map((item, index) => {
                        const nome = typeof item === 'string' ? item : item.itemProvidencia?.nome || '';
                        const labels: Record<string, string> = {
                          FRALDA: 'Fralda',
                          LENCO_UMEDECIDO: 'Lenços Umedecidos',
                          LEITE: 'Leite',
                          CREME_DENTAL: 'Creme Dental',
                          ESCOVA_DE_DENTE: 'Escova de Dente',
                          POMADA: 'Pomada'
                        };
                        return labels[nome] || nome;
                      }).join(', ')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push('/responsavel/diarios')}
        >
          Acessar Diários
        </Button>
      </CardContent>
    </Card>
  );
}
