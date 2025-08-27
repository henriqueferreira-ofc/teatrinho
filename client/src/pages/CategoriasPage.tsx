import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Book } from 'lucide-react';
import { useEBooks } from '@/contexts/EBookContext';
import atividades from '@/data/atividades.json';

interface Categoria {
  nome: string;
  atividades: any[];
}

interface CategoriasPageProps {
  onNavigate: (tab: any, data?: any) => void;
}

const CategoriasPage = ({ onNavigate }: CategoriasPageProps) => {
  const [, setLocation] = useLocation();
  const { selectedEbook } = useEBooks();

  // Agrupar atividades por categoria
  const categorias: Categoria[] = [];
  const categoriaMap = new Map<string, any[]>();

  atividades.forEach((atividade) => {
    if (!categoriaMap.has(atividade.categoria)) {
      categoriaMap.set(atividade.categoria, []);
    }
    categoriaMap.get(atividade.categoria)!.push(atividade);
  });

  categoriaMap.forEach((atividades, nome) => {
    categorias.push({ nome, atividades });
  });

  const handleCategoriaClick = (categoria: string) => {
    // Usar onNavigate para navegar para a categoria
    const categoriaData = categorias.find(c => c.nome === categoria);
    if (categoriaData) {
      onNavigate('atividades-categoria', categoriaData);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate('ebooks')}
          className="p-2"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Categorias de Atividades
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Selecione uma categoria para adicionar atividades
          </p>
        </div>
      </div>

      {/* eBook Selection Info */}
      {selectedEbook && (
        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 mb-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Book className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium text-blue-900 dark:text-blue-100">
                Adicionando atividades ao eBook:
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {selectedEbook.nome} • {selectedEbook.atividades.length} atividades
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Categorias Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categorias.map((categoria) => (
          <div
            key={categoria.nome}
            onClick={() => handleCategoriaClick(categoria.nome)}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-md transition-shadow"
            data-testid={`card-categoria-${categoria.nome.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {categoria.nome}
              </h3>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Book className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {categoria.atividades.length} atividades disponíveis
            </p>
            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              Clique para ver atividades →
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {categorias.length === 0 && (
        <div className="text-center py-12">
          <Book className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Nenhuma categoria encontrada
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Não há atividades disponíveis no momento.
          </p>
        </div>
      )}
    </div>
  );
};

export default CategoriasPage;