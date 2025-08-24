import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Clock } from 'lucide-react';
import type { VideoCategoria } from '@shared/schema';

interface CategoriaCardVideoProps {
  categoria: VideoCategoria;
  onClick: (categoria: VideoCategoria) => void;
}

export function CategoriaCardVideo({ categoria, onClick }: CategoriaCardVideoProps) {
  const { nome, descricao, coverUrl, qtdVideos, tags } = categoria;

  return (
    <Card 
      className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] bg-white"
      onClick={() => onClick(categoria)}
      data-testid={`card-categoria-${categoria.id}`}
    >
      <CardContent className="p-0">
        {/* Imagem de Capa */}
        <div className="relative aspect-video overflow-hidden rounded-t-lg">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={`Categoria ${nome}`}
              className="w-full h-full object-cover"
              data-testid={`img-categoria-cover-${categoria.id}`}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
              <Play className="h-12 w-12 text-blue-500" />
            </div>
          )}
          
          {/* Overlay com quantidade de vídeos */}
          <div className="absolute top-2 right-2">
            <Badge 
              variant="secondary" 
              className="bg-black/70 text-white hover:bg-black/80"
              data-testid={`badge-qtd-videos-${categoria.id}`}
            >
              <Clock className="h-3 w-3 mr-1" />
              {qtdVideos} vídeos
            </Badge>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-4">
          <h3 
            className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1"
            data-testid={`text-categoria-nome-${categoria.id}`}
          >
            {nome}
          </h3>
          
          {descricao && (
            <p 
              className="text-sm text-gray-600 mb-3 line-clamp-2"
              data-testid={`text-categoria-descricao-${categoria.id}`}
            >
              {descricao}
            </p>
          )}
          
          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 3).map((tag, index) => (
                <Badge 
                  key={index}
                  variant="outline" 
                  className="text-xs text-blue-600 border-blue-200"
                  data-testid={`badge-tag-${categoria.id}-${index}`}
                >
                  {tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge variant="outline" className="text-xs text-gray-500">
                  +{tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}