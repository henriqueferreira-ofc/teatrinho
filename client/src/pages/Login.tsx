import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginWithEmail, loginWithGoogle, sendPasswordReset } from '@/lib/firebase';
import { loginSchema, passwordResetSchema, type LoginForm, type PasswordResetForm } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye, EyeOff, Mail } from 'lucide-react';
import logoUrl from '@assets/LOGO DE APLICATIVOSs_1755877873488.png';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

interface LoginProps {
  onSwitchToRegister: () => void;
}

export default function Login({ onSwitchToRegister }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const resetForm = useForm<PasswordResetForm>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      await loginWithEmail(data.email, data.password);
    } catch (error: any) {
      toast({
        title: "Falha no login",
        description: error.message || "Verifique suas credenciais e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (error: any) {
      toast({
        title: "Falha no login com Google",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handlePasswordReset = async (data: PasswordResetForm) => {
    setIsResetLoading(true);
    try {
      await sendPasswordReset(data.email);
      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
      setShowResetDialog(false);
      resetForm.reset();
    } catch (error: any) {
      toast({
        title: "Erro ao enviar email",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{backgroundColor: '#f5f5f5'}} >
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            {/* Logo */}
            <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <img 
                src={logoUrl} 
                alt="Teatrinho Logo" 
                className="w-full h-full object-contain rounded-2xl shadow-lg"
                data-testid="app-logo"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="text-app-title">
              Teatrinho
            </h1>
            <p className="text-gray-600">Faça login ou crie sua conta para continuar</p>
          </div>

          {/* Main Card */}
          <Card className="bg-white shadow-lg rounded-2xl border-0">
            <CardContent className="p-0">
              {/* Card Header with tabs */}
              <div className="p-6 pb-4">
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-6" data-testid="text-card-title">
                  Entrar
                </h2>
                
                {/* Tab Navigation */}
                <div className="flex mb-6">
                  <button 
                    className="flex-1 py-2 text-center font-medium text-gray-900 border-b-2 border-gray-900"
                    data-testid="tab-login"
                  >
                    Entrar
                  </button>
                  <button 
                    className="flex-1 py-2 text-center font-medium text-gray-500 border-b border-gray-200"
                    onClick={onSwitchToRegister}
                    data-testid="tab-register"
                  >
                    Cadastrar
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <div className="px-6 pb-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {/* Email Input */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                              <Input
                                type="email"
                                placeholder="Seu email"
                                className="pl-12 h-14 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 text-gray-900 placeholder:text-gray-500"
                                data-testid="input-email"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Password Input */}
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Sua senha"
                                className="h-14 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 text-gray-900 placeholder:text-gray-500 pr-12"
                                data-testid="input-password"
                                {...field}
                              />
                              <button
                                type="button"
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                onClick={() => setShowPassword(!showPassword)}
                                data-testid="button-toggle-password"
                              >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Forgot Password Link */}
                    <div className="text-center">
                      <Button
                        type="button"
                        variant="link"
                        className="text-sm text-gray-600 hover:text-gray-900 p-0"
                        onClick={() => setShowResetDialog(true)}
                        data-testid="button-forgot-password"
                      >
                        Esqueceu sua senha?
                      </Button>
                    </div>

                    {/* Login Button */}
                    <div className="pt-4">
                      <Button
                        type="submit"
                        className="w-full h-14 text-white font-semibold rounded-xl shadow-lg border-0"
                        style={{backgroundColor: '#1800ad'}}
                        disabled={isLoading}
                        data-testid="button-submit"
                      >
                        {isLoading ? 'Entrando...' : 'Entrar'}
                      </Button>
                    </div>

                    {/* Divider */}
                    <div className="relative flex items-center justify-center py-4">
                      <div className="border-t border-gray-200 w-full"></div>
                      <span className="bg-white px-4 text-gray-500 text-sm absolute">ou</span>
                    </div>

                    {/* Google Sign In */}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-14 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50"
                      onClick={handleGoogleSignIn}
                      disabled={isGoogleLoading}
                      data-testid="button-google-signin"
                    >
                      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      {isGoogleLoading ? 'Entrando...' : 'Continuar com Google'}
                    </Button>
                  </form>
                </Form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Password Reset Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Recuperar Senha</DialogTitle>
            <DialogDescription>
              Digite seu email para receber instruções de recuperação de senha.
            </DialogDescription>
          </DialogHeader>
          <Form {...resetForm}>
            <form onSubmit={resetForm.handleSubmit(handlePasswordReset)} className="space-y-4">
              <FormField
                control={resetForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                          type="email"
                          placeholder="Seu email"
                          className="pl-12 h-14 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0"
                          data-testid="input-reset-email"
                          {...field}
                        />
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
                  onClick={() => setShowResetDialog(false)}
                  data-testid="button-cancel-reset"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  style={{backgroundColor: '#1800ad'}}
                  disabled={isResetLoading}
                  data-testid="button-send-reset"
                >
                  {isResetLoading ? 'Enviando...' : 'Enviar'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}