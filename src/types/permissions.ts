// ============================================================================
// TIPOS DE PERMISSÕES
// ============================================================================

// ============================================================================
// PERMISSÕES
// ============================================================================

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// ROLES
// ============================================================================

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  created_at: string;
  updated_at: string;
}

// ============================================================================
// USER ROLES
// ============================================================================

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  role: Role;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// VERIFICAÇÃO DE PERMISSÕES
// ============================================================================

export interface PermissionCheck {
  hasPermission: boolean;
  reason?: string;
}

// ============================================================================
// RECURSOS E AÇÕES
// ============================================================================

export type Resource = 
  | 'patients'
  | 'schedule'
  | 'reports'
  | 'users'
  | 'settings'
  | 'backup'
  | 'notifications'
  | 'analytics'
  | 'gamification';

export type Action = 
  | 'read'
  | 'create'
  | 'update'
  | 'delete'
  | 'manage';

// ============================================================================
// PERMISSÕES PREDEFINIDAS
// ============================================================================

export const PREDEFINED_PERMISSIONS = {
  // Pacientes
  PATIENTS_READ: { resource: 'patients' as Resource, action: 'read' as Action },
  PATIENTS_CREATE: { resource: 'patients' as Resource, action: 'create' as Action },
  PATIENTS_UPDATE: { resource: 'patients' as Resource, action: 'update' as Action },
  PATIENTS_DELETE: { resource: 'patients' as Resource, action: 'delete' as Action },
  PATIENTS_MANAGE: { resource: 'patients' as Resource, action: 'manage' as Action },
  
  // Agenda
  SCHEDULE_READ: { resource: 'schedule' as Resource, action: 'read' as Action },
  SCHEDULE_CREATE: { resource: 'schedule' as Resource, action: 'create' as Action },
  SCHEDULE_UPDATE: { resource: 'schedule' as Resource, action: 'update' as Action },
  SCHEDULE_DELETE: { resource: 'schedule' as Resource, action: 'delete' as Action },
  SCHEDULE_MANAGE: { resource: 'schedule' as Resource, action: 'manage' as Action },
  
  // Relatórios
  REPORTS_READ: { resource: 'reports' as Resource, action: 'read' as Action },
  REPORTS_CREATE: { resource: 'reports' as Resource, action: 'create' as Action },
  REPORTS_UPDATE: { resource: 'reports' as Resource, action: 'update' as Action },
  REPORTS_DELETE: { resource: 'reports' as Resource, action: 'delete' as Action },
  REPORTS_MANAGE: { resource: 'reports' as Resource, action: 'manage' as Action },
  
  // Usuários
  USERS_READ: { resource: 'users' as Resource, action: 'read' as Action },
  USERS_CREATE: { resource: 'users' as Resource, action: 'create' as Action },
  USERS_UPDATE: { resource: 'users' as Resource, action: 'update' as Action },
  USERS_DELETE: { resource: 'users' as Resource, action: 'delete' as Action },
  USERS_MANAGE: { resource: 'users' as Resource, action: 'manage' as Action },
  
  // Configurações
  SETTINGS_READ: { resource: 'settings' as Resource, action: 'read' as Action },
  SETTINGS_UPDATE: { resource: 'settings' as Resource, action: 'update' as Action },
  SETTINGS_MANAGE: { resource: 'settings' as Resource, action: 'manage' as Action },
  
  // Backup
  BACKUP_READ: { resource: 'backup' as Resource, action: 'read' as Action },
  BACKUP_CREATE: { resource: 'backup' as Resource, action: 'create' as Action },
  BACKUP_MANAGE: { resource: 'backup' as Resource, action: 'manage' as Action },
  
  // Notificações
  NOTIFICATIONS_READ: { resource: 'notifications' as Resource, action: 'read' as Action },
  NOTIFICATIONS_CREATE: { resource: 'notifications' as Resource, action: 'create' as Action },
  NOTIFICATIONS_UPDATE: { resource: 'notifications' as Resource, action: 'update' as Action },
  NOTIFICATIONS_DELETE: { resource: 'notifications' as Resource, action: 'delete' as Action },
  NOTIFICATIONS_MANAGE: { resource: 'notifications' as Resource, action: 'manage' as Action },
  
  // Analytics
  ANALYTICS_READ: { resource: 'analytics' as Resource, action: 'read' as Action },
  ANALYTICS_MANAGE: { resource: 'analytics' as Resource, action: 'manage' as Action },
  
  // Gamificação
  GAMIFICATION_READ: { resource: 'gamification' as Resource, action: 'read' as Action },
  GAMIFICATION_MANAGE: { resource: 'gamification' as Resource, action: 'manage' as Action },
} as const;

// ============================================================================
// ROLES PREDEFINIDOS
// ============================================================================

export const PREDEFINED_ROLES = {
  ADMIN: 'Administrador',
  DOCTOR: 'Médico',
  RECEPTIONIST: 'Recepcionista',
  NURSE: 'Enfermeiro',
  ANALYST: 'Analista',
  VIEWER: 'Visualizador',
} as const;

// ============================================================================
// TIPOS DE UTILIDADE
// ============================================================================

export type PredefinedPermission = typeof PREDEFINED_PERMISSIONS[keyof typeof PREDEFINED_PERMISSIONS];
export type PredefinedRole = typeof PREDEFINED_ROLES[keyof typeof PREDEFINED_ROLES];
