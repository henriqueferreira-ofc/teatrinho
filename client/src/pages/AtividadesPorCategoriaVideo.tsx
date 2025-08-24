import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, Filter, Zap } from 'lucide-react';
import { VideoList } from '@/components/videos/VideoList';
import { useVideos } from '@/hooks/useVideos';
import { useAuth } from '@/contexts/AuthContext';
import type { VideoCategoria, VideoAtividade } from '@shared/schema';

interface AtividadesPorCategoriaVideoProps {
  categoria: VideoCategoria;
  onNavigate?: (tab: any, data?: any) => void;
}

export default function AtividadesPorCategoriaVideo({ 
  categoria, 
  onNavigate 
}: AtividadesPorCategoriaVideoProps) {
  const { 
    videosByCategoria, 
    loadingVideos, 
    error, 
    listVideosByCategoria, 
    clearError 
  } = useVideos();
  
  const { isSubscriber } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const videos = videosByCategoria[categoria.id] || [];
  const loading = loadingVideos[categoria.id] || false;

  // Carregar vídeos da categoria ao montar o componente
  useEffect(() => {
    listVideosByCategoria(categoria.id);
  }, [categoria.id]);

  // Filtrar vídeos baseado na busca e tag selecionada
  const filteredVideos = videos.filter(video => {
    const matchesSearch = searchTerm === '' || 
      video.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = selectedTag === null || 
      (video.tags && video.tags.includes(selectedTag));

    return matchesSearch && matchesTag;
  });

  // Extrair todas as tags únicas dos vídeos
  const allTags = Array.from(new Set(
    videos.flatMap(video => video.tags || [])
  )).sort();

  const handleVideoClick = (video: VideoAtividade) => {
    if (onNavigate) {
      onNavigate('video-detalhe', { video, categoria });
    }
  };

  const handleBackClick = () => {
    if (onNavigate) {
      onNavigate('videos');
    }
  };

  const handleSubscriptionClick = () => {
    // Redirecionar para página de assinatura (temporário)
    window.open('https://google.com', '_blank');
  };

  const premiumVideos = videos.filter(v => v.premium).length;
  const freeVideos = videos.length - premiumVideos;

  return (
    <div className="p-4 pb-8">
      <div className="max-w-7xl mx-auto">
        {/* Header com navegação */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleBackClick}
              data-testid="button-back-to-categories"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Categorias
            </Button>
          </div>

          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 
                className="text-3xl font-bold text-gray-900 mb-2"
                data-testid={`text-categoria-title-${categoria.id}`}
              >
                {categoria.nome}
              </h1>
              {categoria.descricao && (
                <p 
                  className="text-gray-600 mb-3"
                  data-testid={`text-categoria-description-${categoria.id}`}
                >
                  {categoria.descricao}
                </p>
              )}
              
              {/* Estatísticas rápidas */}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span data-testid="text-total-videos">
                  {videos.length} vídeos
                </span>
                {premiumVideos > 0 && (
                  <span data-testid="text-premium-videos">
                    {premiumVideos} premium
                  </span>
                )}
                {freeVideos > 0 && (
                  <span data-testid="text-free-videos">
                    {freeVideos} gratuitos
                  </span>
                )}
              </div>
            </div>

            {/* Status da assinatura */}
            <div className="hidden md:flex items-center gap-3">
              {isSubscriber ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm font-medium">Acesso Total</span>
                </div>
              ) : (
                <Button 
                  onClick={handleSubscriptionClick}
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                  data-testid="button-subscribe"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Ativar Assinatura
                </Button>
              )}
            </div>
          </div>

          {/* Filtros e busca */}
          <div className="space-y-4">
            {/* Barra de busca */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar vídeos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-videos"
              />
            </div>

            {/* Tags para filtro */}
            {allTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Tags:</span>
                <Button
                  variant={selectedTag === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTag(null)}
                  data-testid="button-filter-all"
                >
                  Todas
                </Button>
                {allTags.map((tag) => (
                  <Button
                    key={tag}
                    variant={selectedTag === tag ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTag(tag)}
                    data-testid={`button-filter-${tag}`}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Aviso para usuários não assinantes */}
        {!isSubscriber && premiumVideos > 0 && (
          <Card className="mb-6 bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Zap className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800 mb-1">
                    {premiumVideos} Vídeos Premium Nesta Categoria
                  </p>
                  <p className="text-xs text-amber-700 mb-3">
                    Você pode assistir prévias dos vídeos premium, mas precisa de uma assinatura para ver o conteúdo completo.
                  </p>
                  <Button 
                    size="sm"
                    onClick={handleSubscriptionClick}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                    data-testid="button-subscribe-card"
                  >
                    Ativar Assinatura para Acesso Completo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tratamento de erro */}
        {error && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">Erro ao carregar vídeos</p>
                  <p className="text-xs text-red-700 mt-1">{error}</p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      clearError();
                      listVideosByCategoria(categoria.id);
                    }}
                    className="mt-2 border-red-300 text-red-700 hover:bg-red-100"
                    data-testid="button-retry-videos"
                  >
                    Tentar novamente
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Vídeos */}
        <div data-testid="section-videos-list">
          {/* Resultado da busca */}
          {searchTerm && (
            <div className="mb-4">
              <p className="text-sm text-gray-600" data-testid="text-search-results">
                {filteredVideos.length} resultado(s) para "{searchTerm}"
              </p>
            </div>
          )}

          <VideoList
            videos={filteredVideos}
            loading={loading}
            isSubscriber={isSubscriber}
            onVideoClick={handleVideoClick}
          />
        </div>

        {/* Nenhum resultado */}
        {!loading && filteredVideos.length === 0 && videos.length > 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum vídeo encontrado
            </h3>
            <p className="text-gray-600 mb-4">
              Tente ajustar os filtros ou termos de busca.
            </p>
            <Button 
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedTag(null);
              }}
              data-testid="button-clear-filters"
            >
              Limpar filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}