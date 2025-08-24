import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Play, Zap } from 'lucide-react';
import { CategoriaGridVideo } from '@/components/videos/CategoriaGridVideo';
import { useVideos } from '@/hooks/useVideos';
import { useAuth } from '@/contexts/AuthContext';
import type { VideoCategoria } from '@shared/schema';

interface VideosPageProps {
  onNavigate?: (tab: any, data?: any) => void;
}

export default function VideosPage({ onNavigate }: VideosPageProps) {
  const { 
    categorias, 
    loadingCategorias, 
    error, 
    listCategorias, 
    clearError 
  } = useVideos();
  
  const { isSubscriber } = useAuth();

  // Carregar categorias ao montar o componente
  useEffect(() => {
    listCategorias();
  }, []);

  const handleCategoriaClick = (categoria: VideoCategoria) => {
    if (onNavigate) {
      onNavigate('videos-categoria', categoria);
    }
  };

  const handleSubscriptionClick = () => {
    // Redirecionar para página de assinatura (temporário)
    window.open('https://google.com', '_blank');
  };

  return (
    <div className="p-4 pb-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 
                className="text-3xl font-bold text-gray-900 mb-2"
                data-testid="text-videos-title"
              >
                Vídeos Educativos
              </h1>
              <p 
                className="text-gray-600"
                data-testid="text-videos-subtitle"
              >
                Explore nosso catálogo de vídeos organizados por categorias
              </p>
            </div>

            {/* Status da assinatura */}
            <div className="hidden md:flex items-center gap-3">
              {isSubscriber ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm font-medium">Assinante Ativo</span>
                </div>
              ) : (
                <Button 
                  onClick={handleSubscriptionClick}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                  data-testid="button-subscribe"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Ativar Assinatura
                </Button>
              )}
            </div>
          </div>

          {/* Barra de busca (preparada para futuras implementações) */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por categoria ou tag..."
              className="pl-10"
              disabled
              data-testid="input-search-videos"
            />
          </div>
        </div>

        {/* Aviso para usuários não assinantes */}
        {!isSubscriber && (
          <Card className="mb-6 bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Play className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800 mb-1">
                    Acesso Limitado
                  </p>
                  <p className="text-xs text-amber-700 mb-3">
                    Você pode navegar por todo o catálogo, mas vídeos premium têm reprodução limitada. 
                    Ative sua assinatura para acesso completo a todos os conteúdos.
                  </p>
                  <Button 
                    size="sm"
                    onClick={handleSubscriptionClick}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                    data-testid="button-subscribe-card"
                  >
                    Ativar Assinatura para Assistir Completo
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
                  <p className="text-sm font-medium text-red-800">Erro ao carregar categorias</p>
                  <p className="text-xs text-red-700 mt-1">{error}</p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      clearError();
                      listCategorias();
                    }}
                    className="mt-2 border-red-300 text-red-700 hover:bg-red-100"
                    data-testid="button-retry-categories"
                  >
                    Tentar novamente
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Grid de Categorias */}
        <div data-testid="section-categorias-videos">
          <CategoriaGridVideo
            categorias={categorias}
            loading={loadingCategorias}
            onCategoriaClick={handleCategoriaClick}
          />
        </div>

        {/* Estatísticas (footer da página) */}
        {categorias.length > 0 && !loadingCategorias && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600" data-testid="text-stats-categories">
                  {categorias.length}
                </p>
                <p className="text-sm text-gray-600">Categorias</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600" data-testid="text-stats-videos">
                  {categorias.reduce((total, cat) => total + (cat.qtdVideos || 0), 0)}
                </p>
                <p className="text-sm text-gray-600">Vídeos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600" data-testid="text-stats-premium">
                  {isSubscriber ? 'Acesso Total' : 'Acesso Limitado'}
                </p>
                <p className="text-sm text-gray-600">Status</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}