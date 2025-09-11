// ============================================================================
// COMPONENTE DE GERENCIAMENTO DE ROLES
// ============================================================================

import React, { useState } from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { Role, Permission } from '../../types/permissions';
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
  
  const {
    roles,
    permissions,
    loading,
    error,
    createRole,
    updateRole,
    deleteRole,
    clearError,
  } = usePermissions();

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
      permissions: role.permissions.map(p => p.id),
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const roleData = {
        name: formData.name,
        description: formData.description,
        permissions: permissions.filter(p => formData.permissions.includes(p.id)),
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
    if (window.confirm(`Tem certeza que deseja excluir a role "${role.name}"?`)) {
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
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gerenciamento de Roles
        </h2>
        <div className="flex space-x-2">
          <Button
            onClick={() => setShowForm(true)}
            variant="primary"
            size="sm"
          >
            Nova Role
          </Button>
          {onClose && (
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
            >
              Fechar
            </Button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-red-800 dark:text-red-200">{error}</p>
            <button
              onClick={clearError}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editingRole ? 'Editar Role' : 'Nova Role'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nome
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Permissões
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md p-3">
                {permissions.map(permission => (
                  <label key={permission.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(permission.id)}
                      onChange={() => handlePermissionToggle(permission.id)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {permission.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex space-x-2">
              <Button type="submit" variant="primary">
                {editingRole ? 'Atualizar' : 'Criar'}
              </Button>
              <Button type="button" onClick={resetForm} variant="outline">
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Roles List */}
      <div className="space-y-4">
        {roles.map(role => (
          <div
            key={role.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {role.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {role.description}
                </p>
                <div className="mt-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {role.permissions.length} permissões
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleEdit(role)}
                  variant="outline"
                  size="sm"
                >
                  Editar
                </Button>
                <Button
                  onClick={() => handleDelete(role)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-800"
                >
                  Excluir
                </Button>
              </div>
            </div>
            
            {/* Permissions List */}
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Permissões:
              </h4>
              <div className="flex flex-wrap gap-2">
                {role.permissions.map(permission => (
                  <span
                    key={permission.id}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs"
                  >
                    {permission.name}
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
