import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getVideoCategoryImageUrl, getVideoActivityImageUrl } from '@/lib/firebase';
import type { VideoCategoria, VideoAtividade } from '@shared/schema';

interface VideosContextType {
  // Estado das categorias
  categorias: VideoCategoria[];
  loadingCategorias: boolean;
  selectedVideoCategory: VideoCategoria | null;
  
  // Estado dos vídeos por categoria
  videosByCategoria: Record<string, VideoAtividade[]>;
  loadingVideos: Record<string, boolean>;
  
  // Estado do vídeo individual
  currentVideo: VideoAtividade | null;
  loadingCurrentVideo: boolean;
  
  // Estados gerais
  error: string | null;
  
  // Status da assinatura (do AuthContext)
  isSubscriber: boolean;
  
  // Funções de carregamento
  listCategorias: () => Promise<VideoCategoria[]>;
  listVideosByCategoria: (categoriaId: string) => Promise<VideoAtividade[]>;
  getVideo: (videoId: string) => Promise<VideoAtividade | null>;
  
  // Funções de seleção
  setSelectedVideoCategory: (categoria: VideoCategoria | null) => void;
  
  // Utilitários
  clearError: () => void;
  refreshCache: () => void;
}

const VideosContext = createContext<VideosContextType | undefined>(undefined);

export function useVideos() {
  const context = useContext(VideosContext);
  if (context === undefined) {
    throw new Error('useVideos must be used within a VideosProvider');
  }
  return context;
}

interface VideosProviderProps {
  children: React.ReactNode;
}

