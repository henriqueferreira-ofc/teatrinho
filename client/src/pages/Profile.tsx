import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserProfile, uploadProfileImage, deleteProfileImage } from '@/lib/firebase';
import { updateProfileSchema, type UpdateProfileForm } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Camera, Upload, Trash2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

export default function Profile() {
  const { userProfile, refreshUserProfile, user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const form = useForm<UpdateProfileForm>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: userProfile?.name || '',
      currentPassword: '',
      newPassword: '',
    },
  });

  // Update form when userProfile changes
  React.useEffect(() => {
    if (userProfile) {
      form.reset({
        name: userProfile.name,
        currentPassword: '',
        newPassword: '',
      });
    }
  }, [userProfile, form]);

  const onSubmit = async (data: UpdateProfileForm) => {
    setIsLoading(true);
    try {
      // Se tem nova senha, precisa da senha atual. Se não tem nova senha, só atualiza o nome
      const updateData: any = { name: data.name };
      
      if (data.newPassword && data.newPassword.length > 0) {
        updateData.currentPassword = data.currentPassword;
        updateData.newPassword = data.newPassword;
      }
      
      await updateUserProfile(updateData);
      
      await refreshUserProfile();
      setIsEditing(false);
      form.reset({
        name: data.name,
        currentPassword: '',
        newPassword: '',
      });
      
      toast({
        title: "Perfil atualizado com sucesso",
        description: "Suas alterações foram salvas.",
      });
    } catch (error: any) {
      toast({
        title: "Falha na atualização",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione uma imagem.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingPhoto(true);
    try {
      // Delete old photo if exists
      if (userProfile?.photoURL) {
        await deleteProfileImage(userProfile.photoURL);
      }

      // Upload new photo
      const photoURL = await uploadProfileImage(file);
      
      // Update profile with new photo
      await updateUserProfile({
        name: userProfile?.name || '',
        photoURL,
      });

      await refreshUserProfile();
      
      toast({
        title: "Foto atualizada com sucesso",
        description: "Sua foto de perfil foi alterada.",
      });
    } catch (error: any) {
      toast({
        title: "Falha no upload",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeletePhoto = async () => {
    if (!userProfile?.photoURL) return;

    setIsUploadingPhoto(true);
    try {
      await deleteProfileImage(userProfile.photoURL);
      
      await updateUserProfile({
        name: userProfile.name,
        photoURL: '',
      });

      await refreshUserProfile();
      
      toast({
        title: "Foto removida",
        description: "Sua foto de perfil foi removida.",
      });
    } catch (error: any) {
      toast({
        title: "Falha ao remover foto",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    form.reset({
      name: userProfile?.name || '',
      currentPassword: '',
      newPassword: '',
    });
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    // Pega apenas a primeira letra do primeiro nome
    return name.charAt(0).toUpperCase();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
    });
  };

  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto">
        {/* Profile Header */}
        <Card className="mb-6 shadow-material bg-white/80 backdrop-blur-sm border border-white/50">
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4 mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg" style={{backgroundColor: '#2563eb'}}>
                  {userProfile?.photoURL || user?.photoURL ? (
                    <img 
                      src={userProfile?.photoURL || user?.photoURL || ''} 
                      alt="Foto de perfil" 
                      className="w-full h-full object-cover rounded-full"
                      data-testid="img-profile-photo"
                    />
                  ) : (
                    <span className="text-white text-2xl font-bold" data-testid="text-profile-initials">
                      {getInitials(userProfile?.name)}
                    </span>
                  )}
                </div>
                <Button
                  size="sm"
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full p-0 shadow-lg border-2 border-white"
                  style={{backgroundColor: '#2563eb', color: 'white'}}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  data-testid="button-upload-photo"
                >
                  <Camera className="h-3 w-3" />
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  className="hidden"
                  data-testid="input-photo-upload"
                />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-1" data-testid="text-profile-name">
                  {userProfile?.name || 'User'}
                </h2>
                <p className="text-gray-600 mb-3" data-testid="text-profile-email">
                  {userProfile?.email}
                </p>
                <Badge variant="secondary" className="bg-primary-100 text-primary-700" data-testid="badge-provider">
                  {userProfile?.provider === 'google' ? 'Google' : 'Email'}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button
                className="w-full text-white py-3 rounded-xl font-semibold shadow-lg border-0"
                style={{backgroundColor: '#2563eb', color: 'white'}}
                onClick={() => setIsEditing(!isEditing)}
                data-testid="button-edit-profile"
              >
                {isEditing ? 'Cancelar Edição' : 'Editar Perfil'}
              </Button>
              
              {(userProfile?.photoURL || user?.photoURL) && (
                <Button
                  variant="outline"
                  className="w-full border-2 border-red-200 text-red-600 py-3 rounded-xl font-semibold hover:bg-red-50"
                  onClick={handleDeletePhoto}
                  disabled={isUploadingPhoto}
                  data-testid="button-delete-photo"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isUploadingPhoto ? 'Removendo...' : 'Remover Foto'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile Form */}
        {isEditing && (
          <Card className="mb-6 shadow-material bg-white/80 backdrop-blur-sm border border-white/50">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6" data-testid="text-edit-title">Editar Perfil</h3>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Name Input */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Nome completo</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Digite seu nome completo"
                            className="border-2 border-gray-200 rounded-xl focus:border-primary-500 h-12"
                            data-testid="input-edit-name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Current Password (only for email users) */}
                  {userProfile?.provider === 'email' && (
                    <FormField
                      control={form.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Senha atual</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showCurrentPassword ? 'text' : 'password'}
                                placeholder="Digite a senha atual para alterá-la"
                                className="border-2 border-gray-200 rounded-xl focus:border-primary-500 h-12 pr-12"
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
                  )}

                  {/* New Password (only for email users) */}
                  {userProfile?.provider === 'email' && (
                    <FormField
                      control={form.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Nova senha (opcional)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showNewPassword ? 'text' : 'password'}
                                placeholder="Digite a nova senha"
                                className="border-2 border-gray-200 rounded-xl focus:border-primary-500 h-12 pr-12"
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
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50"
                      onClick={handleCancelEdit}
                      data-testid="button-cancel-edit"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 text-white py-3 rounded-xl font-semibold shadow-lg border-0"
                      style={{backgroundColor: '#2563eb', color: 'white'}}
                      disabled={isLoading}
                      data-testid="button-save-changes"
                    >
                      {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Account Information */}
        <Card className="mb-6 shadow-material bg-white/80 backdrop-blur-sm border border-white/50">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4" data-testid="text-account-title">Informações da Conta</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">ID do Usuário</span>
                <span className="text-gray-900 font-mono text-sm" data-testid="text-user-id">
                  {userProfile?.id?.slice(0, 12)}...
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Email</span>
                <span className="text-gray-900" data-testid="text-account-email">
                  {userProfile?.email}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Método de Autenticação</span>
                <span className="text-gray-900" data-testid="text-auth-method">
                  {userProfile?.provider === 'google' ? 'Google' : 'Email'}
                </span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-gray-600">Membro desde</span>
                <span className="text-gray-900" data-testid="text-member-since">
                  {formatDate(userProfile?.createdAt)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="shadow-material bg-white/80 backdrop-blur-sm border border-white/50 border-l-4 border-red-500">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-red-600 mb-4" data-testid="text-danger-title">Zona de Perigo</h3>
            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full border-2 border-red-200 text-red-600 py-3 rounded-xl font-semibold hover:bg-red-50"
                data-testid="button-delete-account"
              >
                Excluir Conta
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
