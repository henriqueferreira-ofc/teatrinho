import React from 'react';
import { EBookCard } from './EBookCard';
import { useEBooks } from '@/contexts/EBookContext';
import type { Ebook } from '@shared/schema';

interface EBookGridProps {
  onClone?: (ebook: Ebook) => void;
  onDelete?: (ebook: Ebook) => void;
  canEdit?: boolean;
}

export function EBookGrid({ onClone, onDelete, canEdit = true }: EBookGridProps) {
  const { ebooks, selectedEbook, setSelectedEbook } = useEBooks();

  const handleSelectEbook = (ebook: Ebook) => {
    // Toggle selection - if same eBook is selected, deselect it
    setSelectedEbook(selectedEbook?.id === ebook.id ? null : ebook);
  };

  if (ebooks.length === 0) {
    return null; // Parent component will handle empty state
  }

  return (
    <div 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      data-testid="grid-ebooks"
    >
      {ebooks.map((ebook) => (
        <EBookCard
          key={ebook.id}
          ebook={ebook}
          isSelected={selectedEbook?.id === ebook.id}
          onSelect={handleSelectEbook}
          onClone={onClone}
          onDelete={onDelete}
          canEdit={canEdit}
        />
      ))}
    </div>
  );
}