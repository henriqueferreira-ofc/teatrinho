import React, { useState } from 'react';
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { EBookProvider, useEBooks } from '@/contexts/EBookContext';
import { VideosProvider, useVideos } from '@/contexts/VideosContext';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Home from '@/pages/Home';
import CategoriasPage from '@/pages/CategoriasPage';
import EBooks from '@/pages/EBooks';
import VideosPage from '@/pages/VideosPage';
import AtividadesPorCategoriaVideo from '@/pages/AtividadesPorCategoriaVideo';
import DetalheVideoPage from '@/pages/DetalheVideoPage';
import Partnerships from '@/pages/Partnerships';
import Profile from '@/pages/Profile';
import AtividadesPorCategoriaPage from '@/pages/AtividadesPorCategoriaPage';
import DetalheEBookPage from '@/pages/DetalheEBookPage';
import { Categoria, VideoCategoria, VideoAtividade } from '@shared/schema';

type AuthScreen = 'login' | 'register';
type AppTab = 'home' | 'categories' | 'ebooks' | 'videos' | 'partnerships' | 'profile' | 'atividades-categoria' | 'ebook-details' | 'videos-categoria' | 'video-detalhe';

function AuthFlow() {
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>('login');

  const handleSwitchToRegister = () => setCurrentScreen('register');
  const handleSwitchToLogin = () => setCurrentScreen('login');

  return (
    <>
      {currentScreen === 'login' && (
        <Login onSwitchToRegister={handleSwitchToRegister} />
      )}
      {currentScreen === 'register' && (
        <Register onSwitchToLogin={handleSwitchToLogin} />
      )}
    </>
  );
}

function MainAppContent() {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [selectedCategory, setSelectedCategory] = useState<Categoria | null>(null);
  const [selectedVideoCategory, setSelectedVideoCategory] = useState<VideoCategoria | null>(null);
  const [selectedVideoDetalhe, setSelectedVideoDetalhe] = useState<{ video: VideoAtividade; categoria: VideoCategoria } | null>(null);
  const [fromEbook, setFromEbook] = useState(false); // Rastreia se a navegação veio de um eBook
  
  const { setSelectedEbook } = useEBooks();
  const { setSelectedVideoCategory: setSelectedVideoCategoryContext } = useVideos();

  const handleNavigate = (tab: AppTab, data?: any, options?: { fromEbook?: boolean }) => {
    if (tab === 'atividades-categoria' && data) {
      setSelectedCategory(data);
      setSelectedVideoCategory(null);
      setSelectedVideoDetalhe(null);
      setFromEbook(options?.fromEbook || false);
      setActiveTab(tab);
    } else if (tab === 'videos-categoria' && data) {
      setSelectedVideoCategory(data);
      setSelectedCategory(null);
      setSelectedVideoDetalhe(null);
      setActiveTab(tab);
    } else if (tab === 'video-detalhe' && data) {
      setSelectedVideoDetalhe(data);
      setSelectedCategory(null);
      setSelectedVideoCategory(null);
      setActiveTab(tab);
    } else if (tab === 'ebook-details') {
      // Para página de detalhes do eBook, não limpar o selectedEbook
      setSelectedCategory(null);
      setSelectedVideoCategory(null);
      setSelectedVideoDetalhe(null);
      setSelectedVideoCategoryContext(null);
      setActiveTab(tab);
    } else {
      // Para todas as outras páginas (home, ebooks, videos, partnerships, profile)
      // limpar todos os estados selecionados
      setSelectedCategory(null);
      setSelectedVideoCategory(null);
      setSelectedVideoDetalhe(null);
      
      // Limpar também os contextos
      setSelectedEbook(null);
      setSelectedVideoCategoryContext(null);
      
      setActiveTab(tab);
    }
  };

  const handleEBookDetailsClick = () => {
    setActiveTab('ebook-details');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home onNavigate={handleNavigate} />;
      case 'atividades-categoria':
        return selectedCategory ? (
          <AtividadesPorCategoriaPage 
            categoria={selectedCategory} 
            onNavigate={handleNavigate}
            fromEbook={fromEbook}
          />
        ) : <Home onNavigate={handleNavigate} />;
      case 'categories':
        return <Home 
          onNavigate={handleNavigate} 
          onNavigateToActivity={(categoria) => handleNavigate('atividades-categoria', categoria, { fromEbook: true })}
        />;
      case 'ebooks':
        return <EBooks onNavigateToDetails={() => handleNavigate('ebook-details')} />;
      case 'ebook-details':
        return <DetalheEBookPage 
          onBack={() => handleNavigate('ebooks')} 
          onNavigateToCategories={() => handleNavigate('categories')}
          onNavigateToActivity={(categoria) => handleNavigate('atividades-categoria', categoria, { fromEbook: true })}
        />;
      case 'videos':
        return <VideosPage onNavigate={handleNavigate} />;
      case 'videos-categoria':
        return selectedVideoCategory ? (
          <AtividadesPorCategoriaVideo 
            categoria={selectedVideoCategory} 
            onNavigate={handleNavigate}
          />
        ) : <VideosPage onNavigate={handleNavigate} />;
      case 'video-detalhe':
        return selectedVideoDetalhe ? (
          <DetalheVideoPage 
            video={selectedVideoDetalhe.video}
            categoria={selectedVideoDetalhe.categoria}
            onNavigate={handleNavigate}
          />
        ) : <VideosPage onNavigate={handleNavigate} />;
      case 'partnerships':
        return <Partnerships />;
      case 'profile':
        return <Profile />;
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    <ProtectedRoute>
      <Layout 
        activeTab={activeTab === 'atividades-categoria' || activeTab === 'ebook-details' || activeTab === 'categories' || activeTab === 'videos-categoria' || activeTab === 'video-detalhe' ? (activeTab.startsWith('videos') ? 'videos' : 'home') : activeTab} 
        onTabChange={handleNavigate}
        onEBookDetailsClick={handleEBookDetailsClick}
      >
        {renderTabContent()}
      </Layout>
    </ProtectedRoute>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Loading state is handled in ProtectedRoute
  }

  return user ? <MainAppContent /> : <AuthFlow />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <EBookProvider>
            <VideosProvider>
              <AppContent />
              <Toaster />
            </VideosProvider>
          </EBookProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
