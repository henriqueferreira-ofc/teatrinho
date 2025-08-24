import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GripVertical, 
  Trash2, 
  FileText, 
  PenTool, 
  HelpCircle, 
  Video 
} from 'lucide-react';
import type { EbookAtividade } from '@shared/schema';

interface SortableActivityItemProps {
  activity: EbookAtividade;
  onDelete: (activityId: string) => void;
  canEdit?: boolean;
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

export function SortableActivityItem({ activity, onDelete, canEdit = true }: SortableActivityItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: activity.id, disabled: !canEdit });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = activityIcons[activity.tipo];

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={`shadow-sm hover:shadow-md transition-shadow ${isDragging ? 'shadow-lg' : ''}`}
      data-testid={`activity-item-${activity.id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {canEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-8 w-8 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
                {...attributes}
                {...listeners}
                data-testid={`drag-handle-${activity.id}`}
              >
                <GripVertical className="h-4 w-4" />
              </Button>
            )}
            <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
              <Icon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                  {activity.titulo}
                </h4>
                <Badge variant="secondary" className={activityColors[activity.tipo]}>
                  {activityLabels[activity.tipo]}
                </Badge>
              </div>
              {activity.descricao && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {activity.descricao}
                </p>
              )}
            </div>
          </div>
          {canEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(activity.id)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              data-testid={`delete-activity-${activity.id}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      {activity.conteudo && (
        <CardContent className="pt-0">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {activity.conteudo}
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}