import React from 'react';
import { ActivityCard } from './ActivityCard';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Atividade } from '@shared/schema';

interface ActivityGridProps {
  atividades: Atividade[];
  total: number;
  carregadas: number;
  temMais: boolean;
  carregando: boolean;
  onLoadMore: () => void;
  onActivityClick?: (atividade: Atividade) => void;
}

export function ActivityGrid({ 
  atividades, 
  total, 
  carregadas, 
  temMais, 
  carregando, 
  onLoadMore, 
  onActivityClick 
}: ActivityGridProps) {
  return (
    <div className="space-y-6">
      {/* Contador de atividades */}
      <div className="text-center" data-testid="contador-atividades">
        <p className="text-gray-600">
          Exibindo <span className="font-semibold">{carregadas}</span> de{' '}
          <span className="font-semibold">{total}</span> atividades
        </p>
      </div>

      {/* Grid de atividades - sempre 2 colunas */}
      <div 
        className="grid grid-cols-2 gap-4"
        data-testid="grid-atividades"
      >
        {atividades.map((atividade) => (
          <ActivityCard
            key={atividade.id}
            atividade={atividade}
            onClick={onActivityClick}
          />
        ))}
      </div>

      {/* Botão Carregar Mais */}
      {temMais && (
        <div className="text-center">
          <Button
            onClick={onLoadMore}
            disabled={carregando}
            className="px-8 py-2"
            data-testid="button-carregar-mais"
          >
            {carregando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Carregando...
              </>
            ) : (
              'Carregar Mais'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}