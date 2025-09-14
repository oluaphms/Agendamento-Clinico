// ============================================================================
// HOOK DE PERMISSÕES
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import { Permission } from '../services/permissionService';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

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
  user_id: string;
  role_id: string;
  assigned_at: string;
}

interface PermissionCheck {
  allowed: boolean;
  reason?: string;
}

export interface UsePermissionsReturn {
  // Estados
  permissions: Permission[];
  roles: Role[];
  userRoles: UserRole[];
  loading: boolean;
  error: string | null;

  // Ações de permissões
  createPermission: (
    permission: Omit<Permission, 'id' | 'created_at' | 'updated_at'>
  ) => Promise<void>;
  updatePermission: (
    id: string,
    permission: Partial<Permission>
  ) => Promise<void>;
  deletePermission: (id: string) => Promise<void>;

  // Ações de roles
  createRole: (
    role: Omit<Role, 'id' | 'created_at' | 'updated_at'>
  ) => Promise<void>;
  updateRole: (id: string, role: Partial<Role>) => Promise<void>;
  deleteRole: (id: string) => Promise<void>;

  // Ações de user roles
  assignRoleToUser: (userId: string, roleId: string) => Promise<void>;
  removeRoleFromUser: (userId: string, roleId: string) => Promise<void>;

  // Verificação de permissões
  checkPermission: (
    resource: string,
    action: string
  ) => Promise<PermissionCheck>;
  checkMultiplePermissions: (
    permissions: Array<{ resource: string; action: string }>
  ) => Promise<Record<string, PermissionCheck>>;
  hasPermission: (resource: string, action: string) => boolean;
  hasAnyPermission: (
    permissions: Array<{ resource: string; action: string }>
  ) => boolean;
  hasAllPermissions: (
    permissions: Array<{ resource: string; action: string }>
  ) => boolean;

  // Utilitários
  refreshData: () => Promise<void>;
  clearError: () => void;
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export const usePermissions = (): UsePermissionsReturn => {
  // ============================================================================
  // ESTADOS
  // ============================================================================

  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuthStore();

  // ============================================================================
  // FUNÇÕES AUXILIARES
  // ============================================================================

  const handleError = useCallback((error: unknown, operation: string) => {
    const errorMessage =
      error instanceof Error ? error.message : 'Erro desconhecido';
    setError(`Erro ao ${operation}: ${errorMessage}`);
    console.error(`Erro ao ${operation}:`, error);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ============================================================================
  // CARREGAMENTO DE DADOS
  // ============================================================================

  const loadPermissions = useCallback(async () => {
    try {
      // const data = await permissionService.getPermissions();
      const data: Permission[] = [];
      setPermissions(data);
    } catch (error) {
      handleError(error, 'carregar permissões');
    }
  }, [handleError]);

  const loadRoles = useCallback(async () => {
    try {
      // const data = await permissionService.getRoles();
      const data: Role[] = [];
      setRoles(data);
    } catch (error) {
      handleError(error, 'carregar roles');
    }
  }, [handleError]);

  const loadUserRoles = useCallback(async () => {
    if (!user?.id) return;

    try {
      // const data = await permissionService.getUserRoles(user.id);
      const data: UserRole[] = [];
      setUserRoles(data);
    } catch (error) {
      handleError(error, 'carregar roles do usuário');
    }
  }, [user?.id, handleError]);

  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([loadPermissions(), loadRoles(), loadUserRoles()]);
    } catch (error) {
      handleError(error, 'atualizar dados');
    } finally {
      setLoading(false);
    }
  }, [loadPermissions, loadRoles, loadUserRoles, handleError]);

  // ============================================================================
  // AÇÕES DE PERMISSÕES
  // ============================================================================

  const createPermission = useCallback(
    async (
      _permission: Omit<Permission, 'id' | 'created_at' | 'updated_at'>
    ) => {
      try {
        setError(null);
        // const newPermission = await permissionService.createPermission(permission);
        const newPermission: Permission = {
          id: '',
          name: '',
          description: '',
          resource: '',
          action: '',
          category: '',
        };
        setPermissions(prev => [...prev, newPermission]);
      } catch (error) {
        handleError(error, 'criar permissão');
        throw error;
      }
    },
    [handleError]
  );

  const updatePermission = useCallback(
    async (id: string, _permission: Partial<Permission>) => {
      try {
        setError(null);
        // const updatedPermission = await permissionService.updatePermission(id, permission);
        const updatedPermission: Permission = {
          id: '',
          name: '',
          description: '',
          resource: '',
          action: '',
          category: '',
        };
        setPermissions(prev =>
          prev.map(p => (p.id === id ? updatedPermission : p))
        );
      } catch (error) {
        handleError(error, 'atualizar permissão');
        throw error;
      }
    },
    [handleError]
  );

  const deletePermission = useCallback(
    async (id: string) => {
      try {
        setError(null);
        // await permissionService.deletePermission(id);
        setPermissions(prev => prev.filter(p => p.id !== id));
      } catch (error) {
        handleError(error, 'excluir permissão');
        throw error;
      }
    },
    [handleError]
  );

  // ============================================================================
  // AÇÕES DE ROLES
  // ============================================================================

  const createRole = useCallback(
    async (_role: Omit<Role, 'id' | 'created_at' | 'updated_at'>) => {
      try {
        setError(null);
        // const newRole = await permissionService.createRole(role);
        const newRole: Role = {
          id: '',
          name: '',
          description: '',
          permissions: [],
          created_at: '',
          updated_at: '',
        };
        setRoles(prev => [...prev, newRole]);
      } catch (error) {
        handleError(error, 'criar role');
        throw error;
      }
    },
    [handleError]
  );

