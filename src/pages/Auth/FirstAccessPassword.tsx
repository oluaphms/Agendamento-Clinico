import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Shield } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

const FirstAccessPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { updatePassword, skipPasswordChange, user } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!newPassword.trim()) {
      toast.error('Nova senha é obrigatória');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Confirmação de senha não confere');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await updatePassword(newPassword);
      if (result.success) {
        toast.success('Senha alterada com sucesso!');
        navigate('/app/dashboard', { replace: true });
      } else {
        toast.error(result.error || 'Erro ao alterar senha');
      }
    } catch (error) {
      toast.error('Erro inesperado');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipPasswordChange = async () => {
    setIsSubmitting(true);

    try {
      const result = await skipPasswordChange();
      if (result.success) {
        toast.success('Continuando com senha padrão');
        navigate('/app/dashboard', { replace: true });
      } else {
        toast.error(result.error || 'Erro ao continuar com senha padrão');
      }
    } catch (error) {
      toast.error('Erro inesperado');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Primeiro Acesso - Sistema Clínica</title>
      </Helmet>

      <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full space-y-8'>
          {/* Header */}
          <div className='text-center'>
            <div className='mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4'>
              <Shield size={32} className='text-white' />
            </div>
            <h2 className='text-3xl font-bold text-gray-900 dark:text-white mb-2'>
              Primeiro Acesso
            </h2>
            <p className='text-gray-600 dark:text-gray-300'>
              Olá, {user?.user_metadata?.nome || 'Usuário'}!
              <br />
              <span className='font-medium text-blue-600 dark:text-blue-400'>
                Por segurança, altere sua senha antes de continuar.
              </span>
              <br />
              <span className='text-sm text-gray-500 dark:text-gray-400'>
                Ou continue com sua senha padrão se preferir.
              </span>
            </p>
          </div>

          {/* Form */}
          <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
            <div className='space-y-4'>
              {/* Nova Senha */}
              <div>
                <label
                  htmlFor='newPassword'
                  className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                >
                  Nova Senha *
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <Lock size={16} className='text-gray-400 dark:text-gray-500' />
                  </div>
                  <input
                    id='newPassword'
                    name='newPassword'
                    type={showNewPassword ? 'text' : 'password'}
                    autoComplete='new-password'
                    required
                    className='w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                    placeholder='Digite sua nova senha'
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                  <button
                    type='button'
                    className='absolute inset-y-0 right-0 pr-3 flex items-center'
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff size={16} className='text-gray-400 dark:text-gray-500' />
                    ) : (
                      <Eye size={16} className='text-gray-400 dark:text-gray-500' />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirmar Nova Senha */}
              <div>
                <label
                  htmlFor='confirmPassword'
                  className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                >
                  Confirmar Nova Senha *
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <Lock size={16} className='text-gray-400 dark:text-gray-500' />
                  </div>
                  <input
                    id='confirmPassword'
                    name='confirmPassword'
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete='new-password'
                    required
                    className='w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                    placeholder='Confirme sua nova senha'
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type='button'
                    className='absolute inset-y-0 right-0 pr-3 flex items-center'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={16} className='text-gray-400 dark:text-gray-500' />
                    ) : (
                      <Eye size={16} className='text-gray-400 dark:text-gray-500' />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className='space-y-3'>
              {/* Submit Button */}
              <button
                type='submit'
                disabled={isSubmitting}
                className='w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200'
              >
                {isSubmitting ? (
                  <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
                ) : (
                  'Alterar Senha e Continuar'
                )}
              </button>

              {/* Cancel Button */}
              <button
                type='button'
                onClick={handleSkipPasswordChange}
                disabled={isSubmitting}
                className='w-full flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200'
              >
                {isSubmitting ? (
                  <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400'></div>
                ) : (
                  'Continuar com Senha Padrão'
                )}
              </button>
            </div>

            {/* Informações de Segurança */}
            <div className='bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4'>
              <h3 className='text-sm font-medium text-blue-800 dark:text-blue-300 mb-2'>
                Informações Importantes
              </h3>
              <ul className='text-xs text-blue-700 dark:text-blue-400 space-y-1'>
                <li>• Escolha uma senha segura e fácil de lembrar</li>
                <li>• Não há limite mínimo de caracteres</li>
                <li>• Recomendamos usar letras, números e símbolos</li>
                <li>• Esta é sua senha definitiva para o sistema</li>
                <li>• Você pode continuar com sua senha padrão se preferir</li>
              </ul>
            </div>
          </form>

          {/* Footer */}
          <div className='text-center text-xs text-gray-500 dark:text-gray-400'>
            <p>Sistema de Gestão de Clínica</p>
            <p>© 2024 Todos os direitos reservados</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default FirstAccessPassword;
