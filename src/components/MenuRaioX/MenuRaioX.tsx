// ============================================================================
// COMPONENTE: MenuRaioX - Menu Lateral de Navegação
// ============================================================================
// Este componente renderiza o menu lateral de navegação do sistema clínico
// com design temático de "raio-X" e animações suaves.
// ============================================================================

// Imports necessários para React e funcionalidades
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, // Ícone para Usuários
  Settings, // Ícone para Configurações
  Calendar, // Ícone para Agenda
  Shield, // Ícone para Permissões
  BarChart3, // Ícone para Analytics
  FileText, // Ícone para Relatórios
  Bell, // Ícone para Notificações
  X, // Ícone para fechar o menu
  Menu, // Ícone para o cabeçalho do menu
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

// import { usePermissions } from '@/stores/authStore';

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

// Interface para definir a estrutura de um item do menu
interface MenuItem {
  icon: React.ReactNode; // Ícone do item (componente React)
  label: string; // Texto exibido no menu
  path: string; // Rota para navegação
  roles: string[]; // Roles que podem acessar este item
}

// Interface para as props do componente MenuRaioX
interface MenuRaioXProps {
  isOpen?: boolean; // Estado de abertura do menu (controlado externamente)
  onClose?: () => void; // Callback para fechar o menu
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Componente MenuRaioX - Menu lateral de navegação
 *
 * Características:
 * - Design temático de "raio-X" com fundo azul claro
 * - Animações suaves com Framer Motion
 * - Navegação por rotas do React Router
 * - Controle de estado via props externas
 * - Fechamento apenas via botão do cabeçalho
 */
export default function MenuRaioX({ isOpen = false, onClose }: MenuRaioXProps) {
  // ============================================================================
  // ESTADO E HOOKS
  // ============================================================================

  // Estado local para controlar a abertura do menu
  const [open, setOpen] = useState(isOpen);

  // Hooks do React Router para navegação
  const navigate = useNavigate(); // Função para navegar entre rotas
  const location = useLocation(); // Objeto com informações da rota atual

  // Hook de permissões (comentado por enquanto)
  // const { canAccess } = usePermissions();

  // ============================================================================
  // EFEITOS
  // ============================================================================

  // Sincronizar estado local com prop externa
  // Quando a prop isOpen muda, atualiza o estado local
  React.useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  // ============================================================================
  // CONFIGURAÇÃO DOS ITENS DO MENU
  // ============================================================================

  // Array com todos os itens disponíveis no menu
  // Menu reorganizado conforme solicitado - acesso liberado para todos os usuários
  const menuItems: MenuItem[] = [
    {
      icon: <Calendar size={20} />,
      label: 'Agenda',
      path: '/app/agenda',
      roles: ['admin', 'gerente', 'recepcao', 'profissional', 'usuario'],
    },
    {
      icon: <BarChart3 size={20} />,
      label: 'Analytics',
      path: '/app/analytics',
      roles: ['admin', 'gerente', 'recepcao', 'profissional', 'usuario'],
    },
    {
      icon: <FileText size={20} />,
      label: 'Relatórios',
      path: '/app/relatorios',
      roles: ['admin', 'gerente', 'recepcao', 'profissional', 'usuario'],
    },
    {
      icon: <Bell size={20} />,
      label: 'Notificações',
      path: '/app/notificacoes',
      roles: ['admin', 'gerente', 'recepcao', 'profissional', 'usuario'],
    },
    {
      icon: <Users size={20} />,
      label: 'Usuários',
      path: '/app/usuarios',
      roles: ['admin', 'gerente', 'recepcao', 'profissional', 'usuario'],
    },
    {
      icon: <Shield size={20} />,
      label: 'Permissões',
      path: '/app/permissions',
      roles: ['admin', 'gerente', 'recepcao', 'profissional', 'usuario'],
    },
    {
      icon: <Settings size={20} />,
      label: 'Configurações',
      path: '/app/configuracoes',
      roles: ['admin', 'gerente', 'recepcao', 'profissional', 'usuario'],
    },
  ];

  // ============================================================================
  // FILTROS E PERMISSÕES
  // ============================================================================

  // Filtrar itens baseado nas permissões do usuário
  // Temporariamente mostrando todos os itens para debug
  const filteredItems = menuItems;

  // TODO: Implementar sistema de permissões corretamente
  // const filteredItems = menuItems.filter(item => {
  //   const hasAccess = canAccess(item.roles);
  //   console.log(`🔐 Verificando acesso para ${item.label}:`, {
  //     roles: item.roles,
  //     hasAccess,
  //     item
  //   });
  //   return hasAccess;
  // });

  // ============================================================================
  // FUNÇÕES DE NAVEGAÇÃO
  // ============================================================================

  /**
   * Função para lidar com a navegação entre páginas
   * @param path - Caminho da rota para navegar
   */
  const handleNavigation = (path: string) => {
    console.log('🔄 MenuRaioX - Navegando para:', path);
    console.log('👤 Usuário atual:', user?.email);
    console.log('📊 User metadata:', user?.user_metadata);
    console.log('🎯 User role:', user?.user_metadata?.nivel_acesso);

    navigate(path);
    // Nota: Removido o fechamento automático - menu só fecha via botão do cabeçalho
  };

  /**
   * Função para verificar se uma rota está ativa
   * @param path - Caminho da rota para verificar
   * @returns true se a rota estiver ativa
   */
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  /**
   * Função para fechar o menu
   * Atualiza o estado local e notifica o componente pai via callback
   */
  const handleCloseMenu = () => {
    setOpen(false);
    onClose?.(); // Chama o callback se fornecido
  };

  // ============================================================================
  // RENDERIZAÇÃO DO COMPONENTE
  // ============================================================================

  return (
    <div>
      {/* 
        OVERLAY COM EFEITO DE BLUR
        - Ofusca a página de fundo quando o menu está aberto
        - Dá destaque ao menu lateral
        - Permite fechar o menu clicando fora dele
      */}
      {open && (
        <motion.div
          initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
          exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          transition={{ duration: 0.3 }}
          className='fixed inset-0 bg-black/20 z-50'
          style={{ backdropFilter: 'blur(8px)' }}
          onClick={handleCloseMenu}
        />
      )}

      {/* 
        PAINEL PRINCIPAL DO MENU
        - Posicionamento fixo no lado esquerdo da tela
        - Animações de entrada/saída com Framer Motion
        - Design com fundo azul claro e bordas suaves
      */}
      <motion.div
        // Animações de entrada/saída
        initial={{ x: '-100%' }} // Inicia fora da tela (esquerda)
        animate={{ x: open ? 0 : '-100%' }} // Move para posição 0 quando aberto
        exit={{ x: '-100%' }} // Sai pela esquerda quando fechado
        // Configuração da animação spring
        transition={{
          type: 'spring', // Tipo de animação suave
          stiffness: 100, // Rigidez da mola
          damping: 20, // Amortecimento
          mass: 0.8, // Massa do objeto animado
        }}
        // Classes CSS para estilo e posicionamento
        className='fixed top-0 left-0 h-full w-80 bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900 dark:to-blue-800 z-[60] shadow-2xl border-r border-blue-200 dark:border-blue-600 overflow-hidden'
      >
        {/* 
          MONITOR CARDÍACO COMO FUNDO DECORATIVO
          - SVG animado que simula um monitor cardíaco
          - Opacidade baixa para não interferir na legibilidade
          - Animação contínua do traço
        */}
        <div className='absolute inset-0 opacity-20'>
          <div className='flex items-center justify-center h-full'>
            <svg
              viewBox='0 0 500 100'
              className='w-full max-w-md'
              xmlns='http://www.w3.org/2000/svg'
            >
              {/* Linha do monitor cardíaco */}
              <path
                d='M0,50 L40,50 L60,20 L80,80 L120,50 L180,50 L200,30 L220,70 L240,50 L500,50'
                fill='none'
                stroke='#00ff' // Cor cyan neon original
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                filter='url(#glow)' // Aplicar efeito de brilho
              >
                {/* Animação do traço */}
                <animate
                  attributeName='stroke-dasharray'
                  from='0,1000'
                  to='1000,0'
                  dur='6s'
                  repeatCount='indefinite'
                />
              </path>

              {/* Definição do efeito Glow (brilho) */}
              <defs>
                <filter id='glow' x='-50%' y='-50%' width='200%' height='200%'>
                  <feGaussianBlur stdDeviation='3' result='blur' />
                  <feMerge>
                    <feMergeNode in='blur' />
                    <feMergeNode in='SourceGraphic' />
                    <feMergeNode in='blur' />
                  </feMerge>
                </filter>
              </defs>
            </svg>
          </div>
        </div>

        {/* 
          BOTÃO FECHAR (X) NO CANTO SUPERIOR DIREITO
          - Posicionado no canto superior direito do menu
          - Estilo neon cyan consistente com o tema
          - Animações de hover e clique
        */}
        <motion.button
          onClick={handleCloseMenu}
          className='absolute top-4 right-4 z-20 p-2 rounded-lg transition-all duration-300 group'
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          {/* Efeito de brilho no hover */}
          <motion.div
            className='absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg'
            initial={false}
          />

          {/* Ícone X com efeito neon */}
          <motion.span
            className='relative z-10 text-cyan-400 group-hover:drop-shadow-[0_0_8px_rgba(0,255,255,0.6)] transition-all duration-300'
            whileHover={{
              filter: 'drop-shadow(0 0 12px rgba(0,255,255,0.8))',
            }}
          >
            <X size={24} />
          </motion.span>
        </motion.button>

        {/* 
          CONTEÚDO PRINCIPAL DO MENU
          - Container com padding e layout flexível
          - Z-index alto para ficar sobre o fundo decorativo
        */}
        <div className='p-6 flex flex-col h-full relative z-10'>
          {/* 
            HEADER DO MENU
            - Título com emoji de raio-X
            - Linha decorativa com gradiente
            - Descrição do sistema
            - Animação de entrada com delay
          */}
          <motion.div
            initial={{ opacity: 0, y: -20 }} // Inicia invisível e acima
            animate={{ opacity: 1, y: 0 }} // Aparece e desce
            transition={{ delay: 0.2 }} // Delay de 0.2s
            className='mb-8'
          >
            {/* Título principal */}
            <h2 className='text-blue-600 dark:text-white text-2xl font-bold tracking-widest mb-2 flex items-center gap-3'>
              <Menu size={32} className='text-blue-600 dark:text-white' />{' '}
              {/* Ícone de menu */}
              Menu
            </h2>

            {/* Linha decorativa com gradiente */}
            <div className='h-1 w-20 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full'></div>

            {/* Descrição do sistema */}
            <p className='text-blue-700 dark:text-gray-200 text-sm mt-2 tracking-wide font-medium'>
              Sistema de Navegação Médica
            </p>
          </motion.div>

          {/* 
            NAVEGAÇÃO - LISTA DE ITENS DO MENU
            - Container flexível que ocupa o espaço restante
            - Gap entre os itens para espaçamento
            - Barra de rolagem para quando houver muitos itens
          */}
          <nav className='flex flex-col gap-2 flex-1 overflow-y-auto menu-scrollbar'>
            {/* Mapear todos os itens filtrados */}
            {filteredItems.map((item, idx) => (
              <motion.button
                key={item.path} // Chave única para React
                // Animações de entrada escalonadas
                initial={{ opacity: 0, x: -20 }} // Inicia invisível e à esquerda
                animate={{ opacity: 1, x: 0 }} // Aparece e move para posição
                transition={{ delay: 0.3 + idx * 0.1 }} // Delay crescente por item
                // Animações de hover
                whileHover={{
                  scale: 1.02, // Aumenta ligeiramente
                  x: 5, // Move para direita
                  transition: { duration: 0.2 }, // Transição rápida
                }}
                // Animação de clique
                whileTap={{ scale: 0.98 }} // Diminui ligeiramente
                // Handler de clique
                onClick={() => handleNavigation(item.path)}
                // Classes CSS condicionais baseadas no estado ativo
                className={`
                  flex items-center gap-4 p-4 rounded-xl transition-all duration-300 group relative overflow-hidden
                  ${
                    isActive(item.path)
                      ? 'bg-blue-200 dark:bg-blue-700 border border-blue-300 dark:border-blue-500 text-blue-800 dark:text-white' // Estado ativo
                      : 'text-blue-700 dark:text-white hover:text-blue-900 dark:hover:text-blue-100 hover:bg-blue-100 dark:hover:bg-blue-800' // Estado normal
                  }
                `}
              >
                {/* 
                  EFEITO DE BRILHO NO HOVER
                  - Overlay com gradiente que aparece no hover
                  - Opacidade 0 por padrão, 100% no hover
                */}
                <motion.div
                  className='absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300'
                  initial={false}
                />

                {/* 
                  ÍCONE COM EFEITO NEON
                  - Ícone com cores e efeitos condicionais
                  - Drop-shadow para efeito neon
                  - Animação de hover com escala e brilho
                */}
                <motion.span
                  className={`
                    relative z-10 transition-all duration-300
                    ${
                      isActive(item.path)
                        ? 'text-blue-600 dark:text-white drop-shadow-[0_0_8px_rgba(59,130,246,0.6)] dark:drop-shadow-[0_0_8px_rgba(96,165,250,0.6)]' // Estado ativo
                        : 'text-blue-500 dark:text-white group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.4)] dark:group-hover:drop-shadow-[0_0_8px_rgba(96,165,250,0.4)]' // Estado normal
                    }
                  `}
                  whileHover={{
                    scale: 1.1, // Aumenta no hover
                    filter: 'drop-shadow(0 0 12px rgba(59,130,246,0.8))', // Brilho azul intenso no hover
                  }}
                >
                  {item.icon}
                </motion.span>

                {/* 
                  LABEL DO ITEM
                  - Texto do item com fonte e espaçamento
                  - Z-index para ficar sobre efeitos
                */}
                <span
                  className={`
                  font-medium tracking-wide relative z-10
                  ${
                    isActive(item.path)
                      ? 'text-blue-800 dark:text-white font-semibold' // Estado ativo
                      : 'text-blue-700 dark:text-white group-hover:text-blue-900 dark:group-hover:text-blue-100' // Estado normal
                  }
                `}
                >
                  {item.label}
                </span>

                {/* 
                  INDICADOR DE PÁGINA ATIVA
                  - Pequeno círculo que aparece apenas no item ativo
                  - Animação de entrada com escala
                  - Posicionado à direita (ml-auto)
                */}
                {isActive(item.path) && (
                  <motion.div
                    initial={{ scale: 0 }} // Inicia invisível
                    animate={{ scale: 1 }} // Aparece com escala normal
                    className='ml-auto w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(0,255,255,0.8)]'
                  />
                )}
              </motion.button>
            ))}
          </nav>

          {/* 
            FOOTER DO MENU
            - Informações da versão do sistema
            - Pontos animados decorativos
            - Borda superior para separação
            - Animação de entrada com delay
          */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} // Inicia invisível e abaixo
            animate={{ opacity: 1, y: 0 }} // Aparece e sobe
            transition={{ delay: 0.8 }} // Delay maior
            className='mt-8 pt-6 border-t border-cyan-500/20'
          >
            <div className='text-center'>
              {/* Versão do sistema */}
              <p className='text-blue-600 dark:text-gray-300 text-xs tracking-wider'>
                Sistema Clínico v1.0
              </p>

              {/* Pontos animados decorativos */}
              <div className='flex justify-center gap-1 mt-2'>
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className='w-1 h-1 bg-cyan-500 rounded-full'
                    animate={{
                      opacity: [0.3, 1, 0.3], // Pulsação de opacidade
                      scale: [0.8, 1.2, 0.8], // Pulsação de tamanho
                    }}
                    transition={{
                      duration: 2, // Duração de 2 segundos
                      repeat: Infinity, // Repetir infinitamente
                      delay: i * 0.3, // Delay escalonado
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
