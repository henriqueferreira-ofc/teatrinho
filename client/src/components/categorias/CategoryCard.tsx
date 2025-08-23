import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Categoria } from '@shared/schema';

interface CategoryCardProps {
  categoria: Categoria;
  onClick: (categoria: Categoria) => void;
}

export function CategoryCard({ categoria, onClick }: CategoryCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 bg-white/90 backdrop-blur-sm border border-white/50"
      onClick={() => onClick(categoria)}
      data-testid={`card-categoria-${categoria.id}`}
    >
      <CardContent className="p-0">
        <div className="aspect-square overflow-hidden rounded-t-lg">
          <img
            src={categoria.imagemUrl}
            alt={categoria.nome}
            className="w-full h-full object-cover"
            data-testid={`img-categoria-${categoria.id}`}
          />
        </div>
        <div className="p-4">
          <h3 
            className="text-lg font-semibold text-gray-900 text-center"
            data-testid={`text-categoria-nome-${categoria.id}`}
          >
            {categoria.nome}
          </h3>
        </div>
      </CardContent>
    </Card>
  );
}