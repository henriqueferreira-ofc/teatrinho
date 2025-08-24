import React, { useState } from 'react';
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { EBookProvider } from '@/contexts/EBookContext';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Home from '@/pages/Home';
import Categories from '@/pages/Categories';
import EBooks from '@/pages/EBooks';
import Videos from '@/pages/Videos';
import Partnerships from '@/pages/Partnerships';
import Profile from '@/pages/Profile';
import AtividadesPorCategoriaPage from '@/pages/AtividadesPorCategoriaPage';
import DetalheEBookPage from '@/pages/DetalheEBookPage';
import { Categoria } from '@shared/schema';

type AuthScreen = 'login' | 'register';
type AppTab = 'home' | 'categories' | 'ebooks' | 'videos' | 'partnerships' | 'profile' | 'atividades-categoria' | 'ebook-details';

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

function MainApp() {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [selectedCategory, setSelectedCategory] = useState<Categoria | null>(null);

  const handleNavigate = (tab: AppTab, data?: any) => {
    if (tab === 'atividades-categoria' && data) {
      setSelectedCategory(data);
      setActiveTab(tab);
    } else {
      setSelectedCategory(null);
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
          />
        ) : <Home onNavigate={handleNavigate} />;
      case 'categories':
        return <Categories />;
      case 'ebooks':
        return <EBooks onNavigateToDetails={() => handleNavigate('ebook-details')} />;
      case 'ebook-details':
        return <DetalheEBookPage onBack={() => handleNavigate('ebooks')} />;
      case 'videos':
        return <Videos />;
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
        activeTab={activeTab === 'atividades-categoria' || activeTab === 'ebook-details' ? 'home' : activeTab} 
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

  return user ? <MainApp /> : <AuthFlow />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <EBookProvider>
            <AppContent />
            <Toaster />
          </EBookProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
