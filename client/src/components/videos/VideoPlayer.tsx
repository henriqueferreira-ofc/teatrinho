import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, ExternalLink, Crown } from 'lucide-react';
import type { VideoAtividade } from '@shared/schema';

interface VideoPlayerProps {
  video: VideoAtividade;
  isSubscriber: boolean;
  onSubscriptionRequired?: () => void;
}

export function VideoPlayer({ video, isSubscriber, onSubscriptionRequired }: VideoPlayerProps) {
  const [showPreviewOverlay, setShowPreviewOverlay] = useState(false);
  const [previewTimeLeft, setPreviewTimeLeft] = useState<number | null>(null);
  
  const { 
    titulo, 
    videoUrl, 
    plataforma, 
    premium, 
    trailerStart = 0, 
    trailerEnd 
  } = video;

  const canAccessFull = !premium || isSubscriber;
  const hasPreviewLimit = premium && !isSubscriber && trailerEnd;

  // Extrair ID do YouTube da URL
  const getYouTubeVideoId = (url: string): string | null => {
    const regexPatterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    
    for (const pattern of regexPatterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  // Construir URL do embed do YouTube com parâmetros
  const buildYouTubeEmbedUrl = (videoId: string): string => {
    const baseUrl = `https://www.youtube.com/embed/${videoId}`;
    const params = new URLSearchParams({
      autoplay: '1',
      rel: '0',
      modestbranding: '1',
      iv_load_policy: '3',
    });

    // Se tem limitação de prévia, definir tempo de início e fim
    if (hasPreviewLimit && trailerEnd) {
      params.set('start', trailerStart.toString());
      params.set('end', trailerEnd.toString());
    }

    return `${baseUrl}?${params.toString()}`;
  };

  const renderYouTubePlayer = () => {
    const videoId = getYouTubeVideoId(videoUrl);
    if (!videoId) {
      return (
        <div className="aspect-video bg-gray-100 flex items-center justify-center">
          <p className="text-gray-600">URL de vídeo inválida</p>
        </div>
      );
    }

    const embedUrl = buildYouTubeEmbedUrl(videoId);

    return (
      <div className="relative aspect-video">
        <iframe
          src={embedUrl}
          title={titulo}
          className="w-full h-full rounded-lg"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          data-testid="iframe-youtube-player"
        />
        
        {/* Overlay de prévia */}
        {hasPreviewLimit && showPreviewOverlay && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
            <Card className="max-w-md mx-4">
              <CardContent className="p-6 text-center">
                <Crown className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">
                  Prévia finalizada
                </h3>
                <p className="text-gray-600 mb-4">
                  Para assistir o vídeo completo, você precisa de uma assinatura ativa.
                </p>
                <Button 
                  onClick={onSubscriptionRequired}
                  className="w-full"
                  data-testid="button-subscription-cta"
                >
                  Ativar Assinatura para Assistir Completo
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  };

  const renderFallbackPlayer = () => {
    return (
      <div className="relative aspect-video bg-gray-100 flex items-center justify-center rounded-lg">
        {video.thumbnailUrl ? (
          <div className="relative w-full h-full">
            <img
              src={video.thumbnailUrl}
              alt={titulo}
              className="w-full h-full object-cover rounded-lg"
              data-testid="img-video-fallback-thumbnail"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Button
                size="lg"
                onClick={() => window.open(videoUrl, '_blank')}
                className="bg-white/90 text-blue-600 hover:bg-white"
                data-testid="button-external-link"
              >
                <ExternalLink className="h-5 w-5 mr-2" />
                Assistir no {plataforma === 'vimeo' ? 'Vimeo' : 'Player Externo'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <Button
              onClick={() => window.open(videoUrl, '_blank')}
              variant="outline"
              data-testid="button-external-link-fallback"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Assistir no {plataforma === 'vimeo' ? 'Vimeo' : 'Player Externo'}
            </Button>
          </div>
        )}
      </div>
    );
  };

  // Simular controle de tempo de prévia (em implementação real seria controlado pelo player)
  useEffect(() => {
    if (hasPreviewLimit && trailerEnd) {
      const previewDuration = trailerEnd - trailerStart;
      const timer = setTimeout(() => {
        setShowPreviewOverlay(true);
      }, previewDuration * 1000);

      return () => clearTimeout(timer);
    }
  }, [hasPreviewLimit, trailerStart, trailerEnd]);

  return (
    <div className="space-y-4">
      {/* Status de acesso */}
      {premium && (
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
            <Crown className="h-3 w-3 mr-1" />
            Conteúdo Premium
          </Badge>
          
          {!isSubscriber && (
            <Badge variant="outline" className="text-orange-600 border-orange-300">
              {hasPreviewLimit ? `Prévia: ${trailerEnd! - trailerStart}s` : 'Prévia disponível'}
            </Badge>
          )}
        </div>
      )}

      {/* Player */}
      <div data-testid={`video-player-${video.id}`}>
        {plataforma === 'youtube' ? renderYouTubePlayer() : renderFallbackPlayer()}
      </div>

      {/* Avisos para usuários sem assinatura */}
      {premium && !isSubscriber && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Crown className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Conteúdo Premium Limitado
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  {hasPreviewLimit 
                    ? `Você pode assistir os primeiros ${trailerEnd! - trailerStart} segundos. Para ver o vídeo completo, ative sua assinatura.`
                    : 'Este é um conteúdo premium. Ative sua assinatura para ter acesso completo.'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}