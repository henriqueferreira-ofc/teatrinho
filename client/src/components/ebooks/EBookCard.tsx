import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Book, 
  MoreVertical, 
  Edit2, 
  Copy, 
  Trash2, 
  Check, 
  X,
  FileText 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEBooks } from '@/contexts/EBookContext';
import type { Ebook } from '@shared/schema';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EBookCardProps {
  ebook: Ebook;
  isSelected?: boolean;
  onSelect?: (ebook: Ebook) => void;
  onClone?: (ebook: Ebook) => void;
  onDelete?: (ebook: Ebook) => void;
  canEdit?: boolean;
}

export function EBookCard({ 
  ebook, 
  isSelected = false, 
  onSelect, 
  onClone, 
  onDelete,
  canEdit = true 
}: EBookCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(ebook.nome);
  const { updateEbookData } = useEBooks();

  const handleSaveEdit = async () => {
    if (editName.trim() && editName.trim() !== ebook.nome) {
      const updated = await updateEbookData(ebook.id, { nome: editName.trim() });
      if (updated) {
        setIsEditing(false);
      } else {
        setEditName(ebook.nome); // Reset on error
      }
    } else {
      setIsEditing(false);
      setEditName(ebook.nome);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditName(ebook.nome);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isSelected 
          ? 'ring-2 ring-blue-500 shadow-md bg-blue-50/50 dark:bg-blue-950/20' 
          : 'hover:shadow-md'
      }`}
      onClick={() => !isEditing && onSelect?.(ebook)}
      data-testid={`card-ebook-${ebook.id}`}
    >
      <CardContent className="p-4">
        {/* Header with icon and actions */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Book className="h-4 w-4 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <Badge variant="outline" className="text-xs">
                {ebook.atividades.length} atividade{ebook.atividades.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
          
          {canEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                  onClick={(e) => e.stopPropagation()}
                  data-testid={`button-menu-${ebook.id}`}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  data-testid={`button-edit-${ebook.id}`}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Editar nome
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onClone?.(ebook);
                  }}
                  data-testid={`button-clone-${ebook.id}`}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Clonar eBook
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(ebook);
                  }}
                  className="text-red-600 dark:text-red-400"
                  data-testid={`button-delete-${ebook.id}`}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* eBook name (editable) */}
        <div className="mb-3">
          {isEditing ? (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-8 text-sm font-medium"
                autoFocus
                data-testid={`input-edit-name-${ebook.id}`}
              />
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 w-8 p-0 text-green-600"
                onClick={handleSaveEdit}
                data-testid={`button-save-edit-${ebook.id}`}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 w-8 p-0 text-red-600"
                onClick={handleCancelEdit}
                data-testid={`button-cancel-edit-${ebook.id}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <h3 
              className="font-medium text-sm text-gray-900 dark:text-gray-100 line-clamp-2"
              data-testid={`text-ebook-name-${ebook.id}`}
            >
              {ebook.nome}
            </h3>
          )}
        </div>

        {/* Creation date */}
        <p 
          className="text-xs text-gray-500 dark:text-gray-400 mb-3"
          data-testid={`text-ebook-date-${ebook.id}`}
        >
          Criado em {formatDate(ebook.data)}
        </p>

        {/* Select button */}
        <Button
          variant={isSelected ? "default" : "outline"}
          size="sm"
          className="w-full text-xs"
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(ebook);
          }}
          data-testid={`button-select-${ebook.id}`}
        >
          <FileText className="h-3 w-3 mr-1" />
          {isSelected ? 'Selecionado' : 'Selecionar'}
        </Button>
      </CardContent>
    </Card>
  );
}