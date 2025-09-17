// ============================================================================
// COMPONENTE DE GERENCIAMENTO DE ROLES
// ============================================================================

import React, { useState } from 'react';
import { usePermissions } from '../../hooks/usePermissions';
// import { Role, Permission } from '../../types/permissions';

// Definindo tipos locais para evitar conflitos
interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

// interface Permission {
//   id: string;
//   name: string;
//   description: string;
//   resource: string;
//   action: string;
//   category: string;
// }
import { Button } from '../../design-system/Components';
import toast from 'react-hot-toast';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

interface RoleManagerProps {
  onClose?: () => void;
}

interface RoleFormData {
  name: string;
  description: string;
  permissions: string[];
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export const RoleManager: React.FC<RoleManagerProps> = ({ onClose }) => {
  // ============================================================================
  // ESTADOS
  // ============================================================================

  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    description: '',
    permissions: [],
  });

  // Mock data para demonstração
  const [roles, setRoles] = useState<Role[]>([
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

  const [permissions] = useState([
    {
      id: '1',
      name: 'Visualizar Pacientes',
      description: 'Permite visualizar informações dos pacientes',
    },
    {
      id: '2',
      name: 'Criar Pacientes',
      description: 'Permite criar novos pacientes',
    },
    {
      id: '3',
      name: 'Editar Pacientes',
      description: 'Permite editar informações dos pacientes',
    },
    {
      id: '4',
      name: 'Excluir Pacientes',
      description: 'Permite excluir pacientes',
    },
    {
      id: '5',
      name: 'Gerenciar Pacientes',
      description: 'Controle total sobre pacientes',
    },
    {
      id: '6',
      name: 'Visualizar Agenda',
      description: 'Permite visualizar a agenda de consultas',
    },
    {
      id: '7',
      name: 'Criar Agendamentos',
      description: 'Permite criar novos agendamentos',
    },
    {
      id: '8',
      name: 'Editar Agendamentos',
      description: 'Permite editar agendamentos existentes',
    },
    {
      id: '9',
      name: 'Cancelar Agendamentos',
      description: 'Permite cancelar agendamentos',
    },
    {
      id: '10',
      name: 'Gerenciar Agenda',
      description: 'Controle total sobre a agenda',
    },
    {
      id: '11',
      name: 'Visualizar Relatórios',
      description: 'Permite visualizar relatórios do sistema',
    },
    {
      id: '12',
      name: 'Criar Relatórios',
      description: 'Permite criar novos relatórios',
    },
    {
      id: '13',
      name: 'Gerenciar Relatórios',
      description: 'Controle total sobre relatórios',
    },
    {
      id: '14',
      name: 'Visualizar Usuários',
      description: 'Permite visualizar usuários do sistema',
    },
    {
      id: '15',
      name: 'Criar Usuários',
      description: 'Permite criar novos usuários',
    },
    {
      id: '16',
      name: 'Editar Usuários',
      description: 'Permite editar usuários existentes',
    },
    {
      id: '17',
      name: 'Excluir Usuários',
      description: 'Permite excluir usuários',
    },
    {
      id: '18',
      name: 'Gerenciar Usuários',
      description: 'Controle total sobre usuários',
    },
    {
      id: '19',
      name: 'Visualizar Configurações',
      description: 'Permite visualizar configurações do sistema',
    },
    {
      id: '20',
      name: 'Editar Configurações',
      description: 'Permite editar configurações do sistema',
    },
    {
      id: '21',
      name: 'Gerenciar Configurações',
      description: 'Controle total sobre configurações',
    },
    {
      id: '22',
      name: 'Visualizar Backups',
      description: 'Permite visualizar backups do sistema',
    },
    {
      id: '23',
      name: 'Criar Backups',
      description: 'Permite criar backups do sistema',
    },
    {
      id: '24',
      name: 'Gerenciar Backups',
      description: 'Controle total sobre backups',
    },
    {
      id: '25',
      name: 'Visualizar Notificações',
      description: 'Permite visualizar notificações',
    },
    {
      id: '26',
      name: 'Criar Notificações',
      description: 'Permite criar notificações',
    },
    {
      id: '27',
      name: 'Gerenciar Notificações',
      description: 'Controle total sobre notificações',
    },
    {
      id: '28',
      name: 'Visualizar Analytics',
      description: 'Permite visualizar dados analíticos',
    },
    {
      id: '29',
      name: 'Gerenciar Analytics',
      description: 'Controle total sobre analytics',
    },
    {
      id: '30',
      name: 'Visualizar Gamificação',
      description: 'Permite visualizar sistema de gamificação',
    },
    {
      id: '31',
      name: 'Gerenciar Gamificação',
      description: 'Controle total sobre gamificação',
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // ============================================================================
  // FUNÇÕES AUXILIARES
  // ============================================================================

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      permissions: [],
    });
    setEditingRole(null);
    setShowForm(false);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions.map((p: any) => p.id || p),
    });
    setShowForm(true);
  };

  const createRole = async (
    roleData: Omit<Role, 'id' | 'created_at' | 'updated_at'>
  ) => {
    setLoading(true);
    try {
      const newRole: Role = {
        id: (roles.length + 1).toString(),
        name: roleData.name,
        description: roleData.description,
        permissions: roleData.permissions,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setRoles(prev => [...prev, newRole]);
    } catch (error) {
      setError('Erro ao criar role');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (id: string, roleData: Partial<Role>) => {
    setLoading(true);
    try {
      setRoles(prev =>
        prev.map(role =>
          role.id === id
            ? { ...role, ...roleData, updated_at: new Date().toISOString() }
            : role
        )
      );
    } catch (error) {
      setError('Erro ao atualizar role');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteRole = async (id: string) => {
    setLoading(true);
    try {
      setRoles(prev => prev.filter(role => role.id !== id));
    } catch (error) {
      setError('Erro ao excluir role');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const roleData = {
        name: formData.name,
        description: formData.description,
        permissions: formData.permissions,
      };

      if (editingRole) {
        await updateRole(editingRole.id, roleData);
        toast.success('Role atualizada com sucesso!');
      } else {
        await createRole(roleData);
        toast.success('Role criada com sucesso!');
      }

      resetForm();
    } catch (error) {
      toast.error('Erro ao salvar role');
    }
  };

  const handleDelete = async (role: Role) => {
    if (
      window.confirm(`Tem certeza que deseja excluir a role "${role.name}"?`)
    ) {
      try {
        await deleteRole(role.id);
        toast.success('Role excluída com sucesso!');
      } catch (error) {
        toast.error('Erro ao excluir role');
      }
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  };

  // ============================================================================
  // RENDERIZAÇÃO
  // ============================================================================

  if (loading) {
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
          Gerenciamento de Roles
        </h2>
        <div className='flex space-x-2'>
          <Button onClick={() => setShowForm(true)} variant='default' size='sm'>
            Nova Role
          </Button>
          {onClose && (
            <Button onClick={onClose} variant='outline' size='sm'>
              Fechar
            </Button>
          )}
        </div>
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

      {/* Form */}
      {showForm && (
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
            {editingRole ? 'Editar Role' : 'Nova Role'}
          </h3>

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Nome
              </label>
              <input
                type='text'
                value={formData.name}
                onChange={e =>
                  setFormData(prev => ({ ...prev, name: e.target.value }))
                }
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white'
                rows={3}
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Permissões
              </label>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md p-3'>
                {permissions.map(permission => (
                  <label
                    key={permission.id}
                    className='flex items-center space-x-2'
                  >
                    <input
                      type='checkbox'
                      checked={formData.permissions.includes(permission.id)}
                      onChange={() => handlePermissionToggle(permission.id)}
                      className='rounded border-gray-300 text-primary-600 focus:ring-primary-500'
                    />
                    <span className='text-sm text-gray-700 dark:text-gray-300'>
                      {permission.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className='flex space-x-2'>
              <Button type='submit' variant='default'>
                {editingRole ? 'Atualizar' : 'Criar'}
              </Button>
              <Button type='button' onClick={resetForm} variant='outline'>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Roles List */}
      <div className='space-y-4'>
        {roles.map(role => (
          <div
            key={role.id}
            className='bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6'
          >
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                  {role.name}
                </h3>
                <p className='text-gray-600 dark:text-gray-400 mt-1'>
                  {role.description}
                </p>
                <div className='mt-2'>
                  <span className='text-sm text-gray-500 dark:text-gray-400'>
                    {role.permissions.length} permissões
                  </span>
                </div>
              </div>
              <div className='flex space-x-2'>
                <Button
                  onClick={() => handleEdit(role)}
                  variant='outline'
                  size='sm'
                >
                  Editar
                </Button>
                <Button
                  onClick={() => handleDelete(role)}
                  variant='outline'
                  size='sm'
                  className='text-red-600 hover:text-red-800'
                >
                  Excluir
                </Button>
              </div>
            </div>

            {/* Permissions List */}
            <div className='mt-4'>
              <h4 className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Permissões:
              </h4>
              <div className='flex flex-wrap gap-2'>
                {role.permissions.map((permission: any) => (
                  <span
                    key={permission.id || permission}
                    className='px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs'
                  >
                    {permission.name || permission}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
