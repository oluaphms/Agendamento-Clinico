import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn, user, error, clearError, loading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (user && !loading) {
      const from = location.state?.from?.pathname || '/app/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, location]);

  // Limpar erro ao carregar
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Função para formatar CPF
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatCPF(value);
    setCpf(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!cpf.trim()) {
      toast.error('CPF é obrigatório');
      return;
    }

    if (!password.trim()) {
      toast.error('Senha é obrigatória');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signIn(cpf, password);
      if (result.success) {
        if (result.mustChangePassword) {
          // Redirecionar para alteração de senha
          navigate('/change-password', { replace: true });
        } else {
          // Redirecionar para dashboard
          const from = location.state?.from?.pathname || '/app/dashboard';
          navigate(from, { replace: true });
        }
      } else {
        toast.error(result.error || 'Erro no login');
      }
    } catch (error) {
      toast.error('Erro inesperado');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!cpf.trim()) {
      toast.error('Digite seu CPF primeiro');
      return;
    }

    toast('Funcionalidade de recuperação de senha será implementada em breve', {
      icon: 'ℹ️',
    });
  };

  return (
    <>
      <Helmet>
        <title>Login - Sistema Clínica</title>
      </Helmet>

      <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center py-4 px-4 sm:py-12 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full space-y-6 sm:space-y-8'>
          {/* Header */}
          <div className='text-center'>
            <div className='inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-6 sm:mb-8 shadow-lg'>
              <img
                src='/logo-large.png'
                alt='Sistema Clínico'
                className='w-full h-full'
              />
            </div>
            <h2 className='text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2'>
              Entrar no Sistema
            </h2>
            <p className='text-sm sm:text-base text-gray-600 dark:text-gray-300'>
              Acesse sua conta para continuar
            </p>
          </div>

          {/* Form */}
          <form
            className='mt-6 sm:mt-8 space-y-4 sm:space-y-6'
            onSubmit={handleSubmit}
          >
            <div className='space-y-4'>
              <div>
                <label
                  htmlFor='cpf'
                  className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                >
                  CPF *
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <User
                      size={16}
                      className='text-gray-400 dark:text-gray-500'
                    />
                  </div>
                  <input
                    id='cpf'
                    name='cpf'
                    type='text'
                    autoComplete='username'
                    required
                    className='w-full pl-10 pr-3 py-3 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base'
                    placeholder='000.000.000-00'
                    value={cpf}
                    onChange={handleCPFChange}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor='password'
                  className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                >
                  Senha *
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <Lock
                      size={16}
                      className='text-gray-400 dark:text-gray-500'
                    />
                  </div>
                  <input
                    id='password'
                    name='password'
                    type={showPassword ? 'text' : 'password'}
                    autoComplete='current-password'
                    required
                    className='w-full pl-10 pr-10 py-3 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base'
                    placeholder='Digite sua senha'
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button
                    type='button'
                    className='absolute inset-y-0 right-0 pr-3 flex items-center'
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff
                        size={16}
                        className='text-gray-400 dark:text-gray-500'
                      />
                    ) : (
                      <Eye
                        size={16}
                        className='text-gray-400 dark:text-gray-500'
                      />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className='flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0'>
              <button
                type='button'
                onClick={handleForgotPassword}
                className='text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors'
                disabled={isSubmitting}
              >
                Esqueceu sua senha?
              </button>
              <button
                type='button'
                onClick={() => navigate('/register')}
                className='text-sm text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300 transition-colors font-medium'
                disabled={isSubmitting}
              >
                Cadastrar
              </button>
            </div>

            {error && (
              <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3'>
                <p className='text-sm text-red-600 dark:text-red-400'>
                  {error}
                </p>
              </div>
            )}

            <div>
              <button
                type='submit'
                disabled={isSubmitting}
                className='w-full flex justify-center py-3 sm:py-2 px-4 border border-transparent rounded-md shadow-sm text-base sm:text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200'
              >
                {isSubmitting ? (
                  <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
                ) : (
                  'Entrar'
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className='text-center text-xs text-gray-500 dark:text-gray-400'>
            <p>Sistema de Gestão de Clínica</p>
            <p>© Todos os direitos reservados</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
