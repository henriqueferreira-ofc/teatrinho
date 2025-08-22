import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Home as HomeIcon } from 'lucide-react';

export default function Home() {
  const { userProfile } = useAuth();

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white mb-6">
          <h2 className="text-2xl font-bold mb-2" data-testid="text-welcome">
            Bem-vindo de volta, {userProfile?.name?.split(' ')[0] || 'Usuário'}!
          </h2>
          <p className="text-primary-100">Continue sua jornada de leitura com o Teatrinho.</p>
        </div>

        {/* Empty State */}
        <Card className="shadow-material">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <HomeIcon className="text-gray-400 text-2xl" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2" data-testid="text-home-title">Tela Inicial</h3>
            <p className="text-gray-600 mb-6" data-testid="text-home-description">
              Esta tela ainda não está implementada. Recursos futuros incluirão recomendações de leitura, livros recentes e estatísticas de leitura.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <h4 className="font-semibold text-gray-900 mb-2">Em breve:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Recomendações de leitura</li>
                <li>• eBooks abertos recentemente</li>
                <li>• Acompanhamento do progresso de leitura</li>
                <li>• Metas diárias de leitura</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