  const updateRole = useCallback(
    async (id: string, _role: Partial<Role>) => {
      try {
        setError(null);
        // const updatedRole = await permissionService.updateRole(id, role);
        const updatedRole: Role = {
          id: '',
          name: '',
          description: '',
          permissions: [],
          created_at: '',
          updated_at: '',
        };
        setRoles(prev => prev.map(r => (r.id === id ? updatedRole : r)));
      } catch (error) {
        handleError(error, 'atualizar role');
        throw error;
      }
    },
    [handleError]
  );

  const deleteRole = useCallback(
    async (id: string) => {
      try {
        setError(null);
        // await permissionService.deleteRole(id);
        setRoles(prev => prev.filter(r => r.id !== id));
      } catch (error) {
        handleError(error, 'excluir role');
        throw error;
      }
    },
    [handleError]
  );

  // ============================================================================
  // AÇÕES DE USER ROLES
  // ============================================================================

  const assignRoleToUser = useCallback(
    async (userId: string, roleId: string) => {
      try {
        setError(null);
        // const newUserRole = await permissionService.assignRoleToUser(userId, roleId);
        const newUserRole: UserRole = {
          id: '',
          user_id: userId,
          role_id: roleId,
          assigned_at: '',
        };
        setUserRoles(prev => [...prev, newUserRole]);
      } catch (error) {
        handleError(error, 'atribuir role ao usuário');
        throw error;
      }
    },
    [handleError]
  );

  const removeRoleFromUser = useCallback(
    async (userId: string, roleId: string) => {
      try {
        setError(null);
        // await permissionService.removeRoleFromUser(userId, roleId);
        setUserRoles(prev =>
          prev.filter(ur => !(ur.user_id === userId && ur.role_id === roleId))
        );
      } catch (error) {
        handleError(error, 'remover role do usuário');
        throw error;
      }
    },
    [handleError]
  );

  // ============================================================================
  // VERIFICAÇÃO DE PERMISSÕES
  // ============================================================================

  const checkPermission = useCallback(
    async (_resource: string, _action: string): Promise<PermissionCheck> => {
      if (!user?.id) {
        return { allowed: false, reason: 'Usuário não autenticado' };
      }

      try {
        // return await permissionService.checkPermission(user.id, resource, action);
        return { allowed: false, reason: 'Serviço não implementado' };
      } catch (error) {
        return {
          allowed: false,
          reason: `Erro ao verificar permissão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        };
      }
    },
    [user?.id]
  );

  const checkMultiplePermissions = useCallback(
    async (
      permissions: Array<{ resource: string; action: string }>
    ): Promise<Record<string, PermissionCheck>> => {
      if (!user?.id) {
        return permissions.reduce(
          (acc, permission) => {
            const key = `${permission.resource}:${permission.action}`;
            acc[key] = { allowed: false, reason: 'Usuário não autenticado' };
            return acc;
          },
          {} as Record<string, PermissionCheck>
        );
      }

      try {
        // return await permissionService.checkMultiplePermissions(user.id, permissions);
        return permissions.reduce(
          (acc, perm) => {
            acc[`${perm.resource}:${perm.action}`] = {
              allowed: false,
              reason: 'Serviço não implementado',
            };
            return acc;
          },
          {} as Record<string, PermissionCheck>
        );
      } catch (error) {
        return permissions.reduce(
          (acc, permission) => {
            const key = `${permission.resource}:${permission.action}`;
            acc[key] = {
              allowed: false,
              reason: `Erro ao verificar permissão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
            };
            return acc;
          },
          {} as Record<string, PermissionCheck>
        );
      }
    },
    [user?.id]
  );

  // ============================================================================
  // VERIFICAÇÕES SINCRONAS (BASEADAS NO ESTADO LOCAL)
  // ============================================================================

  const hasPermission = useCallback(
    (resource: string, action: string): boolean => {
      if (!user?.id) return false;

      return userRoles.some(
        userRole =>
          (userRole as any).role?.permissions?.some(
            (permission: any) =>
              permission.resource === resource && permission.action === action
          ) || false
      );
    },
    [user?.id, userRoles]
  );

  const hasAnyPermission = useCallback(
    (permissions: Array<{ resource: string; action: string }>): boolean => {
      if (!user?.id) return false;

      return permissions.some(permission =>
        hasPermission(permission.resource, permission.action)
      );
    },
    [user?.id, hasPermission]
  );

  const hasAllPermissions = useCallback(
    (permissions: Array<{ resource: string; action: string }>): boolean => {
      if (!user?.id) return false;

      return permissions.every(permission =>
        hasPermission(permission.resource, permission.action)
      );
    },
    [user?.id, hasPermission]
  );

  // ============================================================================
  // EFEITOS
  // ============================================================================

  useEffect(() => {
    if (user?.id) {
      refreshData();
    }
  }, [user?.id, refreshData]);

  // ============================================================================
  // RETORNO
  // ============================================================================

  return {
    // Estados
    permissions,
    roles,
    userRoles,
    loading,
    error,

    // Ações de permissões
    createPermission,
    updatePermission,
    deletePermission,

    // Ações de roles
    createRole,
    updateRole,
    deleteRole,

    // Ações de user roles
    assignRoleToUser,
    removeRoleFromUser,

    // Verificação de permissões
    checkPermission,
    checkMultiplePermissions,
    hasPermission,

    // Propriedades adicionais para compatibilidade
    hasAnyPermission,
    hasAllPermissions,

    // Utilitários
    refreshData,
    clearError,
  };
};
