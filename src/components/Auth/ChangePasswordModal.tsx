import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: any;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  user,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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

    setLoading(true);

    try {
      // Usar a função real de alteração de senha do authStore
      const { updatePassword } = await import('@/stores/authStore');
      const result = await updatePassword(newPassword);

      if (result.success) {
        toast.success('Senha alterada com sucesso!');
        onSuccess();
      } else {
        toast.error(result.error || 'Erro ao alterar senha');
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      toast.error('Erro inesperado ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const handleSkipPasswordChange = async () => {
    if (loading) return;

    setLoading(true);

    try {
      // Usar a função de pular alteração de senha do authStore
      const { skipPasswordChange } = await import('@/stores/authStore');
      const result = await skipPasswordChange();

      if (result.success) {
        toast.success('Continuando com senha padrão');
        onSuccess();
      } else {
        toast.error(result.error || 'Erro ao continuar com senha padrão');
      }
    } catch (error) {
      console.error('Erro ao pular alteração de senha:', error);
      toast.error('Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className='bg-white rounded-xl shadow-2xl max-w-md w-full p-6'
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className='flex items-center space-x-3 mb-6'>
              <div className='w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center'>
                <Lock className='w-6 h-6 text-white' />
              </div>
              <div>
                <h2 className='text-xl font-bold text-gray-900'>
                  Alterar Senha
                </h2>
                <p className='text-sm text-gray-600'>
                  Primeiro acesso - {user?.user_metadata?.nome}
                </p>
              </div>
            </div>

            {/* Alert */}
            <div className='bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6'>
              <div className='flex items-start space-x-3'>
                <AlertCircle className='w-5 h-5 text-amber-600 mt-0.5' />
                <div>
                  <h3 className='text-sm font-medium text-amber-800'>
                    Primeiro Acesso
                  </h3>
                  <p className='text-sm text-amber-700 mt-1'>
                    Por segurança, você deve alterar sua senha antes de
                    continuar.
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className='space-y-4'>
              {/* Senha Atual */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Senha Atual
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <Lock className='w-4 h-4 text-gray-400' />
                  </div>
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    className='w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    placeholder='Digite sua senha atual'
                    disabled={loading}
                  />
                  <button
                    type='button'
                    className='absolute inset-y-0 right-0 pr-3 flex items-center'
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    disabled={loading}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className='w-4 h-4 text-gray-400' />
                    ) : (
                      <Eye className='w-4 h-4 text-gray-400' />
                    )}
                  </button>
                </div>
              </div>

              {/* Nova Senha */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Nova Senha
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <Lock className='w-4 h-4 text-gray-400' />
                  </div>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className='w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    placeholder='Digite sua nova senha'
                    disabled={loading}
                  />
                  <button
                    type='button'
                    className='absolute inset-y-0 right-0 pr-3 flex items-center'
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    disabled={loading}
                  >
                    {showNewPassword ? (
                      <EyeOff className='w-4 h-4 text-gray-400' />
                    ) : (
                      <Eye className='w-4 h-4 text-gray-400' />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirmar Senha */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Confirmar Nova Senha
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <Lock className='w-4 h-4 text-gray-400' />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className='w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    placeholder='Confirme sua nova senha'
                    disabled={loading}
                  />
                  <button
                    type='button'
                    className='absolute inset-y-0 right-0 pr-3 flex items-center'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className='w-4 h-4 text-gray-400' />
                    ) : (
                      <Eye className='w-4 h-4 text-gray-400' />
                    )}
                  </button>
                </div>
              </div>

              {/* Botões */}
              <div className='space-y-3 pt-4'>
                <div className='flex space-x-3'>
                  <button
                    type='button'
                    onClick={handleSkipPasswordChange}
                    disabled={loading}
                    className='flex-1 px-4 py-2 border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2'
                  >
                    <Shield className='w-4 h-4' />
                    <span>Continuar com Senha Padrão</span>
                  </button>
                  <button
                    type='submit'
                    disabled={loading}
                    className='flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2'
                  >
                    {loading ? (
                      <>
                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                        <span>Alterando...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className='w-4 h-4' />
                        <span>Alterar Senha</span>
                      </>
                    )}
                  </button>
                </div>
                <button
                  type='button'
                  onClick={handleClose}
                  className='w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                  disabled={loading}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChangePasswordModal;
