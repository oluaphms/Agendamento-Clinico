import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import ChangePasswordModal from './ChangePasswordModal';
import toast from 'react-hot-toast';

const FirstAccessHandler: React.FC = () => {
  const { user, mustChangePassword } = useAuthStore();
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  useEffect(() => {
    // Verificar se o usuário deve alterar a senha
    if (user && mustChangePassword) {
      setShowChangePasswordModal(true);
    }
  }, [user, mustChangePassword]);

  const handlePasswordChangeSuccess = () => {
    setShowChangePasswordModal(false);
    toast.success('Senha alterada com sucesso! Bem-vindo ao sistema.');
  };

  const handleCloseModal = () => {
    // Permitir fechar o modal - o usuário pode escolher continuar com senha padrão
    setShowChangePasswordModal(false);
  };

  return (
    <ChangePasswordModal
      isOpen={showChangePasswordModal}
      onClose={handleCloseModal}
      onSuccess={handlePasswordChangeSuccess}
      user={user}
    />
  );
};

export default FirstAccessHandler;
