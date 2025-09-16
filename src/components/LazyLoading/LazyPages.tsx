// ============================================================================
// COMPONENTES LAZY PARA PÁGINAS
// ============================================================================
// Componentes lazy para todas as páginas da aplicação
// ============================================================================

import { LazyWrapper, CardSkeleton, TableSkeleton } from './LazyWrapper';
import { createLazyComponent, ComponentPreloader } from '@/utils/codeSplitting';

// ============================================================================
// COMPONENTES LAZY
// ============================================================================

// Páginas principais com code splitting otimizado
export const LazyDashboard = createLazyComponent(
  () => import('@/pages/Dashboard/Dashboard'),
  { chunkName: 'dashboard', preload: true }
);
export const LazyAgenda = createLazyComponent(
  () => import('@/pages/Agenda/Agenda'),
  { chunkName: 'agenda' }
);
export const LazyPacientes = createLazyComponent(
  () => import('@/pages/Pacientes/Pacientes'),
  { chunkName: 'pacientes' }
);
export const LazyProfissionais = createLazyComponent(
  () => import('@/pages/Profissionais/Profissionais'),
  { chunkName: 'profissionais' }
);
export const LazyServicos = createLazyComponent(
  () => import('@/pages/Servicos/Servicos'),
  { chunkName: 'servicos' }
);
export const LazyUsuarios = createLazyComponent(
  () => import('@/pages/Usuarios/Usuarios'),
  { chunkName: 'usuarios' }
);
export const LazyConfiguracoes = createLazyComponent(
  () => import('@/pages/Configuracoes/Configuracoes'),
  { chunkName: 'configuracoes' }
);
export const LazyRelatorios = createLazyComponent(
  () => import('@/pages/Relatorios/Relatorios'),
  { chunkName: 'relatorios' }
);
export const LazyNotificacoes = createLazyComponent(
  () => import('@/pages/Notificacoes/Notificacoes'),
  { chunkName: 'notificacoes' }
);
export const LazyWhatsApp = createLazyComponent(
  () => import('@/pages/WhatsApp/WhatsApp'),
  { chunkName: 'whatsapp' }
);
export const LazyBackup = createLazyComponent(
  () => import('@/pages/Backup/Backup'),
  { chunkName: 'backup' }
);

// Páginas de autenticação
export const LazyLogin = createLazyComponent(
  () => import('@/pages/Auth/Login'),
  { chunkName: 'login' }
);
export const LazyRegister = createLazyComponent(
  () => import('@/pages/Auth/Register'),
  { chunkName: 'register' }
);
export const LazyChangePassword = createLazyComponent(
  () => import('@/pages/Auth/ChangePassword'),
  { chunkName: 'change-password' }
);
export const LazyFirstAccessPassword = createLazyComponent(
  () => import('@/pages/Auth/FirstAccessPassword'),
  { chunkName: 'first-access-password' }
);
export const LazyForgotPassword = createLazyComponent(
  () => import('@/pages/Auth/ForgotPassword'),
  { chunkName: 'forgot-password' }
);
export const LazyApresentacao = createLazyComponent(
  () => import('@/pages/Apresentacao/ApresentacaoSimple'),
  { chunkName: 'apresentacao', preload: true }
);

// Páginas de sistema
export const LazyPermissions = createLazyComponent(
  () => import('@/pages/Permissions/Permissions'),
  { chunkName: 'permissions' }
);

// ============================================================================
// PRELOAD DE COMPONENTES CRÍTICOS
// ============================================================================

// Preload de componentes críticos em idle time
ComponentPreloader.preloadOnIdle(
  () => import('@/pages/Dashboard/Dashboard'),
  'dashboard'
);

ComponentPreloader.preloadOnIdle(
  () => import('@/pages/Agenda/Agenda'),
  'agenda'
);

// ============================================================================
// COMPONENTES WRAPPED COM FALLBACKS
// ============================================================================

