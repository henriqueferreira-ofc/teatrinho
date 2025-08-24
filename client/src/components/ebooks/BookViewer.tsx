import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  PenTool, 
  HelpCircle, 
  Video,
  X 
} from 'lucide-react';
import type { Ebook, EbookAtividade } from '@shared/schema';

interface BookViewerProps {
  ebook: Ebook;
  trigger?: React.ReactNode;
}

const activityIcons = {
  texto: FileText,
  exercicio: PenTool,
  quiz: HelpCircle,
  video: Video,
};

const activityLabels = {
  texto: 'Leitura de Texto',
  exercicio: 'Exercício Prático', 
  quiz: 'Quiz/Questionário',
  video: 'Vídeo',
};

const activityColors = {
  texto: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  exercicio: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  quiz: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  video: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
};

export function BookViewer({ ebook, trigger }: BookViewerProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [open, setOpen] = useState(false);
  
  // Create pages: cover + activities
  const pages = [
    { type: 'cover', content: null },
    ...ebook.atividades.map((activity, index) => ({ type: 'activity', content: activity, index }))
  ];

  const totalPages = pages.length;
  const currentPageData = pages[currentPage];

  const nextPage = () => {
    setCurrentPage(prev => (prev < totalPages - 1 ? prev + 1 : prev));
  };

  const prevPage = () => {
    setCurrentPage(prev => (prev > 0 ? prev - 1 : prev));
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      setCurrentPage(0); // Reset to cover when opening
    }
  };

  const renderCoverPage = () => (
    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-8">
      <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
        <BookOpen className="h-12 w-12 text-white" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">
        {ebook.nome}
      </h1>
      <div className="text-center text-gray-600 dark:text-gray-400 space-y-2">
        <p>
          {ebook.atividades.length} atividade{ebook.atividades.length !== 1 ? 's' : ''}
        </p>
        <p className="text-sm">
          Criado em {new Date(ebook.data).toLocaleDateString('pt-BR')}
        </p>
      </div>
    </div>
  );

  const renderActivityPage = (activity: EbookAtividade, index: number) => {
    const Icon = activityIcons[activity.tipo];
    
    return (
      <div className="h-full flex flex-col bg-white dark:bg-gray-900 rounded-lg p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
              <Icon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {activity.titulo}
                </h2>
                <Badge variant="secondary" className={activityColors[activity.tipo]}>
                  {activityLabels[activity.tipo]}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Atividade {index + 1} de {ebook.atividades.length}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {activity.descricao && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descrição
              </h3>
              <p className="text-gray-900 dark:text-gray-100 leading-relaxed">
                {activity.descricao}
              </p>
            </div>
          )}
          
          {activity.conteudo && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Conteúdo
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-gray-900 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
                  {activity.conteudo}
                </p>
              </div>
            </div>
          )}

          {!activity.descricao && !activity.conteudo && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <Icon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Esta atividade ainda não possui conteúdo detalhado.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" data-testid="button-view-book">
            <BookOpen className="h-4 w-4 mr-2" />
            Visualizar Livro
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh] p-0" data-testid="book-viewer-dialog">
        <DialogHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              {ebook.nome} - Visualização do Livro
            </DialogTitle>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Página {currentPage + 1} de {totalPages}
            </div>
          </div>
        </DialogHeader>
        
        {/* Book Content */}
        <div className="flex-1 p-6 overflow-hidden">
          <div className="h-full">
            {currentPageData.type === 'cover' 
              ? renderCoverPage()
              : renderActivityPage(
                  currentPageData.content as EbookAtividade, 
                  (currentPageData as { type: string; content: EbookAtividade; index: number }).index
                )
            }
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={prevPage}
            disabled={currentPage === 0}
            data-testid="button-prev-page"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>
          
          <div className="flex items-center gap-2">
            {pages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentPage 
                    ? 'bg-blue-500' 
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                }`}
                data-testid={`page-indicator-${index}`}
              />
            ))}
          </div>

          <Button
            variant="outline"
            onClick={nextPage}
            disabled={currentPage === totalPages - 1}
            data-testid="button-next-page"
          >
            Próxima
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}