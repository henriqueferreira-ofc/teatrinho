import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Grid3X3, Plus } from 'lucide-react';

export default function Categories() {
  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900" data-testid="text-categories-title">Categorias</h2>
          <Button className="bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600" data-testid="button-add-category">
            <Plus className="h-4 w-4 mr-2" />
            Nova Categoria
          </Button>
        </div>

        {/* Empty State */}
        <Card className="shadow-material bg-white/80 backdrop-blur-sm border border-white/50">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Grid3X3 className="text-gray-400 text-2xl" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2" data-testid="text-empty-title">Nenhuma categoria ainda</h3>
            <p className="text-gray-600 mb-6" data-testid="text-empty-description">
              Esta tela ainda não está implementada. Recursos futuros incluirão organização de conteúdo por categorias e gêneros.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <h4 className="font-semibold text-gray-900 mb-2">Em breve:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Criar e gerenciar categorias personalizadas</li>
                <li>• Organizar conteúdo por gêneros teatrais</li>
                <li>• Filtrar eBooks e vídeos por categoria</li>
                <li>• Sugestões de conteúdo por preferências</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}