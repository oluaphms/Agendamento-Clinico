// ============================================================================
// COMPONENTE DE GERENCIAMENTO DE USUÁRIOS PENDENTES
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../design-system/Components';
import { User, Check, X, Eye, UserPlus, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

interface PendingUser {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  cargo: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  nivel_acesso?: string;
}

interface PendingUsersManagerProps {
  onUserApproved?: (userId: string) => void;
  onUserRejected?: (userId: string) => void;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export const PendingUsersManager: React.FC<PendingUsersManagerProps> = ({
  onUserApproved,
  onUserRejected
}) => {
  // ============================================================================
  // ESTADOS
  // ============================================================================
  
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [processing, setProcessing] = useState<string | null>(null);
  
  const { user } = useAuthStore();

  // ============================================================================
  // EFEITOS
  // ============================================================================
  
  useEffect(() => {
    loadPendingUsers();
  }, []);

  // ============================================================================
  // FUNÇÕES AUXILIARES
  // ============================================================================
  
  const loadPendingUsers = async () => {
    setLoading(true);
    try {
      // Carregar usuários pendentes do localStorage
      const storedUsers = localStorage.getItem('pendingUsers');
      let users: PendingUser[] = [];
      
      if (storedUsers) {
        users = JSON.parse(storedUsers);
      } else {
        // Dados de exemplo se não houver usuários no localStorage
        users = [
          {
            id: '1',
            nome: 'João Silva',
            email: 'joao@email.com',
            cpf: '123.456.789-00',
            telefone: '(11) 99999-9999',
            cargo: 'Recepcionista',
            status: 'pending',
            created_at: '2025-01-08T10:30:00Z'
          },
          {
            id: '2',
            nome: 'Maria Santos',
            email: 'maria@email.com',
            cpf: '987.654.321-00',
            telefone: '(11) 88888-8888',
            cargo: 'Enfermeira',
            status: 'pending',
            created_at: '2025-01-08T14:15:00Z'
          }
        ];
      }
      
      setPendingUsers(users);
    } catch (error) {
      toast.error('Erro ao carregar usuários pendentes');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId: string, nivelAcesso: string) => {
    setProcessing(userId);
    try {
      // Simular aprovação do usuário
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedUsers = pendingUsers.map(user => 
        user.id === userId 
          ? { ...user, status: 'approved', nivel_acesso: nivelAcesso }
          : user
      );
      
      // Salvar no localStorage
      localStorage.setItem('pendingUsers', JSON.stringify(updatedUsers));
      
      setPendingUsers(updatedUsers);
      
      toast.success('Usuário aprovado com sucesso!');
      onUserApproved?.(userId);
    } catch (error) {
      toast.error('Erro ao aprovar usuário');
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectUser = async (userId: string) => {
    setProcessing(userId);
    try {
      // Simular rejeição do usuário
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedUsers = pendingUsers.map(user => 
        user.id === userId 
          ? { ...user, status: 'rejected' }
          : user
      );
      
      // Salvar no localStorage
      localStorage.setItem('pendingUsers', JSON.stringify(updatedUsers));
      
      setPendingUsers(updatedUsers);
      
      toast.success('Usuário rejeitado');
      onUserRejected?.(userId);
    } catch (error) {
      toast.error('Erro ao rejeitar usuário');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'approved':
        return 'Aprovado';
      case 'rejected':
        return 'Rejeitado';
      default:
        return 'Desconhecido';
    }
  };

  // ============================================================================
  // RENDERIZAÇÃO
  // ============================================================================
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Usuários Pendentes de Aprovação
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie usuários que solicitaram acesso ao sistema
          </p>
        </div>
        <Button
          onClick={loadPendingUsers}
          variant="outline"
          size="sm"
        >
          Atualizar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pendentes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {pendingUsers.filter(u => u.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <Check className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Aprovados</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {pendingUsers.filter(u => u.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <X className="h-8 w-8 text-red-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejeitados</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {pendingUsers.filter(u => u.status === 'rejected').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Users List */}
      {pendingUsers.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
          <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhum usuário pendente
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Não há usuários aguardando aprovação no momento
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingUsers.map(user => (
            <div
              key={user.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <User className="h-8 w-8 text-gray-400" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {user.nome}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">CPF</p>
                      <p className="font-medium text-gray-900 dark:text-white">{user.cpf}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Telefone</p>
                      <p className="font-medium text-gray-900 dark:text-white">{user.telefone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Cargo</p>
                      <p className="font-medium text-gray-900 dark:text-white">{user.cargo}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Data de Cadastro</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(user.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                    {getStatusText(user.status)}
                  </span>
                  
                  {user.status === 'pending' && (
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => setSelectedUser(user)}
                        variant="outline"
                        size="sm"
                        disabled={processing === user.id}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Revisar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approval Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Aprovar Usuário
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Usuário</p>
                <p className="font-medium text-gray-900 dark:text-white">{selectedUser.nome}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nível de Acesso
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Selecione um nível</option>
                  <option value="recepcao">Recepcionista</option>
                  <option value="profissional">Profissional de Saúde</option>
                  <option value="admin">Administrador</option>
                  <option value="desenvolvedor">Desenvolvedor</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                onClick={() => setSelectedUser(null)}
                variant="outline"
                size="sm"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => handleRejectUser(selectedUser.id)}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-800"
                disabled={processing === selectedUser.id}
              >
                {processing === selectedUser.id ? 'Rejeitando...' : 'Rejeitar'}
              </Button>
              <Button
                onClick={() => {
                  if (selectedRole) {
                    handleApproveUser(selectedUser.id, selectedRole);
                    setSelectedUser(null);
                    setSelectedRole('');
                  } else {
                    toast.error('Selecione um nível de acesso');
                  }
                }}
                variant="primary"
                size="sm"
                disabled={!selectedRole || processing === selectedUser.id}
              >
                {processing === selectedUser.id ? 'Aprovando...' : 'Aprovar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingUsersManager;
