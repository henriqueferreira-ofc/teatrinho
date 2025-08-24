import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ActivityCard } from '@/components/atividades/ActivityCard';
import { useEBooks } from '@/contexts/EBookContext';
import { Categoria, Atividade } from '@shared/schema';
import atividadesData from '@/data/atividades.json';

// Tipo para navegação entre telas
type AppTab = 'home' | 'categories' | 'ebooks' | 'videos' | 'partnerships' | 'profile' | 'atividades-categoria';

interface AtividadesPorCategoriaPageProps {
  categoria: Categoria;
  onNavigate?: (tab: AppTab) => void;
}

const ATIVIDADES_POR_PAGINA = 20;

export default function AtividadesPorCategoriaPage({ 
  categoria, 
  onNavigate 
}: AtividadesPorCategoriaPageProps) {
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [todasAtividades, setTodasAtividades] = useState<Atividade[]>([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [carregando, setCarregando] = useState(false);
  const { selectedEbook, toggleActivityInEbook, isActivityInEbook } = useEBooks();

  useEffect(() => {
    // Carregar todas as atividades da categoria
    try {
      const atividadesDaCategoria = (atividadesData as Atividade[])
        .filter(atividade => {
          // Se for "todas-as-atividades", mostrar todas
          if (categoria.id === 'todas-as-atividades') {
            return true;
          }
          return atividade.categoria === categoria.id;
        })
        .sort((a, b) => a.ordem - b.ordem);
      
      setTodasAtividades(atividadesDaCategoria);
      
      // Carregar primeira página
      const primeiraPagina = atividadesDaCategoria.slice(0, ATIVIDADES_POR_PAGINA);
      setAtividades(primeiraPagina);
      setPaginaAtual(1);
    } catch (error) {
      console.error('Erro ao carregar atividades:', error);
    }
  }, [categoria.id]);

  const carregarMais = async () => {
    setCarregando(true);
    
    try {
      // Simular delay de carregamento
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const proximaPagina = paginaAtual + 1;
      const inicio = (proximaPagina - 1) * ATIVIDADES_POR_PAGINA;
      const fim = inicio + ATIVIDADES_POR_PAGINA;
      
      const novasAtividades = todasAtividades.slice(inicio, fim);
      setAtividades(prev => [...prev, ...novasAtividades]);
      setPaginaAtual(proximaPagina);
    } catch (error) {
      console.error('Erro ao carregar mais atividades:', error);
    } finally {
      setCarregando(false);
    }
  };

  const temMaisAtividades = atividades.length < todasAtividades.length;

  const handleActivityClick = async (atividade: Atividade) => {
    if (!selectedEbook) return;
    
    await toggleActivityInEbook(selectedEbook.id, atividade.id);
  };

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header com navegação e título */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate?.('home')}
              data-testid="button-voltar"
            >
              <ArrowLeft size={16} className="mr-2" />
              Voltar
            </Button>
          </div>
          
          <div className="text-center">
            <h1 
              className="text-2xl font-bold text-gray-900 mb-2"
              data-testid="text-categoria-nome"
            >
              {categoria.nome}
            </h1>
            <div className="flex justify-center gap-4 text-sm text-gray-600">
              <span data-testid="text-total-atividades">
                Total: <strong>{todasAtividades.length}</strong> atividades
              </span>
              <span data-testid="text-atividades-carregadas">
                Carregadas: <strong>{atividades.length}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* eBook Selection Info */}
        {selectedEbook && (
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 mb-6 border border-blue-200 dark:border-blue-800">
            <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
              Selecionando atividades para: {selectedEbook.nome}
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Clique nas atividades para adicioná-las ou removê-las do seu eBook. 
              Atividades já adicionadas são marcadas com uma borda verde e ícone de check.
            </p>
          </div>
        )}

        {/* Lista de atividades */}
        {todasAtividades.length > 0 ? (
          <div className="space-y-6">
            {/* Contador de atividades */}
            <div className="text-center" data-testid="contador-atividades">
              <p className="text-gray-600 dark:text-gray-400">
                Exibindo <span className="font-semibold">{atividades.length}</span> de{' '}
                <span className="font-semibold">{todasAtividades.length}</span> atividades
              </p>
            </div>

            {/* Grid customizado para integração com eBook */}
            <div 
              className="grid grid-cols-2 lg:grid-cols-4 gap-4"
              data-testid="grid-atividades"
            >
              {atividades.map((atividade) => (
                <ActivityCard
                  key={atividade.id}
                  atividade={atividade}
                  onClick={selectedEbook ? handleActivityClick : undefined}
                  isInEbook={selectedEbook ? isActivityInEbook(selectedEbook.id, atividade.id) : false}
                />
              ))}
            </div>

            {/* Botão Carregar Mais */}
            {temMaisAtividades && (
              <div className="text-center">
                <Button
                  onClick={carregarMais}
                  disabled={carregando}
                  className="px-8 py-2"
                  data-testid="button-carregar-mais"
                >
                  {carregando ? (
                    <>
                      Carregando...
                    </>
                  ) : (
                    'Carregar Mais'
                  )}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12" data-testid="empty-state">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Nenhuma atividade encontrada para esta categoria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}