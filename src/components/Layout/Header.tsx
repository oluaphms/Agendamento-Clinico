import React, { useState } from 'react';
import {
  User,
  LogOut,
  Settings,
  ChevronDown,
  ArrowLeft,
  Sun,
  Moon,
  Heart,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { SideDrawer } from '@/components/MenuCardiaco';
import toast from 'react-hot-toast';

const Header: React.FC = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isCardiacMenuOpen, setIsCardiacMenuOpen] = useState(false);

  const { user, signOut } = useAuthStore();
  // const permissions = usePermissions();
  const { isDark, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erro no logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  const getRoleName = (role: string) => {
    const roles = {
      admin: 'Administrador',
      recepcao: 'Recepcionista',
      profissional: 'Profissional de Saúde',
      gerente: 'Gerente',
      usuario: 'Usuário',
    };
    return roles[role as keyof typeof roles] || role;
  };

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      admin: isDark ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800',
      recepcao: isDark
        ? 'bg-blue-900 text-blue-200'
        : 'bg-blue-100 text-blue-800',
      profissional: isDark
        ? 'bg-green-900 text-green-200'
        : 'bg-green-100 text-green-800',
      gerente: isDark
        ? 'bg-purple-900 text-purple-200'
        : 'bg-purple-100 text-purple-800',
      usuario: isDark
        ? 'bg-gray-700 text-gray-200'
        : 'bg-gray-100 text-gray-800',
    };
    return (
      colors[role as keyof typeof colors] ||
      (isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800')
    );
  };

  // Verificar se é uma página interna (não é dashboard)
  const isInternalPage = ![
    '/',
    '/dashboard',
    '/login',
    '/app/dashboard',
  ].includes(location.pathname);

  // Mapeamento de títulos das páginas
  const getPageTitle = (pathname: string) => {
    const titleMap: { [key: string]: string } = {
      '/app/dashboard': 'Dashboard',
      '/app/agenda': 'Agenda',
      '/app/pacientes': 'Pacientes',
      '/app/profissionais': 'Profissionais',
      '/app/servicos': 'Serviços',
      '/app/convenio-servicos': 'Convênio/Serviços',
      '/app/usuarios': 'Usuários',
      '/app/configuracoes': 'Configurações',
      '/app/permissions': 'Permissões',
      '/app/relatorios': 'Relatórios',
      '/app/notificacoes': 'Notificações',
      '/app/analytics': 'Analytics',
      '/app/whatsapp': 'WhatsApp',
      '/app/backup': 'Backup',
    };

    return titleMap[pathname] || 'Dashboard';
  };

  const getPageIcon = (pathname: string) => {
    const iconMap: { [key: string]: string } = {
      '/app/dashboard': '📊',
      '/app/agenda': '📅',
      '/app/pacientes': '👥',
      '/app/profissionais': '👨‍⚕️',
      '/app/servicos': '🩺',
      '/app/convenio-servicos': '📋',
      '/app/usuarios': '👤',
      '/app/configuracoes': '⚙️',
      '/app/permissions': '🔐',
      '/app/relatorios': '📋',
      '/app/notificacoes': '🔔',
      '/app/whatsapp': '💬',
      '/app/backup': '💾',
    };

    return iconMap[pathname] || '📊';
  };

  const getPageDescription = (pathname: string) => {
    const descriptionMap: { [key: string]: string } = {
      '/app/dashboard': 'Visão geral e métricas importantes da clínica',
      '/app/agenda': 'Gerencie agendamentos, consultas e horários disponíveis',
      '/app/pacientes': 'Cadastro e gestão completa de pacientes',
      '/app/profissionais':
        'Administre profissionais de saúde e suas especialidades',
      '/app/servicos': 'Configure serviços médicos e procedimentos oferecidos',
      '/app/convenio-servicos': 'Gerencie convênios e serviços da clínica',
      '/app/usuarios':
        'Controle de acesso e permissões dos usuários do sistema',
      '/app/configuracoes': 'Configurações gerais e personalização do sistema',
      '/app/permissions': 'Gerenciamento de permissões e níveis de acesso',
      '/app/relatorios': 'Gere e exporte relatórios em múltiplos formatos',
      '/app/notificacoes': 'Central de notificações e alertas do sistema',
      '/app/whatsapp': 'Integração e comunicação via WhatsApp',
      '/app/backup': 'Backup e restauração de dados do sistema',
    };

    return (
      descriptionMap[pathname] ||
      'Visão geral e métricas importantes da clínica'
    );
  };

  // Se não há usuário autenticado, não renderizar o header
  if (!user) {
    return null;
  }

  return (
    <header
      className='fixed top-0 left-0 right-0 shadow-lg z-30 transition-colors duration-300'
      style={{ backgroundColor: '#2196F3' }}
    >
      <div className='px-4 sm:px-6 py-4 sm:py-6'>
        <div className='flex items-center justify-between'>
          {/* Botão Voltar - Só aparece em páginas internas */}
          {isInternalPage && (
            <button
              onClick={() => navigate('/app/dashboard')}
              className='flex items-center space-x-1 sm:space-x-2 p-2 sm:p-3 rounded-lg transition-colors text-white hover:text-blue-100 hover:bg-blue-600'
            >
              <ArrowLeft size={16} />
              <span className='text-xs sm:text-sm font-medium hidden sm:inline'>
                Voltar
              </span>
            </button>
          )}

          {/* Cabeçalho Principal - Centralizado */}
          <div className='flex-1 flex justify-center items-center'>
            <div className='text-center max-w-md mx-auto'>
              <div className='flex items-center justify-center space-x-3 mb-1'>
                <span className='text-2xl sm:text-3xl'>
                  {getPageIcon(location.pathname)}
                </span>
                <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold text-white truncate'>
                  {getPageTitle(location.pathname)}
                </h1>
              </div>
              <p className='text-xs sm:text-sm text-blue-100 font-medium leading-tight px-2'>
                {getPageDescription(location.pathname)}
              </p>
            </div>
          </div>

          {/* Right Side */}
          <div className='flex items-center space-x-2 sm:space-x-4'>
            {/* Menu Button */}
            <motion.button
              onClick={() => setIsCardiacMenuOpen(true)}
              className={`relative flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg transition-all duration-300 group ${
                isDark
                  ? 'text-red-400 hover:text-red-300 hover:bg-red-900/30'
                  : 'text-red-500 hover:text-red-600 hover:bg-red-50'
              }`}
              title='Menu'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Heart size={16} />
              </motion.div>
              <span className='text-xs sm:text-sm font-medium hidden sm:inline'>
                Menu
              </span>
            </motion.button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? 'text-yellow-400 hover:bg-yellow-900/20'
                  : 'text-yellow-600 hover:bg-yellow-50'
              }`}
              title={isDark ? 'Modo claro' : 'Modo escuro'}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* User Menu */}
            <div className='relative'>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  isDark
                    ? 'text-white hover:bg-blue-800/50'
                    : 'text-white hover:bg-blue-600/80'
                }`}
              >
                <div className='w-8 h-8 rounded-full bg-white/20 flex items-center justify-center'>
                  <User size={16} />
                </div>
                <div className='hidden sm:block text-left'>
                  <p className='text-sm font-medium'>
                    {user.user_metadata?.nome || 'Usuário'}
                  </p>
                  <p className='text-xs opacity-75'>
                    {getRoleName(user.user_metadata?.nivel_acesso || 'usuario')}
                  </p>
                </div>
                <ChevronDown size={16} />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className='absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50'>
                  <div className='p-4 border-b border-gray-200 dark:border-gray-700'>
                    <div className='flex items-center space-x-3'>
                      <div className='w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center'>
                        <User
                          size={20}
                          className='text-blue-600 dark:text-blue-300'
                        />
                      </div>
                      <div>
                        <p className='font-medium text-gray-900 dark:text-white'>
                          {user.user_metadata?.nome || 'Usuário'}
                        </p>
                        <p className='text-sm text-gray-500 dark:text-gray-400'>
                          {user.email}
                        </p>
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${getRoleBadgeColor(
                            user.user_metadata?.nivel_acesso || 'usuario'
                          )}`}
                        >
                          {getRoleName(
                            user.user_metadata?.nivel_acesso || 'usuario'
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className='p-2'>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/app/configuracoes');
                      }}
                      className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                        isDark
                          ? 'text-gray-300 hover:bg-gray-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Settings size={16} className='mr-3' />
                      Configurações
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleLogout();
                      }}
                      className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                        isDark
                          ? 'text-red-400 hover:bg-red-900/20'
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <LogOut size={16} className='mr-3' />
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Menu Lateral */}
      <SideDrawer
        isOpen={isCardiacMenuOpen}
        onClose={() => setIsCardiacMenuOpen(false)}
      />
    </header>
  );
};

export default Header;
