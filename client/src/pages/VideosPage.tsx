import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Play, Zap, ChevronRight } from 'lucide-react';
import { CategoriaGridVideo } from '@/components/videos/CategoriaGridVideo';
import { useVideos } from '@/hooks/useVideos';
import { useAuth } from '@/contexts/AuthContext';
import { getVideoCategoryImageUrl } from '@/lib/firebase';
import type { VideoCategoria } from '@shared/schema';

// Importando as imagens das categorias como fallback
import comunicacaoImg from '@assets/1_1756319870173.jpg';
import comportamentoImg from '@assets/2_1756319870182.jpg';
import compreendendoImg from '@assets/3_1756319870182.jpg';
import atividadesImg from '@assets/4_1756319870183.jpg';

interface VideosPageProps {
  onNavigate?: (tab: any, data?: any) => void;
}

export default function VideosPage({ onNavigate }: VideosPageProps) {
  const { 
    categorias, 
    loadingCategorias, 
    error, 
    listCategorias, 
    clearError,
    setSelectedVideoCategory 
  } = useVideos();
  
  const { isSubscriber } = useAuth();

  // Estado para as categorias especializadas com imagens do Firebase Storage
  const [categoriasAutismo, setCategoriasAutismo] = useState([
    {
      id: 'compreendendo',
      nome: 'Compreendendo o Autismo',
      descricao: 'Para mães que estão iniciando na jornada e precisam de informação clara e acessível.',
      imagemUrl: compreendendoImg,
      cor: 'from-teal-400 to-teal-600',
      ordem: 1
    },
    {
      id: 'atividades',
      nome: 'Atividades Práticas & Estímulos',
      descricao: 'Ensinar mães a fazerem atividades lúdicas em casa que estimulam coordenação, atenção e criatividade.',
      imagemUrl: atividadesImg,
      cor: 'from-pink-400 to-pink-600',
      ordem: 2
    },
    {
      id: 'comunicacao',
      nome: 'Comunicação & Interação Social',
      descricao: 'Foco em habilidades sociais e comunicativas.',
      imagemUrl: comunicacaoImg,
      cor: 'from-purple-400 to-purple-600',
      ordem: 3
    },
    {
      id: 'comportamento',
      nome: 'Comportamento & Emoções',
      descricao: 'Apoio para lidar com situações difíceis do cotidiano.',
      imagemUrl: comportamentoImg,
      cor: 'from-orange-400 to-orange-600',
      ordem: 4
    }
  ]);

  // Carregar categorias ao montar o componente
  useEffect(() => {
    listCategorias();
    
    // Carregar imagens do Firebase Storage para as categorias de autismo
    const loadStorageImages = async () => {
      try {
        const categoriasComStorage = await Promise.all(
          categoriasAutismo.map(async (categoria) => {
            try {
              const storageImageUrl = await getVideoCategoryImageUrl(categoria.id);
              return {
                ...categoria,
                imagemUrl: storageImageUrl || categoria.imagemUrl // Usar storage ou fallback
              };
            } catch (error) {
              console.warn(`Imagem não encontrada no storage para ${categoria.id}:`, error);
              return categoria; // Manter imagem original
            }
          })
        );
        
        setCategoriasAutismo(categoriasComStorage);
      } catch (error) {
        console.error('Erro ao carregar imagens do storage:', error);
      }
    };

    loadStorageImages();
  }, []);

  const handleCategoriaClick = (categoria: VideoCategoria) => {
    if (onNavigate) {
      onNavigate('videos-categoria', categoria);
    }
  };

  const handleCategoriaAutismoClick = (categoria: any) => {
    // Converter para formato VideoCategoria e navegar
    const videoCategoria: VideoCategoria = {
      id: categoria.id,
      nome: categoria.nome,
      descricao: categoria.descricao,
      coverUrl: categoria.imagemUrl,
      ordem: categoria.ordem,
      tags: ['autismo', 'educativo'],
      qtdVideos: 0,
      ativo: true
    };
    
    if (onNavigate) {
      onNavigate('videos-categoria', videoCategoria);
    }
  };

  const handleCategoriaSelect = (categoria: VideoCategoria) => {
    // Selecionar categoria no contexto para exibir no header
    setSelectedVideoCategory(categoria);
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
                Conteúdo especializado para apoiar mães de crianças com autismo
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
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                  data-testid="button-subscribe"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Assinar Agora
                </Button>
              )}
            </div>
          </div>

          {/* Barra de pesquisa */}
          <div className="relative max-w-md mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Pesquisar vídeos..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0"
              data-testid="input-search-videos"
            />
          </div>
        </div>

        {/* Categorias de Autismo - Layout Responsivo */}
        {/* Mobile: 2x2 grid, Desktop: 4x1 grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Categorias Especializadas
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categoriasAutismo.map((categoria) => (
              <Card 
                key={categoria.id} 
                className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden border-0 shadow-md"
                onClick={() => handleCategoriaAutismoClick(categoria)}
                data-testid={`card-categoria-${categoria.id}`}
              >
                <CardContent className="p-0">
                  {/* Imagem da categoria */}
                  <div className="relative aspect-square overflow-hidden">
                    <img 
                      src={categoria.imagemUrl} 
                      alt={categoria.nome}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      data-testid={`img-categoria-${categoria.id}`}
                    />
                    
                    {/* Overlay com gradiente */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${categoria.cor} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
                    
                    {/* Botão de ação */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md">
                        <ChevronRight className="h-4 w-4 text-gray-700" />
                      </div>
                    </div>
                  </div>

                  {/* Conteúdo da categoria */}
                  <div className="p-4">
                    <h3 
                      className="font-semibold text-gray-900 mb-2 text-sm md:text-base line-clamp-2"
                      data-testid={`text-titulo-${categoria.id}`}
                    >
                      {categoria.nome}
                    </h3>
                    <p 
                      className="text-gray-600 text-xs md:text-sm line-clamp-3"
                      data-testid={`text-descricao-${categoria.id}`}
                    >
                      {categoria.descricao}
                    </p>
                    
                    {/* Indicador visual */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${categoria.cor}`} />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-0 h-auto text-xs text-gray-500 hover:text-gray-700"
                        data-testid={`button-explorar-${categoria.id}`}
                      >
                        Explorar
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Outras categorias existentes */}
        {categorias && categorias.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Outras Categorias
            </h2>
            {loadingCategorias ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Carregando categorias...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <Button 
                  onClick={() => { clearError(); listCategorias(); }}
                  variant="outline"
                  data-testid="button-retry-categories"
                >
                  Tentar Novamente
                </Button>
              </div>
            ) : (
              <CategoriaGridVideo
                categorias={categorias}
                onCategoriaClick={handleCategoriaClick}
                onCategoriaSelect={handleCategoriaSelect}
              />
            )}
          </div>
        )}

        {/* Seção informativa */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 md:p-8">
          <div className="text-center">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
              Apoio Especializado para Famílias
            </h2>
            <p className="text-gray-600 mb-6 max-w-3xl mx-auto">
              Nossos vídeos são desenvolvidos especialmente para mães que buscam orientação 
              prática e informação confiável sobre o autismo. Cada categoria oferece conteúdo 
              estruturado para diferentes momentos da jornada.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-teal-600 font-bold text-lg">1</span>
                </div>
                <p className="text-sm font-medium text-gray-700">Compreensão</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-pink-600 font-bold text-lg">2</span>
                </div>
                <p className="text-sm font-medium text-gray-700">Atividades</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-purple-600 font-bold text-lg">3</span>
                </div>
                <p className="text-sm font-medium text-gray-700">Comunicação</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-orange-600 font-bold text-lg">4</span>
                </div>
                <p className="text-sm font-medium text-gray-700">Comportamento</p>
              </div>
            </div>

            {/* Call to action para não assinantes */}
            {!isSubscriber && (
              <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border border-orange-200">
                <div className="flex items-center justify-center mb-4">
                  <Zap className="h-8 w-8 text-orange-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Acesse Todo o Conteúdo
                </h3>
                <p className="text-gray-600 mb-4">
                  Torne-se assinante e tenha acesso completo a todos os vídeos educativos
                </p>
                <Button
                  onClick={handleSubscriptionClick}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                  data-testid="button-subscribe-cta"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Assinar Agora
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}