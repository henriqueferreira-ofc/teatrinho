import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Book, Plus, Crown, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEBooks } from '@/contexts/EBookContext';
import { EBookGrid } from '@/components/ebooks/EBookGrid';
import { CreateEBookDialog } from '@/components/ebooks/CreateEBookDialog';
import { CloneEBookDialog } from '@/components/ebooks/CloneEBookDialog';
import { DeleteEBookDialog } from '@/components/ebooks/DeleteEBookDialog';
import type { Ebook } from '@shared/schema';

interface EBooksPageProps {
  onNavigateToDetails?: () => void;
}

export default function EBooksPage({ onNavigateToDetails }: EBooksPageProps = {}) {
  const { user, isSubscriber } = useAuth();
  const { ebooks, loading, setSelectedEbook } = useEBooks();
  
  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCloneDialog, setShowCloneDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedEbookForAction, setSelectedEbookForAction] = useState<Ebook | null>(null);

  const handleCloneEbook = (ebook: Ebook) => {
    setSelectedEbookForAction(ebook);
    setShowCloneDialog(true);
  };

  const handleDeleteEbook = (ebook: Ebook) => {
    setSelectedEbookForAction(ebook);
    setShowDeleteDialog(true);
  };

  const handleSelectEbook = (ebook: Ebook) => {
    // First select the eBook in the context
    setSelectedEbook(ebook);
    // Then navigate to details page when eBook is selected
    onNavigateToDetails?.();
  };

  const handleCloseCloneDialog = () => {
    setShowCloneDialog(false);
    setSelectedEbookForAction(null);
  };

  const handleCloseDeleteDialog = () => {
    setShowDeleteDialog(false);
    setSelectedEbookForAction(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-36" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-4 w-full mb-3" />
                <Skeleton className="h-3 w-2/3 mb-2" />
                <Skeleton className="h-8 w-full" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 
            className="text-2xl font-bold text-gray-900 dark:text-gray-100" 
            data-testid="text-ebooks-title"
          >
            Meus eBooks
          </h2>
          
          {isSubscriber ? (
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              data-testid="button-create-ebook"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar eBook
            </Button>
          ) : (
            <Button 
              variant="outline" 
              disabled
              className="opacity-50 cursor-not-allowed"
              data-testid="button-create-ebook-disabled"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar eBook
            </Button>
          )}
        </div>

        {/* Non-subscriber message */}
        {!isSubscriber && (
          <Card className="mb-6 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <Crown className="h-5 w-5 text-yellow-600 dark:text-yellow-300" />
                </div>
                <div className="flex-1">
                  <h3 
                    className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2"
                    data-testid="text-subscription-title"
                  >
                    Funcionalidade Premium
                  </h3>
                  <p 
                    className="text-yellow-700 dark:text-yellow-300 text-sm mb-4"
                    data-testid="text-subscription-description"
                  >
                    A criação e edição de eBooks está disponível apenas para usuários com assinatura ativa.
                    Com a assinatura você pode criar, editar, clonar e gerenciar todos os seus eBooks personalizados.
                  </p>
                  <Button 
                    asChild 
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                    data-testid="button-activate-subscription"
                  >
                    <a href="https://google.com" target="_blank" rel="noopener noreferrer">
                      <Crown className="h-4 w-4 mr-2" />
                      Ativar Assinatura para Criar eBooks
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* eBooks Content */}
        {ebooks.length > 0 ? (
          <EBookGrid
            onSelect={handleSelectEbook}
            onClone={handleCloneEbook}
            onDelete={handleDeleteEbook}
            canEdit={isSubscriber}
          />
        ) : (
          /* Empty State */
          <Card className="shadow-lg bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Book className="text-gray-400 dark:text-gray-500 text-2xl" size={32} />
              </div>
              <h3 
                className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3" 
                data-testid="text-empty-title"
              >
                Nenhum eBook criado ainda
              </h3>
              <p 
                className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto"
                data-testid="text-empty-description"
              >
                {isSubscriber 
                  ? "Comece criando seu primeiro eBook personalizado. Você pode adicionar atividades e organizá-las como desejar."
                  : "Esta é a área onde seus eBooks aparecerão. Para criar eBooks, você precisa de uma assinatura ativa."
                }
              </p>
              
              {isSubscriber ? (
                <Button 
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  data-testid="button-create-first-ebook"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar meu primeiro eBook
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-left max-w-sm mx-auto">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Com a assinatura você pode:
                    </h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• Criar eBooks personalizados</li>
                      <li>• Adicionar e organizar atividades</li>
                      <li>• Clonar eBooks existentes</li>
                      <li>• Editar e gerenciar seus conteúdos</li>
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Dialogs */}
        <CreateEBookDialog 
          open={showCreateDialog} 
          onOpenChange={setShowCreateDialog} 
        />
        
        <CloneEBookDialog 
          open={showCloneDialog} 
          onOpenChange={handleCloseCloneDialog}
          ebook={selectedEbookForAction}
        />
        
        <DeleteEBookDialog 
          open={showDeleteDialog} 
          onOpenChange={handleCloseDeleteDialog}
          ebook={selectedEbookForAction}
        />
      </div>
    </div>
  );
}
