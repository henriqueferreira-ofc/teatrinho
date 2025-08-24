import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useEBooks } from '@/contexts/EBookContext';
import { logout } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Menu, Home, Book, User, LogOut, X, Grid3X3, Play, Handshake, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'home' | 'categories' | 'ebooks' | 'videos' | 'partnerships' | 'profile';
  onTabChange: (tab: 'home' | 'categories' | 'ebooks' | 'videos' | 'partnerships' | 'profile') => void;
  onEBookDetailsClick?: () => void;
}

export default function Layout({ children, activeTab, onTabChange, onEBookDetailsClick }: LayoutProps) {
  const { userProfile } = useAuth();
  const { selectedEbook } = useEBooks();
  const { toast } = useToast();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado da sua conta.",
      });
    } catch (error) {
      toast({
        title: "Erro ao fazer logout",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
    setIsDrawerOpen(false);
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const navItems = [
    { id: 'home' as const, label: 'Início', icon: Home },
    { id: 'categories' as const, label: 'Categorias', icon: Grid3X3 },
    { id: 'ebooks' as const, label: 'eBooks', icon: Book },
    { id: 'videos' as const, label: 'Vídeos', icon: Play },
    { id: 'partnerships' as const, label: 'Parceria', icon: Handshake },
    { id: 'profile' as const, label: 'Perfil', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-40 border-b border-gray-100">
        <div className="flex items-center justify-between px-4 h-16">
          {/* Menu Button */}
          <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" data-testid="button-menu">
                <Menu className="h-7 w-7 text-gray-700" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <div className="flex flex-col h-full">
                {/* Drawer Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center space-x-4">
                    {userProfile?.photoURL ? (
                      <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                        <img 
                          src={userProfile.photoURL} 
                          alt="Foto do usuário"
                          className="w-full h-full object-cover"
                          data-testid="img-user-photo"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-semibold flex-shrink-0">
                        <span data-testid="text-user-initials">
                          {getInitials(userProfile?.name)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg" data-testid="text-user-name">
                        {userProfile?.name || 'Usuário'}
                      </h3>
                      <p className="text-sm text-gray-600" data-testid="text-user-email">
                        {userProfile?.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Drawer Menu Items */}
                <nav className="flex-1 p-4 space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start space-x-3 h-12"
                    onClick={() => {
                      onTabChange('home');
                      setIsDrawerOpen(false);
                    }}
                    data-testid="link-home"
                  >
                    <Home className="h-5 w-5 text-gray-600" />
                    <span className="text-gray-700">Início</span>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start space-x-3 h-12"
                    onClick={() => {
                      onTabChange('categories');
                      setIsDrawerOpen(false);
                    }}
                    data-testid="link-categories"
                  >
                    <Grid3X3 className="h-5 w-5 text-gray-600" />
                    <span className="text-gray-700">Categorias</span>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start space-x-3 h-12"
                    onClick={() => {
                      onTabChange('ebooks');
                      setIsDrawerOpen(false);
                    }}
                    data-testid="link-ebooks"
                  >
                    <Book className="h-5 w-5 text-gray-600" />
                    <span className="text-gray-700">Meus eBooks</span>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start space-x-3 h-12"
                    onClick={() => {
                      onTabChange('videos');
                      setIsDrawerOpen(false);
                    }}
                    data-testid="link-videos"
                  >
                    <Play className="h-5 w-5 text-gray-600" />
                    <span className="text-gray-700">Vídeos</span>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start space-x-3 h-12"
                    onClick={() => {
                      onTabChange('partnerships');
                      setIsDrawerOpen(false);
                    }}
                    data-testid="link-partnerships"
                  >
                    <Handshake className="h-5 w-5 text-gray-600" />
                    <span className="text-gray-700">Parceria</span>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start space-x-3 h-12"
                    onClick={() => {
                      onTabChange('profile');
                      setIsDrawerOpen(false);
                    }}
                    data-testid="link-profile"
                  >
                    <User className="h-5 w-5 text-gray-600" />
                    <span className="text-gray-700">Perfil</span>
                  </Button>
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-gray-200">
                  <Button
                    variant="ghost"
                    className="w-full justify-start space-x-3 h-12 text-red-600 hover:bg-red-50"
                    onClick={handleLogout}
                    data-testid="button-logout"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sair</span>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Selected eBook Indicator or App Title */}
          {selectedEbook ? (
            <Button
              variant="ghost"
              className="flex items-center gap-3 max-w-xs"
              onClick={onEBookDetailsClick}
              data-testid="button-selected-ebook"
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Book className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <p 
                    className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate"
                    data-testid="text-selected-ebook-name"
                  >
                    {selectedEbook.nome}
                  </p>
                </div>
                <Badge 
                  variant="secondary" 
                  className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full h-6 w-6 p-0 flex items-center justify-center text-xs font-semibold"
                  data-testid="badge-ebook-activities-count"
                >
                  {selectedEbook.atividades.length}
                </Badge>
              </div>
            </Button>
          ) : (
            <h1 
              className="text-xl font-bold text-gray-900 dark:text-gray-100 hidden sm:block" 
              data-testid="text-app-title"
            >
              Teatrinho
            </h1>
          )}

          {/* User Avatar */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold" data-testid="text-header-initials">
                {getInitials(userProfile?.name)}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pt-16 pb-20 min-h-screen">
        {children}
      </main>

      {/* Fixed Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`flex flex-col items-center space-y-1 py-2 px-2 transition-colors ${
                activeTab === id ? 'text-blue-500' : 'text-gray-400'
              }`}
              onClick={() => onTabChange(id)}
              data-testid={`tab-${id}`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
