// ============================================================================
// PÁGINA DE PERMISSÕES
// ============================================================================

import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { PermissionManager, RoleManager, UserRoleManager, PendingUsersManager } from '../../components/Permissions';
import { useThemeStore } from '../../stores/themeStore';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

type TabType = 'permissions' | 'roles' | 'user-roles' | 'pending-users';

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export const Permissions: React.FC = () => {
  // ============================================================================
  // ESTADOS E HOOKS
  // ============================================================================
  
  const [activeTab, setActiveTab] = useState<TabType>('permissions');
  const { isDark } = useThemeStore();

  // ============================================================================
  // FUNÇÕES AUXILIARES
  // ============================================================================
  
  const tabs = [
    { id: 'permissions' as TabType, label: 'Permissões', icon: '🔐' },
    { id: 'roles' as TabType, label: 'Roles', icon: '👥' },
    { id: 'user-roles' as TabType, label: 'Roles de Usuário', icon: '👤' },
    { id: 'pending-users' as TabType, label: 'Usuários Pendentes', icon: '⏳' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'permissions':
        return <PermissionManager />;
      case 'roles':
        return <RoleManager />;
      case 'user-roles':
        return <UserRoleManager />;
      case 'pending-users':
        return <PendingUsersManager />;
      default:
        return <PermissionManager />;
    }
  };

  // ============================================================================
  // RENDERIZAÇÃO
  // ============================================================================
  
  return (
    <>
      <Helmet>
        <title>Permissões - Sistema de Gestão de Clínica</title>
        <meta name="description" content="Gerencie permissões, roles e atribuições de usuários do sistema" />
      </Helmet>
      
      <div className={`min-h-screen transition-colors duration-300 ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Sistema de Permissões
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie permissões, roles e atribuições de usuários do sistema
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
        </div>
      </div>
    </>
  );
};

export default Permissions;
