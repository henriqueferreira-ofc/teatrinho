import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Clock, Crown, Download } from 'lucide-react';
import type { VideoAtividade } from '@shared/schema';

interface VideoCardProps {
  video: VideoAtividade;
  isSubscriber: boolean;
  onClick: (video: VideoAtividade) => void;
}

export function VideoCard({ video, isSubscriber, onClick }: VideoCardProps) {
  const { 
    titulo, 
    descricao, 
    thumbnailUrl, 
    duracaoSegundos, 
    premium, 
    tags,
    materiaisRelacionados 
  } = video;

  const formatDuration = (seconds: number | undefined): string => {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const canAccessFull = !premium || isSubscriber;
  const hasDownloads = materiaisRelacionados && materiaisRelacionados.length > 0;

  return (
    <Card 
      className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.01] bg-white group"
      onClick={() => onClick(video)}
      data-testid={`card-video-${video.id}`}
    >
      <CardContent className="p-0">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden rounded-t-lg">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={`Thumbnail ${titulo}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              data-testid={`img-video-thumbnail-${video.id}`}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
              <Play className="h-12 w-12 text-blue-500" />
            </div>
          )}
          
          {/* Overlay com duração */}
          {duracaoSegundos && (
            <div className="absolute bottom-2 right-2">
              <Badge 
                variant="secondary" 
                className="bg-black/70 text-white text-xs"
                data-testid={`badge-duration-${video.id}`}
              >
                <Clock className="h-3 w-3 mr-1" />
                {formatDuration(duracaoSegundos)}
              </Badge>
            </div>
          )}

          {/* Badge Premium */}
          {premium && (
            <div className="absolute top-2 right-2">
              <Badge 
                variant="secondary" 
                className="bg-amber-500 text-white border-0"
                data-testid={`badge-premium-${video.id}`}
              >
                <Crown className="h-3 w-3 mr-1" />
                PREMIUM
              </Badge>
            </div>
          )}

          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
            <Button
              size="lg"
              className="rounded-full bg-white/90 text-blue-600 hover:bg-white shadow-lg"
              data-testid={`button-play-${video.id}`}
            >
              <Play className="h-6 w-6 ml-1" />
            </Button>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 
              className="font-semibold text-lg text-gray-900 line-clamp-2 flex-1"
              data-testid={`text-video-titulo-${video.id}`}
            >
              {titulo}
            </h3>
            
            {/* Ícone de downloads disponíveis */}
            {hasDownloads && (
              <div className={`ml-2 ${canAccessFull ? 'text-green-600' : 'text-gray-400'}`}>
                <Download 
                  className="h-4 w-4" 
                  data-testid={`icon-downloads-${video.id}`}
                />
              </div>
            )}
          </div>
          
          {descricao && (
            <p 
              className="text-sm text-gray-600 mb-3 line-clamp-2"
              data-testid={`text-video-descricao-${video.id}`}
            >
              {descricao}
            </p>
          )}
          
          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {tags.slice(0, 3).map((tag, index) => (
                <Badge 
                  key={index}
                  variant="outline" 
                  className="text-xs text-blue-600 border-blue-200"
                  data-testid={`badge-tag-${video.id}-${index}`}
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

          {/* Status de Acesso */}
          {premium && !isSubscriber && (
            <div 
              className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded"
              data-testid={`text-premium-notice-${video.id}`}
            >
              Prévia disponível • Assinatura necessária para ver completo
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}