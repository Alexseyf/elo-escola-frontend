"use client"

import { useState, useEffect } from "react"
import { RouteGuard } from "@/components/auth/RouteGuard"
import { getAlunosDoResponsavel } from "@/utils/alunos"
import { Aluno } from "@/stores/useAlunosStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CustomSelect } from "@/components/CustomSelect"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, Calendar, DollarSign, GraduationCap } from "lucide-react"

const formatarTurma = (nome: string) => {
  const turmas: Record<string, string> = {
    BERCARIO1: "Berçário 1",
    BERCARIO2: "Berçário 2",
    MATERNAL1: "Maternal 1",
    MATERNAL2: "Maternal 2",
    PRE1: "Pré 1",
    PRE2: "Pré 2",
    TURNOINVERSO: "Turno Inverso",
  }
  return turmas[nome] || nome
}

const formatarData = (dataString: string) => {
  const data = new Date(dataString)
  return data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })
}

const calcularIdade = (dataNasc: string) => {
  const hoje = new Date()
  const nascimento = new Date(dataNasc)
  
  let anos = hoje.getFullYear() - nascimento.getFullYear()
  const mes = hoje.getMonth() - nascimento.getMonth()
  
  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
    anos--
  }
  
  if (anos < 1) {
    let meses = mes
    if (meses < 0) {
      meses = 12 + mes
    }
    if (hoje.getDate() < nascimento.getDate()) {
      meses--
    }
    return meses === 1 ? '1 mês' : `${meses} meses`
  }
  
  return anos === 1 ? '1 ano' : `${anos} anos`
}

export default function MeusFilhosPage() {
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [selectedAlunoId, setSelectedAlunoId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadAlunos() {
      setIsLoading(true)
      const data = await getAlunosDoResponsavel()
      setAlunos(data)
      
      if (data.length === 1) {
        setSelectedAlunoId(data[0].id)
      }
      
      setIsLoading(false)
    }

    loadAlunos()
  }, [])

  const selectedAluno = alunos.find(a => a.id === selectedAlunoId)

  if (isLoading) {
    return (
      <RouteGuard allowedRoles={['RESPONSAVEL']}>
        <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Carregando...
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Informações cadastrais dos alunos
            </p>
          </div>

          <Skeleton className="h-64 w-full" />
        </div>
      </RouteGuard>
    )
  }

  if (alunos.length === 0) {
    return (
      <RouteGuard allowedRoles={['RESPONSAVEL']}>
        <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Meus Filhos
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Informações cadastrais dos alunos
            </p>
          </div>

          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum aluno vinculado a esta conta</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </RouteGuard>
    )
  }

  return (
    <RouteGuard allowedRoles={['RESPONSAVEL']}>
      <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {alunos.length === 1 ? 'Meu Filho' : 'Meus Filhos'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Informações cadastrais dos alunos
          </p>
        </div>

        {/* Seletor de Aluno (apenas se houver mais de um) */}
        {alunos.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Selecione o aluno</CardTitle>
            </CardHeader>
            <CardContent>
              <CustomSelect
                id="aluno-select"
                name="alunoId"
                value={selectedAlunoId || ""}
                onChange={(e) => setSelectedAlunoId(Number(e.target.value))}
                options={alunos.map(aluno => ({
                  value: aluno.id,
                  label: aluno.nome
                }))}
              />
            </CardContent>
          </Card>
        )}

        {/* Informações do Aluno Selecionado */}
        {selectedAluno && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl capitalize">{selectedAluno.nome}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {selectedAluno.isAtivo ? (
                  <span className="text-green-600 font-medium">● Ativo</span>
                ) : (
                  <span className="text-red-600 font-medium">● Inativo</span>
                )}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Grid de Informações */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Data de Nascimento e Idade */}
                {selectedAluno.dataNasc && (
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Data de Nascimento</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatarData(selectedAluno.dataNasc)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {calcularIdade(selectedAluno.dataNasc)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Turma */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Turma</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedAluno.turma ? formatarTurma(selectedAluno.turma.nome) : 'Não atribuída'}
                    </p>
                  </div>
                </div>

                {/* Mensalidade */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Mensalidade</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(selectedAluno.mensalidade || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </RouteGuard>
  )
}
