// ============================================================================
// SISTEMA DE PERMISSÕES GRANULARES
// ============================================================================
// Sistema para controle de acesso baseado em roles e permissões
// ============================================================================

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export type Permission = 
  // Pacientes
  | 'patients:read'
  | 'patients:write'
  | 'patients:delete'
  | 'patients:export'
  
  // Consultas
  | 'appointments:read'
  | 'appointments:write'
  | 'appointments:delete'
  | 'appointments:cancel'
  | 'appointments:reschedule'
  
  // Profissionais
  | 'professionals:read'
  | 'professionals:write'
  | 'professionals:delete'
  | 'professionals:schedule'
  
  // Usuários
  | 'users:read'
  | 'users:write'
  | 'users:delete'
  | 'users:manage_roles'
  
  // Relatórios
  | 'reports:read'
  | 'reports:write'
  | 'reports:export'
  | 'reports:financial'
  
  // Configurações
  | 'settings:read'
  | 'settings:write'
  | 'settings:system'
  
  // Dashboard
  | 'dashboard:read'
  | 'dashboard:metrics'
  | 'dashboard:analytics'
  
  // Notificações
  | 'notifications:read'
  | 'notifications:write'
  | 'notifications:send'
  
  // Financeiro
  | 'financial:read'
  | 'financial:write'
  | 'financial:approve'
  | 'financial:reports';

export type Role = 
  | 'admin'
  | 'gerente'
  | 'profissional'
  | 'recepcao'
  | 'financeiro'
  | 'usuario';

export interface UserPermissions {
  userId: string;
  role: Role;
  permissions: Permission[];
  customPermissions?: Permission[];
  restrictions?: PermissionRestriction[];
}

export interface PermissionRestriction {
  resource: string;
  action: string;
  conditions: Record<string, any>;
}

export interface PermissionCheck {
  hasPermission: boolean;
  reason?: string;
  restrictions?: PermissionRestriction[];
}

// ============================================================================
// CONFIGURAÇÕES DE ROLES E PERMISSÕES
// ============================================================================

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    // Todas as permissões
    'patients:read', 'patients:write', 'patients:delete', 'patients:export',
    'appointments:read', 'appointments:write', 'appointments:delete', 'appointments:cancel', 'appointments:reschedule',
    'professionals:read', 'professionals:write', 'professionals:delete', 'professionals:schedule',
    'users:read', 'users:write', 'users:delete', 'users:manage_roles',
    'reports:read', 'reports:write', 'reports:export', 'reports:financial',
    'settings:read', 'settings:write', 'settings:system',
    'dashboard:read', 'dashboard:metrics', 'dashboard:analytics',
    'notifications:read', 'notifications:write', 'notifications:send',
    'financial:read', 'financial:write', 'financial:approve', 'financial:reports',
  ],
  
  gerente: [
    'patients:read', 'patients:write', 'patients:export',
    'appointments:read', 'appointments:write', 'appointments:cancel', 'appointments:reschedule',
    'professionals:read', 'professionals:write', 'professionals:schedule',
    'users:read', 'users:write',
    'reports:read', 'reports:write', 'reports:export', 'reports:financial',
    'settings:read', 'settings:write',
    'dashboard:read', 'dashboard:metrics', 'dashboard:analytics',
    'notifications:read', 'notifications:write', 'notifications:send',
    'financial:read', 'financial:write', 'financial:reports',
  ],
  
  profissional: [
    'patients:read', 'patients:write',
    'appointments:read', 'appointments:write', 'appointments:reschedule',
    'professionals:read',
    'reports:read', 'reports:export',
    'dashboard:read', 'dashboard:metrics',
    'notifications:read', 'notifications:write',
    'financial:read',
  ],
  
  recepcao: [
    'patients:read', 'patients:write',
    'appointments:read', 'appointments:write', 'appointments:cancel', 'appointments:reschedule',
    'professionals:read',
    'reports:read', 'reports:export',
    'dashboard:read',
    'notifications:read', 'notifications:write',
  ],
  
  financeiro: [
    'patients:read',
    'appointments:read',
    'professionals:read',
    'reports:read', 'reports:export', 'reports:financial',
    'dashboard:read', 'dashboard:metrics',
    'notifications:read',
    'financial:read', 'financial:write', 'financial:reports',
  ],
  
  usuario: [
    'patients:read',
    'appointments:read',
    'professionals:read',
    'dashboard:read',
    'notifications:read',
  ],
};

