'use client';

import { useEffect, useState, useMemo } from 'react';
import { useBNCCStore } from '@/stores/useBNCCStore';
import { useTurmasStore } from '@/stores/useTurmasStore';
import { formatarCampoExperiencia } from '@/stores/useCamposStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Plus, Pencil, Trash2, Search } from 'lucide-react';

export default function ObjetivosTab() {
  const { 
    objetivos, 
    campos, 
    isLoadingObjetivos, 
    fetchObjetivos, 
    fetchCampos,
    createObjetivo, 
    updateObjetivo, 
    deleteObjetivo 
  } = useBNCCStore();
  
  const { grupos, fetchGrupos } = useTurmasStore();
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    codigo: '',
    descricao: '',
    grupoId: '',
    campoExperienciaId: '',
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrupoId, setFilterGrupoId] = useState<string>('');
  const [filterCampoId, setFilterCampoId] = useState<string>('');
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchObjetivos();
    fetchCampos();
    fetchGrupos();
  }, [fetchObjetivos, fetchCampos, fetchGrupos]);

  // Filter and search objetivos
  const filteredObjetivos = useMemo(() => {
    return objetivos.filter((obj) => {
      const matchesSearch = 
        obj.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        obj.descricao.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesGrupo = !filterGrupoId || obj.grupoId === Number(filterGrupoId);
      const matchesCampo = !filterCampoId || obj.campoExperienciaId === Number(filterCampoId);
      
      return matchesSearch && matchesGrupo && matchesCampo;
    });
  }, [objetivos, searchTerm, filterGrupoId, filterCampoId]);

  const handleOpenCreateSheet = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      codigo: '',
      descricao: '',
      grupoId: '',
      campoExperienciaId: '',
    });
    setErrorMessage('');
    setIsSheetOpen(true);
  };

  const handleOpenEditSheet = (obj: any) => {
    setIsEditing(true);
    setEditingId(obj.id);
    setFormData({
      codigo: obj.codigo,
      descricao: obj.descricao,
      grupoId: obj.grupoId.toString(),
      campoExperienciaId: obj.campoExperienciaId.toString(),
    });
    setErrorMessage('');
    setIsSheetOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!formData.codigo || !formData.descricao || !formData.grupoId || !formData.campoExperienciaId) {
      setErrorMessage('Todos os campos são obrigatórios');
      return;
    }

    setIsSubmitting(true);

    try {
      const data = {
        codigo: formData.codigo,
        descricao: formData.descricao,
        grupoId: Number(formData.grupoId),
        campoExperienciaId: Number(formData.campoExperienciaId),
      };

      const result = isEditing && editingId
        ? await updateObjetivo(editingId, data)
        : await createObjetivo(data);

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
      const result = await deleteObjetivo(deleteId);
      
      if (result.success) {
        setSuccessMessage(result.message);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(result.message);
        setTimeout(() => setErrorMessage(''), 5000);
      }
    } catch (error) {
      setErrorMessage('Erro inesperado ao deletar objetivo');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setIsSubmitting(false);
      setDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  const formatGrupoLabel = (grupoPorCampo: string) => {
    const labels: Record<string, string> = {
      BEBES: 'Bebês (0-18 meses)',
      CRIANCAS_BEM_PEQUENAS: 'Crianças bem pequenas (19m-3a11m)',
      CRIANCAS_PEQUENAS: 'Crianças pequenas (4a-5a11m)',
      CRIANCAS_MAIORES: 'Crianças maiores (6a+)',
    };
    return labels[grupoPorCampo] || grupoPorCampo;
  };

  if (isLoadingObjetivos) {
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

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <Label htmlFor="search">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="search"
                type="text"
                placeholder="Código ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filter by Grupo */}
          <div>
            <Label htmlFor="filterGrupo">Grupo</Label>
            <Select value={filterGrupoId || "ALL"} onValueChange={(val) => setFilterGrupoId(val === "ALL" ? "" : val)}>
              <SelectTrigger id="filterGrupo">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                {grupos.map((grupo) => (
                  <SelectItem key={grupo.id} value={grupo.id.toString()}>
                    {formatGrupoLabel(grupo.nome)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filter by Campo */}
          <div>
            <Label htmlFor="filterCampo">Campo</Label>
            <Select value={filterCampoId || "ALL"} onValueChange={(val) => setFilterCampoId(val === "ALL" ? "" : val)}>
              <SelectTrigger id="filterCampo">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                {campos.map((campo) => (
                  <SelectItem key={campo.id} value={campo.id.toString()}>
                    {formatarCampoExperiencia(campo.campoExperiencia)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          {filteredObjetivos.length} de {objetivos.length} objetivo(s)
        </p>
        
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button onClick={handleOpenCreateSheet} className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Objetivo
            </Button>
          </SheetTrigger>
          
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{isEditing ? 'Editar Objetivo' : 'Novo Objetivo'}</SheetTitle>
              <SheetDescription>
                {isEditing ? 'Altere os dados do objetivo abaixo' : 'Preencha os dados do novo objetivo'}
              </SheetDescription>
            </SheetHeader>

            <form onSubmit={handleSubmit} className="space-y-6 mt-6 p-4">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código *</Label>
                <Input
                  id="codigo"
                  type="text"
                  maxLength={20}
                  value={formData.codigo}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, codigo: e.target.value })}
                  placeholder="Ex: EI01EO01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição *</Label>
                <Textarea
                  id="descricao"
                  maxLength={500}
                  rows={4}
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descrição do objetivo de aprendizagem"
                />
                <p className="text-xs text-gray-500">{formData.descricao.length}/500</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="grupoId">Grupo *</Label>
                <Select value={formData.grupoId} onValueChange={(value) => setFormData({ ...formData, grupoId: value })}>
                  <SelectTrigger id="grupoId">
                    <SelectValue placeholder="Selecione um grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    {grupos.map((grupo) => (
                      <SelectItem key={grupo.id} value={grupo.id.toString()}>
                        {formatGrupoLabel(grupo.nome)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="campoExperienciaId">Campo de Experiência *</Label>
                <Select value={formData.campoExperienciaId} onValueChange={(value) => setFormData({ ...formData, campoExperienciaId: value })}>
                  <SelectTrigger id="campoExperienciaId">
                    <SelectValue placeholder="Selecione um campo" />
                  </SelectTrigger>
                  <SelectContent>
                    {campos.map((campo) => (
                      <SelectItem key={campo.id} value={campo.id.toString()}>
                        {formatarCampoExperiencia(campo.campoExperiencia)}
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grupo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredObjetivos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Nenhum objetivo encontrado
                  </td>
                </tr>
              ) : (
                filteredObjetivos.map((obj) => (
                  <tr key={obj.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">{obj.codigo}</td>
                    <td className="px-4 py-4 text-sm text-gray-700 max-w-md truncate" title={obj.descricao}>
                      {obj.descricao}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {obj.grupo ? formatGrupoLabel(obj.grupo.grupoPorCampo) : '-'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {obj.campoExperiencia ? formatarCampoExperiencia(obj.campoExperiencia.campoExperiencia) : '-'}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        obj.isAtivo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {obj.isAtivo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditSheet(obj)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        {obj.isAtivo && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDeleteDialog(obj.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar objetivo</AlertDialogTitle>
            <AlertDialogDescription>
              Este objetivo será marcado como <strong>inativo</strong> e não aparecerá mais em novas atividades.
              <br /><br />
              Atividades existentes que usam este objetivo continuarão funcionando normalmente para fins de histórico pedagógico.
              <br /><br />
              Esta ação pode ser revertida editando o objetivo e marcando-o como ativo novamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isSubmitting} className="bg-orange-600 hover:bg-orange-700">
              {isSubmitting ? 'Desativando...' : 'Desativar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
