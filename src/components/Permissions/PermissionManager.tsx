// ============================================================================
// COMPONENTE: PermissionManager - Gerenciador de Permissões
// ============================================================================
// Interface para gerenciar permissões granulares de usuários
// ============================================================================

import React, { useState } from 'react';
import {
  Shield,
  User,
  Users,
  Settings,
  AlertTriangle,
  Save,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Search,
  Download,
  Upload,
} from 'lucide-react';
import { usePermissions as useAuthPermissions } from '@/stores/authStore';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Alert,
  AlertDescription,
  Input,
} from '@/design-system';
import { PermissionService } from '@/services/mockServices';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  category: string;
}

interface FuncaoPermission {
  funcao: string;
  permissions: Permission[];
  customPermissions: Permission[];
}

interface UserPermission {
  userId: string;
  userName: string;
  funcao: string;
  customPermissions: Permission[];
  overrides: Record<string, boolean>;
}

// ============================================================================
// DADOS MOCK
// ============================================================================

const MOCK_PERMISSIONS: Permission[] = [
  // Pacientes
  {
    id: 'patients.read',
    name: 'Visualizar Pacientes',
    description: 'Pode visualizar lista de pacientes',
    resource: 'pacientes',
    action: 'read',
    category: 'Pacientes',
  },
  {
    id: 'patients.create',
    name: 'Criar Pacientes',
    description: 'Pode criar novos pacientes',
    resource: 'pacientes',
    action: 'create',
    category: 'Pacientes',
  },
  {
    id: 'patients.update',
    name: 'Editar Pacientes',
    description: 'Pode editar dados de pacientes',
    resource: 'pacientes',
    action: 'update',
    category: 'Pacientes',
  },
  {
    id: 'patients.delete',
    name: 'Deletar Pacientes',
    description: 'Pode deletar pacientes',
    resource: 'pacientes',
    action: 'delete',
    category: 'Pacientes',
  },
  {
    id: 'patients.export',
    name: 'Exportar Pacientes',
    description: 'Pode exportar dados de pacientes',
    resource: 'pacientes',
    action: 'export',
    category: 'Pacientes',
  },

  // Agendamentos
  {
    id: 'appointments.read',
    name: 'Visualizar Agendamentos',
    description: 'Pode visualizar agendamentos',
    resource: 'agendamentos',
    action: 'read',
    category: 'Agendamentos',
  },
  {
    id: 'appointments.create',
    name: 'Criar Agendamentos',
    description: 'Pode criar novos agendamentos',
    resource: 'agendamentos',
    action: 'create',
    category: 'Agendamentos',
  },
  {
    id: 'appointments.update',
    name: 'Editar Agendamentos',
    description: 'Pode editar agendamentos',
    resource: 'agendamentos',
    action: 'update',
    category: 'Agendamentos',
  },
  {
    id: 'appointments.delete',
    name: 'Deletar Agendamentos',
    description: 'Pode deletar agendamentos',
    resource: 'agendamentos',
    action: 'delete',
    category: 'Agendamentos',
  },
  {
    id: 'appointments.cancel',
    name: 'Cancelar Agendamentos',
    description: 'Pode cancelar agendamentos',
    resource: 'agendamentos',
    action: 'cancel',
    category: 'Agendamentos',
  },

  // Profissionais
  {
    id: 'professionals.read',
    name: 'Visualizar Profissionais',
    description: 'Pode visualizar profissionais',
    resource: 'profissionais',
    action: 'read',
    category: 'Profissionais',
  },
  {
    id: 'professionals.create',
    name: 'Criar Profissionais',
    description: 'Pode criar novos profissionais',
    resource: 'profissionais',
    action: 'create',
    category: 'Profissionais',
  },
  {
    id: 'professionals.update',
    name: 'Editar Profissionais',
    description: 'Pode editar profissionais',
    resource: 'profissionais',
    action: 'update',
    category: 'Profissionais',
  },
  {
    id: 'professionals.delete',
    name: 'Deletar Profissionais',
    description: 'Pode deletar profissionais',
    resource: 'profissionais',
    action: 'delete',
    category: 'Profissionais',
  },

  // Configurações
  {
    id: 'settings.read',
    name: 'Visualizar Configurações',
    description: 'Pode visualizar configurações',
    resource: 'configuracoes',
    action: 'read',
    category: 'Configurações',
  },
  {
    id: 'settings.update',
    name: 'Editar Configurações',
    description: 'Pode editar configurações',
    resource: 'configuracoes',
    action: 'update',
    category: 'Configurações',
  },

  // Usuários
  {
    id: 'users.read',
    name: 'Visualizar Usuários',
    description: 'Pode visualizar usuários',
    resource: 'usuarios',
    action: 'read',
    category: 'Usuários',
  },
  {
    id: 'users.create',
    name: 'Criar Usuários',
    description: 'Pode criar usuários',
    resource: 'usuarios',
    action: 'create',
    category: 'Usuários',
  },
  {
    id: 'users.update',
    name: 'Editar Usuários',
    description: 'Pode editar usuários',
    resource: 'usuarios',
    action: 'update',
    category: 'Usuários',
  },
  {
    id: 'users.delete',
    name: 'Deletar Usuários',
    description: 'Pode deletar usuários',
    resource: 'usuarios',
    action: 'delete',
    category: 'Usuários',
  },

  // Backup
  {
    id: 'backup.create',
    name: 'Criar Backup',
    description: 'Pode criar backups',
    resource: 'backup',
    action: 'create',
    category: 'Backup',
  },
  {
    id: 'backup.restore',
    name: 'Restaurar Backup',
    description: 'Pode restaurar backups',
    resource: 'backup',
    action: 'restore',
    category: 'Backup',
  },
  {
    id: 'backup.delete',
    name: 'Deletar Backup',
    description: 'Pode deletar backups',
    resource: 'backup',
    action: 'delete',
    category: 'Backup',
  },
];

