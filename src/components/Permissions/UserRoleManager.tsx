// ============================================================================
// COMPONENTE DE GERENCIAMENTO DE ROLES DE USUÁRIO
// ============================================================================

import React, { useState, useEffect } from 'react';
import { usePermissions } from '../../hooks/usePermissions';
// import { useAuthStore } from '../../stores/authStore';
// import { UserRole, Role } from '../../types/permissions';

// Definindo tipos locais para evitar conflitos
interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  role: Role;
  created_at: string;
  updated_at: string;
}
import { Button } from '../../design-system/Components';
import toast from 'react-hot-toast';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

interface UserRoleManagerProps {
  userId?: string;
  onClose?: () => void;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export const UserRoleManager: React.FC<UserRoleManagerProps> = ({
  userId: propUserId,
  onClose,
}) => {
  // ============================================================================
  // ESTADOS
  // ============================================================================

  const [selectedUserId, setSelectedUserId] = useState<string>(
    propUserId || ''
  );
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // const { user } = useAuthStore();
  // Mock data para demonstração
  const [roles] = useState<Role[]>([
    {
      id: '1',
      name: 'Administrador',
      description: 'Acesso total ao sistema',
      permissions: [
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '10',
        '11',
        '12',
        '13',
        '14',
        '15',
        '16',
        '17',
        '18',
        '19',
        '20',
        '21',
        '22',
        '23',
        '24',
        '25',
        '26',
        '27',
        '28',
        '29',
        '30',
        '31',
      ],
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: '2',
      name: 'Médico',
      description: 'Acesso a pacientes, agenda e relatórios',
      permissions: [
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '10',
        '11',
        '12',
        '13',
      ],
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: '3',
      name: 'Recepcionista',
      description: 'Acesso a pacientes e agenda (sem exclusão)',
      permissions: ['1', '2', '3', '6', '7', '8', '9'],
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: '4',
      name: 'Enfermeiro',
      description: 'Acesso a pacientes e agenda (sem exclusão)',
      permissions: ['1', '2', '3', '6', '7', '8', '9'],
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
    {
      id: '5',
      name: 'Analista',
      description: 'Acesso a relatórios e analytics',
      permissions: ['11', '12', '13', '28', '29'],
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
    },
  ]);

  const [users] = useState([
    { id: '1', name: 'João Silva', email: 'joao@email.com' },
    { id: '2', name: 'Maria Santos', email: 'maria@email.com' },
    { id: '3', name: 'Ana Costa', email: 'ana@email.com' },
    { id: '4', name: 'Carlos Oliveira', email: 'carlos@email.com' },
    { id: '5', name: 'Lucia Ferreira', email: 'lucia@email.com' },
    { id: '6', name: 'Pedro Almeida', email: 'pedro@email.com' },
  ]);

  const [userRoles, setUserRoles] = useState<UserRole[]>([
    {
      id: '1',
      user_id: '1',
      role_id: '1',
      assigned_at: '2025-01-01T00:00:00Z',
    },
    {
      id: '2',
      user_id: '2',
      role_id: '2',
      assigned_at: '2025-01-01T00:00:00Z',
    },
    {
      id: '3',
      user_id: '3',
      role_id: '3',
      assigned_at: '2025-01-01T00:00:00Z',
    },
    {
      id: '4',
      user_id: '4',
      role_id: '4',
      assigned_at: '2025-01-01T00:00:00Z',
    },
  ]);

  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);
  const refreshData = async () => {
    setPermissionsLoading(true);
    // Simular carregamento
    await new Promise(resolve => setTimeout(resolve, 1000));
    setPermissionsLoading(false);
  };

  // ============================================================================
  // EFEITOS
  // ============================================================================

  useEffect(() => {
    if (propUserId) {
      setSelectedUserId(propUserId);
    }
  }, [propUserId]);

  // ============================================================================
  // FUNÇÕES AUXILIARES
  // ============================================================================

  const assignRoleToUser = async (userId: string, roleId: string) => {
    setLoading(true);
    try {
      const newUserRole: UserRole = {
        id: (userRoles.length + 1).toString(),
        user_id: userId,
        role_id: roleId,
        assigned_at: new Date().toISOString(),
      };
      setUserRoles(prev => [...prev, newUserRole]);
    } catch (error) {
      setError('Erro ao atribuir role');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeRoleFromUser = async (userId: string, roleId: string) => {
    setLoading(true);
    try {
      setUserRoles(prev =>
        prev.filter(ur => !(ur.user_id === userId && ur.role_id === roleId))
      );
    } catch (error) {
      setError('Erro ao remover role');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async () => {
    if (!selectedUserId || !selectedRoleId) {
      toast.error('Selecione um usuário e uma role');
      return;
    }

    setLoading(true);
    try {
      await assignRoleToUser(selectedUserId, selectedRoleId);
      toast.success('Role atribuída com sucesso!');
      setSelectedRoleId('');
    } catch (error) {
      toast.error('Erro ao atribuir role');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRole = async (userRole: UserRole) => {
    if (
      window.confirm(
        `Tem certeza que deseja remover a role "${userRole.role.name}" do usuário?`
      )
    ) {
      setLoading(true);
      try {
        await removeRoleFromUser(
          (userRole as any).userId || (userRole as any).user_id,
          (userRole as any).roleId || (userRole as any).role_id
        );
        toast.success('Role removida com sucesso!');
      } catch (error) {
        toast.error('Erro ao remover role');
      } finally {
        setLoading(false);
      }
    }
  };

  const getUserRoles = (userId: string) => {
    return userRoles.filter(ur => ur.user_id === userId);
  };

  const getAvailableRoles = (userId: string) => {
    const userRolesList = getUserRoles(userId);
    const assignedRoleIds = userRolesList.map(ur => ur.role_id);
    return roles.filter(role => !assignedRoleIds.includes(role.id));
  };

  // ============================================================================
  // RENDERIZAÇÃO
  // ============================================================================

  if (permissionsLoading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500'></div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
          Gerenciamento de Roles de Usuário
        </h2>
        {onClose && (
          <Button onClick={onClose} variant='outline' size='sm'>
            Fechar
          </Button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4'>
          <div className='flex items-center justify-between'>
            <p className='text-red-800 dark:text-red-200'>{error}</p>
            <button
              onClick={clearError}
              className='text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200'
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* User Selection */}
      {!propUserId && (
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
            Selecionar Usuário
          </h3>
          <div className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Buscar por Nome
                </label>
                <input
                  type='text'
                  value={selectedUserId}
                  onChange={e => setSelectedUserId(e.target.value)}
                  placeholder='Digite o nome do usuário'
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  ID do Usuário
                </label>
                <input
                  type='text'
                  value={selectedUserId}
                  onChange={e => setSelectedUserId(e.target.value)}
                  placeholder='Digite o ID do usuário'
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white'
                />
              </div>
            </div>

            {/* Lista de Usuários Disponíveis */}
            <div className='mt-4'>
              <h4 className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Usuários Disponíveis
              </h4>
              <div className='max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md'>
                {[
                  {
                    id: '1',
                    name: 'João Silva',
                    email: 'joao@email.com',
                    role: 'Administrador',
                  },
                  {
                    id: '2',
                    name: 'Maria Santos',
                    email: 'maria@email.com',
                    role: 'Médico',
                  },
                  {
                    id: '3',
                    name: 'Ana Costa',
                    email: 'ana@email.com',
                    role: 'Recepcionista',
                  },
                  {
                    id: '4',
                    name: 'Carlos Oliveira',
                    email: 'carlos@email.com',
                    role: 'Enfermeiro',
                  },
                ].map(user => (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUserId(user.id)}
                    className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0 ${
                      selectedUserId === user.id
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : ''
                    }`}
                  >
                    <div className='flex items-center justify-between'>
                      <div>
                        <div className='font-medium text-gray-900 dark:text-white'>
                          {user.name}
                        </div>
                        <div className='text-sm text-gray-600 dark:text-gray-400'>
                          {user.email}
                        </div>
                      </div>
                      <div className='text-sm text-gray-500 dark:text-gray-400'>
                        {user.role}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className='flex space-x-2'>
              <Button onClick={() => refreshData()} variant='outline' size='sm'>
                Atualizar Dados
              </Button>
              <Button
                onClick={() => setSelectedUserId('')}
                variant='outline'
                size='sm'
              >
                Limpar Seleção
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Role Assignment */}
      {selectedUserId && (
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
            Atribuir Role
          </h3>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Role
              </label>
              <select
                value={selectedRoleId}
                onChange={e => setSelectedRoleId(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white'
              >
                <option value=''>Selecione uma role</option>
                {getAvailableRoles(selectedUserId).map(role => (
                  <option key={role.id} value={role.id}>
                    {role.name} - {role.description}
                  </option>
                ))}
              </select>
            </div>
            <Button
              onClick={handleAssignRole}
              disabled={!selectedRoleId || loading}
              variant='default'
              size='sm'
            >
              {loading ? 'Atribuindo...' : 'Atribuir Role'}
            </Button>
          </div>
        </div>
      )}

      {/* Current User Roles */}
      {selectedUserId && (
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
            Roles Atuais do Usuário
          </h3>
          {getUserRoles(selectedUserId).length === 0 ? (
            <div className='bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center'>
              <p className='text-gray-500 dark:text-gray-400'>
                Nenhuma role atribuída a este usuário
              </p>
            </div>
          ) : (
            <div className='space-y-3'>
              {getUserRoles(selectedUserId).map(userRole => (
                <div
                  key={userRole.id}
                  className='bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4'
                >
                  <div className='flex items-center justify-between'>
                    <div>
                      <h4 className='font-semibold text-gray-900 dark:text-white'>
                        {(userRole as any).role?.name || 'Role não encontrada'}
                      </h4>
                      <p className='text-sm text-gray-600 dark:text-gray-400'>
                        {(userRole as any).role?.description ||
                          'Descrição não disponível'}
                      </p>
                      <div className='mt-2'>
                        <span className='text-xs text-gray-500 dark:text-gray-400'>
                          Atribuída em:{' '}
                          {new Date(
                            (userRole as any).created_at || Date.now()
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleRemoveRole(userRole as any)}
                      variant='outline'
                      size='sm'
                      className='text-red-600 hover:text-red-800'
                      disabled={loading}
                    >
                      Remover
                    </Button>
                  </div>

                  {/* Permissions */}
                  <div className='mt-3'>
                    <h5 className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                      Permissões:
                    </h5>
                    <div className='flex flex-wrap gap-1'>
                      {((userRole as any).role?.permissions || []).map(
                        (permission: any) => (
                          <span
                            key={permission.id || permission}
                            className='px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-full text-xs'
                          >
                            {permission.name || permission}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
