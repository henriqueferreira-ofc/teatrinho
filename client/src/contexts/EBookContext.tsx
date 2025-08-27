import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getUserEbooks, createEbook, updateEbook, deleteEbook, cloneEbook } from '@/lib/firebase';
import type { Ebook, CreateEbook, UpdateEbook } from '@shared/schema';

interface EBookContextType {
  ebooks: Ebook[];
  selectedEbook: Ebook | null;
  loading: boolean;
  error: string | null;
  setSelectedEbook: (ebook: Ebook | null) => void;
  setSelectedEbookWithPersistence: (ebook: Ebook | null) => void;
  createNewEbook: (data: CreateEbook) => Promise<Ebook | null>;
  updateEbookData: (id: string, data: UpdateEbook) => Promise<Ebook | null>;
  deleteEbookData: (id: string) => Promise<boolean>;
  cloneEbookData: (id: string, newName: string) => Promise<Ebook | null>;
  refreshEbooks: () => Promise<void>;
  checkEbookNameExists: (name: string, excludeId?: string) => boolean;
  addActivityToEbook: (ebookId: string, activityId: string) => Promise<boolean>;
  addCustomActivityToEbook: (ebookId: string, activityData: any) => Promise<boolean>;
  removeActivityFromEbook: (ebookId: string, activityId: string) => Promise<boolean>;
  reorderActivities: (ebookId: string, reorderedActivityIds: string[]) => Promise<boolean>;
  toggleActivityInEbook: (ebookId: string, activityId: string) => Promise<boolean>;
  isActivityInEbook: (ebookId: string, activityId: string) => boolean;
}

const EBookContext = createContext<EBookContextType | undefined>(undefined);

export function useEBooks() {
  const context = useContext(EBookContext);
  if (context === undefined) {
    throw new Error('useEBooks must be used within an EBookProvider');
  }
  return context;
}

interface EBookProviderProps {
  children: React.ReactNode;
}

