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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  conteudo: z.string().optional(),
});

type AddActivityFormData = z.infer<typeof addActivitySchema>;

interface AddActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ebookId: string;
}

export function AddActivityDialog({ open, onOpenChange, ebookId }: AddActivityDialogProps) {
  const { addCustomActivityToEbook } = useEBooks();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AddActivityFormData>({
    resolver: zodResolver(addActivitySchema),
    defaultValues: {
      titulo: '',
      descricao: '',
      tipo: 'texto',
      conteudo: '',
    },
  });

  const onSubmit = async (data: AddActivityFormData) => {
    if (!ebookId) return;

    setIsSubmitting(true);
    
    try {
      // Create activity data
      const activityData = {
        titulo: data.titulo,
        descricao: data.descricao || '',
        tipo: data.tipo,
        conteudo: data.conteudo || ''
      };

      // Add custom activity to eBook
      await addCustomActivityToEbook(ebookId, activityData);
      
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

  if (!ebookId) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle data-testid="text-add-activity-title">
            Adicionar Atividade
          </DialogTitle>
          <DialogDescription data-testid="text-add-activity-description">
            Crie uma nova atividade personalizada para seu eBook.
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
            <Select
              value={form.watch('tipo')}
              onValueChange={(value) => form.setValue('tipo', value as 'texto' | 'exercicio' | 'quiz' | 'video')}
            >
              <SelectTrigger data-testid="select-activity-type">
                <SelectValue placeholder="Selecione o tipo de atividade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="texto">Leitura de Texto</SelectItem>
                <SelectItem value="exercicio">Exercício Prático</SelectItem>
                <SelectItem value="quiz">Quiz/Questionário</SelectItem>
                <SelectItem value="video">Vídeo Educativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="conteudo">Conteúdo (opcional)</Label>
            <Textarea
              id="conteudo"
              placeholder="Adicione o conteúdo detalhado da atividade..."
              rows={4}
              {...form.register('conteudo')}
              data-testid="input-activity-content"
            />
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