import React from 'react';
import { CategoriaCardVideo } from './CategoriaCardVideo';
import { Skeleton } from '@/components/ui/skeleton';
import { Play } from 'lucide-react';
import type { VideoCategoria } from '@shared/schema';

interface CategoriaGridVideoProps {
  categorias: VideoCategoria[];
  loading?: boolean;
  onCategoriaClick: (categoria: VideoCategoria) => void;
}

export function CategoriaGridVideo({ 
  categorias, 
  loading = false, 
  onCategoriaClick 
}: CategoriaGridVideoProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <Skeleton className="aspect-video w-full rounded-lg" />
            <div className="space-y-2 px-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-14" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (categorias.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
          <Play className="h-8 w-8 text-gray-400" />
        </div>
        <h3 
          className="text-lg font-semibold text-gray-900 mb-2"
          data-testid="text-no-categories"
        >
          Nenhuma categoria encontrada
        </h3>
        <p 
          className="text-gray-600"
          data-testid="text-no-categories-description"
        >
          Não há categorias de vídeos disponíveis no momento.
        </p>
      </div>
    );
  }

  return (
    <div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      data-testid="grid-categorias-videos"
    >
      {categorias.map((categoria) => (
        <CategoriaCardVideo
          key={categoria.id}
          categoria={categoria}
          onClick={onCategoriaClick}
        />
      ))}
    </div>
  );
}