// ============================================================================
// CONFIGURAÇÕES DE RECURSOS
// ============================================================================

export const RESOURCE_PERMISSIONS: Record<string, Permission[]> = {
  patients: ['patients:read', 'patients:write', 'patients:delete', 'patients:export'],
  appointments: ['appointments:read', 'appointments:write', 'appointments:delete', 'appointments:cancel', 'appointments:reschedule'],
  professionals: ['professionals:read', 'professionals:write', 'professionals:delete', 'professionals:schedule'],
  users: ['users:read', 'users:write', 'users:delete', 'users:manage_roles'],
  reports: ['reports:read', 'reports:write', 'reports:export', 'reports:financial'],
  settings: ['settings:read', 'settings:write', 'settings:system'],
  dashboard: ['dashboard:read', 'dashboard:metrics', 'dashboard:analytics'],
  notifications: ['notifications:read', 'notifications:write', 'notifications:send'],
  financial: ['financial:read', 'financial:write', 'financial:approve', 'financial:reports'],
};

// ============================================================================
// FUNÇÕES DE VERIFICAÇÃO DE PERMISSÕES
// ============================================================================

/**
 * Verifica se um usuário tem uma permissão específica
 */
export function hasPermission(
  userPermissions: UserPermissions,
  permission: Permission,
  resource?: string,
  context?: Record<string, any>
): PermissionCheck {
  // Verificar se o usuário tem a permissão básica
  const hasBasicPermission = userPermissions.permissions.includes(permission) ||
                           userPermissions.customPermissions?.includes(permission);

  if (!hasBasicPermission) {
    return {
      hasPermission: false,
      reason: `Usuário não possui a permissão ${permission}`,
    };
  }

  // Verificar restrições específicas
  if (userPermissions.restrictions) {
    const relevantRestrictions = userPermissions.restrictions.filter(
      restriction => 
        !resource || 
        restriction.resource === resource ||
        restriction.resource === '*'
    );

    for (const restriction of relevantRestrictions) {
      if (restriction.action === permission.split(':')[1]) {
        // Verificar condições da restrição
        const conditionsMet = Object.entries(restriction.conditions).every(
          ([key, value]) => {
            if (context && context[key] !== undefined) {
              return context[key] === value;
            }
            return false;
          }
        );

        if (!conditionsMet) {
          return {
            hasPermission: false,
            reason: `Permissão restrita por condições específicas`,
            restrictions: [restriction],
          };
        }
      }
    }
  }

  return {
    hasPermission: true,
  };
}

/**
 * Verifica se um usuário tem permissão para acessar um recurso
 */
export function canAccessResource(
  userPermissions: UserPermissions,
  resource: string,
  action: string = 'read'
): PermissionCheck {
  const permission = `${resource}:${action}` as Permission;
  return hasPermission(userPermissions, permission, resource);
}

/**
 * Verifica se um usuário pode executar uma ação em um recurso específico
 */
export function canPerformAction(
  userPermissions: UserPermissions,
  resource: string,
  action: string,
  context?: Record<string, any>
): PermissionCheck {
  const permission = `${resource}:${action}` as Permission;
  return hasPermission(userPermissions, permission, resource, context);
}

/**
 * Filtra uma lista de recursos baseado nas permissões do usuário
 */
export function filterByPermissions<T extends { id: string; [key: string]: any }>(
  items: T[],
  userPermissions: UserPermissions,
  resource: string,
  action: string = 'read'
): T[] {
  const permissionCheck = canAccessResource(userPermissions, resource, action);
  
  if (!permissionCheck.hasPermission) {
    return [];
  }

  // Aplicar restrições específicas se existirem
  if (permissionCheck.restrictions) {
    return items.filter(item => {
      return permissionCheck.restrictions!.every(restriction => {
        return Object.entries(restriction.conditions).every(
          ([key, value]) => {
            if (item[key] !== undefined) {
              return item[key] === value;
            }
            return true;
          }
        );
      });
    });
  }

  return items;
}

/**
 * Verifica se um usuário pode ver um campo específico
 */
