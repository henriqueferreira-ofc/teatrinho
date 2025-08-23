import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ActivityGrid } from '@/components/atividades/ActivityGrid';
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

        {/* Lista de atividades */}
        {todasAtividades.length > 0 ? (
          <ActivityGrid
            atividades={atividades}
            total={todasAtividades.length}
            carregadas={atividades.length}
            temMais={temMaisAtividades}
            carregando={carregando}
            onLoadMore={carregarMais}
            onActivityClick={(atividade) => {
              // Aqui poderia abrir uma modal ou navegar para visualizar a atividade
              console.log('Atividade clicada:', atividade);
            }}
          />
        ) : (
          <div className="text-center py-12" data-testid="empty-state">
            <p className="text-gray-600 text-lg">
              Nenhuma atividade encontrada para esta categoria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}