import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Book, 
  ArrowLeft, 
  Calendar,
  FileText,
  Edit2,
  Copy,
  Trash2,
  Plus,
  Check,
  X
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useEBooks } from '@/contexts/EBookContext';
import { useAuth } from '@/contexts/AuthContext';
import { CloneEBookDialog } from '@/components/ebooks/CloneEBookDialog';
import { DeleteEBookDialog } from '@/components/ebooks/DeleteEBookDialog';
import { AddActivityDialog } from '@/components/ebooks/AddActivityDialog';
import { format } from 'date-fns';
import { ActivityList } from '@/components/ebooks/ActivityList';
import { BookViewer } from '@/components/ebooks/BookViewer';
import { EBookExporter } from '@/components/ebooks/EBookExporter';
import { ptBR } from 'date-fns/locale';
import type { Ebook } from '@shared/schema';

interface DetalheEBookPageProps {
  onBack: () => void;
}

export default function DetalheEBookPage({ onBack }: DetalheEBookPageProps) {
  const { selectedEbook, removeActivityFromEbook, updateEbookData, reorderActivities } = useEBooks();
  const { isSubscriber } = useAuth();
  const [showCloneDialog, setShowCloneDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddActivityDialog, setShowAddActivityDialog] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');

  const handleCloneSuccess = () => {
    setShowCloneDialog(false);
    onBack(); // Navigate back to show the cloned eBook
  };

  const handleDeleteSuccess = () => {
    setShowDeleteDialog(false);
    onBack(); // Navigate back since the eBook was deleted
  };

  const handleEditName = () => {
    if (selectedEbook) {
      setEditedName(selectedEbook.nome);
      setIsEditingName(true);
    }
  };

  const handleSaveEditName = async () => {
    if (!selectedEbook || !editedName.trim()) return;
    
    if (editedName.trim() !== selectedEbook.nome) {
      const updated = await updateEbookData(selectedEbook.id, { nome: editedName.trim() });
      if (updated) {
        setIsEditingName(false);
      }
    } else {
      setIsEditingName(false);
    }
  };

  const handleCancelEditName = () => {
    setIsEditingName(false);
    setEditedName(selectedEbook?.nome || '');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEditName();
    } else if (e.key === 'Escape') {
      handleCancelEditName();
    }
  };

  if (!selectedEbook) {
    return (
      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">
            <Book className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Nenhum eBook selecionado
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Selecione um eBook para visualizar seus detalhes.
            </p>
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos eBooks
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { 
        locale: ptBR 
      });
    } catch {
      return 'Data inválida';
    }
  };

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            onClick={onBack}
            data-testid="button-back-to-ebooks"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar aos eBooks
          </Button>
        </div>

        {/* eBook details card */}
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg flex-shrink-0">
                  <Book className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
                <div className="flex-1 min-w-0">
                  {isEditingName ? (
                    <div className="flex items-center gap-2 mb-2">
                      <Input
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="text-lg sm:text-2xl font-bold h-10 sm:h-12 flex-1"
                        autoFocus
                        data-testid="input-edit-ebook-name"
                      />
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="p-2 text-green-600 hover:text-green-700 flex-shrink-0"
                        onClick={handleSaveEditName}
                        data-testid="button-save-edit-name"
                      >
                        <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="p-2 text-red-600 hover:text-red-700 flex-shrink-0"
                        onClick={handleCancelEditName}
                        data-testid="button-cancel-edit-name"
                      >
                        <X className="h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                    </div>
                  ) : (
                    <CardTitle 
                      className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2"
                      data-testid="text-ebook-title"
                    >
                      {selectedEbook.nome}
                    </CardTitle>
                  )}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span data-testid="text-ebook-creation-date">
                        Criado em {formatDate(selectedEbook.data)}
                      </span>
                    </div>
                    <Badge variant="outline" className="w-fit" data-testid="badge-activities-count">
                      <FileText className="h-3 w-3 mr-1" />
                      {selectedEbook.atividades.length} atividade{selectedEbook.atividades.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              {isSubscriber && !isEditingName && (
                <div className="flex flex-col sm:flex-row gap-2 sm:flex-shrink-0">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleEditName}
                    className="w-full sm:w-auto"
                    data-testid="button-edit-ebook"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    <span className="sm:inline">Editar</span>
                  </Button>
                  <BookViewer ebook={selectedEbook} />
                  <EBookExporter ebook={selectedEbook} />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowCloneDialog(true)}
                    className="w-full sm:w-auto"
                    data-testid="button-clone-ebook"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    <span className="sm:inline">Clonar</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                    className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:border-red-300"
                    data-testid="button-delete-ebook"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    <span className="sm:inline">Excluir</span>
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="pt-6">
            {/* Activities section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 
                  className="text-lg font-semibold text-gray-900 dark:text-gray-100"
                  data-testid="text-activities-section-title"
                >
                  Atividades do eBook
                </h3>
                {isSubscriber && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setShowAddActivityDialog(true)}
                    data-testid="button-add-activity"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Atividade
                  </Button>
                )}
              </div>

              {selectedEbook.atividades.length > 0 ? (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Arraste as atividades para reordenar
                  </p>
                  <ActivityList
                    activities={selectedEbook.atividades}
                    onReorder={async (newOrder) => {
                      await reorderActivities(selectedEbook.id, newOrder);
                    }}
                    onDelete={async (activityId) => {
                      await removeActivityFromEbook(selectedEbook.id, activityId);
                    }}
                    canEdit={isSubscriber}
                  />
                </div>
              ) : (
                <Card className="border-dashed border-2 border-gray-300 dark:border-gray-700">
                  <CardContent className="p-8 text-center">
                    <FileText className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                    <h4 
                      className="font-medium text-gray-900 dark:text-gray-100 mb-2"
                      data-testid="text-no-activities-title"
                    >
                      Nenhuma atividade ainda
                    </h4>
                    <p 
                      className="text-gray-600 dark:text-gray-400 mb-4"
                      data-testid="text-no-activities-description"
                    >
                      Este eBook não possui atividades adicionadas. 
                      {isSubscriber 
                        ? " Você pode adicionar atividades para organizar seu conteúdo." 
                        : " A funcionalidade de adicionar atividades estará disponível em breve."
                      }
                    </p>
                    {isSubscriber && (
                      <Button 
                        variant="outline" 
                        onClick={() => setShowAddActivityDialog(true)}
                        data-testid="button-add-first-activity"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar primeira atividade
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Future features note */}
            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                Funcionalidades em desenvolvimento
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Adicionar e remover atividades do eBook</li>
                <li>• Reordenar atividades por arrastar e soltar</li>
                <li>• Visualizar atividades em formato de livro</li>
                <li>• Exportar eBook para diferentes formatos</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Dialogs */}
        <CloneEBookDialog 
          open={showCloneDialog} 
          onOpenChange={(open) => {
            if (!open) handleCloneSuccess();
            setShowCloneDialog(open);
          }}
          ebook={selectedEbook}
        />
        
        <DeleteEBookDialog 
          open={showDeleteDialog} 
          onOpenChange={(open) => {
            if (!open) handleDeleteSuccess();
            setShowDeleteDialog(open);
          }}
          ebook={selectedEbook}
        />
        
        <AddActivityDialog 
          open={showAddActivityDialog} 
          onOpenChange={setShowAddActivityDialog}
          ebook={selectedEbook}
        />
      </div>
    </div>
  );
}