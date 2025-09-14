// ============================================================================
// COMPONENTE: MenuCardiaco - Menu Horizontal com Linha ECG Progressiva
// ============================================================================
// Este componente renderiza um menu inovador com linha ECG que surge da esquerda
// para direita, liberando botões conforme a linha avança com animação suave.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar, // Ícone para Agenda
  User, // Ícone para Pacientes
  BarChart3, // Ícone para Analytics
  FileText, // Ícone para Relatórios
  Bell, // Ícone para Notificações
  Users, // Ícone para Usuários
  Shield, // Ícone para Permissões
  Settings, // Ícone para Configurações
  Stethoscope, // Ícone para Profissional
  X, // Ícone para fechar o menu
  Heart, // Ícone para o botão do menu
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

interface MenuItem {
  icon: React.ComponentType<any>;
  label: string;
  path: string;
  roles: string[];
  position: {
    x: number; // Posição horizontal na linha (0-500)
    y: number; // Posição vertical na linha (0-100)
  };
}

interface MenuCardiacoProps {
  isOpen?: boolean;
  onClose?: () => void;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function MenuCardiaco({
  isOpen = false,
  onClose,
}: MenuCardiacoProps) {
  const [ecgProgress, setEcgProgress] = useState(0); // Progresso da animação ECG
  const [showIcons, setShowIcons] = useState(false); // Controla quando os ícones aparecem
  const animationStartedRef = React.useRef(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  // Define o path da linha ECG igual ao da página de apresentação
  const pathD = `M0,50 L40,50 L60,20 L80,80 L120,50 L180,50 L200,30 L220,70 L240,50 L500,50`;

  // Itens do menu - 4 acima e 5 abaixo com espaçamento para monitor central
  const menuItems: MenuItem[] = [
    // 4 ÍCONES ACIMA - Linha superior
    {
      icon: Calendar,
      label: 'Agenda',
      path: '/app/agenda',
      roles: ['admin', 'gerente', 'recepcao', 'profissional', 'usuario'],
      position: { x: 100, y: 20 }, // Acima do monitor
    },
    {
      icon: User,
      label: 'Pacientes',
      path: '/app/pacientes',
      roles: ['admin', 'gerente', 'recepcao', 'profissional', 'usuario'],
      position: { x: 200, y: 20 }, // Acima do monitor
    },
    {
      icon: BarChart3,
      label: 'Analytics',
      path: '/app/analytics',
      roles: ['admin', 'gerente', 'recepcao', 'profissional', 'usuario'],
      position: { x: 300, y: 20 }, // Acima do monitor
    },
    {
      icon: Bell,
      label: 'Notificações',
      path: '/app/notificacoes',
      roles: ['admin', 'gerente', 'recepcao', 'profissional', 'usuario'],
      position: { x: 400, y: 20 }, // Acima do monitor
    },
    // 5 ÍCONES ABAIXO - Linha inferior
    {
      icon: FileText,
      label: 'Relatórios',
      path: '/app/relatorios',
      roles: ['admin', 'gerente', 'recepcao', 'profissional', 'usuario'],
      position: { x: 80, y: 80 }, // Abaixo do monitor
    },
    {
      icon: Users,
      label: 'Usuários',
      path: '/app/usuarios',
      roles: ['admin', 'gerente', 'recepcao', 'profissional', 'usuario'],
      position: { x: 180, y: 80 }, // Abaixo do monitor
    },
    {
      icon: Shield,
      label: 'Permissões',
      path: '/app/permissions',
      roles: ['admin', 'gerente', 'recepcao', 'profissional', 'usuario'],
      position: { x: 280, y: 80 }, // Abaixo do monitor
    },
    {
      icon: Settings,
      label: 'Configurações',
      path: '/app/configuracoes',
      roles: ['admin', 'gerente', 'recepcao', 'profissional', 'usuario'],
      position: { x: 380, y: 80 }, // Abaixo do monitor
    },
    {
      icon: Stethoscope,
      label: 'Profissional',
      path: '/app/profissionais',
      roles: ['admin', 'gerente', 'recepcao', 'profissional', 'usuario'],
      position: { x: 450, y: 80 }, // Abaixo do monitor
    },
  ];

  // Efeito para controlar a animação da linha ECG repetitiva
  useEffect(() => {
    if (isOpen && !animationStartedRef.current) {
      animationStartedRef.current = true;
      setShowIcons(true); // Mostra ícones imediatamente
      setEcgProgress(0);

      let frame: number;
      let animationCycle = 0;

      const animate = () => {
        setEcgProgress(p => {
          if (p >= 1) {
            // Quando completa, reinicia após 1 segundo
            setTimeout(() => {
              animationCycle++;
              setEcgProgress(0);
            }, 1000);
            return 1;
          }
          return p + 0.008; // Animação mais rápida para repetição
        });
        frame = requestAnimationFrame(animate);
      };
      animate();

      return () => {
        cancelAnimationFrame(frame);
      };
    } else if (!isOpen) {
      // Reset ao fechar
      animationStartedRef.current = false;
      setEcgProgress(0);
      setShowIcons(false);
    }
  }, [isOpen]);

  const handleNavigation = (path: string, requiredRoles: string[]) => {
    console.log('🔄 MenuCardiaco - Navegando para:', path);
    console.log('👤 Usuário atual:', user?.email);
    console.log('🎯 User role:', user?.user_metadata?.nivel_acesso);

    // Navegar para a página (acesso liberado para todos os usuários)
    navigate(path);
    onClose?.();
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleClose = () => {
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className='fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center'
      style={{ zIndex: 9999 }}
    >
      {/* Container Principal - Centralizado */}
      <div className='relative flex flex-col items-center justify-center min-h-screen w-full px-4'>
        {/* Título do Menu com Botão Fechar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className='mb-8 relative'
        >
          <div className='flex items-center justify-center gap-4'>
            <motion.h2
              className='text-3xl md:text-4xl font-bold text-white text-center flex items-center justify-center gap-3'
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <Heart size={32} className='text-blue-400 animate-pulse' />
              Menu Cardíaco
            </motion.h2>

            {/* Botão Fechar ao lado do título */}
            <motion.button
              onClick={handleClose}
              className='p-2 rounded-full bg-red-500/20 hover:bg-red-500/30 transition-colors group'
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <X size={20} className='text-red-400 group-hover:text-red-300' />
            </motion.button>
          </div>

          <motion.p
            className='text-center text-white/70 text-base md:text-lg mt-2'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Sistema de Gestão Médica
          </motion.p>
        </motion.div>

        {/* Container Principal com Layout Fixo */}
        <div className='relative w-[95vw] max-w-7xl h-[300px] flex flex-col items-center justify-between'>
          {/* Linha Superior - 4 Ícones */}
          <div className='flex items-center justify-center gap-16 mb-8'>
            {menuItems.slice(0, 4).map(item => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={
                    showIcons
                      ? { opacity: 1, scale: 1 }
                      : { opacity: 0, scale: 0.5 }
                  }
                  transition={{
                    duration: 0.6,
                    type: 'spring',
                    stiffness: 200,
                    damping: 20,
                  }}
                  className='flex flex-col items-center cursor-pointer group'
                  onClick={() => handleNavigation(item.path, item.roles)}
                >
                  <motion.div
                    className={`
                      bg-black/80 p-3 rounded-full transition-all duration-300 border-2
                      ${
                        isActive(item.path)
                          ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-blue-300 shadow-lg shadow-blue-500/40'
                          : 'border-white/30 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-400/40 hover:bg-black/90'
                      }
                    `}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon
                      className={`
                        text-white transition-all duration-300
                        ${
                          isActive(item.path)
                            ? 'text-white drop-shadow-lg'
                            : 'text-blue-300 group-hover:text-blue-200 group-hover:drop-shadow-[0_0_8px_rgba(0,224,255,0.6)]'
                        }
                      `}
                      size={20}
                    />
                  </motion.div>
                  <span className='text-white text-xs mt-1 font-medium drop-shadow-lg'>
                    {item.label}
                  </span>
                  {isActive(item.path) && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className='absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full shadow-lg'
                    />
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Monitor Cardíaco Central */}
          <div className='relative w-full h-[100px] flex items-center justify-center'>
            <svg viewBox='0 0 500 100' className='w-full h-full'>
              <defs>
                <filter
                  id='ecgGlow'
                  x='-50%'
                  y='-50%'
                  width='200%'
                  height='200%'
                >
                  <feGaussianBlur stdDeviation='3' result='blur' />
                  <feMerge>
                    <feMergeNode in='blur' />
                    <feMergeNode in='SourceGraphic' />
                    <feMergeNode in='blur' />
                  </feMerge>
                </filter>
              </defs>

              <motion.path
                d={pathD}
                fill='none'
                stroke='#0066ff'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                filter='url(#ecgGlow)'
                initial={{ pathLength: 0 }}
                animate={{ pathLength: ecgProgress }}
                transition={{ duration: 0, ease: 'linear' }}
              />
            </svg>
          </div>

          {/* Linha Inferior - 5 Ícones */}
          <div className='flex items-center justify-center gap-12 mt-8'>
            {menuItems.slice(4, 9).map(item => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={
                    showIcons
                      ? { opacity: 1, scale: 1 }
                      : { opacity: 0, scale: 0.5 }
                  }
                  transition={{
                    duration: 0.6,
                    type: 'spring',
                    stiffness: 200,
                    damping: 20,
                  }}
                  className='flex flex-col items-center cursor-pointer group'
                  onClick={() => handleNavigation(item.path, item.roles)}
                >
                  <motion.div
                    className={`
                      bg-black/80 p-3 rounded-full transition-all duration-300 border-2
                      ${
                        isActive(item.path)
                          ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-blue-300 shadow-lg shadow-blue-500/40'
                          : 'border-white/30 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-400/40 hover:bg-black/90'
                      }
                    `}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon
                      className={`
                        text-white transition-all duration-300
                        ${
                          isActive(item.path)
                            ? 'text-white drop-shadow-lg'
                            : 'text-blue-300 group-hover:text-blue-200 group-hover:drop-shadow-[0_0_8px_rgba(0,224,255,0.6)]'
                        }
                      `}
                      size={20}
                    />
                  </motion.div>
                  <span className='text-white text-xs mt-1 font-medium drop-shadow-lg'>
                    {item.label}
                  </span>
                  {isActive(item.path) && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className='absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full shadow-lg'
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
