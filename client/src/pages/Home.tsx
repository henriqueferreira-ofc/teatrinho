import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CategoryGrid } from '@/components/categorias/CategoryGrid';
import { Categoria } from '@shared/schema';
import categoriesData from '@/data/categorias.json';

// Tipo para navegação entre telas
type AppTab = 'home' | 'categories' | 'ebooks' | 'videos' | 'partnerships' | 'profile' | 'atividades-categoria' | 'ebook-details';

interface HomeProps {
  onNavigate?: (tab: AppTab, data?: any) => void;
}

export default function Home({ onNavigate }: HomeProps = {}) {
  const { userProfile } = useAuth();
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
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white mb-6">
          <h2 className="text-2xl font-bold mb-2 text-black" data-testid="text-welcome">
            Bem-vindo de volta, {userProfile?.name?.split(' ')[0] || 'Usuário'}!
          </h2>
          <p className="text-black">Explore nossas atividades organizadas por categorias.</p>
        </div>

        {/* Categories Section */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4" data-testid="text-categorias-titulo">
            Categorias de Atividades
          </h3>
          
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