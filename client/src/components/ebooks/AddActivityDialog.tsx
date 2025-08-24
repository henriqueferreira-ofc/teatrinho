import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Loader2 } from 'lucide-react';
import { useEBooks } from '@/contexts/EBookContext';
import type { Ebook } from '@shared/schema';

const addActivitySchema = z.object({
  titulo: z.string().min(1, 'O título é obrigatório').max(100, 'Título muito longo'),
  descricao: z.string().optional(),
  tipo: z.enum(['texto', 'exercicio', 'quiz', 'video']).default('texto'),
});

type AddActivityFormData = z.infer<typeof addActivitySchema>;

interface AddActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ebook: Ebook | null;
}

export function AddActivityDialog({ open, onOpenChange, ebook }: AddActivityDialogProps) {
  const { addActivityToEbook } = useEBooks();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AddActivityFormData>({
    resolver: zodResolver(addActivitySchema),
    defaultValues: {
      titulo: '',
      descricao: '',
      tipo: 'texto',
    },
  });

  const onSubmit = async (data: AddActivityFormData) => {
    if (!ebook) return;

    setIsSubmitting(true);
    
    try {
      // Generate a simple activity ID (in a real app, this would come from a database)
      const activityId = `atividade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await addActivityToEbook(ebook.id, activityId);
      
      // Reset form and close dialog
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding activity:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  if (!ebook) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle data-testid="text-add-activity-title">
            Adicionar Atividade
          </DialogTitle>
          <DialogDescription data-testid="text-add-activity-description">
            Adicione uma nova atividade ao eBook "{ebook.nome}".
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título da Atividade</Label>
            <Input
              id="titulo"
              placeholder="Ex: Leitura de texto, Exercício de matemática..."
              {...form.register('titulo')}
              data-testid="input-activity-title"
            />
            {form.formState.errors.titulo && (
              <p className="text-sm text-red-600" data-testid="error-activity-title">
                {form.formState.errors.titulo.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição (opcional)</Label>
            <Textarea
              id="descricao"
              placeholder="Descreva brevemente a atividade..."
              rows={3}
              {...form.register('descricao')}
              data-testid="input-activity-description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Atividade</Label>
            <select
              id="tipo"
              {...form.register('tipo')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              data-testid="select-activity-type"
            >
              <option value="texto">Leitura de Texto</option>
              <option value="exercicio">Exercício Prático</option>
              <option value="quiz">Quiz/Questionário</option>
              <option value="video">Vídeo Educativo</option>
            </select>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              data-testid="button-cancel-add-activity"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              data-testid="button-confirm-add-activity"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adicionando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Atividade
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}