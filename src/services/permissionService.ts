// ============================================================================
// SERVIÇO DE PERMISSÕES MOCKADO
// ============================================================================

import { Permission, Role, UserRole } from '@/types/permissions';

// ============================================================================
// DADOS MOCKADOS
// ============================================================================

const MOCK_PERMISSIONS: Permission[] = [
  // Pacientes
  {
    id: '1',
    name: 'Visualizar Pacientes',
    description: 'Permite visualizar informações dos pacientes',
    resource: 'patients',
    action: 'read',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Criar Pacientes',
    description: 'Permite criar novos pacientes',
    resource: 'patients',
    action: 'create',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Editar Pacientes',
    description: 'Permite editar informações dos pacientes',
    resource: 'patients',
    action: 'update',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '4',
    name: 'Excluir Pacientes',
    description: 'Permite excluir pacientes',
    resource: 'patients',
    action: 'delete',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '5',
    name: 'Gerenciar Pacientes',
    description: 'Controle total sobre pacientes',
    resource: 'patients',
    action: 'manage',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  // Agenda
  {
    id: '6',
    name: 'Visualizar Agenda',
    description: 'Permite visualizar a agenda de consultas',
    resource: 'schedule',
    action: 'read',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '7',
    name: 'Criar Agendamentos',
    description: 'Permite criar novos agendamentos',
    resource: 'schedule',
    action: 'create',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '8',
    name: 'Editar Agendamentos',
    description: 'Permite editar agendamentos existentes',
    resource: 'schedule',
    action: 'update',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '9',
    name: 'Cancelar Agendamentos',
    description: 'Permite cancelar agendamentos',
    resource: 'schedule',
    action: 'delete',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '10',
    name: 'Gerenciar Agenda',
    description: 'Controle total sobre a agenda',
    resource: 'schedule',
    action: 'manage',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  // Relatórios
  {
    id: '11',
    name: 'Visualizar Relatórios',
    description: 'Permite visualizar relatórios do sistema',
    resource: 'reports',
    action: 'read',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '12',
    name: 'Criar Relatórios',
    description: 'Permite criar novos relatórios',
    resource: 'reports',
    action: 'create',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '13',
    name: 'Gerenciar Relatórios',
    description: 'Controle total sobre relatórios',
    resource: 'reports',
    action: 'manage',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  // Usuários
  {
    id: '14',
    name: 'Visualizar Usuários',
    description: 'Permite visualizar usuários do sistema',
    resource: 'users',
    action: 'read',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '15',
    name: 'Criar Usuários',
    description: 'Permite criar novos usuários',
    resource: 'users',
    action: 'create',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '16',
    name: 'Editar Usuários',
    description: 'Permite editar usuários existentes',
    resource: 'users',
    action: 'update',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '17',
    name: 'Excluir Usuários',
    description: 'Permite excluir usuários',
    resource: 'users',
    action: 'delete',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '18',
    name: 'Gerenciar Usuários',
    description: 'Controle total sobre usuários',
    resource: 'users',
    action: 'manage',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  // Configurações
  {
    id: '19',
    name: 'Visualizar Configurações',
    description: 'Permite visualizar configurações do sistema',
    resource: 'settings',
    action: 'read',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '20',
    name: 'Editar Configurações',
    description: 'Permite editar configurações do sistema',
    resource: 'settings',
    action: 'update',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '21',
    name: 'Gerenciar Configurações',
    description: 'Controle total sobre configurações',
    resource: 'settings',
    action: 'manage',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  // Backup
  {
    id: '22',
    name: 'Visualizar Backups',
    description: 'Permite visualizar backups do sistema',
    resource: 'backup',
    action: 'read',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '23',
    name: 'Criar Backups',
    description: 'Permite criar backups do sistema',
    resource: 'backup',
    action: 'create',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '24',
    name: 'Gerenciar Backups',
    description: 'Controle total sobre backups',
    resource: 'backup',
    action: 'manage',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  // Notificações
  {
    id: '25',
    name: 'Visualizar Notificações',
    description: 'Permite visualizar notificações',
    resource: 'notifications',
    action: 'read',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '26',
    name: 'Criar Notificações',
    description: 'Permite criar notificações',
    resource: 'notifications',
    action: 'create',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '27',
    name: 'Gerenciar Notificações',
    description: 'Controle total sobre notificações',
    resource: 'notifications',
    action: 'manage',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  // Analytics
  {
    id: '28',
    name: 'Visualizar Analytics',
    description: 'Permite visualizar dados analíticos',
    resource: 'analytics',
    action: 'read',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '29',
    name: 'Gerenciar Analytics',
    description: 'Controle total sobre analytics',
    resource: 'analytics',
    action: 'manage',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  // Gamificação
  {
    id: '30',
    name: 'Visualizar Gamificação',
    description: 'Permite visualizar sistema de gamificação',
    resource: 'gamification',
    action: 'read',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '31',
    name: 'Gerenciar Gamificação',
    description: 'Controle total sobre gamificação',
    resource: 'gamification',
    action: 'manage',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
];

const MOCK_ROLES: Role[] = [
  {
    id: '1',
    name: 'Administrador',
    description: 'Acesso total ao sistema',
    permissions: MOCK_PERMISSIONS,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Médico',
    description: 'Acesso a pacientes, agenda e relatórios',
    permissions: MOCK_PERMISSIONS.filter(p =>
      ['patients', 'schedule', 'reports'].includes(p.resource)
    ),
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Recepcionista',
    description: 'Acesso a pacientes e agenda (sem exclusão)',
    permissions: MOCK_PERMISSIONS.filter(
      p =>
        ['patients', 'schedule'].includes(p.resource) && p.action !== 'delete'
    ),
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '4',
    name: 'Enfermeiro',
    description: 'Acesso a pacientes e agenda (sem exclusão)',
    permissions: MOCK_PERMISSIONS.filter(
      p =>
        ['patients', 'schedule'].includes(p.resource) && p.action !== 'delete'
    ),
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '5',
    name: 'Analista',
    description: 'Acesso a relatórios e analytics',
    permissions: MOCK_PERMISSIONS.filter(p =>
      ['reports', 'analytics'].includes(p.resource)
    ),
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
];

const MOCK_USER_ROLES: UserRole[] = [
  {
    id: '1',
    user_id: '1',
    role_id: '1',
    role: MOCK_ROLES[0],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '2',
    user_id: '2',
    role_id: '2',
    role: MOCK_ROLES[1],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '3',
    user_id: '3',
    role_id: '3',
    role: MOCK_ROLES[2],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '4',
    user_id: '4',
    role_id: '4',
    role: MOCK_ROLES[3],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
];

// ============================================================================
// SERVIÇO DE PERMISSÕES
// ============================================================================

export class PermissionService {
  // ============================================================================
  // PERMISSÕES
  // ============================================================================

  static async getPermissions(): Promise<Permission[]> {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simular delay
    return [...MOCK_PERMISSIONS];
  }

  static async getPermission(id: string): Promise<Permission | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_PERMISSIONS.find(p => p.id === id) || null;
  }

  static async createPermission(
    permission: Omit<Permission, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Permission> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newPermission: Permission = {
      ...permission,
      id: (MOCK_PERMISSIONS.length + 1).toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    MOCK_PERMISSIONS.push(newPermission);
    return newPermission;
  }

  static async updatePermission(
    id: string,
    permission: Partial<Permission>
  ): Promise<Permission> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = MOCK_PERMISSIONS.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Permissão não encontrada');

    MOCK_PERMISSIONS[index] = {
      ...MOCK_PERMISSIONS[index],
      ...permission,
      updated_at: new Date().toISOString(),
    };
    return MOCK_PERMISSIONS[index];
  }

  static async deletePermission(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = MOCK_PERMISSIONS.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Permissão não encontrada');
    MOCK_PERMISSIONS.splice(index, 1);
  }

  // ============================================================================
  // ROLES
  // ============================================================================

  static async getRoles(): Promise<Role[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...MOCK_ROLES];
  }

  static async getRole(id: string): Promise<Role | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_ROLES.find(r => r.id === id) || null;
  }

  static async createRole(
    role: Omit<Role, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Role> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newRole: Role = {
      ...role,
      id: (MOCK_ROLES.length + 1).toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    MOCK_ROLES.push(newRole);
    return newRole;
  }

  static async updateRole(id: string, role: Partial<Role>): Promise<Role> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = MOCK_ROLES.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Role não encontrada');

    MOCK_ROLES[index] = {
      ...MOCK_ROLES[index],
      ...role,
      updated_at: new Date().toISOString(),
    };
    return MOCK_ROLES[index];
  }

  static async deleteRole(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = MOCK_ROLES.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Role não encontrada');
    MOCK_ROLES.splice(index, 1);
  }

  // ============================================================================
  // USER ROLES
  // ============================================================================

  static async getUserRoles(userId: string): Promise<UserRole[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return MOCK_USER_ROLES.filter(ur => ur.user_id === userId);
  }

  static async assignRoleToUser(
    userId: string,
    roleId: string
  ): Promise<UserRole> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const role = MOCK_ROLES.find(r => r.id === roleId);
    if (!role) throw new Error('Role não encontrada');

    const newUserRole: UserRole = {
      id: (MOCK_USER_ROLES.length + 1).toString(),
      user_id: userId,
      role_id: roleId,
      role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    MOCK_USER_ROLES.push(newUserRole);
    return newUserRole;
  }

  static async removeRoleFromUser(
    userId: string,
    roleId: string
  ): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = MOCK_USER_ROLES.findIndex(
      ur => ur.user_id === userId && ur.role_id === roleId
    );
    if (index === -1) throw new Error('Associação não encontrada');
    MOCK_USER_ROLES.splice(index, 1);
  }

  // ============================================================================
  // VERIFICAÇÃO DE PERMISSÕES
  // ============================================================================

  static async checkPermission(
    userId: string,
    resource: string,
    action: string
  ): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const userRoles = MOCK_USER_ROLES.filter(ur => ur.user_id === userId);

    return userRoles.some(userRole =>
      userRole.role.permissions.some(
        permission =>
          permission.resource === resource && permission.action === action
      )
    );
  }

  static async checkMultiplePermissions(
    userId: string,
    permissions: Array<{ resource: string; action: string }>
  ): Promise<Record<string, boolean>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const userRoles = MOCK_USER_ROLES.filter(ur => ur.user_id === userId);

    const result: Record<string, boolean> = {};

    permissions.forEach(permission => {
      const key = `${permission.resource}:${permission.action}`;
      result[key] = userRoles.some(userRole =>
        userRole.role.permissions.some(
          p =>
            p.resource === permission.resource && p.action === permission.action
        )
      );
    });

    return result;
  }
}

export default PermissionService;
