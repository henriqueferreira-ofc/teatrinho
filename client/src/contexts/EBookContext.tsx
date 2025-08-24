import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getUserEbooks, createEbook, updateEbook, deleteEbook, cloneEbook } from '@/lib/firebase';
import type { Ebook, CreateEbook, UpdateEbook } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

interface EBookContextType {
  ebooks: Ebook[];
  selectedEbook: Ebook | null;
  loading: boolean;
  error: string | null;
  setSelectedEbook: (ebook: Ebook | null) => void;
  createNewEbook: (data: CreateEbook) => Promise<Ebook | null>;
  updateEbookData: (id: string, data: UpdateEbook) => Promise<Ebook | null>;
  deleteEbookData: (id: string) => Promise<boolean>;
  cloneEbookData: (id: string, newName: string) => Promise<Ebook | null>;
  refreshEbooks: () => Promise<void>;
  checkEbookNameExists: (name: string, excludeId?: string) => boolean;
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
  const { toast } = useToast();

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
        setSelectedEbook(null);
      }
    } catch (err) {
      console.error('Error fetching eBooks:', err);
      setError('Erro ao carregar eBooks');
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus eBooks.",
        variant: "destructive",
      });
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

  const createNewEbook = async (data: CreateEbook): Promise<Ebook | null> => {
    try {
      setError(null);
      
      // Check if name already exists
      if (checkEbookNameExists(data.nome)) {
        toast({
          title: "Nome já existe",
          description: "Já existe um eBook com esse nome. Escolha um nome diferente.",
          variant: "destructive",
        });
        return null;
      }

      const newEbook = await createEbook(data);
      setEbooks(prev => [...prev, newEbook].sort((a, b) => a.nome.localeCompare(b.nome)));
      
      toast({
        title: "eBook criado",
        description: `O eBook "${newEbook.nome}" foi criado com sucesso.`,
      });
      
      return newEbook;
    } catch (err) {
      console.error('Error creating eBook:', err);
      setError('Erro ao criar eBook');
      toast({
        title: "Erro",
        description: "Não foi possível criar o eBook. Tente novamente.",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateEbookData = async (id: string, data: UpdateEbook): Promise<Ebook | null> => {
    try {
      setError(null);
      
      // Check if name already exists (excluding current eBook)
      if (data.nome && checkEbookNameExists(data.nome, id)) {
        toast({
          title: "Nome já existe",
          description: "Já existe um eBook com esse nome. Escolha um nome diferente.",
          variant: "destructive",
        });
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
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o eBook. Tente novamente.",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteEbookData = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const ebookToDelete = ebooks.find(ebook => ebook.id === id);
      
      await deleteEbook(id);
      setEbooks(prev => prev.filter(ebook => ebook.id !== id));
      
      // Clear selection if deleted eBook was selected
      if (selectedEbook?.id === id) {
        setSelectedEbook(null);
      }
      
      toast({
        title: "eBook excluído",
        description: `O eBook "${ebookToDelete?.nome}" foi excluído com sucesso.`,
      });
      
      return true;
    } catch (err) {
      console.error('Error deleting eBook:', err);
      setError('Erro ao excluir eBook');
      toast({
        title: "Erro",
        description: "Não foi possível excluir o eBook. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  const cloneEbookData = async (id: string, newName: string): Promise<Ebook | null> => {
    try {
      setError(null);
      
      // Check if name already exists
      if (checkEbookNameExists(newName)) {
        toast({
          title: "Nome já existe",
          description: "Já existe um eBook com esse nome. Escolha um nome diferente.",
          variant: "destructive",
        });
        return null;
      }

      const clonedEbook = await cloneEbook(id, newName);
      setEbooks(prev => [...prev, clonedEbook].sort((a, b) => a.nome.localeCompare(b.nome)));
      
      toast({
        title: "eBook clonado",
        description: `O eBook "${clonedEbook.nome}" foi criado com sucesso.`,
      });
      
      return clonedEbook;
    } catch (err) {
      console.error('Error cloning eBook:', err);
      setError('Erro ao clonar eBook');
      toast({
        title: "Erro",
        description: "Não foi possível clonar o eBook. Tente novamente.",
        variant: "destructive",
      });
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
      setLoading(false);
    }
  }, [user]);

  const value: EBookContextType = {
    ebooks,
    selectedEbook,
    loading,
    error,
    setSelectedEbook,
    createNewEbook,
    updateEbookData,
    deleteEbookData,
    cloneEbookData,
    refreshEbooks,
    checkEbookNameExists,
  };

  return (
    <EBookContext.Provider value={value}>
      {children}
    </EBookContext.Provider>
  );
}