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
import { useAuthStore, usePermissions } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { useNavigate, useLocation } from 'react-router-dom';
import MenuCardiaco from '@/components/MenuCardiaco';
import toast from 'react-hot-toast';

const Header: React.FC = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isCardiacMenuOpen, setIsCardiacMenuOpen] = useState(false);

  const { user, signOut } = useAuthStore();
  const permissions = usePermissions();
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
      '/app/dashboard': '🏥 Sistema de Clínica',
      '/app/agenda': '📅 Agenda',
      '/app/pacientes': '👥 Pacientes',
      '/app/profissionais': '👨‍⚕️ Profissionais',
      '/app/servicos': '🩺 Serviços',
      '/app/usuarios': '👤 Usuários',
      '/app/configuracoes': '⚙️ Configurações',
      '/app/permissions': '🔐 Permissões',
    };

    return titleMap[pathname] || '🏥 Sistema de Clínica';
  };

  const getPageDescription = (pathname: string) => {
    const descriptionMap: { [key: string]: string } = {
      '/app/dashboard':
        'Sistema de Gestão de Clínica - Controle total sobre pacientes, profissionais, serviços e agendamentos',
      '/app/agenda': 'Gerencie agendamentos, consultas e horários disponíveis',
      '/app/pacientes': 'Cadastro e gestão completa de pacientes',
      '/app/profissionais':
        'Administre profissionais de saúde e suas especialidades',
      '/app/servicos': 'Configure serviços médicos e procedimentos oferecidos',
      '/app/usuarios':
        'Controle de acesso e permissões dos usuários do sistema',
      '/app/configuracoes': 'Configurações gerais e personalização do sistema',
      '/app/permissions': 'Gerenciamento de permissões e níveis de acesso',
    };

    return (
      descriptionMap[pathname] ||
      'Sistema de Gestão de Clínica - Controle total sobre pacientes, profissionais, serviços e agendamentos'
    );
  };

  // Se não há usuário autenticado, não renderizar o header
  if (!user) {
    return null;
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 shadow-sm border-b px-6 py-3 z-30 transition-colors duration-300 ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      <div className='flex items-center justify-between'>
        {/* Botão Voltar - Só aparece em páginas internas */}
        {isInternalPage && (
          <button
            onClick={() => navigate('/app/dashboard')}
            className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
              isDark
                ? 'text-white hover:text-blue-100 hover:bg-blue-800'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <ArrowLeft size={20} />
            <span className='text-sm font-medium'>Voltar</span>
          </button>
        )}

        {/* Logo/Brand - Centralizado */}
        <div className='flex-1 flex justify-center'>
          <div className='text-center'>
            <h1
              className={`text-xl font-bold transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              {getPageTitle(location.pathname)}
            </h1>
            <p
              className={`text-sm transition-colors duration-300 ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              {getPageDescription(location.pathname)}
            </p>
          </div>
        </div>

        {/* Right Side */}
        <div className='flex items-center space-x-4'>
          {/* Menu Cardíaco Button */}
          <motion.button
            onClick={() => setIsCardiacMenuOpen(true)}
            className={`relative flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 group ${
              isDark
                ? 'text-red-400 hover:text-red-300 hover:bg-red-900/30'
                : 'text-red-500 hover:text-red-600 hover:bg-red-50'
            }`}
            title='Menu Cardíaco'
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
                ease: "easeInOut"
              }}
            >
              <Heart size={18} />
            </motion.div>
            <span className='text-sm font-medium'>Cardíaco</span>

            {/* Efeito de brilho no hover */}
            <motion.div
              className={`absolute inset-0 rounded-lg bg-gradient-to-r from-red-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              initial={false}
            />
          </motion.button>


          {/* Theme Toggle Button */}
          <motion.button
            onClick={toggleTheme}
            className={`relative p-2 rounded-lg transition-all duration-300 group ${
              isDark
                ? 'text-yellow-300 hover:text-yellow-200 hover:bg-yellow-900/30'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
            title={
              isDark ? 'Alternar para tema claro' : 'Alternar para tema escuro'
            }
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{
                rotate: isDark ? 0 : 180,
                scale: isDark ? 1 : 1.1,
              }}
              transition={{
                duration: 0.3,
                type: 'spring',
                stiffness: 200,
              }}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </motion.div>

            {/* Efeito de brilho no hover */}
            <motion.div
              className='absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300'
              initial={false}
            />
          </motion.button>

          {/* User Menu */}
          <div className='relative'>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <div className='w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center'>
                <User size={16} className='text-white' />
              </div>
              <div className='text-left'>
                <p
                  className={`text-sm font-medium transition-colors duration-300 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {user.user_metadata?.nome ||
                    user.email?.split('@')[0] ||
                    'Usuário'}
                </p>
                <div
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(permissions.userRole || '')}`}
                >
                  {getRoleName(permissions.userRole || '')}
                </div>
              </div>
              <ChevronDown
                size={16}
                className={`transition-colors duration-300 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}
              />
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div
                className={`absolute right-0 mt-2 w-56 rounded-lg shadow-lg border py-2 z-50 transition-colors duration-300 ${
                  isDark
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-200'
                }`}
              >
                {/* User Info */}
                <div className='px-4 py-3 border-b border-gray-700'>
                  <p className='text-sm font-medium text-white'>
                    {user.user_metadata?.nome ||
                      user.email?.split('@')[0] ||
                      'Usuário'}
                  </p>
                  <p className='text-sm text-gray-400'>{user.email}</p>
                  <div
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${getRoleBadgeColor(permissions.userRole || '')}`}
                  >
                    {getRoleName(permissions.userRole || '')}
                  </div>
                </div>

                {/* Menu Items */}
                <div className='py-1'>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/profile');
                    }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center transition-colors ${
                      isDark
                        ? 'text-white hover:bg-blue-800'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <User size={16} className='mr-3' />
                    Meu Perfil
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/change-password');
                    }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center transition-colors ${
                      isDark
                        ? 'text-white hover:bg-blue-800'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Settings size={16} className='mr-3' />
                    Alterar Senha
                  </button>
                </div>

                {/* Logout */}
                <div className='border-t border-gray-700 py-1'>
                  <button
                    onClick={handleLogout}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center transition-colors ${
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

      {/* Menu Cardíaco */}
      <MenuCardiaco 
        isOpen={isCardiacMenuOpen} 
        onClose={() => setIsCardiacMenuOpen(false)} 
      />
    </header>
  );
};

export default Header;
