import React, { useState } from 'react';
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Home from '@/pages/Home';
import EBooks from '@/pages/EBooks';
import Profile from '@/pages/Profile';

type AuthScreen = 'login' | 'register';
type AppTab = 'home' | 'ebooks' | 'profile';

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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home />;
      case 'ebooks':
        return <EBooks />;
      case 'profile':
        return <Profile />;
      default:
        return <Home />;
    }
  };

  return (
    <ProtectedRoute>
      <Layout activeTab={activeTab} onTabChange={setActiveTab}>
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
          <AppContent />
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
