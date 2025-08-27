import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { useLocation } from 'wouter';

// Importando as imagens das categorias
import comunicacaoImg from '@assets/1_1756319870173.jpg';
import comportamentoImg from '@assets/2_1756319870182.jpg';
import compreendendoImg from '@assets/3_1756319870182.jpg';
import atividadesImg from '@assets/4_1756319870183.jpg';

export default function VideosPage() {
  const [, setLocation] = useLocation();

  // Categorias de vídeos para mães com crianças autistas
  const categorias = [
    {
      id: 'compreendendo',
      titulo: 'Compreendendo o Autismo',
      descricao: 'Para mães que estão iniciando na jornada e precisam de informação clara e acessível.',
      imagem: compreendendoImg,
      cor: 'from-teal-400 to-teal-600'
    },
    {
      id: 'atividades',
      titulo: 'Atividades Práticas & Estímulos',
      descricao: 'Ensinar mães a fazerem atividades lúdicas em casa que estimulam coordenação, atenção e criatividade.',
      imagem: atividadesImg,
      cor: 'from-pink-400 to-pink-600'
    },
    {
      id: 'comunicacao',
      titulo: 'Comunicação & Interação Social',
      descricao: 'Foco em habilidades sociais e comunicativas.',
      imagem: comunicacaoImg,
      cor: 'from-purple-400 to-purple-600'
    },
    {
      id: 'comportamento',
      titulo: 'Comportamento & Emoções',
      descricao: 'Apoio para lidar com situações difíceis do cotidiano.',
      imagem: comportamentoImg,
      cor: 'from-orange-400 to-orange-600'
    }
  ];

  const handleCategoriaClick = (categoria: any) => {
    // Navegar para página de vídeos da categoria
    setLocation(`/videos/${categoria.id}`);
  };

  return (
    <div className="p-4 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
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

        {/* Grid de Categorias */}
        {/* Mobile: 2x2 grid, Desktop: 4x1 grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categorias.map((categoria) => (
            <Card 
              key={categoria.id} 
              className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden border-0 shadow-md"
              onClick={() => handleCategoriaClick(categoria)}
              data-testid={`card-categoria-${categoria.id}`}
            >
              <CardContent className="p-0">
                {/* Imagem da categoria */}
                <div className="relative aspect-square overflow-hidden">
                  <img 
                    src={categoria.imagem} 
                    alt={categoria.titulo}
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
                    {categoria.titulo}
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

        {/* Seção informativa */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 md:p-8">
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
          </div>
        </div>
      </div>
    </div>
  );
}