import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { logout, updateUserStatus, updateUserDocument, updateUserPassword } from '@/lib/firebase';
import { updateProfileSchema, changePasswordSchema, type UpdateProfileForm, type ChangePasswordForm } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { User, Lock, Crown, LogOut, ChevronRight, Menu, Power, Edit, Eye, EyeOff } from 'lucide-react';

export default function Profile() {
  const { user, userProfile, isSubscriber, refreshUserProfile } = useAuth();
  const { toast } = useToast();
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      toast({
        title: "Erro ao fazer logout",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const profileForm = useForm<UpdateProfileForm>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: userProfile?.name || '',
    },
  });

  const passwordForm = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handleEditProfile = () => {
    if (userProfile) {
      profileForm.reset({ name: userProfile.name });
      setShowEditDialog(true);
    }
  };

  const handleChangePassword = () => {
    // Only allow password change for email users
    if (userProfile?.provider === 'google') {
      toast({
        title: "Não disponível",
        description: "Usuários do Google devem alterar a senha através da conta Google.",
        variant: "destructive",
      });
      return;
    }
    passwordForm.reset();
    setShowPasswordDialog(true);
  };

  const handleUpdateProfile = async (data: UpdateProfileForm) => {
    if (!user || !userProfile) return;

    setIsUpdatingProfile(true);
    try {
      await updateUserDocument(user.uid, { name: data.name });
      await refreshUserProfile();
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
      setShowEditDialog(false);
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (data: ChangePasswordForm) => {
    setIsChangingPassword(true);
    try {
      await updateUserPassword(data.currentPassword, data.newPassword);
      toast({
        title: "Senha alterada",
        description: "Sua senha foi alterada com sucesso.",
      });
      setShowPasswordDialog(false);
      passwordForm.reset();
    } catch (error: any) {
      let message = "Tente novamente.";
      if (error.code === 'auth/wrong-password') {
        message = "Senha atual incorreta.";
      } else if (error.code === 'auth/weak-password') {
        message = "A nova senha é muito fraca.";
      }
      toast({
        title: "Erro ao alterar senha",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!userProfile) return;
    
    setUpdatingStatus(true);
    try {
      const newStatus = !userProfile.ativo;
      await updateUserStatus(newStatus);
      await refreshUserProfile();
      
      toast({
        title: "Status atualizado",
        description: `Sua conta foi ${newStatus ? 'ativada' : 'desativada'}.`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Erro ao atualizar status",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="p-4">
      <div className="max-w-lg mx-auto">
        {/* User Profile Section */}
        <Card className="shadow-lg bg-white border border-gray-200 mb-4">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              {userProfile?.photoURL ? (
                <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                  <img 
                    src={userProfile.photoURL} 
                    alt="Foto do usuário"
                    className="w-full h-full object-cover"
                    data-testid="img-profile-photo"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-semibold flex-shrink-0">
                  {getInitials(userProfile?.name)}
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900" data-testid="text-profile-name">
                  {userProfile?.name || 'Usuário'}
                </h2>
                <p className="text-gray-600 text-sm" data-testid="text-profile-email">
                  {userProfile?.email}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    userProfile?.ativo !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    ● {userProfile?.ativo !== false ? 'Ativo' : 'Inativo'}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    isSubscriber ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {isSubscriber ? '● Assinante' : '● Não Assinante'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
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

            {/* Controle de Status da Conta */}
            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  userProfile?.ativo !== false ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <Power className={`h-5 w-5 ${
                    userProfile?.ativo !== false ? 'text-green-600' : 'text-red-600'
                  }`} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Status da Conta</p>
                  <p className="text-sm text-gray-500">
                    {userProfile?.ativo !== false ? 'Sua conta está ativa' : 'Sua conta está inativa'}
                  </p>
                </div>
              </div>
              <Switch
                checked={userProfile?.ativo !== false}
                onCheckedChange={handleToggleStatus}
                disabled={updatingStatus}
                data-testid="switch-account-status"
                aria-label="Ativar/Desativar conta"
              />
            </div>

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
                  Acesse recursos exclusivos e conteúdo premium da Teatrinho
                </p>
                <Button
                  asChild
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold mb-2"
                  data-testid="button-activate-now"
                >
                  <a href="https://google.com.br" target="_blank" rel="noopener noreferrer">
                    Assinar Agora
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

      {/* Edit Profile Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
            <DialogDescription>
              Atualize suas informações pessoais.
            </DialogDescription>
          </DialogHeader>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(handleUpdateProfile)} className="space-y-4">
              <FormField
                control={profileForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Seu nome completo"
                        className="h-12"
                        data-testid="input-profile-name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowEditDialog(false)}
                  data-testid="button-cancel-edit"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  style={{backgroundColor: '#1800ad'}}
                  disabled={isUpdatingProfile}
                  data-testid="button-save-profile"
                >
                  {isUpdatingProfile ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
            <DialogDescription>
              Digite sua senha atual e a nova senha.
            </DialogDescription>
          </DialogHeader>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(handleUpdatePassword)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha Atual</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showCurrentPassword ? 'text' : 'password'}
                          placeholder="Digite sua senha atual"
                          className="h-12 pr-12"
                          data-testid="input-current-password"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          data-testid="button-toggle-current-password"
                        >
                          {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? 'text' : 'password'}
                          placeholder="Digite a nova senha"
                          className="h-12 pr-12"
                          data-testid="input-new-password"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          data-testid="button-toggle-new-password"
                        >
                          {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Nova Senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirme a nova senha"
                          className="h-12 pr-12"
                          data-testid="input-confirm-password"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          data-testid="button-toggle-confirm-password"
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowPasswordDialog(false)}
                  data-testid="button-cancel-password"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  style={{backgroundColor: '#1800ad'}}
                  disabled={isChangingPassword}
                  data-testid="button-save-password"
                >
                  {isChangingPassword ? 'Alterando...' : 'Alterar Senha'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}