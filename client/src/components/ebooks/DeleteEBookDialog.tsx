import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useEBooks } from '@/contexts/EBookContext';
import { Loader2, AlertTriangle } from 'lucide-react';
import type { Ebook } from '@shared/schema';

interface DeleteEBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ebook: Ebook | null;
}

export function DeleteEBookDialog({ open, onOpenChange, ebook }: DeleteEBookDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { deleteEbookData } = useEBooks();

  const handleDelete = async () => {
    if (!ebook) return;

    setIsLoading(true);
    
    try {
      const success = await deleteEbookData(ebook.id);

      if (success) {
        onOpenChange(false);
      }
    } catch (error) {
      // Error will be handled by context
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!ebook) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent data-testid="dialog-delete-ebook">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Excluir eBook
          </AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza de que deseja excluir permanentemente o eBook "{ebook.nome}"?
            <br /><br />
            <strong>Esta ação não pode ser desfeita.</strong>
            {ebook.atividades.length > 0 && (
              <>
                <br /><br />
                O eBook contém {ebook.atividades.length} atividade{ebook.atividades.length !== 1 ? 's' : ''} 
                que também {ebook.atividades.length === 1 ? 'será perdida' : 'serão perdidas'}.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={isLoading}
            data-testid="button-cancel-delete"
          >
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isLoading}
            data-testid="button-confirm-delete"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Excluir definitivamente
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}