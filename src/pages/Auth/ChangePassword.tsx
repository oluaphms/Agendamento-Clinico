import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

const ChangePassword: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { updatePassword, user } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!currentPassword.trim()) {
      toast.error('Senha atual é obrigatória');
      return;
    }

    if (!newPassword.trim()) {
      toast.error('Nova senha é obrigatória');
      return;
    }

    if (newPassword.length < 3) {
      toast.error('Nova senha deve ter pelo menos 3 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Confirmação de senha não confere');
      return;
    }

    if (currentPassword === newPassword) {
      toast.error('A nova senha deve ser diferente da senha atual');
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

  return (
    <>
      <Helmet>
        <title>Alterar Senha - Sistema Clínica</title>
      </Helmet>

      <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full space-y-8'>
          {/* Header */}
          <div className='text-center'>
            <div className='mx-auto h-16 w-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mb-4'>
              <CheckCircle size={32} className='text-white' />
            </div>
            <h2 className='text-3xl font-bold text-gray-900 mb-2'>
              Alterar Senha
            </h2>
            <p className='text-gray-600'>
              Olá, {user?.user_metadata?.nome || 'Usuário'}!
              <br />
              Por favor, altere sua senha para continuar.
            </p>
          </div>

          {/* Form */}
          <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
            <div className='space-y-4'>
              {/* Senha Atual */}
              <div>
                <label
                  htmlFor='currentPassword'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Senha Atual *
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <Lock size={16} className='text-gray-400' />
                  </div>
                  <input
                    id='currentPassword'
                    name='currentPassword'
                    type={showCurrentPassword ? 'text' : 'password'}
                    autoComplete='current-password'
                    required
                    className='w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    placeholder='Digite sua senha atual'
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                  />
                  <button
                    type='button'
                    className='absolute inset-y-0 right-0 pr-3 flex items-center'
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={16} className='text-gray-400' />
                    ) : (
                      <Eye size={16} className='text-gray-400' />
                    )}
                  </button>
                </div>
              </div>

              {/* Nova Senha */}
              <div>
                <label
                  htmlFor='newPassword'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Nova Senha *
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <Lock size={16} className='text-gray-400' />
                  </div>
                  <input
                    id='newPassword'
                    name='newPassword'
                    type={showNewPassword ? 'text' : 'password'}
                    autoComplete='new-password'
                    required
                    className='w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
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
                      <EyeOff size={16} className='text-gray-400' />
                    ) : (
                      <Eye size={16} className='text-gray-400' />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirmar Nova Senha */}
              <div>
                <label
                  htmlFor='confirmPassword'
                  className='block text-sm font-medium text-gray-700 mb-1'
                >
                  Confirmar Nova Senha *
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <Lock size={16} className='text-gray-400' />
                  </div>
                  <input
                    id='confirmPassword'
                    name='confirmPassword'
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete='new-password'
                    required
                    className='w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
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
                      <EyeOff size={16} className='text-gray-400' />
                    ) : (
                      <Eye size={16} className='text-gray-400' />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type='submit'
                disabled={isSubmitting}
                className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200'
              >
                {isSubmitting ? (
                  <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
                ) : (
                  'Alterar Senha'
                )}
              </button>
            </div>

            {/* Informações de Segurança */}
            <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
              <h3 className='text-sm font-medium text-blue-800 mb-2'>
                Requisitos da Senha
              </h3>
              <ul className='text-xs text-blue-700 space-y-1'>
                <li>• Mínimo de 3 caracteres</li>
                <li>• Deve ser diferente da senha atual</li>
                <li>• Recomendamos usar letras, números e símbolos</li>
              </ul>
            </div>
          </form>

          {/* Footer */}
          <div className='text-center text-xs text-gray-500'>
            <p>Sistema de Gestão de Clínica</p>
            <p>© 2024 Todos os direitos reservados</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChangePassword;
