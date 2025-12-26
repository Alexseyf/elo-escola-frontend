'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createSchoolSchema, CreateSchoolFormValues } from '@/schemas/escola';
import { createSchool } from '@/utils/escolas';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter,
  SheetTrigger
} from '../../ui/sheet';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { toast } from 'sonner';
import { Loader2, Plus } from 'lucide-react';

interface SchoolFormSheetProps {
  onSuccess?: () => void;
}

export function SchoolFormSheet({ onSuccess }: SchoolFormSheetProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateSchoolFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createSchoolSchema) as any,
    defaultValues: {
      name: '',
      slug: '',
      legalName: '',
      cnpj: '',
      logoUrl: '',
      primaryColor: '#000000',
      timezone: 'America/Sao_Paulo',
      subscriptionPlan: 'BASIC',
      adminUser: {
        nome: '',
        email: '',
        telefone: ''
      }
    }
  });

  const { watch, setValue } = form;
  const nameValue = watch('name');

  useEffect(() => {
    if (nameValue && !form.getFieldState('slug').isDirty) {
      const slug = nameValue
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setValue('slug', slug);
    }
  }, [nameValue, setValue, form]);

  async function onSubmit(data: CreateSchoolFormValues) {
    try {
      setIsSubmitting(true);
      await createSchool(data);
      toast.success('Escola criada com sucesso!');
      setOpen(false);
      form.reset();
      if (onSuccess) onSuccess();
    } catch (error: unknown) {
      console.error(error);
      const err = error as { response?: { status: number } };
      if (err.response?.status === 409) {
        toast.error('Já existe uma escola com esse Slug ou Email de administrador.');
      } else {
        toast.error('Erro ao criar escola. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Escola
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Nova Escola</SheetTitle>
          <SheetDescription>
            Cadastre uma nova escola no sistema.
          </SheetDescription>
        </SheetHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground border-b pb-1">Dados da Escola</h3>
              
              <FormField
                control={form.control}
                name="name"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Nome da Escola</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Escola Futuro" {...field} value={field.value as string} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="slug"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>Slug (URL)</FormLabel>
                      <FormControl>
                        <Input placeholder="escola-futuro" {...field} value={field.value as string} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="cnpj"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>CNPJ (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Apenas números" {...field} value={field.value as string} maxLength={14} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

               <div className="grid grid-cols-2 gap-4">
                 <FormField
                  control={form.control}
                  name="subscriptionPlan"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>Plano</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um plano" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="BASIC">Basic</SelectItem>
                          <SelectItem value="PRO">Pro</SelectItem>
                          <SelectItem value="PREMIUM">Premium</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="primaryColor"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>Cor Primária</FormLabel>
                        <div className="flex gap-2">
                          <Input 
                            type="color" 
                            className="w-12 p-1" 
                            value={field.value as string} 
                            onChange={field.onChange} 
                          />
                          <FormControl>
                            <Input placeholder="#000000" {...field} value={field.value as string} />
                          </FormControl>
                        </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                </div>
            </div>

            <div className="space-y-4">
               <h3 className="text-sm font-medium text-muted-foreground border-b pb-1">Administrador Inicial</h3>
               
               <FormField
                control={form.control}
                name="adminUser.nome"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Nome do Administrador</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo" {...field} value={field.value as string} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                 <FormField
                  control={form.control}
                  name="adminUser.email"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="admin@escola.com" {...field} value={field.value as string} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="adminUser.telefone"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="(00) 00000-0000" {...field} value={field.value as string} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <SheetFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar Escola
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
