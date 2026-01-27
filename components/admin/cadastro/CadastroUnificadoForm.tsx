"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAlunosStore } from "@/stores/useAlunosStore";
import { useUsuariosStore } from "@/stores/useUsuariosStore";
import { useTurmasStore } from "@/stores/useTurmasStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Save, UserPlus, GraduationCap, Users, Plus, Trash2 } from "lucide-react";
import { alunoSchema } from "@/schemas/aluno";
import { usuarioSchema } from "@/schemas/usuario";

const cadastroUnificadoSchema = z.object({
  aluno: alunoSchema,
  responsaveis: z.array(usuarioSchema.omit({ roles: true })).min(1, "Adicione pelo menos um responsável"),
});

type CadastroUnificadoValues = z.infer<typeof cadastroUnificadoSchema>;

export function CadastroUnificadoForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createAluno, adicionarResponsavelAluno } = useAlunosStore();
  const { criarUsuario } = useUsuariosStore();
  const { turmas, fetchTurmas } = useTurmasStore();

  const form = useForm<CadastroUnificadoValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(cadastroUnificadoSchema) as any,
    defaultValues: {
      aluno: {
        nome: "",
        dataNasc: "",
        turmaId: 0,
        mensalidade: undefined,
      },
      responsaveis: [
        {
          nome: "",
          email: "",
          cpf: "",
          rg: "",
          dataNascimento: "",
          telefone: "",
          telefoneComercial: "",
          enderecoLogradouro: "",
          enderecoNumero: "",
        }
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "responsaveis",
  });

  useEffect(() => {
    fetchTurmas();
  }, [fetchTurmas]);

  async function onSubmit(data: CadastroUnificadoValues) {
    setIsSubmitting(true);
    try {
      const alunoPayload = {
        ...data.aluno,
        dataNasc: `${data.aluno.dataNasc}T00:00:00.000Z`,
        mensalidade: data.aluno.mensalidade || 0,
      };

      const alunoResult = await createAluno(alunoPayload);

      if (!alunoResult.success || !alunoResult.data) {
        toast.error(`Erro ao criar aluno: ${alunoResult.message}`);
        setIsSubmitting(false);
        return;
      }

      const alunoId = alunoResult.data.id;
      toast.success("Aluno criado com sucesso!");

      let successCount = 0;
      for (const responsavel of data.responsaveis) {
        const responsavelPayload = {
          ...responsavel,
          dataNascimento: `${responsavel.dataNascimento}T00:00:00.000Z`,
          roles: ["RESPONSAVEL"],
        };

        const usuarioResult = await criarUsuario(responsavelPayload);

        if (!usuarioResult) {
          toast.error(`Erro ao criar responsável ${responsavel.nome}.`);
          continue;
        }

        const responsavelId = usuarioResult.id;

        const linkResult = await adicionarResponsavelAluno(alunoId, responsavelId);
        if (linkResult.success) {
          successCount++;
        } else {
          toast.error(`Erro ao vincular responsável ${responsavel.nome}: ${linkResult.message}`);
        }
      }

      if (successCount === data.responsaveis.length) {
        toast.success("Todos os responsáveis foram vinculados com sucesso!");
        form.reset({
          aluno: {
            nome: "",
            dataNasc: "",
            turmaId: 0,
            mensalidade: undefined,
          },
          responsaveis: [
            {
              nome: "",
              email: "",
              cpf: "",
              rg: "",
              dataNascimento: "",
              telefone: "",
              telefoneComercial: "",
              enderecoLogradouro: "",
              enderecoNumero: "",
            }
          ],
        });
      } else if (successCount > 0) {
        toast.warning(`Cadastro concluído, mas apenas ${successCount} de ${data.responsaveis.length} responsáveis foram vinculados.`);
      } else {
        toast.error("Erro ao vincular responsáveis.");
      }

    } catch (error) {
      console.error(error);
      toast.error("Erro inesperado durante o cadastro.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-md">
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

            {/* --- Dados do Aluno --- */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <GraduationCap className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold text-lg">Dados do Aluno</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="aluno.nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo do Aluno</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do aluno" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="aluno.dataNasc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Nascimento</FormLabel>
                      <FormControl>
                        <Input type="date" max={new Date().toISOString().split('T')[0]} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="aluno.turmaId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Turma</FormLabel>
                      <Select
                        onValueChange={(val) => field.onChange(Number(val))}
                        value={field.value ? String(field.value) : ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a turma" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {turmas.map((turma) => (
                            <SelectItem key={turma.id} value={String(turma.id)}>
                              {turma.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="aluno.mensalidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mensalidade (R$)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="0,00"
                          value={field.value ? new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(Number(field.value)) : ''}
                          onChange={(e) => {
                            const rawValue = e.target.value.replace(/\D/g, '');
                            const numberValue = rawValue ? Number(rawValue) / 100 : undefined;
                            field.onChange(numberValue);
                          }}
                          maxLength={15}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* --- Dados dos Responsáveis --- */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b pt-4">
                <Users className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold text-lg">Dados dos Responsáveis</h3>
              </div>

              {fields.map((field, index) => (
                <Card key={field.id} className="relative p-4 border bg-card/40">
                  <div className="absolute right-2 top-2">
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="mb-4 font-medium text-sm text-muted-foreground">
                    Responsável {index + 1}
                  </div>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name={`responsaveis.${index}.nome`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome do responsável" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`responsaveis.${index}.email`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="email@exemplo.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`responsaveis.${index}.dataNascimento`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data de Nascimento</FormLabel>
                            <FormControl>
                              <Input type="date" max={new Date().toISOString().split('T')[0]} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`responsaveis.${index}.cpf`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CPF</FormLabel>
                            <FormControl>
                              <Input placeholder="000.000.000-00" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`responsaveis.${index}.rg`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>RG</FormLabel>
                            <FormControl>
                              <Input placeholder="0.000.000-0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`responsaveis.${index}.telefone`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Celular</FormLabel>
                            <FormControl>
                              <Input placeholder="(99) 99999-9999" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`responsaveis.${index}.telefoneComercial`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone Comercial (Opcional)</FormLabel>
                            <FormControl>
                              <Input placeholder="(99) 3333-3333" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name={`responsaveis.${index}.enderecoLogradouro`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Endereço</FormLabel>
                              <FormControl>
                                <Input placeholder="Rua das Flores" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div>
                        <FormField
                          control={form.control}
                          name={`responsaveis.${index}.enderecoNumero`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Número</FormLabel>
                              <FormControl>
                                <Input placeholder="123" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              <Button
                type="button"
                variant="outline"
                className="w-full dashed-border"
                onClick={() => append({
                  nome: "",
                  email: "",
                  cpf: "",
                  rg: "",
                  dataNascimento: "",
                  telefone: "",
                  telefoneComercial: "",
                  enderecoLogradouro: "",
                  enderecoNumero: "",
                })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Responsável
              </Button>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" size="lg" disabled={isSubmitting} className="w-full md:w-auto">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
