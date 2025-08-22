import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { logout } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Lock, Crown, LogOut, ChevronRight } from 'lucide-react';

export default function Profile() {
  const { userProfile, isSubscriber } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado da sua conta.",
      });
    } catch (error) {
      toast({
        title: "Erro ao fazer logout",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleEditProfile = () => {
    // TODO: Implementar navegação para tela de editar perfil
    toast({
      title: "Em desenvolvimento",
      description: "Funcionalidade será implementada em breve.",
    });
  };

  const handleChangePassword = () => {
    // TODO: Implementar navegação para tela de alterar senha
    toast({
      title: "Em desenvolvimento", 
      description: "Funcionalidade será implementada em breve.",
    });
  };

  return (
    <div className="p-4">
      <div className="max-w-lg mx-auto">
        <Card className="shadow-lg bg-white border border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-medium text-gray-900">
              Configurações da Conta
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Editar Perfil */}
            <Button
              variant="ghost"
              className="w-full justify-between p-4 h-auto hover:bg-gray-50"
              onClick={handleEditProfile}
              data-testid="button-edit-profile"
            >
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-600" />
                <span className="text-gray-900 font-medium">Editar Perfil</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </Button>

            {/* Alterar Senha - só mostra para usuários de email */}
            {userProfile?.provider === 'email' && (
              <Button
                variant="ghost"
                className="w-full justify-between p-4 h-auto hover:bg-gray-50"
                onClick={handleChangePassword}
                data-testid="button-change-password"
              >
                <div className="flex items-center space-x-3">
                  <Lock className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-900 font-medium">Alterar Senha</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </Button>
            )}

            {/* Seção de Assinatura */}
            {!isSubscriber && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-4">
                <div className="flex items-center justify-center mb-3">
                  <Crown className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="text-center font-semibold text-gray-900 mb-2">
                  Torne-se um Assinante
                </h3>
                <p className="text-center text-sm text-gray-600 mb-4">
                  Acesse recursos exclusivos disponíveis em nosso Painel
                </p>
                <Button
                  asChild
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold mb-2"
                  data-testid="button-activate-now"
                >
                  <a href="https://google.com.br" target="_blank" rel="noopener noreferrer">
                    Ativar Agora
                  </a>
                </Button>
              </div>
            )}

            {/* Mostrar status de assinante ativo */}
            {isSubscriber && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 my-4">
                <div className="flex items-center justify-center mb-2">
                  <Crown className="h-6 w-6 text-green-600 mr-2" />
                  <span className="text-green-800 font-semibold">Assinante Ativo</span>
                </div>
                <p className="text-center text-sm text-green-600">
                  Você tem acesso a todos os recursos exclusivos
                </p>
              </div>
            )}

            {/* Sair da Conta */}
            <Button
              variant="destructive"
              className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair da Conta
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}