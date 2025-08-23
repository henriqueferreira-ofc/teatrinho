import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Atividade } from '@shared/schema';

interface ActivityCardProps {
  atividade: Atividade;
  onClick?: (atividade: Atividade) => void;
}

export function ActivityCard({ atividade, onClick }: ActivityCardProps) {
  return (
    <Card 
      className={`${onClick ? 'cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105' : ''} bg-white/90 backdrop-blur-sm border border-white/50`}
      onClick={() => onClick?.(atividade)}
      data-testid={`card-atividade-${atividade.id}`}
    >
      <CardContent className="p-0">
        <div className="aspect-[3/4] overflow-hidden rounded-lg">
          <img
            src={atividade.imagemUrl}
            alt={`Atividade ${atividade.ordem}`}
            className="w-full h-full object-cover"
            data-testid={`img-atividade-${atividade.id}`}
          />
        </div>
      </CardContent>
    </Card>
  );
}