// ============================================================================
// COMPONENTE DE PROTEÇÃO POR PERMISSÃO
// ============================================================================

import React, { ReactNode } from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { Resource, Action } from '../../types/permissions';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

interface PermissionGuardProps {
  children: ReactNode;
  resource: Resource;
  action: Action;
  fallback?: ReactNode;
  requireAll?: boolean;
  permissions?: Array<{ resource: Resource; action: Action }>;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  resource,
  action,
  fallback = null,
  requireAll = false,
  permissions,
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } =
    usePermissions();

  // ============================================================================
  // VERIFICAÇÃO DE PERMISSÕES
  // ============================================================================

  const checkPermission = () => {
    // Se foram fornecidas permissões específicas
    if (permissions && permissions.length > 0) {
      if (requireAll) {
        return hasAllPermissions(permissions);
      } else {
        return hasAnyPermission(permissions);
      }
    }

    // Verificação de permissão única
    return hasPermission(resource, action);
  };

  // ============================================================================
  // RENDERIZAÇÃO
  // ============================================================================

  const hasAccess = checkPermission();

  if (hasAccess) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

// ============================================================================
// COMPONENTES DE CONVENIÊNCIA
// ============================================================================

export const AdminOnly: React.FC<{
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ children, fallback = null }) => (
  <PermissionGuard resource='users' action='manage' fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const DoctorOnly: React.FC<{
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ children, fallback = null }) => (
  <PermissionGuard resource='patients' action='manage' fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const ReceptionistOnly: React.FC<{
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ children, fallback = null }) => (
  <PermissionGuard resource='schedule' action='manage' fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const ReadOnly: React.FC<{
  children: ReactNode;
  resource: Resource;
  fallback?: ReactNode;
}> = ({ children, resource, fallback = null }) => (
  <PermissionGuard resource={resource} action='read' fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const WriteOnly: React.FC<{
  children: ReactNode;
  resource: Resource;
  fallback?: ReactNode;
}> = ({ children, resource, fallback = null }) => (
  <PermissionGuard resource={resource} action='create' fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const ManageOnly: React.FC<{
  children: ReactNode;
  resource: Resource;
  fallback?: ReactNode;
}> = ({ children, resource, fallback = null }) => (
  <PermissionGuard resource={resource} action='manage' fallback={fallback}>
    {children}
  </PermissionGuard>
);
