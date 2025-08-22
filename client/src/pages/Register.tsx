import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerWithEmail, loginWithGoogle } from '@/lib/firebase';
import { registerSchema, type RegisterForm } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Eye, EyeOff, Book } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface RegisterProps {
  onSwitchToLogin: () => void;
}

export default function Register({ onSwitchToLogin }: RegisterProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      terms: false,
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      await registerWithEmail(data.email, data.password, data.name);
      toast({
        title: "Conta criada com sucesso!",
        description: "Bem-vindo ao Teatrinho. Agora você pode começar a criar seus eBooks.",
      });
    } catch (error: any) {
      toast({
        title: "Falha no registro",
        description: error.message || "Tente novamente.",
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
      toast({
        title: "Bem-vindo ao Teatrinho!",
        description: "Sua conta foi criada com Google com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Falha no registro com Google",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-4 text-gray-600 hover:text-gray-900"
          onClick={onSwitchToLogin}
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao login
        </Button>

        {/* Header */}
        <div className="text-center mb-8">
          {/* Logo acima do título */}
          <div className="w-20 h-20 bg-primary-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
            <Book className="text-white" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="text-register-title">Criar Conta</h1>
          <p className="text-gray-600">Junte-se ao Teatrinho e comece sua jornada de leitura.</p>
        </div>

        {/* Register Form Card */}
        <Card className="mb-6 shadow-material bg-white/80 backdrop-blur-sm border border-white/50">
          <CardContent className="p-6">
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
                          data-testid="input-name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email Input */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Endereço de email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Digite seu email"
                          className="border-2 border-gray-200 rounded-xl focus:border-primary-500 h-12"
                          data-testid="input-email"
                          {...field}
                        />
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
                      <FormLabel className="text-gray-700">Senha (mín. 6 caracteres)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Digite sua senha"
                            className="border-2 border-gray-200 rounded-xl focus:border-primary-500 h-12 pr-12"
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

                {/* Terms Checkbox */}
                <FormField
                  control={form.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-terms"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm text-gray-600">
                          Eu concordo com os{' '}
                          <Button variant="link" className="text-primary-500 hover:text-primary-600 p-0 h-auto text-sm" data-testid="link-terms">
                            Termos de Serviço
                          </Button>{' '}
                          e{' '}
                          <Button variant="link" className="text-primary-500 hover:text-primary-600 p-0 h-auto text-sm" data-testid="link-privacy">
                            Política de Privacidade
                          </Button>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                {/* Register Button */}
                <Button
                  type="submit"
                  className="w-full bg-primary-500 text-white py-3 rounded-xl font-semibold hover:bg-primary-600 h-12 shadow-lg border-0"
                  disabled={isLoading}
                  data-testid="button-submit"
                >
                  {isLoading ? 'Criando conta...' : 'Criar Conta'}
                </Button>

                {/* Divider */}
                <div className="relative flex items-center justify-center my-6">
                  <div className="border-t border-gray-200 w-full"></div>
                  <span className="bg-white px-4 text-gray-500 text-sm">ou</span>
                </div>

                {/* Google Sign Up */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 h-12"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                  data-testid="button-google-signup"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {isGoogleLoading ? 'Criando conta...' : 'Criar conta com Google'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