export function EBookProvider({ children }: EBookProviderProps) {
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [selectedEbook, setSelectedEbook] = useState<Ebook | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Função para definir e persistir o eBook selecionado
  const setSelectedEbookWithPersistence = React.useCallback((ebook: Ebook | null) => {
    setSelectedEbook(ebook);
    if (ebook) {
      localStorage.setItem('selectedEbook', JSON.stringify(ebook));
      console.log('eBook selecionado salvo no localStorage:', ebook.nome);
    } else {
      localStorage.removeItem('selectedEbook');
      console.log('eBook selecionado removido do localStorage');
    }
  }, []);

  const refreshEbooks = async () => {
    if (!user) {
      setEbooks([]);
      setSelectedEbook(null);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const userEbooks = await getUserEbooks();
      setEbooks(userEbooks);
      
      // If selected eBook was deleted, clear selection
      if (selectedEbook && !userEbooks.find(ebook => ebook.id === selectedEbook.id)) {
        setSelectedEbookWithPersistence(null);
      } else if (!selectedEbook) {
        // Check if there's a selected eBook in localStorage
        const savedEbook = localStorage.getItem('selectedEbook');
        if (savedEbook) {
          try {
            const parsedEbook = JSON.parse(savedEbook);
            const foundEbook = userEbooks.find(ebook => ebook.id === parsedEbook.id);
            if (foundEbook) {
              setSelectedEbook(foundEbook);
              console.log('eBook carregado do localStorage:', foundEbook.nome);
            } else {
              localStorage.removeItem('selectedEbook');
            }
          } catch (error) {
            console.error('Erro ao carregar eBook do localStorage:', error);
            localStorage.removeItem('selectedEbook');
          }
        }
      }
    } catch (err) {
      console.error('Error fetching eBooks:', err);
      setError('Erro ao carregar eBooks');
    } finally {
      setLoading(false);
    }
  };

  const checkEbookNameExists = (name: string, excludeId?: string): boolean => {
    return ebooks.some(ebook => 
      ebook.nome.toLowerCase() === name.toLowerCase() && 
      ebook.id !== excludeId
    );
  };

  const addActivityToEbook = async (ebookId: string, activityId: string): Promise<boolean> => {
    try {
      setError(null);
      console.log('Adicionando atividade:', activityId, 'ao eBook:', ebookId);
      
      const ebook = ebooks.find(e => e.id === ebookId);
      if (!ebook) {
        console.log('eBook não encontrado');
        return false;
      }
      
      // Check if activity is already in the eBook
      if (ebook.atividades.includes(activityId)) {
        console.log('Atividade já existe no eBook');
        return false; // Activity already exists
      }
      
      const updatedActivities = [...ebook.atividades, activityId];
      console.log('Atualizando atividades:', updatedActivities);
      
      const updatedEbook = await updateEbook(ebookId, { atividades: updatedActivities });
      
      setEbooks(prev => prev.map(e => 
        e.id === ebookId ? updatedEbook : e
      ));
      
      // Update selected eBook if it was the one being updated
      if (selectedEbook?.id === ebookId) {
        setSelectedEbookWithPersistence(updatedEbook);
        console.log('eBook selecionado atualizado com sucesso');
      }
      
      return true;
    } catch (err) {
      console.error('Error adding activity to eBook:', err);
      setError('Erro ao adicionar atividade');
      return false;
    }
  };

  const removeActivityFromEbook = async (ebookId: string, activityId: string): Promise<boolean> => {
    try {
      setError(null);
      console.log('Removendo atividade:', activityId, 'do eBook:', ebookId);
      
      const ebook = ebooks.find(e => e.id === ebookId);
      if (!ebook) return false;
      
      const updatedActivities = ebook.atividades.filter(id => id !== activityId);
      console.log('Atividades após remoção:', updatedActivities);
      
      const updatedEbook = await updateEbook(ebookId, { atividades: updatedActivities });
      
      setEbooks(prev => prev.map(e => 
        e.id === ebookId ? updatedEbook : e
      ));
      
      // Update selected eBook if it was the one being updated
      if (selectedEbook?.id === ebookId) {
        setSelectedEbookWithPersistence(updatedEbook);
        console.log('eBook selecionado atualizado após remoção');
      }
      
      return true;
    } catch (err) {
      console.error('Error removing activity from eBook:', err);
      setError('Erro ao remover atividade');
      return false;
    }
  };

  const reorderActivities = async (ebookId: string, reorderedActivityIds: string[]): Promise<boolean> => {
    try {
      setError(null);
      
      const ebook = ebooks.find(e => e.id === ebookId);
      if (!ebook) return false;
      
      const updatedEbook = await updateEbook(ebookId, { atividades: reorderedActivityIds });
      
      setEbooks(prev => prev.map(e => 
        e.id === ebookId ? updatedEbook : e
      ));
      
      // Update selected eBook if it was the one being updated
      if (selectedEbook?.id === ebookId) {
        setSelectedEbookWithPersistence(updatedEbook);
      }
      
      return true;
    } catch (err) {
      console.error('Error reordering activities:', err);
      setError('Erro ao reordenar atividades');
      return false;
    }
  };

  const toggleActivityInEbook = async (ebookId: string, activityId: string): Promise<boolean> => {
    const ebook = ebooks.find(e => e.id === ebookId);
    if (!ebook) return false;
    
    console.log('Toggle atividade:', activityId, 'em eBook:', ebookId, 'Existe?', ebook.atividades.includes(activityId));
    
    if (ebook.atividades.includes(activityId)) {
      return await removeActivityFromEbook(ebookId, activityId);
    } else {
      return await addActivityToEbook(ebookId, activityId);
    }
  };

  const addCustomActivityToEbook = async (ebookId: string, activityData: any): Promise<boolean> => {
    try {
      setError(null);
      
      // Generate a unique ID for the new activity
      const newActivityId = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create the activity with the generated ID
      const customActivity = {
        id: newActivityId,
        ...activityData,
        categoria: 'custom',
        ordem: Date.now()
      };

      // Store custom activity in localStorage for now
      const customActivities = JSON.parse(localStorage.getItem('customActivities') || '{}');
      customActivities[newActivityId] = customActivity;
      localStorage.setItem('customActivities', JSON.stringify(customActivities));

      // Add the activity ID to the eBook
      return await addActivityToEbook(ebookId, newActivityId);
    } catch (err) {
      console.error('Error adding custom activity to eBook:', err);
      setError('Erro ao adicionar atividade personalizada');
      return false;
    }
  };

  const isActivityInEbook = (ebookId: string, activityId: string): boolean => {
    const ebook = ebooks.find(e => e.id === ebookId);
    return ebook ? ebook.atividades.includes(activityId) : false;
  };

  const createNewEbook = async (data: CreateEbook): Promise<Ebook | null> => {
    try {
      setError(null);
      
      // Check if name already exists
      if (checkEbookNameExists(data.nome)) {
        return null;
      }

      const newEbook = await createEbook(data);
      setEbooks(prev => [...prev, newEbook].sort((a, b) => a.nome.localeCompare(b.nome)));
      
      return newEbook;
    } catch (err) {
      console.error('Error creating eBook:', err);
      setError('Erro ao criar eBook');
      return null;
    }
  };

  const updateEbookData = async (id: string, data: UpdateEbook): Promise<Ebook | null> => {
    try {
      setError(null);
      
      // Check if name already exists (excluding current eBook)
      if (data.nome && checkEbookNameExists(data.nome, id)) {
        return null;
      }

      const updatedEbook = await updateEbook(id, data);
      setEbooks(prev => prev.map(ebook => 
        ebook.id === id ? updatedEbook : ebook
      ).sort((a, b) => a.nome.localeCompare(b.nome)));
      
      // Update selected eBook if it was the one being updated
      if (selectedEbook?.id === id) {
        setSelectedEbook(updatedEbook);
      }
      
      return updatedEbook;
    } catch (err) {
      console.error('Error updating eBook:', err);
      setError('Erro ao atualizar eBook');
      return null;
    }
  };

  const deleteEbookData = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      
      await deleteEbook(id);
      setEbooks(prev => prev.filter(ebook => ebook.id !== id));
      
      // Clear selection if deleted eBook was selected
      if (selectedEbook?.id === id) {
        setSelectedEbook(null);
      }
      
      return true;
    } catch (err) {
      console.error('Error deleting eBook:', err);
      setError('Erro ao excluir eBook');
      return false;
    }
  };

  const cloneEbookData = async (id: string, newName: string): Promise<Ebook | null> => {
    try {
      setError(null);
      
      // Check if name already exists
      if (checkEbookNameExists(newName)) {
        return null;
      }

      const clonedEbook = await cloneEbook(id, newName);
      setEbooks(prev => [...prev, clonedEbook].sort((a, b) => a.nome.localeCompare(b.nome)));
      
      return clonedEbook;
    } catch (err) {
      console.error('Error cloning eBook:', err);
      setError('Erro ao clonar eBook');
      return null;
    }
  };

  // Load eBooks when user changes
  useEffect(() => {
    if (user) {
      refreshEbooks();
    } else {
      setEbooks([]);
      setSelectedEbook(null);
      localStorage.removeItem('selectedEbook');
      setLoading(false);
    }
  }, [user]);

  const value: EBookContextType = {
    ebooks,
    selectedEbook,
    loading,
    error,
    setSelectedEbook,
    setSelectedEbookWithPersistence,
    createNewEbook,
    updateEbookData,
    deleteEbookData,
    cloneEbookData,
    refreshEbooks,
    checkEbookNameExists,
    addActivityToEbook,
    addCustomActivityToEbook,
    removeActivityFromEbook,
    reorderActivities,
    toggleActivityInEbook,
    isActivityInEbook,
  };

  return (
    <EBookContext.Provider value={value}>
      {children}
    </EBookContext.Provider>
  );
}