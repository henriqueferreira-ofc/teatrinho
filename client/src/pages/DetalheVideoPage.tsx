import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Clock, 
  Download, 
  ExternalLink, 
  Crown, 
  Tag,
  FileText,
  Zap
} from 'lucide-react';
import { VideoPlayer } from '@/components/videos/VideoPlayer';
import { useVideos } from '@/hooks/useVideos';
import { useAuth } from '@/contexts/AuthContext';
import type { VideoCategoria, VideoAtividade } from '@shared/schema';

interface DetalheVideoPageProps {
  video: VideoAtividade;
  categoria: VideoCategoria;
  onNavigate?: (tab: any, data?: any) => void;
}

export default function DetalheVideoPage({ 
  video: initialVideo,
  categoria, 
  onNavigate 
}: DetalheVideoPageProps) {
  const { currentVideo, getVideo, loadingCurrentVideo } = useVideos();
  const { isSubscriber } = useAuth();
  
  // Use current video from context se disponível, senão use initial video
  const video = currentVideo || initialVideo;
  
  useEffect(() => {
    // Carregar detalhes completos do vídeo
    if (initialVideo?.id) {
      getVideo(initialVideo.id);
    }
  }, [initialVideo?.id]);

  const formatDuration = (seconds: number | undefined): string => {
    if (!seconds) return 'Duração não informada';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleBackClick = () => {
    if (onNavigate) {
      onNavigate('videos-categoria', categoria);
    }
  };

  const handleSubscriptionClick = () => {
    // Redirecionar para página de assinatura (temporário)
    window.open('https://google.com', '_blank');
  };

  const handleDownloadMaterial = (url: string, titulo: string) => {
    if (!isSubscriber && video.premium) {
      handleSubscriptionClick();
      return;
    }
    window.open(url, '_blank');
  };

  const handleDownloadTranscription = () => {
    if (!isSubscriber && video.premium) {
      handleSubscriptionClick();
      return;
    }
    if (video.transcricaoUrl) {
      window.open(video.transcricaoUrl, '_blank');
    }
  };

  if (loadingCurrentVideo) {
    return (
      <div className="p-4 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-48"></div>
            <div className="aspect-video bg-gray-300 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="p-4 pb-8">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Vídeo não encontrado</h2>
          <p className="text-gray-600 mb-6">O vídeo que você está procurando não foi encontrado.</p>
          <Button onClick={handleBackClick} data-testid="button-back-error">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Categoria
          </Button>
        </div>
      </div>
    );
  }

  const canAccessFull = !video.premium || isSubscriber;
  const hasDownloads = video.materiaisRelacionados && video.materiaisRelacionados.length > 0;

  return (
    <div className="p-4 pb-8">
      <div className="max-w-4xl mx-auto">
        {/* Header com navegação */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleBackClick}
            data-testid="button-back-to-category"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para {categoria.nome}
          </Button>
        </div>

        {/* Player de Vídeo */}
        <div className="mb-6" data-testid={`video-player-section-${video.id}`}>
          <VideoPlayer 
            video={video}
            isSubscriber={isSubscriber}
            onSubscriptionRequired={handleSubscriptionClick}
          />
        </div>

        {/* Informações do Vídeo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Principal - Detalhes */}
          <div className="lg:col-span-2 space-y-6">
            {/* Título e Metadados */}
            <div>
              <div className="flex items-start justify-between mb-3">
                <h1 
                  className="text-3xl font-bold text-gray-900 flex-1"
                  data-testid={`text-video-title-${video.id}`}
                >
                  {video.titulo}
                </h1>
                
                {/* Badges de status */}
                <div className="flex flex-col items-end gap-2 ml-4">
                  {video.premium && (
                    <Badge 
                      variant="secondary" 
                      className="bg-amber-100 text-amber-800"
                      data-testid={`badge-premium-${video.id}`}
                    >
                      <Crown className="h-3 w-3 mr-1" />
                      PREMIUM
                    </Badge>
                  )}
                  {!isSubscriber && (
                    <Button 
                      size="sm"
                      onClick={handleSubscriptionClick}
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                      data-testid="button-subscribe-header"
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      Assinar
                    </Button>
                  )}
                </div>
              </div>

              {/* Metadados */}
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span data-testid={`text-duration-${video.id}`}>
                    {formatDuration(video.duracaoSegundos)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  <span>{categoria.nome}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${video.premium ? 'bg-amber-500' : 'bg-green-500'}`}></span>
                  <span>{video.premium ? 'Premium' : 'Gratuito'}</span>
                </div>
              </div>

              {/* Descrição */}
              {video.descricao && (
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">Descrição</h3>
                  <p 
                    className="text-gray-700 leading-relaxed"
                    data-testid={`text-description-${video.id}`}
                  >
                    {video.descricao}
                  </p>
                </div>
              )}
            </div>

            <Separator />

            {/* Tags */}
            {video.tags && video.tags.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {video.tags.map((tag, index) => (
                    <Badge 
                      key={index}
                      variant="outline" 
                      className="text-blue-600 border-blue-200"
                      data-testid={`badge-tag-detail-${video.id}-${index}`}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Downloads e Materiais */}
          <div className="space-y-6">
            {/* Downloads */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Download className="h-5 w-5" />
                  Downloads
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Transcrição */}
                {video.transcricaoUrl && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleDownloadTranscription}
                    disabled={!canAccessFull}
                    data-testid={`button-download-transcription-${video.id}`}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Transcrição
                    {!canAccessFull && <Crown className="h-3 w-3 ml-auto text-amber-500" />}
                  </Button>
                )}

                {/* Materiais Relacionados */}
                {hasDownloads && video.materiaisRelacionados!.map((material, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleDownloadMaterial(material.url, material.titulo)}
                    disabled={!canAccessFull}
                    data-testid={`button-download-material-${video.id}-${index}`}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {material.titulo}
                    <span className="text-xs text-gray-500 ml-auto mr-2">
                      {material.tipo.toUpperCase()}
                    </span>
                    {!canAccessFull && <Crown className="h-3 w-3 text-amber-500" />}
                  </Button>
                ))}

                {/* Estado vazio */}
                {!video.transcricaoUrl && !hasDownloads && (
                  <div className="text-center py-6 text-gray-500">
                    <Download className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">Nenhum material disponível</p>
                  </div>
                )}

                {/* Aviso para não assinantes */}
                {!canAccessFull && (hasDownloads || video.transcricaoUrl) && (
                  <Card className="bg-amber-50 border-amber-200 mt-4">
                    <CardContent className="p-3">
                      <div className="flex items-start space-x-2">
                        <Crown className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-amber-800 mb-1">
                            Downloads Premium
                          </p>
                          <p className="text-xs text-amber-700">
                            Assinatura necessária para baixar materiais.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            {/* Informações Técnicas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plataforma:</span>
                  <span className="font-medium capitalize">{video.plataforma}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duração:</span>
                  <span className="font-medium">{formatDuration(video.duracaoSegundos)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Categoria:</span>
                  <span className="font-medium">{categoria.nome}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipo:</span>
                  <span className={`font-medium ${video.premium ? 'text-amber-600' : 'text-green-600'}`}>
                    {video.premium ? 'Premium' : 'Gratuito'}
                  </span>
                </div>
                {video.premium && video.trailerEnd && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Prévia:</span>
                    <span className="font-medium">{video.trailerEnd - (video.trailerStart || 0)}s</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}