import React from 'react';
import { CategoryCard } from './CategoryCard';
import { Categoria } from '@shared/schema';

interface CategoryGridProps {
  categorias: Categoria[];
  onCategoryClick: (categoria: Categoria) => void;
}

export function CategoryGrid({ categorias, onCategoryClick }: CategoryGridProps) {
  return (
    <div 
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      data-testid="grid-categorias"
    >
      {categorias.map((categoria) => (
        <CategoryCard
          key={categoria.id}
          categoria={categoria}
          onClick={onCategoryClick}
        />
      ))}
    </div>
  );
}