// ============================================================================
// PÁGINA DE PERMISSÕES - Interface Avançada de Controle de Acesso
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Shield,
  Users,
  UserCheck,
  Clock,
  Settings,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Lock,
  Unlock,
  Key,
  Crown,
  Star,
  Zap,
  Activity,
  BarChart3,
  FileText,
  MessageCircle,
  Database,
  Bell,
  Calendar,
  Stethoscope,
} from 'lucide-react';
import {
  PermissionManager,
  RoleManager,
  UserRoleManager,
  PendingUsersManager,
} from '../../components/Permissions';
import { useThemeStore } from '../../stores/themeStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/design-system';
import { LoadingSpinner } from '@/components/LazyLoading/LazyWrapper';
import toast from 'react-hot-toast';

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
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRoles: 0,
    totalPermissions: 0,
    pendingUsers: 0,
  });
  const { isDark } = useThemeStore();

  // ============================================================================
  // EFEITOS
  // ============================================================================

  useEffect(() => {
    loadStats();
  }, []);

  // ============================================================================
  // FUNÇÕES
  // ============================================================================

  const loadStats = async () => {
    setLoading(true);
    try {
      // Simular carregamento de estatísticas
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStats({
        totalUsers: 24,
        totalRoles: 5,
        totalPermissions: 32,
        pendingUsers: 3,
      });
      toast.success('Estatísticas de permissões carregadas!');
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast.error('Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // FUNÇÕES AUXILIARES
  // ============================================================================

  const tabs = [
    {
      id: 'permissions' as TabType,
      label: 'Permissões',
      icon: Shield,
      description: 'Gerencie permissões do sistema',
      color: 'blue',
    },
    {
      id: 'roles' as TabType,
      label: 'Roles',
      icon: Users,
      description: 'Configure roles e grupos',
      color: 'green',
    },
    {
      id: 'user-roles' as TabType,
      label: 'Usuários',
      icon: UserCheck,
      description: 'Atribua roles aos usuários',
      color: 'purple',
    },
    {
      id: 'pending-users' as TabType,
      label: 'Pendentes',
      icon: Clock,
      description: 'Usuários aguardando aprovação',
      color: 'orange',
    },
  ];

  const getTabIcon = (tab: any) => {
    const IconComponent = tab.icon;
    return <IconComponent className='h-5 w-5' />;
  };

  const getTabColor = (color: string) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-100 dark:bg-blue-900',
      green: 'text-green-600 bg-green-100 dark:bg-green-900',
      purple: 'text-purple-600 bg-purple-100 dark:bg-purple-900',
      orange: 'text-orange-600 bg-orange-100 dark:bg-orange-900',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

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

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 p-6'>
      <Helmet>
        <title>Permissões - Sistema de Gestão de Clínica</title>
        <meta
          name='description'
          content='Sistema avançado de controle de acesso e permissões'
        />
      </Helmet>

      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900 dark:text-white flex items-center'>
                <Shield className='mr-3 !text-blue-600' size={32} style={{ color: '#2563eb !important' }} />
                Controle de Acesso
              </h1>
              <p className='text-gray-600 dark:text-gray-300 mt-2'>
                Sistema avançado de permissões e controle de acesso
              </p>
            </div>
            <div className='flex items-center space-x-4'>
              <button
                onClick={loadStats}
                className='flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors'
              >
                <RefreshCw className='mr-2' size={16} />
                Atualizar
              </button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <div className='p-3 bg-blue-100 dark:bg-blue-900 rounded-lg'>
                  <Users className='h-6 w-6 text-blue-600' />
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                    Total de Usuários
                  </p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {stats.totalUsers}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <div className='p-3 bg-green-100 dark:bg-green-900 rounded-lg'>
                  <Crown className='h-6 w-6 text-green-600' />
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                    Roles Ativos
                  </p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {stats.totalRoles}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <div className='p-3 bg-purple-100 dark:bg-purple-900 rounded-lg'>
                  <Key className='h-6 w-6 text-purple-600' />
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                    Permissões
                  </p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {stats.totalPermissions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <div className='p-3 bg-orange-100 dark:bg-orange-900 rounded-lg'>
                  <Clock className='h-6 w-6 text-orange-600' />
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                    Pendentes
                  </p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {stats.pendingUsers}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className='mb-8'>
          <div className='border-b border-gray-200 dark:border-gray-700'>
            <nav className='-mb-px flex space-x-8'>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <span className='mr-2'>{getTabIcon(tab)}</span>
                  {tab.label}
                  {tab.id === 'pending-users' && stats.pendingUsers > 0 && (
                    <span className='ml-2 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 py-0.5 px-2 rounded-full text-xs'>
                      {stats.pendingUsers}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700'>
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Permissions;
