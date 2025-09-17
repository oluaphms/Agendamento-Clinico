// ============================================================================
// COMPONENTE: PermissionManager - Gerenciador de Permissões
// ============================================================================
// Interface para gerenciar permissões granulares de usuários
// ============================================================================

import React, { useState } from 'react';

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
// import { PermissionService } from '@/services/mockServices';
import { PREDEFINED_PERMISSIONS, PREDEFINED_ROLES } from '@/types/permissions';
import toast from 'react-hot-toast';

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
// DADOS REAIS BASEADOS EM PERMISSÕES PREDEFINIDAS
// ============================================================================

const REAL_PERMISSIONS: Permission[] = Object.entries(
  PREDEFINED_PERMISSIONS
).map(([key, value], index) => ({
  id: (index + 1).toString(),
  name: key
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, l => l.toUpperCase()),
  description: `Permite ${value.action} em ${value.resource}`,
  resource: value.resource,
  action: value.action,
  category: getCategoryFromResource(value.resource),
}));

function getCategoryFromResource(resource: string): string {
  const categories: Record<string, string> = {
    patients: 'Pacientes',
    schedule: 'Agenda',
    reports: 'Relatórios',
    users: 'Usuários',
    settings: 'Sistema',
    backup: 'Backup',
    notifications: 'Notificações',
    analytics: 'Analytics',
    gamification: 'Gamificação',
  };
  return categories[resource] || 'Outros';
}

const REAL_FUNCAO_PERMISSIONS: FuncaoPermission[] = [
  {
    funcao: 'Administrador',
    permissions: REAL_PERMISSIONS,
    customPermissions: [],
  },
  {
    funcao: 'Médico',
    permissions: REAL_PERMISSIONS.filter(p =>
      ['patients', 'schedule', 'reports'].includes(p.resource)
    ),
    customPermissions: [],
  },
  {
    funcao: 'Recepcionista',
    permissions: REAL_PERMISSIONS.filter(p =>
      ['patients', 'schedule'].includes(p.resource)
    ),
    customPermissions: [],
  },
  {
    funcao: 'Enfermeiro',
    permissions: REAL_PERMISSIONS.filter(p =>
      ['patients', 'schedule'].includes(p.resource)
    ),
    customPermissions: [],
  },
  {
    funcao: 'Analista',
    permissions: REAL_PERMISSIONS.filter(p =>
      ['reports', 'analytics'].includes(p.resource)
    ),
    customPermissions: [],
  },
];

const REAL_USERS: UserPermission[] = [
  {
    userId: '1',
    userName: 'João Silva',
    funcao: 'Administrador',
    customPermissions: [],
    overrides: {},
  },
  {
    userId: '2',
    userName: 'Maria Santos',
    funcao: 'Médico',
    customPermissions: [],
    overrides: {},
  },
  {
    userId: '3',
    userName: 'Ana Costa',
    funcao: 'Recepcionista',
    customPermissions: [],
    overrides: {},
  },
  {
    userId: '4',
    userName: 'Carlos Oliveira',
    funcao: 'Enfermeiro',
    customPermissions: [],
    overrides: {},
  },
];