const MOCK_FUNCAO_PERMISSIONS: FuncaoPermission[] = [
  {
    funcao: 'admin',
    permissions: MOCK_PERMISSIONS,
    customPermissions: [],
  },
  {
    funcao: 'desenvolvedor',
    permissions: MOCK_PERMISSIONS,
    customPermissions: [],
  },
  {
    funcao: 'gerente',
    permissions: MOCK_PERMISSIONS.filter(
      p => !p.id.includes('users.') && !p.id.includes('backup.')
    ),
    customPermissions: [],
  },
  {
    funcao: 'recepcao',
    permissions: MOCK_PERMISSIONS.filter(
      p =>
        p.category === 'Pacientes' ||
        p.category === 'Agendamentos' ||
        (p.category === 'Profissionais' && p.action === 'read')
    ),
    customPermissions: [],
  },
  {
    funcao: 'profissional',
    permissions: MOCK_PERMISSIONS.filter(
      p =>
        (p.category === 'Pacientes' && ['read', 'update'].includes(p.action)) ||
        (p.category === 'Agendamentos' &&
          ['read', 'update'].includes(p.action)) ||
        false
    ),
    customPermissions: [],
  },
  {
    funcao: 'usuario',
    permissions: MOCK_PERMISSIONS.filter(p => p.action === 'read'),
    customPermissions: [],
  },
];

const MOCK_USERS: UserPermission[] = [
  {
    userId: 'user_1',
    userName: 'Administrador',
    funcao: 'admin',
    customPermissions: [],
    overrides: {},
  },
  {
    userId: 'user_2',
    userName: 'Desenvolvedor Principal',
    funcao: 'desenvolvedor',
    customPermissions: [],
    overrides: {},
  },
  {
    userId: 'user_3',
    userName: 'Maria Santos',
    funcao: 'recepcao',
    customPermissions: [],
    overrides: {},
  },
  {
    userId: 'user_4',
    userName: 'Dr. Carlos',
    funcao: 'profissional',
    customPermissions: [],
    overrides: {},
  },
];

