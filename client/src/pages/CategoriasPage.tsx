import React, { useState, useEffect } from 'react';
import { CategoryGrid } from '@/components/categorias/CategoryGrid';
import { Categoria } from '@shared/schema';
import categoriesData from '@/data/categorias.json';

// Tipo para navegação entre telas
type AppTab = 'home' | 'categories' | 'ebooks' | 'videos' | 'partnerships' | 'profile' | 'atividades-categoria' | 'ebook-details';

interface CategoriasPageProps {
  onNavigate?: (tab: AppTab, data?: any) => void;
}

export default function CategoriasPage({ onNavigate }: CategoriasPageProps) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    // Carregar categorias dos dados JSON
    try {
      const categoriasOrdenadas = (categoriesData as Categoria[]).sort((a, b) => a.ordem - b.ordem);
      setCategorias(categoriasOrdenadas);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  }, []);

  const handleCategoryClick = (categoria: Categoria) => {
    // Navegar para a página de atividades da categoria
    onNavigate?.('atividades-categoria', categoria);
  };

  return (
    <div className="p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="text-categorias-titulo">
            Categorias de Atividades
          </h1>
          <p className="text-gray-600" data-testid="text-categorias-descricao">
            Explore nossas atividades organizadas por categorias temáticas.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="mb-6">
          {categorias.length > 0 ? (
            <CategoryGrid 
              categorias={categorias} 
              onCategoryClick={handleCategoryClick} 
            />
          ) : (
            <div className="text-center py-8" data-testid="loading-categorias">
              <p className="text-gray-600">Carregando categorias...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}