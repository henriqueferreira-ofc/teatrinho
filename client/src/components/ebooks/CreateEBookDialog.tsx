import React, { useState } from 'react';
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

interface CreateEBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateEBookDialog({ open, onOpenChange }: CreateEBookDialogProps) {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { createNewEbook, checkEbookNameExists } = useEBooks();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;

    if (checkEbookNameExists(name.trim())) {
      // Error will be shown by context
      return;
    }

    setIsLoading(true);
    
    try {
      const newEbook = await createNewEbook({
        nome: name.trim(),
        atividades: [],
      });

      if (newEbook) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" data-testid="dialog-create-ebook">
        <DialogHeader>
          <DialogTitle>Criar novo eBook</DialogTitle>
          <DialogDescription>
            Digite o nome para seu novo eBook. O nome deve ser único.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ebook-name" className="text-right">
                Nome
              </Label>
              <Input
                id="ebook-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Digite o nome do eBook"
                className="col-span-3"
                maxLength={100}
                autoFocus
                disabled={isLoading}
                data-testid="input-ebook-name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              disabled={isLoading}
              data-testid="button-cancel"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!name.trim() || isLoading}
              data-testid="button-create"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar eBook
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}