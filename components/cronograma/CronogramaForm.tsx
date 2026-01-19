"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Cronograma, CreateCronogramaDTO, TipoEvento } from "@/types/cronograma"
import { createCronograma, updateCronograma } from "@/utils/cronogramas"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { CustomSelect } from "@/components/CustomSelect"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  titulo: z.string().min(3, "O título deve ter pelo menos 3 caracteres").max(100, "O título deve ter no máximo 100 caracteres"),
  descricao: z.string().min(5, "A descrição deve ter pelo menos 5 caracteres").max(500, "A descrição deve ter no máximo 500 caracteres"),
  data: z.string().min(1, "A data é obrigatória"),
  tipoEvento: z.nativeEnum(TipoEvento, {
    message: "Selecione um tipo de evento válido",
  }),
})

interface CronogramaFormProps {
  initialData?: Cronograma
  isEditing?: boolean
}

export function CronogramaForm({ initialData, isEditing }: CronogramaFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: initialData?.titulo || "",
      descricao: initialData?.descricao || "",
      data: initialData?.data ? new Date(initialData.data).toISOString().split('T')[0] : "",
      tipoEvento: initialData?.tipoEvento || TipoEvento.EVENTO_ESCOLAR,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const dataFormatada = `${values.data}T09:00:00Z`
      
      const payload: CreateCronogramaDTO = {
        ...values,
        data: dataFormatada,
        isAtivo: true
      }

      if (isEditing && initialData?.id) {
        const result = await updateCronograma(initialData.id, payload)
        if (result.success) {
          toast.success("Evento atualizado com sucesso!")
          router.push("/admin/cronograma")
        } else {
          toast.error(result.message || "Erro ao atualizar evento")
        }
      } else {
        const result = await createCronograma(payload)
        if (result.success) {
          toast.success("Evento cadastrado com sucesso!")
          router.push("/admin/cronograma")
        } else {
          toast.error(result.message || "Erro ao cadastrar evento")
        }
      }
    } catch (error) {
      console.error("Erro no formulário:", error)
      toast.error("Ocorreu um erro inesperado")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto shadow-sm">
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-gray-700">Título do Evento</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Reunião de Pais e Mestres" {...field} className="focus:ring-2 focus:ring-blue-500" />
                  </FormControl>
                  <FormDescription>
                    {field.value.length}/100 caracteres
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-gray-700">Descrição</FormLabel>
                  <FormControl>
                    <textarea
                      placeholder="Descreva os detalhes do evento..."
                      className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value.length}/500 caracteres
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="data"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-gray-700">Data</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="focus:ring-2 focus:ring-blue-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tipoEvento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-gray-700">Tipo de Evento</FormLabel>
                    <FormControl>
                      <CustomSelect
                        id="tipoEvento"
                        name="tipoEvento"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        options={[
                          { value: TipoEvento.REUNIAO, label: "Reunião" },
                          { value: TipoEvento.FERIADO, label: "Feriado" },
                          { value: TipoEvento.RECESSO, label: "Recesso" },
                          { value: TipoEvento.EVENTO_ESCOLAR, label: "Evento Escolar" },
                          { value: TipoEvento.ATIVIDADE_PEDAGOGICA, label: "Atividade Pedagógica" },
                          { value: TipoEvento.OUTRO, label: "Outro" }
                        ]}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                disabled={isLoading}
                className="min-w-[140px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  isEditing ? "Atualizar Evento" : "Cadastrar Evento"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