export function canViewField(
  userPermissions: UserPermissions,
  resource: string,
  field: string
): boolean {
  // Campos sensíveis que requerem permissões especiais
  const sensitiveFields: Record<string, string[]> = {
    patients: ['cpf', 'rg', 'endereco', 'telefone'],
    appointments: ['observacoes', 'diagnostico'],
    financial: ['valor', 'desconto', 'forma_pagamento'],
    users: ['email', 'telefone', 'endereco'],
  };

  const sensitiveFieldsForResource = sensitiveFields[resource] || [];
  
  if (sensitiveFieldsForResource.includes(field)) {
    return hasPermission(userPermissions, `${resource}:write` as Permission).hasPermission;
  }

  return hasPermission(userPermissions, `${resource}:read` as Permission).hasPermission;
}

/**
 * Verifica se um usuário pode editar um campo específico
 */
export function canEditField(
  userPermissions: UserPermissions,
  resource: string,
  field: string
): boolean {
  return hasPermission(userPermissions, `${resource}:write` as Permission).hasPermission;
}

// ============================================================================
// FUNÇÕES DE GERENCIAMENTO DE ROLES
// ============================================================================

/**
 * Cria um novo role com permissões personalizadas
 */
export function createCustomRole(
  roleName: string,
  permissions: Permission[],
  baseRole?: Role
): Record<string, Permission[]> {
  const basePermissions = baseRole ? ROLE_PERMISSIONS[baseRole] : [];
  const allPermissions = [...new Set([...basePermissions, ...permissions])];
  
  return {
    [roleName]: allPermissions,
  };
}

/**
 * Adiciona permissões a um role existente
 */
export function addPermissionsToRole(
  role: Role,
  additionalPermissions: Permission[]
): Permission[] {
  const currentPermissions = ROLE_PERMISSIONS[role];
  return [...new Set([...currentPermissions, ...additionalPermissions])];
}

/**
 * Remove permissões de um role existente
 */
export function removePermissionsFromRole(
  role: Role,
  permissionsToRemove: Permission[]
): Permission[] {
  const currentPermissions = ROLE_PERMISSIONS[role];
  return currentPermissions.filter(permission => !permissionsToRemove.includes(permission));
}

/**
 * Lista todas as permissões disponíveis para um role
 */
export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Lista todos os roles disponíveis
 */
export function getAvailableRoles(): Role[] {
  return Object.keys(ROLE_PERMISSIONS) as Role[];
}

/**
 * Verifica se um role existe
 */
export function isValidRole(role: string): role is Role {
  return role in ROLE_PERMISSIONS;
}

// ============================================================================
// FUNÇÕES DE CONTEXTO
// ============================================================================

/**
 * Cria um contexto de permissão para verificação
 */
export function createPermissionContext(
  resource: string,
  resourceId?: string,
  additionalData?: Record<string, any>
): Record<string, any> {
  return {
    resource,
    resourceId,
    ...additionalData,
  };
}

/**
 * Verifica permissões baseadas em contexto de propriedade
 */
export function canAccessOwnResource(
  userPermissions: UserPermissions,
  resource: string,
  action: string,
  resourceOwnerId: string,
  currentUserId: string
): PermissionCheck {
  // Se o usuário é o dono do recurso, pode acessar
  if (resourceOwnerId === currentUserId) {
    return { hasPermission: true };
  }

  // Caso contrário, verificar permissões normais
  return canPerformAction(userPermissions, resource, action);
}

// ============================================================================
// FUNÇÕES DE AUDITORIA
// ============================================================================

/**
 * Registra uma tentativa de acesso para auditoria
 */
export function logPermissionCheck(
  userId: string,
  permission: Permission,
  resource: string,
  granted: boolean,
  reason?: string
): void {
  // Em produção, isso seria enviado para um sistema de auditoria
  console.log('Permission Check:', {
    userId,
    permission,
    resource,
    granted,
    reason,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Verifica permissões com logging de auditoria
 */
export function hasPermissionWithAudit(
  userPermissions: UserPermissions,
  permission: Permission,
  resource?: string,
  context?: Record<string, any>
): PermissionCheck {
  const result = hasPermission(userPermissions, permission, resource, context);
  
  logPermissionCheck(
    userPermissions.userId,
    permission,
    resource || 'unknown',
    result.hasPermission,
    result.reason
  );

  return result;
}
