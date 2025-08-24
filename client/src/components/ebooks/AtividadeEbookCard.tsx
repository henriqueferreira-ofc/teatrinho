import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, X } from 'lucide-react';
import { Atividade } from '@shared/schema';

interface AtividadeEbookCardProps {
  atividade: Atividade;
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}

export function AtividadeEbookCard({ 
  atividade, 
  index, 
  total, 
  onMoveUp, 
  onMoveDown, 
  onRemove 
}: AtividadeEbookCardProps) {
  const isFirst = index === 0;
  const isLast = index === total - 1;

  return (
    <Card 
      className="bg-white/90 backdrop-blur-sm border border-white/50"
      data-testid={`card-atividade-ebook-${atividade.id}`}
    >
      <CardContent className="p-0">
        <div className="flex items-center gap-4">
          {/* Activity Image - A4 format */}
          <div className="aspect-[3/4] w-32 overflow-hidden rounded-lg flex-shrink-0">
            <img
              src={atividade.imagemUrl}
              alt={`Atividade ${atividade.ordem}`}
              className="w-full h-full object-cover"
              data-testid={`img-atividade-ebook-${atividade.id}`}
            />
          </div>

          {/* Activity Info */}
          <div className="flex-1 min-w-0 py-4">
            <h3 
              className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate"
              data-testid={`text-atividade-ebook-nome-${atividade.id}`}
            >
              Atividade {atividade.ordem}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Posição: {index + 1} de {total}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-1 p-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onMoveUp}
              disabled={isFirst}
              className="h-8 w-8 p-0"
              data-testid={`button-move-up-${atividade.id}`}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onMoveDown}
              disabled={isLast}
              className="h-8 w-8 p-0"
              data-testid={`button-move-down-${atividade.id}`}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onRemove}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/20"
              data-testid={`button-remove-${atividade.id}`}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}