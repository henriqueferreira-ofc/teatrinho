import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { Atividade } from '@shared/schema';

interface ActivityCardProps {
  atividade: Atividade;
  onClick?: (atividade: Atividade) => void;
  isInEbook?: boolean;
}

export function ActivityCard({ atividade, onClick, isInEbook = false }: ActivityCardProps) {
  return (
    <Card 
      className={`${onClick ? 'cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105' : ''} bg-white/90 backdrop-blur-sm ${
        isInEbook 
          ? 'border-2 border-green-500 ring-2 ring-green-200 dark:ring-green-800' 
          : 'border border-white/50'
      }`}
      onClick={() => onClick?.(atividade)}
      data-testid={`card-atividade-${atividade.id}`}
    >
      <CardContent className="p-0 relative">
        <div className="aspect-[3/4] overflow-hidden rounded-lg">
          <img
            src={atividade.imagemUrl}
            alt={`Atividade ${atividade.ordem}`}
            className="w-full h-full object-cover"
            data-testid={`img-atividade-${atividade.id}`}
          />
        </div>
        
        {/* Check icon for activities in eBook */}
        {isInEbook && (
          <div 
            className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
            data-testid={`icon-check-${atividade.id}`}
          >
            <Check className="w-4 h-4 text-white" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}