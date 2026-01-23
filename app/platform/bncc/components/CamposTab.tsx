'use client';

import { useEffect, useState } from 'react';
import { useBNCCStore } from '@/stores/useBNCCStore';
import { formatarCampoExperiencia } from '@/stores/useCamposStore';
import { CAMPO_EXPERIENCIA } from '@/types/bncc';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function CamposTab() {
  const { campos, isLoadingCampos, fetchCampos, createCampo, updateCampo, deleteCampo } = useBNCCStore();
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedCampo, setSelectedCampo] = useState<CAMPO_EXPERIENCIA | ''>('');
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchCampos();
  }, [fetchCampos]);

  const campoOptions: CAMPO_EXPERIENCIA[] = [
    CAMPO_EXPERIENCIA.EU_OUTRO_NOS,
    CAMPO_EXPERIENCIA.CORPO_GESTOS_MOVIMENTOS,
    CAMPO_EXPERIENCIA.TRACOS_SONS_CORES_FORMAS,
    CAMPO_EXPERIENCIA.ESCUTA_FALA_PENSAMENTO_IMAGINACAO,
    CAMPO_EXPERIENCIA.ESPACOS_TEMPOS_QUANTIDADES_RELACOES_TRANSFORMACOES,
  ];

  const handleOpenCreateSheet = () => {
    setIsEditing(false);
    setEditingId(null);
    setSelectedCampo('');
    setErrorMessage('');
    setIsSheetOpen(true);
  };

  const handleOpenEditSheet = (id: number, campoExperiencia: CAMPO_EXPERIENCIA) => {
    setIsEditing(true);
    setEditingId(id);
    setSelectedCampo(campoExperiencia);
    setErrorMessage('');
    setIsSheetOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!selectedCampo) {
      setErrorMessage('Por favor, selecione um campo de experiência');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = isEditing && editingId
        ? await updateCampo(editingId, { campoExperiencia: selectedCampo })
        : await createCampo({ campoExperiencia: selectedCampo });

      if (result.success) {
        setSuccessMessage(result.message);
        setIsSheetOpen(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(result.message);
      }
    } catch (error) {
      setErrorMessage('Erro inesperado. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDeleteDialog = (id: number) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const result = await deleteCampo(deleteId);
      
      if (result.success) {
        setSuccessMessage(result.message);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(result.message);
        setTimeout(() => setErrorMessage(''), 5000);
      }
    } catch (error) {
      setErrorMessage('Erro inesperado ao deletar campo');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setIsSubmitting(false);
      setDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  if (isLoadingCampos) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}
      
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {errorMessage}
        </div>
      )}

      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">{campos.length} campo(s) cadastrado(s)</p>
        
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button onClick={handleOpenCreateSheet} className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Campo
            </Button>
          </SheetTrigger>
          
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{isEditing ? 'Editar Campo de Experiência' : 'Novo Campo de Experiência'}</SheetTitle>
              <SheetDescription>
                {isEditing ? 'Altere o campo de experiência abaixo' : 'Selecione um novo campo de experiência'}
              </SheetDescription>
            </SheetHeader>

            <form onSubmit={handleSubmit} className="space-y-6 mt-6 p-4">
              <div className="space-y-2">
                <Label htmlFor="campoExperiencia">Campo de Experiência</Label>
                <Select value={selectedCampo} onValueChange={(value) => setSelectedCampo(value as CAMPO_EXPERIENCIA)}>
                  <SelectTrigger id="campoExperiencia">
                    <SelectValue placeholder="Selecione um campo" />
                  </SelectTrigger>
                  <SelectContent>
                    {campoOptions.map((campo) => (
                      <SelectItem key={campo} value={campo}>
                        {formatarCampoExperiencia(campo)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsSheetOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome do Campo</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {campos.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                  Nenhum campo cadastrado
                </td>
              </tr>
            ) : (
              campos.map((campo) => (
                <tr key={campo.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{campo.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatarCampoExperiencia(campo.campoExperiencia)}
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEditSheet(campo.id, campo.campoExperiencia)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDeleteDialog(campo.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar este campo de experiência? Esta ação não pode ser desfeita.
              {' '}
              <strong>Nota:</strong> Não será possível deletar se houver objetivos associados a este campo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isSubmitting} className="bg-red-600 hover:bg-red-700">
              {isSubmitting ? 'Deletando...' : 'Deletar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
