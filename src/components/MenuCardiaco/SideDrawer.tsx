// ============================================================================
// COMPONENTE: SideDrawer - Menu Lateral Deslizante
// ============================================================================
// Menu lateral que desliza da esquerda da tela com overlay semitransparente.
// Substitui o MenuCardiaco modal por um drawer mais moderno e responsivo.
// ============================================================================

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, // Ícone para Agenda
  User, // Ícone para Pacientes
  FileText, // Ícone para Relatórios
  Bell, // Ícone para Notificações
  Users, // Ícone para Usuários
  Shield, // Ícone para Permissões
  Settings, // Ícone para Configurações
  Stethoscope, // Ícone para Profissional
  X, // Ícone para fechar o menu
  Heart, // Ícone para o botão do menu
  ClipboardList, // Ícone para Convênio/Serviços
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useThemeStore } from '../../stores/themeStore';

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

interface MenuItem {
  icon: React.ComponentType<any>;
  label: string;
  path: string;
  roles: string[];
  description?: string;
}

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function SideDrawer({ isOpen, onClose }: SideDrawerProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { isDark } = useThemeStore();

  // Itens do menu - mantendo a mesma estrutura do MenuCardiaco
  const menuItems: MenuItem[] = [
    {
      icon: Calendar,
      label: 'Agenda',
      path: '/app/agenda',
      roles: ['admin', 'gerente', 'recepcao', 'profissional', 'usuario'],
      description: 'Gerencie seus agendamentos',
    },
    {
      icon: User,
      label: 'Pacientes',
      path: '/app/pacientes',
      roles: ['admin', 'gerente', 'recepcao', 'profissional', 'usuario'],
      description: 'Cadastro e histórico de pacientes',
    },
    {
      icon: Bell,
      label: 'Notificações',
      path: '/app/notificacoes',
      roles: ['admin', 'gerente', 'recepcao', 'profissional', 'usuario'],
      description: 'Central de notificações',
    },
    {
      icon: FileText,
      label: 'Relatórios',
      path: '/app/relatorios',
      roles: ['admin', 'gerente', 'recepcao', 'profissional', 'usuario'],
      description: 'Relatórios e estatísticas',
    },
    {
      icon: Users,
      label: 'Usuários',
      path: '/app/usuarios',
      roles: ['admin', 'gerente', 'recepcao', 'profissional', 'usuario'],
      description: 'Gerenciar usuários do sistema',
    },
    {
      icon: Shield,
      label: 'Permissões',
      path: '/app/permissions',
      roles: ['admin', 'gerente', 'recepcao', 'profissional', 'usuario'],
      description: 'Controle de acesso e permissões',
    },
    {
      icon: Settings,
      label: 'Configurações',
      path: '/app/configuracoes',
      roles: ['admin', 'gerente', 'recepcao', 'profissional', 'usuario'],
      description: 'Configurações do sistema',
    },
    {
      icon: Stethoscope,
      label: 'Profissional',
      path: '/app/profissionais',
      roles: ['admin', 'gerente', 'recepcao', 'profissional', 'usuario'],
      description: 'Cadastro de profissionais',
    },
    {
      icon: ClipboardList,
      label: 'Convênio/Serviços',
      path: '/app/convenio-servicos',
      roles: ['admin', 'gerente', 'recepcao', 'profissional', 'usuario'],
      description: 'Cadastro de convênios e serviços',
    },
  ];

  // Fechar menu com ESC
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevenir scroll do body quando menu estiver aberto
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleNavigation = (path: string, _requiredRoles: string[]) => {
    console.log('🔄 SideDrawer - Navegando para:', path);
    console.log('👤 Usuário atual:', user?.email);
    console.log('🎯 User role:', user?.user_metadata?.nivel_acesso);

    // Navegar para a página (acesso liberado para todos os usuários)
    navigate(path);
    onClose();
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className='fixed inset-0 bg-black/50 backdrop-blur-sm z-40'
            onClick={handleOverlayClick}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
              duration: 0.3,
            }}
            className={`fixed left-0 top-0 h-full w-80 max-w-[85vw] z-50 shadow-2xl flex flex-col ${
              isDark
                ? 'bg-gray-900 border-r border-gray-700'
                : 'bg-white border-r border-gray-200'
            }`}
          >
            {/* Header do Drawer */}
            <div
              className={`flex items-center justify-between p-6 border-b ${
                isDark ? 'border-gray-700' : 'border-gray-200'
              }`}
            >
              <div className='flex items-center space-x-3'>
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
                  <Heart
                    size={24}
                    className={`${isDark ? 'text-blue-400' : 'text-blue-600'}`}
                  />
                </motion.div>
                <div>
                  <h2
                    className={`text-xl font-bold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    Menu
                  </h2>
                  <p
                    className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    Sistema de Gestão Médica
                  </p>
                </div>
              </div>

              {/* Botão Fechar */}
              <motion.button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  isDark
                    ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* Lista de Itens do Menu */}
            <div className='flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800 hover:scrollbar-thumb-gray-500 dark:hover:scrollbar-thumb-gray-500'>
              <nav className='space-y-1 px-4'>
                {menuItems.map((item, index) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);

                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: index * 0.05,
                        duration: 0.3,
                      }}
                    >
                      <button
                        onClick={() => handleNavigation(item.path, item.roles)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                          active
                            ? isDark
                              ? 'bg-blue-600 text-white shadow-lg'
                              : 'bg-blue-100 text-blue-700 shadow-md'
                            : isDark
                              ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                      >
                        <div
                          className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
                            active
                              ? isDark
                                ? 'bg-blue-500'
                                : 'bg-blue-200'
                              : isDark
                                ? 'bg-gray-700 group-hover:bg-gray-600'
                                : 'bg-gray-100 group-hover:bg-gray-200'
                          }`}
                        >
                          <Icon
                            size={20}
                            className={`transition-colors ${
                              active
                                ? 'text-white'
                                : isDark
                                  ? 'text-gray-400 group-hover:text-white'
                                  : 'text-gray-500 group-hover:text-gray-700'
                            }`}
                          />
                        </div>

                        <div className='flex-1 text-left'>
                          <div
                            className={`font-medium ${
                              active
                                ? 'text-white'
                                : isDark
                                  ? 'text-gray-200 group-hover:text-white'
                                  : 'text-gray-900 group-hover:text-gray-900'
                            }`}
                          >
                            {item.label}
                          </div>
                          {item.description && (
                            <div
                              className={`text-sm ${
                                active
                                  ? 'text-blue-100'
                                  : isDark
                                    ? 'text-gray-400 group-hover:text-gray-300'
                                    : 'text-gray-500 group-hover:text-gray-600'
                              }`}
                            >
                              {item.description}
                            </div>
                          )}
                        </div>

                        {/* Indicador de página ativa */}
                        {active && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`w-2 h-2 rounded-full ${
                              isDark ? 'bg-white' : 'bg-blue-600'
                            }`}
                          />
                        )}
                      </button>
                    </motion.div>
                  );
                })}
              </nav>
            </div>

            {/* Footer do Drawer */}
            <div
              className={`p-4 border-t ${
                isDark ? 'border-gray-700' : 'border-gray-200'
              }`}
            >
              <div
                className={`text-center text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                <p>Sistema de Gestão de Clínica</p>
                <p className='mt-1'>Versão 1.0.0</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