// Dashboard com skeleton de cards
export const DashboardLazy = () => (
  <LazyWrapper
    fallback={
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6'>
        {Array.from({ length: 4 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    }
  >
    <LazyDashboard />
  </LazyWrapper>
);

// Agenda com skeleton de tabela
export const AgendaLazy = () => (
  <LazyWrapper
    fallback={
      <div className='p-6'>
        <TableSkeleton rows={8} columns={6} />
      </div>
    }
  >
    <LazyAgenda />
  </LazyWrapper>
);

// Pacientes com skeleton de tabela
export const PacientesLazy = () => (
  <LazyWrapper
    fallback={
      <div className='p-6'>
        <TableSkeleton rows={10} columns={5} />
      </div>
    }
  >
    <LazyPacientes />
  </LazyWrapper>
);

// Profissionais com skeleton de cards
export const ProfissionaisLazy = () => (
  <LazyWrapper
    fallback={
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6'>
        {Array.from({ length: 6 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    }
  >
    <LazyProfissionais />
  </LazyWrapper>
);

// Serviços com skeleton de cards
export const ServicosLazy = () => (
  <LazyWrapper
    fallback={
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6'>
        {Array.from({ length: 6 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    }
  >
    <LazyServicos />
  </LazyWrapper>
);

// Usuários com skeleton de tabela
export const UsuariosLazy = () => (
  <LazyWrapper
    fallback={
      <div className='p-6'>
        <TableSkeleton rows={10} columns={7} />
      </div>
    }
  >
    <LazyUsuarios />
  </LazyWrapper>
);

// Configurações com skeleton de cards
export const ConfiguracoesLazy = () => (
  <LazyWrapper
    fallback={
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 p-6'>
        {Array.from({ length: 6 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    }
  >
    <LazyConfiguracoes />
  </LazyWrapper>
);

// Relatórios com skeleton de cards
export const RelatoriosLazy = () => (
  <LazyWrapper
    fallback={
      <div className='p-6 space-y-6'>
        {/* Filtros */}
        <CardSkeleton height='120px' />
        {/* Lista de relatórios */}
        <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
          {Array.from({ length: 6 }).map((_, index) => (
            <CardSkeleton key={index} height='200px' />
          ))}
        </div>
      </div>
    }
  >
    <LazyRelatorios />
  </LazyWrapper>
);

// Notificações com skeleton de lista
export const NotificacoesLazy = () => (
  <LazyWrapper
    fallback={
      <div className='p-6 space-y-6'>
        {/* Estatísticas */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
          {Array.from({ length: 4 }).map((_, index) => (
            <CardSkeleton key={index} height='100px' />
          ))}
        </div>
        {/* Filtros */}
        <CardSkeleton height='120px' />
        {/* Lista de notificações */}
        <div className='space-y-4'>
          {Array.from({ length: 5 }).map((_, index) => (
            <CardSkeleton key={index} height='150px' />
          ))}
        </div>
      </div>
    }
  >
    <LazyNotificacoes />
  </LazyWrapper>
);

// WhatsApp com skeleton de mensagens
export const WhatsAppLazy = () => (
  <LazyWrapper
    fallback={
      <div className='p-6 space-y-6'>
        {/* Header */}
        <CardSkeleton height='120px' />
        {/* Tabs */}
        <CardSkeleton height='60px' />
        {/* Filtros */}
        <CardSkeleton height='120px' />
        {/* Lista de mensagens */}
        <div className='space-y-4'>
          {Array.from({ length: 5 }).map((_, index) => (
            <CardSkeleton key={index} height='150px' />
          ))}
        </div>
      </div>
    }
  >
    <LazyWhatsApp />
  </LazyWrapper>
);

// Backup com skeleton de backups
export const BackupLazy = () => (
  <LazyWrapper
    fallback={
      <div className='p-6 space-y-6'>
        {/* Header */}
        <CardSkeleton height='120px' />
        {/* Tabs */}
        <CardSkeleton height='60px' />
        {/* Filtros */}
        <CardSkeleton height='120px' />
        {/* Lista de backups */}
        <div className='space-y-4'>
          {Array.from({ length: 5 }).map((_, index) => (
            <CardSkeleton key={index} height='200px' />
          ))}
        </div>
      </div>
    }
  >
    <LazyBackup />
  </LazyWrapper>
);

// Páginas de autenticação
export const LoginLazy = () => (
  <LazyWrapper
    fallback={
      <div className='min-h-screen flex items-center justify-center'>
        <CardSkeleton />
      </div>
    }
  >
    <LazyLogin />
  </LazyWrapper>
);

export const RegisterLazy = () => (
  <LazyWrapper
    fallback={
      <div className='min-h-screen flex items-center justify-center'>
        <CardSkeleton />
      </div>
    }
  >
    <LazyRegister />
  </LazyWrapper>
);

export const ChangePasswordLazy = () => (
  <LazyWrapper
    fallback={
      <div className='min-h-screen flex items-center justify-center'>
        <CardSkeleton />
      </div>
    }
  >
    <LazyChangePassword />
  </LazyWrapper>
);

export const FirstAccessPasswordLazy = () => (
  <LazyWrapper
    fallback={
      <div className='min-h-screen flex items-center justify-center'>
        <CardSkeleton />
      </div>
    }
  >
    <LazyFirstAccessPassword />
  </LazyWrapper>
);

export const ForgotPasswordLazy = () => (
  <LazyWrapper
    fallback={
      <div className='min-h-screen flex items-center justify-center'>
        <CardSkeleton />
      </div>
    }
  >
    <LazyForgotPassword />
  </LazyWrapper>
);

export const ApresentacaoLazy = () => (
  <LazyWrapper
    fallback={
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-4'></div>
          <p className='text-gray-600 dark:text-gray-400'>
            Carregando apresentação...
          </p>
        </div>
      </div>
    }
  >
    <LazyApresentacao />
  </LazyWrapper>
);

// Permissões com skeleton de tabs
export const PermissionsLazy = () => (
  <LazyWrapper
    fallback={
      <div className='p-6'>
        <div className='mb-6'>
          <div className='h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2'></div>
          <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2'></div>
        </div>
        <div className='border-b border-gray-200 dark:border-gray-700 mb-6'>
          <div className='flex space-x-8'>
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className='h-10 bg-gray-200 dark:bg-gray-700 rounded w-24'
              ></div>
            ))}
          </div>
        </div>
        <div className='space-y-4'>
          {Array.from({ length: 3 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      </div>
    }
  >
    <LazyPermissions />
  </LazyWrapper>
);

// ============================================================================
// EXPORTAÇÕES
// ============================================================================
// As exportações já estão feitas individualmente acima
