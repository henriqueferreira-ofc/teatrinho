import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  restrictToVerticalAxis,
} from '@dnd-kit/modifiers';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  GripVertical, 
  Trash2, 
  PenTool, 
  HelpCircle, 
  Video 
} from 'lucide-react';
import type { EbookAtividade } from '@shared/schema';

interface ActivityListProps {
  activities: EbookAtividade[];
  onReorder: (newOrder: EbookAtividade[]) => void;
  onDelete: (activityId: string) => void;
  canEdit?: boolean;
}

// Activity styling constants
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

// Sortable Activity Item Component
interface SortableActivityItemProps {
  activity: EbookAtividade;
  onDelete: (activityId: string) => void;
  canEdit?: boolean;
}

function SortableActivityItem({ activity, onDelete, canEdit = true }: SortableActivityItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: activity.id, disabled: !canEdit });

  const style = {
    transform: CSS.Translate.toString(transform),
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

export function ActivityList({ activities, onReorder, onDelete, canEdit = true }: ActivityListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: any) {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = activities.findIndex((item) => item.id === active.id);
      const newIndex = activities.findIndex((item) => item.id === over.id);
      
      const newOrder = arrayMove(activities, oldIndex, newIndex).map((activity, index) => ({
        ...activity,
        ordem: index
      }));
      
      onReorder(newOrder);
    }
  }

  if (activities.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center">
            <FileText className="h-6 w-6 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Nenhuma atividade adicionada
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Adicione atividades ao seu eBook para começar a organizar o conteúdo.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <SortableContext items={activities.map(a => a.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3" data-testid="activities-list">
          {activities.map((activity) => (
            <SortableActivityItem
              key={activity.id}
              activity={activity}
              onDelete={onDelete}
              canEdit={canEdit}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}