const REAL_PENDING_USERS = [
  {
    id: '5',
    name: 'Lucia Ferreira',
    email: 'lucia@email.com',
    requestedRole: 'Recepcionista',
    status: 'pending',
    created_at: '2025-01-08T14:15:00Z',
  },
  {
    id: '6',
    name: 'Pedro Almeida',
    email: 'pedro@email.com',
    requestedRole: 'Analista',
    status: 'pending',
    created_at: '2025-01-08T16:30:00Z',
  },
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export const PermissionManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'funcoes' | 'users' | 'permissions' | 'pending'
  >('funcoes');
  const [permissions] = useState<Permission[]>(REAL_PERMISSIONS);
  const [funcaoPermissions, setFuncaoPermissions] = useState<
    FuncaoPermission[]
  >(REAL_FUNCAO_PERMISSIONS);
  const [users, setUsers] = useState<UserPermission[]>(REAL_USERS);
  const [pendingUsers, setPendingUsers] = useState(REAL_PENDING_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [bulkRole, setBulkRole] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
  // FUNÇÕES AUXILIARES
  // ============================================================================

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Pacientes:
        'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200',
      Agenda:
        'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200',
      Relatórios:
        'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200',
      Usuários:
        'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200',
      Sistema:
        'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200',
      Backup: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200',
      Notificações:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200',
      Analytics:
        'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-200',
      Gamificação:
        'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-200',
    };
    return (
      colors[category] ||
      'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200'
    );
  };

  const getActionIcon = (action: string) => {
    const icons: Record<string, React.ReactNode> = {
      read: <Eye className='h-4 w-4' />,
      create: <Plus className='h-4 w-4' />,
      update: <Edit className='h-4 w-4' />,
      delete: <Trash2 className='h-4 w-4' />,
      manage: <Settings className='h-4 w-4' />,
    };
    return icons[action] || <Shield className='h-4 w-4' />;
  };

  const handleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleBulkRoleAssignment = async () => {
    if (selectedUsers.length === 0 || !bulkRole) return;

    setIsLoading(true);
    try {
      // Simular atribuição em lote
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Atualizar usuários localmente
      setUsers(prev =>
        prev.map(user =>
          selectedUsers.includes(user.userId)
            ? { ...user, funcao: bulkRole }
            : user
        )
      );

      toast.success(
        `Role "${bulkRole}" atribuída com sucesso para ${selectedUsers.length} usuário(s)!`
      );
      setShowBulkModal(false);
      setSelectedUsers([]);
      setBulkRole('');
    } catch (error) {
      toast.error('Erro ao atribuir roles em lote');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAllUsers = () => {
    setSelectedUsers(users.map(user => user.userId));
  };

  const handleDeselectAllUsers = () => {
    setSelectedUsers([]);
  };

  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch =
      permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === 'all' || permission.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedPermissions = filteredPermissions.reduce(
    (acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    },
    {} as Record<string, Permission[]>
  );

  // ============================================================================
  // RENDERIZAÇÃO
  // ============================================================================

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
            Gerenciamento de Permissões
          </h2>
          <p className='text-gray-600 dark:text-gray-400 mt-1'>
            Configure permissões granulares para usuários e funções
          </p>
        </div>
        <div className='flex space-x-2'>
          <Button variant='outline' size='sm'>
            <Download className='h-4 w-4 mr-2' />
            Exportar
          </Button>
          <Button variant='outline' size='sm'>
            <Upload className='h-4 w-4 mr-2' />
            Importar
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className='border-b border-gray-200 dark:border-gray-700'>
        <nav className='-mb-px flex space-x-8'>
          {[
            { id: 'funcoes', label: 'Funções', icon: Users },
            { id: 'users', label: 'Usuários', icon: User },
            { id: 'permissions', label: 'Permissões', icon: Shield },
            { id: 'pending', label: 'Pendentes', icon: Clock },
          ].map(tab => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <IconComponent className='h-5 w-5 mr-2' />
                {tab.label}
                {tab.id === 'pending' && pendingUsers.length > 0 && (
                  <span className='ml-2 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 py-0.5 px-2 rounded-full text-xs'>
                    {pendingUsers.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'funcoes' && (
        <div className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {funcaoPermissions.map(funcao => (
              <Card key={funcao.funcao}>
                <CardHeader>
                  <CardTitle className='flex items-center justify-between'>
                    <span>{funcao.funcao}</span>
                    <Badge variant='secondary'>
                      {funcao.permissions.length} permissões
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-2'>
                    {Object.entries(
                      funcao.permissions.reduce(
                        (acc, perm) => {
                          if (!acc[perm.category]) acc[perm.category] = [];
                          acc[perm.category].push(perm);
                          return acc;
                        },
                        {} as Record<string, Permission[]>
                      )
                    ).map(([category, perms]) => (
                      <div key={category}>
                        <div className='flex items-center space-x-2 mb-2'>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(category)}`}
                          >
                            {category}
                          </span>
                          <span className='text-xs text-gray-500'>
                            {perms.length} permissões
                          </span>
                        </div>
                        <div className='space-y-1'>
                          {perms.slice(0, 3).map(perm => (
                            <div
                              key={perm.id}
                              className='flex items-center space-x-2 text-sm'
                            >
                              {getActionIcon(perm.action)}
                              <span className='text-gray-600 dark:text-gray-400'>
                                {perm.name}
                              </span>
                            </div>
                          ))}
                          {perms.length > 3 && (
                            <div className='text-xs text-gray-500'>
                              +{perms.length - 3} mais...
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className='space-y-6'>
          {/* Bulk Operations */}
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <div className='flex items-center space-x-2'>
                <input
                  type='checkbox'
                  checked={
                    selectedUsers.length === users.length && users.length > 0
                  }
                  onChange={
                    selectedUsers.length === users.length
                      ? handleDeselectAllUsers
                      : handleSelectAllUsers
                  }
                  className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                />
                <span className='text-sm text-gray-700 dark:text-gray-300'>
                  Selecionar todos ({selectedUsers.length}/{users.length})
                </span>
              </div>
              {selectedUsers.length > 0 && (
                <div className='flex items-center space-x-2'>
                  <Button
                    onClick={() => setShowBulkModal(true)}
                    size='sm'
                    variant='outline'
                  >
                    Atribuir Role em Lote
                  </Button>
                  <Button
                    onClick={handleDeselectAllUsers}
                    size='sm'
                    variant='outline'
                  >
                    Limpar Seleção
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {users.map(user => (
              <Card
                key={user.userId}
                className={`cursor-pointer transition-all ${
                  selectedUsers.includes(user.userId)
                    ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'hover:shadow-md'
                }`}
                onClick={() => handleUserSelection(user.userId)}
              >
                <CardHeader>
                  <CardTitle className='flex items-center justify-between'>
                    <div className='flex items-center space-x-2'>
                      <input
                        type='checkbox'
                        checked={selectedUsers.includes(user.userId)}
                        onChange={() => handleUserSelection(user.userId)}
                        onClick={e => e.stopPropagation()}
                        className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                      />
                      <span>{user.userName}</span>
                    </div>
                    <Badge variant='outline'>{user.funcao}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-2'>
                    <div className='text-sm text-gray-600 dark:text-gray-400'>
                      Função: {user.funcao}
                    </div>
                    <div className='text-sm text-gray-600 dark:text-gray-400'>
                      Permissões customizadas: {user.customPermissions.length}
                    </div>
                    <div className='text-sm text-gray-600 dark:text-gray-400'>
                      Overrides: {Object.keys(user.overrides).length}
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
          {/* Filtros */}
          <div className='flex flex-col sm:flex-row gap-4'>
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                <Input
                  placeholder='Buscar permissões...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>
            <div className='flex gap-2'>
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
              >
                <option value='all'>Todas as categorias</option>
                {Array.from(new Set(permissions.map(p => p.category))).map(
                  category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          {/* Lista de Permissões por Categoria */}
          <div className='space-y-6'>
            {Object.entries(groupedPermissions).map(([category, perms]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className='flex items-center space-x-2'>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(category)}`}
                    >
                      {category}
                    </span>
                    <span className='text-sm text-gray-500'>
                      {perms.length} permissões
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {perms.map(permission => (
                      <div
                        key={permission.id}
                        className='p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'
                      >
                        <div className='flex items-start space-x-3'>
                          <div className='flex-shrink-0'>
                            {getActionIcon(permission.action)}
                          </div>
                          <div className='flex-1 min-w-0'>
                            <h4 className='text-sm font-medium text-gray-900 dark:text-white'>
                              {permission.name}
                            </h4>
                            <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
                              {permission.description}
                            </p>
                            <div className='mt-2 flex items-center space-x-2'>
                              <Badge variant='outline' className='text-xs'>
                                {permission.action}
                              </Badge>
                              <Badge variant='outline' className='text-xs'>
                                {permission.resource}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'pending' && (
        <div className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {pendingUsers.map(user => (
              <Card key={user.id}>
                <CardHeader>
                  <CardTitle className='flex items-center justify-between'>
                    <span>{user.name}</span>
                    <Badge
                      variant='outline'
                      className='bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
                    >
                      Pendente
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-2'>
                    <div className='text-sm text-gray-600 dark:text-gray-400'>
                      Email: {user.email}
                    </div>
                    <div className='text-sm text-gray-600 dark:text-gray-400'>
                      Função solicitada: {user.requestedRole}
                    </div>
                    <div className='text-sm text-gray-600 dark:text-gray-400'>
                      Data:{' '}
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </div>
                    <div className='flex space-x-2 mt-4'>
                      <Button size='sm' variant='default'>
                        <CheckCircle className='h-4 w-4 mr-1' />
                        Aprovar
                      </Button>
                      <Button size='sm' variant='outline'>
                        <XCircle className='h-4 w-4 mr-1' />
                        Rejeitar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Bulk Role Assignment Modal */}
      {showBulkModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              Atribuir Role em Lote
            </h3>

            <div className='space-y-4'>
              <div>
                <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>
                  Usuários selecionados: {selectedUsers.length}
                </p>
                <div className='max-h-32 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md p-2'>
                  {selectedUsers.map(userId => {
                    const user = users.find(u => u.userId === userId);
                    return user ? (
                      <div
                        key={userId}
                        className='text-sm text-gray-700 dark:text-gray-300 py-1'
                      >
                        {user.userName} ({user.funcao})
                      </div>
                    ) : null;
                  })}
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Nova Role
                </label>
                <select
                  value={bulkRole}
                  onChange={e => setBulkRole(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
                >
                  <option value=''>Selecione uma role</option>
                  {Object.values(PREDEFINED_ROLES).map(role => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className='flex justify-end space-x-3 mt-6'>
              <Button
                onClick={() => setShowBulkModal(false)}
                variant='outline'
                size='sm'
              >
                Cancelar
              </Button>
              <Button
                onClick={handleBulkRoleAssignment}
                variant='default'
                size='sm'
                disabled={!bulkRole || isLoading}
              >
                {isLoading ? (
                  <>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                    Atribuindo...
                  </>
                ) : (
                  'Atribuir Role'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionManager;
