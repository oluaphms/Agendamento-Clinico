// ============================================================================
// EXPORTAÇÕES DO MÓDULO PERMISSIONS
// ============================================================================

export { default as PermissionManager } from './PermissionManager';
export { PermissionGuard, AdminOnly, DoctorOnly, ReceptionistOnly, ReadOnly, WriteOnly, ManageOnly } from './PermissionGuard';
export { RoleManager } from './RoleManager';
export { UserRoleManager } from './UserRoleManager';
export { PendingUsersManager } from './PendingUsersManager';
export { AuditLogManager } from './AuditLogManager';
