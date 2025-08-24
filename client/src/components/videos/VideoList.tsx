import React from 'react';
import { VideoCard } from './VideoCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Play } from 'lucide-react';
import type { VideoAtividade } from '@shared/schema';

interface VideoListProps {
  videos: VideoAtividade[];
  loading?: boolean;
  isSubscriber: boolean;
  onVideoClick: (video: VideoAtividade) => void;
}

export function VideoList({ 
  videos, 
  loading = false, 
  isSubscriber,
  onVideoClick 
}: VideoListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <Skeleton className="aspect-video w-full rounded-lg" />
            <div className="space-y-2 px-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
          <Play className="h-8 w-8 text-gray-400" />
        </div>
        <h3 
          className="text-lg font-semibold text-gray-900 mb-2"
          data-testid="text-no-videos"
        >
          Nenhum vídeo encontrado
        </h3>
        <p 
          className="text-gray-600"
          data-testid="text-no-videos-description"
        >
          Não há vídeos disponíveis nesta categoria.
        </p>
      </div>
    );
  }

  return (
    <div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      data-testid="grid-videos"
    >
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          video={video}
          isSubscriber={isSubscriber}
          onClick={onVideoClick}
        />
      ))}
    </div>
  );
}