export function VideosProvider({ children }: VideosProviderProps) {
  // Estados das categorias
  const [categorias, setCategorias] = useState<VideoCategoria[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  const [selectedVideoCategory, setSelectedVideoCategory] = useState<VideoCategoria | null>(null);
  
  // Estados dos vídeos por categoria
  const [videosByCategoria, setVideosByCategoria] = useState<Record<string, VideoAtividade[]>>({});
  const [loadingVideos, setLoadingVideos] = useState<Record<string, boolean>>({});
  
  // Estado do vídeo individual
  const [currentVideo, setCurrentVideo] = useState<VideoAtividade | null>(null);
  const [loadingCurrentVideo, setLoadingCurrentVideo] = useState(false);
  
  // Estados gerais
  const [error, setError] = useState<string | null>(null);
  
  // Cache timestamp para invalidação simples
  const [lastUpdated, setLastUpdated] = useState<number>(0);
  
  const { user, isSubscriber } = useAuth();

  // Simular dados de categorias (temporário - depois será substituído por Firebase)
  const mockCategorias: VideoCategoria[] = [
    {
      id: 'cat-cores-formas',
      nome: 'Cores e Formas',
      descricao: 'Vídeos para reconhecer cores e formas',
      ordem: 10,
      coverUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400',
      tags: ['cores', 'formas', '2-6'],
      qtdVideos: 3,
      ativo: true,
      createdAt: '2025-01-24T19:00:00Z',
      updatedAt: '2025-01-24T19:00:00Z',
    },
    {
      id: 'cat-coordenacao-motora',
      nome: 'Coordenação Motora',
      descricao: 'Exercícios para desenvolver coordenação motora',
      ordem: 20,
      coverUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
      tags: ['motricidade', 'exercicios', '3-8'],
      qtdVideos: 2,
      ativo: true,
      createdAt: '2025-01-24T19:00:00Z',
      updatedAt: '2025-01-24T19:00:00Z',
    },
    {
      id: 'cat-comunicacao',
      nome: 'Comunicação',
      descricao: 'Atividades para desenvolvimento da comunicação',
      ordem: 30,
      coverUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400',
      tags: ['comunicacao', 'linguagem', '2-10'],
      qtdVideos: 4,
      ativo: true,
      createdAt: '2025-01-24T19:00:00Z',
      updatedAt: '2025-01-24T19:00:00Z',
    }
  ];

  // Simular dados de vídeos (temporário)
  const mockVideos: Record<string, VideoAtividade[]> = {
    'cat-cores-formas': [
      {
        id: 'vid-abc-001',
        categoriaId: 'cat-cores-formas',
        titulo: 'Cores Primárias Brincando',
        descricao: 'Aprenda cores primárias com atividades práticas e divertidas.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        plataforma: 'youtube' as const,
        duracaoSegundos: 540,
        thumbnailUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
        tags: ['cores', 'ludico', 'motricidade'],
        premium: true,
        trailerStart: 0,
        trailerEnd: 60,
        materiaisRelacionados: [
          { tipo: 'pdf' as const, titulo: 'Guia de atividades', url: 'https://example.com/guia.pdf' }
        ],
        transcricaoUrl: 'https://example.com/transcricao.txt',
        ativo: true,
        createdAt: '2025-01-24T19:05:00Z',
        updatedAt: '2025-01-24T19:05:00Z',
      },
      {
        id: 'vid-abc-002',
        categoriaId: 'cat-cores-formas',
        titulo: 'Formas Geométricas Básicas',
        descricao: 'Reconhecimento de formas geométricas através de brincadeiras.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        plataforma: 'youtube' as const,
        duracaoSegundos: 420,
        thumbnailUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400',
        tags: ['formas', 'geometria', 'educativo'],
        premium: false,
        trailerStart: 0,
        materiaisRelacionados: [],
        ativo: true,
        createdAt: '2025-01-24T19:10:00Z',
        updatedAt: '2025-01-24T19:10:00Z',
      }
    ],
    'cat-coordenacao-motora': [
      {
        id: 'vid-coord-001',
        categoriaId: 'cat-coordenacao-motora',
        titulo: 'Exercícios de Motricidade Fina',
        descricao: 'Atividades para desenvolver a coordenação motora fina.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        plataforma: 'youtube' as const,
        duracaoSegundos: 720,
        thumbnailUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
        tags: ['motricidade', 'coordenacao', 'fino'],
        premium: true,
        trailerStart: 0,
        trailerEnd: 90,
        materiaisRelacionados: [],
        ativo: true,
        createdAt: '2025-01-24T19:15:00Z',
        updatedAt: '2025-01-24T19:15:00Z',
      }
    ],
    'cat-comunicacao': [
      {
        id: 'vid-com-001',
        categoriaId: 'cat-comunicacao',
        titulo: 'Primeiras Palavras',
        descricao: 'Estimulando as primeiras palavras através de jogos.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        plataforma: 'youtube' as const,
        duracaoSegundos: 480,
        thumbnailUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400',
        tags: ['comunicacao', 'palavras', 'linguagem'],
        premium: false,
        trailerStart: 0,
        materiaisRelacionados: [
          { tipo: 'pdf' as const, titulo: 'Lista de palavras', url: 'https://example.com/palavras.pdf' }
        ],
        ativo: true,
        createdAt: '2025-01-24T19:20:00Z',
        updatedAt: '2025-01-24T19:20:00Z',
      }
    ]
  };

  const clearError = () => setError(null);

  const refreshCache = () => {
    setCategorias([]);
    setVideosByCategoria({});
    setCurrentVideo(null);
    setSelectedVideoCategory(null);
    setLastUpdated(Date.now());
  };

  const listCategorias = async (): Promise<VideoCategoria[]> => {
    if (categorias.length > 0 && Date.now() - lastUpdated < 300000) { // Cache por 5 minutos
      return categorias;
    }

    setLoadingCategorias(true);
    setError(null);

    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Filtrar apenas categorias ativas e ordenar
      const categoriasAtivas = mockCategorias
        .filter(cat => cat.ativo)
        .sort((a, b) => a.ordem - b.ordem);

      // Temporariamente desabilitado devido a problemas de permissão no Firebase Storage
      // const categoriasComImagens = await Promise.all(
      //   categoriasAtivas.map(async (categoria) => {
      //     try {
      //       const imageUrl = await getVideoCategoryImageUrl(categoria.id);
      //       return {
      //         ...categoria,
      //         coverUrl: imageUrl || categoria.coverUrl
      //       };
      //     } catch (error) {
      //       console.warn(`Erro ao carregar imagem para categoria ${categoria.id}:`, error);
      //       return categoria;
      //     }
      //   })
      // );
      const categoriasComImagens = categoriasAtivas; // Usar apenas imagens locais por enquanto

      setCategorias(categoriasComImagens);
      setLastUpdated(Date.now());
      
      return categoriasComImagens;
    } catch (err) {
      console.error('Error loading video categories:', err);
      setError('Erro ao carregar categorias de vídeos');
      return [];
    } finally {
      setLoadingCategorias(false);
    }
  };

  const listVideosByCategoria = async (categoriaId: string): Promise<VideoAtividade[]> => {
    if (videosByCategoria[categoriaId] && !loadingVideos[categoriaId]) {
      return videosByCategoria[categoriaId];
    }

    setLoadingVideos(prev => ({ ...prev, [categoriaId]: true }));
    setError(null);

    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const videos = mockVideos[categoriaId] || [];
      const videosAtivos = videos.filter(video => video.ativo);

      // Temporariamente desabilitado devido a problemas de permissão no Firebase Storage
      // const videosComImagens = await Promise.all(
      //   videosAtivos.map(async (video) => {
      //     try {
      //       const imageUrl = await getVideoActivityImageUrl(video.id);
      //       return {
      //         ...video,
      //         thumbnailUrl: imageUrl || video.thumbnailUrl
      //       };
      //     } catch (error) {
      //       console.warn(`Erro ao carregar imagem para vídeo ${video.id}:`, error);
      //       return video;
      //     }
      //   })
      // );
      const videosComImagens = videosAtivos; // Usar apenas thumbnails originais por enquanto

      setVideosByCategoria(prev => ({
        ...prev,
        [categoriaId]: videosComImagens
      }));
      
      return videosComImagens;
    } catch (err) {
      console.error('Error loading videos for category:', err);
      setError('Erro ao carregar vídeos da categoria');
      return [];
    } finally {
      setLoadingVideos(prev => ({ ...prev, [categoriaId]: false }));
    }
  };

  const getVideo = async (videoId: string): Promise<VideoAtividade | null> => {
    setLoadingCurrentVideo(true);
    setError(null);

    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Buscar em todas as categorias (em uma implementação real seria direto pelo ID)
      let foundVideo: VideoAtividade | null = null;
      
      for (const videos of Object.values(mockVideos)) {
        const video = videos.find(v => v.id === videoId && v.ativo);
        if (video) {
          foundVideo = video;
          break;
        }
      }

      if (!foundVideo) {
        setError('Vídeo não encontrado');
        return null;
      }

      setCurrentVideo(foundVideo);
      return foundVideo;
    } catch (err) {
      console.error('Error loading video:', err);
      setError('Erro ao carregar vídeo');
      return null;
    } finally {
      setLoadingCurrentVideo(false);
    }
  };

  // Carregar categorias quando o usuário estiver logado
  useEffect(() => {
    if (user) {
      listCategorias();
    } else {
      setCategorias([]);
      setVideosByCategoria({});
      setCurrentVideo(null);
      setSelectedVideoCategory(null);
    }
  }, [user]);

  const value: VideosContextType = {
    // Estado das categorias
    categorias,
    loadingCategorias,
    selectedVideoCategory,
    
    // Estado dos vídeos por categoria
    videosByCategoria,
    loadingVideos,
    
    // Estado do vídeo individual
    currentVideo,
    loadingCurrentVideo,
    
    // Estados gerais
    error,
    
    // Status da assinatura
    isSubscriber,
    
    // Funções
    listCategorias,
    listVideosByCategoria,
    getVideo,
    setSelectedVideoCategory,
    clearError,
    refreshCache,
  };

  return (
    <VideosContext.Provider value={value}>
      {children}
    </VideosContext.Provider>
  );
}