const MOCK_PENDING_USERS = [
  {
    id: 'pending_1',
    name: 'Ana Silva',
    email: 'ana.silva@clinica.com',
    requestedRole: 'recepcao',
    requestedAt: '2024-01-15T10:30:00Z',
    status: 'pending',
  },
  {
    id: 'pending_2',
    name: 'João Oliveira',
    email: 'joao.oliveira@clinica.com',
    requestedRole: 'profissional',
    requestedAt: '2024-01-14T14:20:00Z',
    status: 'pending',
  },
  {
    id: 'pending_3',
    name: 'Carla Mendes',
    email: 'carla.mendes@clinica.com',
    requestedRole: 'gerente',
    requestedAt: '2024-01-13T09:15:00Z',
    status: 'pending',
  },
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export const PermissionManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'funcoes' | 'users' | 'permissions' | 'pending'
  >('funcoes');
  const [permissions] = useState<Permission[]>(MOCK_PERMISSIONS);
  const [funcaoPermissions, setFuncaoPermissions] = useState<
    FuncaoPermission[]
  >(MOCK_FUNCAO_PERMISSIONS);
  const [users, setUsers] = useState<UserPermission[]>(MOCK_USERS);
  const [pendingUsers, setPendingUsers] = useState(MOCK_PENDING_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // ============================================================================
  // VERIFICAÇÕES DE PERMISSÃO
  // ============================================================================

  // Verificar se é admin ou desenvolvedor (acesso direto)
  const { isAdmin, isDesenvolvedor } = useAuthPermissions();
  const hasDirectAccess = isAdmin() || isDesenvolvedor();

  // Apenas admin e desenvolvedor podem gerenciar permissões
  const canManagePermissions = hasDirectAccess;

  if (!hasDirectAccess) {
    return (
      <Alert variant='destructive'>
        <AlertTriangle className='h-4 w-4' />
        <AlertDescription>
          Apenas administradores e desenvolvedores podem acessar o gerenciador
          de permissões.
        </AlertDescription>
      </Alert>
    );
  }

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleFuncaoPermissionToggle = (
    funcao: string,
    permissionId: string
  ) => {
    if (!canManagePermissions) return;

    setFuncaoPermissions(prev =>
      prev.map(rp => {
        if (rp.funcao === funcao) {
          const hasPermission = rp.permissions.some(p => p.id === permissionId);
          if (hasPermission) {
            return {
              ...rp,
              permissions: rp.permissions.filter(p => p.id !== permissionId),
            };
          } else {
            const permission = permissions.find(p => p.id === permissionId);
            if (permission) {
              return {
                ...rp,
                permissions: [...rp.permissions, permission],
              };
            }
          }
        }
        return rp;
      })
    );
  };

  const handleUserPermissionToggle = (userId: string, permissionId: string) => {
    if (!canManagePermissions) return;

    setUsers(prev =>
      prev.map(user => {
        if (user.userId === userId) {
          const hasPermission = user.customPermissions.some(
            p => p.id === permissionId
          );
          if (hasPermission) {
            return {
              ...user,
              customPermissions: user.customPermissions.filter(
                p => p.id !== permissionId
              ),
            };
          } else {
            const permission = permissions.find(p => p.id === permissionId);
            if (permission) {
              return {
                ...user,
                customPermissions: [...user.customPermissions, permission],
              };
            }
          }
        }
        return user;
      })
    );
  };

  const handleUserRoleChange = (userId: string, newRole: string) => {
    if (!canManagePermissions) return;

    setUsers(prev =>
      prev.map(user =>
        user.userId === userId
          ? { ...user, funcao: newRole, customPermissions: [] }
          : user
      )
    );
  };

  const handleSavePermissions = async () => {
    if (!canManagePermissions) return;

    try {
      console.log('Salvando permissões...', {
        funcaoPermissions,
        users,
      });

      const success = await PermissionService.saveAllPermissions(
        funcaoPermissions
      );

      if (success) {
        alert('Permissões salvas com sucesso!');
      } else {
        alert('Erro ao salvar permissões. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao salvar permissões:', error);
      alert('Erro ao salvar permissões. Tente novamente.');
    }
  };

  const handleApproveUser = (pendingUserId: string) => {
    const pendingUser = pendingUsers.find(u => u.id === pendingUserId);
    if (!pendingUser) return;

    // Adicionar usuário à lista de usuários ativos
    const newUser: UserPermission = {
      userId: `user_${Date.now()}`,
      userName: pendingUser.name,
      funcao: pendingUser.requestedRole,
      customPermissions: [],
      overrides: {},
    };

    setUsers(prev => [...prev, newUser]);
    setPendingUsers(prev => prev.filter(u => u.id !== pendingUserId));
  };

  const handleRejectUser = (pendingUserId: string) => {
    setPendingUsers(prev => prev.filter(u => u.id !== pendingUserId));
  };

  // ============================================================================
  // UTILITÁRIOS
  // ============================================================================

  const getFuncaoPermissions = (funcao: string): Permission[] => {
    const rolePermission = funcaoPermissions.find(rp => rp.funcao === funcao);
    return rolePermission ? rolePermission.permissions : [];
  };

  const getUserPermissions = (userId: string): Permission[] => {
    const user = users.find(u => u.userId === userId);
    if (!user) return [];

    const rolePermissions = getFuncaoPermissions(user.funcao);
    return [...rolePermissions, ...user.customPermissions];
  };

  const hasUserPermission = (userId: string, permissionId: string): boolean => {
    const userPermissions = getUserPermissions(userId);
    return userPermissions.some(p => p.id === permissionId);
  };

  const getFuncaoColor = (funcao: string): string => {
    const colors: Record<string, string> = {
      admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      desenvolvedor:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      gerente:
        'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      recepcao: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      profissional:
        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      usuario: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    };
    return colors[funcao] || 'bg-gray-100 text-gray-800';
  };

  const getPermissionCategories = (): string[] => {
    return [...new Set(permissions.map(p => p.category))];
  };

  const getFilteredUsers = (): UserPermission[] => {
    return users.filter(user => {
      const matchesSearch = user.userName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === 'all' || user.funcao === filterRole;
      return matchesSearch && matchesRole;
    });
  };

  const getFilteredPermissions = (): Permission[] => {
    return permissions.filter(permission => {
      const matchesSearch =
        permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        filterCategory === 'all' || permission.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  };

  const getStats = () => {
    return {
      totalPermissions: permissions.length,
      totalRoles: funcaoPermissions.length,
      totalUsers: users.length,
      pendingUsers: pendingUsers.length,
      activeUsers: users.length,
    };
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  const stats = getStats();

  return (
    <div className='space-y-6'>
      {/* Header Principal */}
      <div className='bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white'>
        <div className='flex justify-between items-start'>
          <div>
            <h1 className='text-3xl font-bold mb-2'>Sistema de Permissões</h1>
            <p className='text-blue-100 text-lg'>
              Gerencie permissões, roles e atribuições de usuários do sistema
            </p>
          </div>
          <div className='flex gap-3'>
            <Button
              onClick={handleSavePermissions}
              className='bg-white text-blue-600 hover:bg-blue-50'
              disabled={!canManagePermissions}
            >
              <Save className='w-4 h-4 mr-2' />
              Salvar Permissões
            </Button>
          </div>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <Card className='hover:shadow-lg transition-shadow'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                  Total de Permissões
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {stats.totalPermissions}
                </p>
              </div>
              <div className='p-3 bg-blue-100 dark:bg-blue-900 rounded-full'>
                <Shield className='w-6 h-6 text-blue-600 dark:text-blue-400' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='hover:shadow-lg transition-shadow'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                  Roles/Funções
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {stats.totalRoles}
                </p>
              </div>
              <div className='p-3 bg-green-100 dark:bg-green-900 rounded-full'>
                <Users className='w-6 h-6 text-green-600 dark:text-green-400' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='hover:shadow-lg transition-shadow'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                  Usuários Ativos
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {stats.activeUsers}
                </p>
              </div>
              <div className='p-3 bg-purple-100 dark:bg-purple-900 rounded-full'>
                <User className='w-6 h-6 text-purple-600 dark:text-purple-400' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='hover:shadow-lg transition-shadow'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                  Usuários Pendentes
                </p>
                <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                  {stats.pendingUsers}
                </p>
              </div>
              <div className='p-3 bg-orange-100 dark:bg-orange-900 rounded-full'>
                <Clock className='w-6 h-6 text-orange-600 dark:text-orange-400' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de Busca e Filtros */}
      <Card>
        <CardContent className='p-6'>
          <div className='flex flex-col md:flex-row gap-4'>
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
                <Input
                  placeholder='Buscar usuários, permissões ou roles...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>
            <div className='flex gap-2'>
              <select
                value={filterRole}
                onChange={e => setFilterRole(e.target.value)}
                className='w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white'
              >
                <option value='all'>Todas as Roles</option>
                <option value='admin'>Admin</option>
                <option value='gerente'>Gerente</option>
                <option value='recepcao'>Recepção</option>
                <option value='profissional'>Profissional</option>
                <option value='usuario'>Usuário</option>
              </select>
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className='w-40 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white'
              >
                <option value='all'>Todas as Categorias</option>
                {getPermissionCategories().map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Navegação */}
      <div className='border-b border-gray-200 dark:border-gray-700'>
        <nav className='-mb-px flex space-x-8'>
          {[
            {
              id: 'funcoes',
              label: 'Funções',
              icon: Shield,
              count: stats.totalRoles,
            },
            {
              id: 'users',
              label: 'Usuários',
              icon: Users,
              count: stats.activeUsers,
            },
            {
              id: 'permissions',
              label: 'Permissões',
              icon: Settings,
              count: stats.totalPermissions,
            },
            {
              id: 'pending',
              label: 'Usuários Pendentes',
              icon: Clock,
              count: stats.pendingUsers,
            },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
              <Badge variant='secondary' className='ml-1'>
                {tab.count}
              </Badge>
            </button>
          ))}
        </nav>
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === 'funcoes' && (
        <div className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {funcaoPermissions.map(funcaoPermission => (
              <Card
                key={funcaoPermission.funcao}
                className='hover:shadow-lg transition-shadow'
              >
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <CardTitle className='text-lg capitalize'>
                      {funcaoPermission.funcao}
                    </CardTitle>
                    <Badge className={getFuncaoColor(funcaoPermission.funcao)}>
                      {funcaoPermission.permissions.length} permissões
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    {getPermissionCategories().map(category => {
                      const categoryPermissions = permissions.filter(
                        p => p.category === category
                      );

                      return (
                        <div key={category}>
                          <h4 className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                            {category}
                          </h4>
                          <div className='space-y-1'>
                            {categoryPermissions.map(permission => {
                              const hasPermission =
                                funcaoPermission.permissions.some(
                                  p => p.id === permission.id
                                );
                              return (
                                <label
                                  key={permission.id}
                                  className={`flex items-center space-x-2 text-sm ${
                                    canManagePermissions
                                      ? 'cursor-pointer'
                                      : 'cursor-not-allowed'
                                  }`}
                                >
                                  <input
                                    type='checkbox'
                                    checked={hasPermission}
                                    onChange={() =>
                                      handleFuncaoPermissionToggle(
                                        funcaoPermission.funcao,
                                        permission.id
                                      )
                                    }
                                    disabled={!canManagePermissions}
                                    className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                                  />
                                  <span
                                    className={
                                      hasPermission
                                        ? 'text-gray-900 dark:text-white'
                                        : 'text-gray-500 dark:text-gray-400'
                                    }
                                  >
                                    {permission.name}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className='space-y-6'>
          <div className='flex justify-between items-center'>
            <h3 className='text-xl font-semibold text-gray-900 dark:text-white'>
              Usuários Ativos ({getFilteredUsers().length})
            </h3>
            <Button className='bg-green-600 hover:bg-green-700 text-white'>
              <Plus className='w-4 h-4 mr-2' />
              Adicionar Usuário
            </Button>
          </div>
          <div className='grid grid-cols-1 gap-6'>
            {getFilteredUsers().map(user => (
              <Card
                key={user.userId}
                className='hover:shadow-lg transition-shadow'
              >
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <User size={24} className='text-gray-500' />
                      <div>
                        <CardTitle className='text-lg'>
                          {user.userName}
                        </CardTitle>
                        <p className='text-sm text-gray-600 dark:text-gray-400'>
                          ID: {user.userId}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Badge className={getFuncaoColor(user.funcao)}>
                        {user.funcao}
                      </Badge>
                      <Badge variant='outline'>
                        {getUserPermissions(user.userId).length} permissões
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {/* Mudança de Função */}
                    <div>
                      <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                        Função
                      </label>
                      <select
                        value={user.funcao}
                        onChange={e =>
                          handleUserRoleChange(user.userId, e.target.value)
                        }
                        disabled={!canManagePermissions}
                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                      >
                        <option value='admin'>Admin</option>
                        <option value='gerente'>Gerente</option>
                        <option value='recepcao'>Recepção</option>
                        <option value='profissional'>Profissional</option>
                        <option value='usuario'>Usuário</option>
                        <option value='desenvolvedor'>Desenvolvedor</option>
                      </select>
                    </div>

                    {/* Permissões Customizadas */}
                    <div>
                      <h4 className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                        Permissões Customizadas
                      </h4>
                      <div className='space-y-2'>
                        {getPermissionCategories().map(category => {
                          const categoryPermissions = permissions.filter(
                            p => p.category === category
                          );
                          const userHasCategoryPermissions =
                            categoryPermissions.filter(p =>
                              hasUserPermission(user.userId, p.id)
                            );

                          if (userHasCategoryPermissions.length === 0)
                            return null;

                          return (
                            <div key={category}>
                              <h5 className='text-xs font-medium text-gray-600 dark:text-gray-400 mb-1'>
                                {category}
                              </h5>
                              <div className='space-y-1'>
                                {categoryPermissions.map(permission => {
                                  const hasPermission = hasUserPermission(
                                    user.userId,
                                    permission.id
                                  );
                                  const isFromRole = getFuncaoPermissions(
                                    user.funcao
                                  ).some(p => p.id === permission.id);
                                  const isCustom = user.customPermissions.some(
                                    p => p.id === permission.id
                                  );

                                  return (
                                    <div
                                      key={permission.id}
                                      className={`flex items-center space-x-2 text-sm p-2 rounded ${
                                        isFromRole
                                          ? 'bg-blue-50 dark:bg-blue-900/20'
                                          : isCustom
                                            ? 'bg-green-50 dark:bg-green-900/20'
                                            : 'bg-gray-50 dark:bg-gray-800'
                                      }`}
                                    >
                                      <input
                                        type='checkbox'
                                        checked={hasPermission}
                                        onChange={() =>
                                          handleUserPermissionToggle(
                                            user.userId,
                                            permission.id
                                          )
                                        }
                                        disabled={
                                          !canManagePermissions || isFromRole
                                        }
                                        className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                                      />
                                      <span
                                        className={
                                          hasPermission
                                            ? 'text-gray-900 dark:text-white'
                                            : 'text-gray-500 dark:text-gray-400'
                                        }
                                      >
                                        {permission.name}
                                      </span>
                                      {isFromRole && (
                                        <Badge
                                          variant='outline'
                                          className='text-xs'
                                        >
                                          Role
                                        </Badge>
                                      )}
                                      {isCustom && (
                                        <Badge
                                          variant='outline'
                                          className='text-xs'
                                        >
                                          Custom
                                        </Badge>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'permissions' && (
        <div className='space-y-6'>
          <div className='flex justify-between items-center'>
            <h3 className='text-xl font-semibold text-gray-900 dark:text-white'>
              Permissões do Sistema ({getFilteredPermissions().length})
            </h3>
            <div className='flex gap-2'>
              <Button variant='outline'>
                <Download className='w-4 h-4 mr-2' />
                Exportar
              </Button>
              <Button variant='outline'>
                <Upload className='w-4 h-4 mr-2' />
                Importar
              </Button>
            </div>
          </div>
          <div className='grid grid-cols-1 gap-6'>
            {getPermissionCategories().map(category => {
              const categoryPermissions = getFilteredPermissions().filter(
                p => p.category === category
              );
              if (categoryPermissions.length === 0) return null;

              return (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className='text-lg'>{category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-4'>
                      {categoryPermissions.map(permission => (
                        <div
                          key={permission.id}
                          className='border border-gray-200 dark:border-gray-700 rounded-lg p-4'
                        >
                          <div className='flex items-start justify-between'>
                            <div className='flex-1'>
                              <h4 className='font-medium text-gray-900 dark:text-white'>
                                {permission.name}
                              </h4>
                              <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
                                {permission.description}
                              </p>
                            </div>
                            <div className='flex items-center gap-2'>
                              <Badge variant='secondary'>
                                {permission.action}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'pending' && (
        <div className='space-y-6'>
          <div className='flex justify-between items-center'>
            <h3 className='text-xl font-semibold text-gray-900 dark:text-white'>
              Usuários Pendentes ({pendingUsers.length})
            </h3>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                onClick={() => {
                  // Aprovar todos os usuários pendentes
                  pendingUsers.forEach(user => handleApproveUser(user.id));
                }}
                disabled={pendingUsers.length === 0}
              >
                <CheckCircle className='w-4 h-4 mr-2' />
                Aprovar Todos
              </Button>
              <Button
                variant='outline'
                onClick={() => {
                  // Rejeitar todos os usuários pendentes
                  setPendingUsers([]);
                }}
                disabled={pendingUsers.length === 0}
                className='text-red-600 hover:text-red-700'
              >
                <XCircle className='w-4 h-4 mr-2' />
                Rejeitar Todos
              </Button>
            </div>
          </div>

          {pendingUsers.length === 0 ? (
            <Card>
              <CardContent className='p-12 text-center'>
                <Clock className='w-16 h-16 text-gray-400 mx-auto mb-4' />
                <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
                  Nenhum usuário pendente
                </h3>
                <p className='text-gray-600 dark:text-gray-400'>
                  Não há solicitações de acesso aguardando aprovação.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {pendingUsers.map(pendingUser => (
                <Card
                  key={pendingUser.id}
                  className='hover:shadow-lg transition-shadow'
                >
                  <CardHeader>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        <div className='p-2 bg-orange-100 dark:bg-orange-900 rounded-full'>
                          <Clock className='w-5 h-5 text-orange-600 dark:text-orange-400' />
                        </div>
                        <div>
                          <CardTitle className='text-lg'>
                            {pendingUser.name}
                          </CardTitle>
                          <p className='text-sm text-gray-600 dark:text-gray-400'>
                            {pendingUser.email}
                          </p>
                        </div>
                      </div>
                      <Badge className='bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'>
                        Pendente
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-4'>
                      <div>
                        <p className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                          Função Solicitada
                        </p>
                        <Badge
                          className={getFuncaoColor(pendingUser.requestedRole)}
                        >
                          {pendingUser.requestedRole}
                        </Badge>
                      </div>

                      <div>
                        <p className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                          Data da Solicitação
                        </p>
                        <p className='text-sm text-gray-600 dark:text-gray-400'>
                          {new Date(pendingUser.requestedAt).toLocaleDateString(
                            'pt-BR'
                          )}
                        </p>
                      </div>

                      <div className='flex gap-2 pt-4'>
                        <Button
                          onClick={() => handleApproveUser(pendingUser.id)}
                          className='flex-1 bg-green-600 hover:bg-green-700 text-white'
                        >
                          <CheckCircle className='w-4 h-4 mr-2' />
                          Aprovar
                        </Button>
                        <Button
                          onClick={() => handleRejectUser(pendingUser.id)}
                          variant='outline'
                          className='flex-1 text-red-600 hover:text-red-700 hover:bg-red-50'
                        >
                          <XCircle className='w-4 h-4 mr-2' />
                          Rejeitar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// EXPORTAÇÕES
// ============================================================================

export default PermissionManager;
