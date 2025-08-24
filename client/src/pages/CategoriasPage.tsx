import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { CategoryGrid } from '@/components/categorias/CategoryGrid';
import { Categoria } from '@shared/schema';
import categoriesData from '@/data/categorias.json';

// Tipo para navegação entre telas
type AppTab = 'home' | 'categories' | 'ebooks' | 'videos' | 'partnerships' | 'profile' | 'atividades-categoria' | 'ebook-details' | 'detalhe-ebook';

interface CategoriasPageProps {
  onNavigate?: (tab: AppTab, data?: any) => void;
  onBack?: () => void;
}

export default function CategoriasPage({ onNavigate, onBack }: CategoriasPageProps) {
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
        {/* Header com navegação */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              data-testid="button-voltar-categorias"
            >
              <ArrowLeft size={16} className="mr-2" />
              Voltar
            </Button>
          </div>
          
          <div className="text-center">
            <h1 
              className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2"
              data-testid="text-categorias-titulo"
            >
              Escolha uma Categoria
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Selecione uma categoria para ver as atividades disponíveis
            </p>
          </div>
        </div>

        {/* Categories Section */}
        <div className="mb-6">
          {categorias.length > 0 ? (
            <CategoryGrid 
              categorias={categorias} 
              onCategoryClick={handleCategoryClick} 
            />
          ) : (
            <div className="text-center py-8" data-testid="loading-categorias">
              <p className="text-gray-600 dark:text-gray-400">Carregando categorias...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}