import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEBooks } from '@/contexts/EBookContext';
import { Loader2 } from 'lucide-react';
import type { Ebook } from '@shared/schema';

interface CloneEBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ebook: Ebook | null;
}

export function CloneEBookDialog({ open, onOpenChange, ebook }: CloneEBookDialogProps) {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { cloneEbookData, checkEbookNameExists } = useEBooks();

  // Set default name when dialog opens or ebook changes
  useEffect(() => {
    if (ebook && open) {
      setName(`${ebook.nome} - Cópia`);
    }
  }, [ebook, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !ebook) return;

    if (checkEbookNameExists(name.trim())) {
      // Error will be shown by context
      return;
    }

    setIsLoading(true);
    
    try {
      const clonedEbook = await cloneEbookData(ebook.id, name.trim());

      if (clonedEbook) {
        setName('');
        onOpenChange(false);
      }
    } catch (error) {
      // Error will be handled by context
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setName('');
    onOpenChange(false);
  };

  if (!ebook) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" data-testid="dialog-clone-ebook">
        <DialogHeader>
          <DialogTitle>Clonar eBook</DialogTitle>
          <DialogDescription>
            Você está clonando o eBook "{ebook.nome}". 
            Digite o nome para a nova cópia.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="clone-name" className="text-right">
                Nome
              </Label>
              <Input
                id="clone-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome para a cópia"
                className="col-span-3"
                maxLength={100}
                autoFocus
                disabled={isLoading}
                data-testid="input-clone-name"
              />
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p><strong>eBook original:</strong> {ebook.nome}</p>
              <p><strong>Atividades:</strong> {ebook.atividades.length} item{ebook.atividades.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              disabled={isLoading}
              data-testid="button-cancel-clone"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!name.trim() || isLoading}
              data-testid="button-confirm-clone"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Clonar eBook
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}