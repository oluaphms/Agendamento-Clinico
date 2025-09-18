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
export const LazyServicosConvenios = createLazyComponent(
  () => import('@/pages/ServicosConvenios/ServicosConvenios'),
  { chunkName: 'servicos-convenios' }
);
export const LazyConvenioServicos = createLazyComponent(
  () => import('@/pages/ConvenioServicos/ConvenioServicos'),
  { chunkName: 'convenio-servicos' }
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

// Financial Pages
export const LazyDashboardFinanceiro = createLazyComponent(
  () => import('@/pages/Financeiro/DashboardFinanceiro'),
  { chunkName: 'dashboard-financeiro' }
);
export const LazyContasReceber = createLazyComponent(
  () => import('@/pages/Financeiro/ContasReceber'),
  { chunkName: 'contas-receber' }
);
export const LazyPagamentos = createLazyComponent(
  () => import('@/pages/Financeiro/Pagamentos'),
  { chunkName: 'pagamentos' }
);
export const LazyFluxoCaixa = createLazyComponent(
  () => import('@/pages/Financeiro/FluxoCaixa'),
  { chunkName: 'fluxo-caixa' }
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

// Serviços com skeleton of cards
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

// Serviços/Convênios com skeleton de formulário e lista
export const ServicosConveniosLazy = () => (
  <LazyWrapper
    fallback={
      <div className='p-6 space-y-6'>
        {/* Header */}
        <div className='flex items-center space-x-3 mb-6'>
          <div className='h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded'></div>
          <div>
            <div className='h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2'></div>
            <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-64'></div>
          </div>
        </div>
        {/* Tabs */}
        <div className='flex space-x-1 bg-gray-200 dark:bg-gray-700 rounded-lg p-1'>
          <div className='flex-1 h-10 bg-gray-300 dark:bg-gray-600 rounded'></div>
          <div className='flex-1 h-10 bg-gray-300 dark:bg-gray-600 rounded'></div>
        </div>
        {/* Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Formulário */}
          <CardSkeleton height='400px' />
          {/* Lista */}
          <CardSkeleton height='400px' />
        </div>
      </div>
    }
  >
    <LazyServicosConvenios />
  </LazyWrapper>
);

// Convênio/Serviços com skeleton de cards
export const ConvenioServicosLazy = () => (
  <LazyWrapper
    fallback={
      <div className='p-6 space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center space-x-3'>
            <div className='h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg'></div>
            <div>
              <div className='h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2'></div>
              <div className='h-5 bg-gray-200 dark:bg-gray-700 rounded w-80'></div>
            </div>
          </div>
          <div className='h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg'></div>
        </div>
        {/* Tabs */}
        <div className='border-b border-gray-200 dark:border-gray-700'>
          <div className='flex space-x-8'>
            <div className='h-10 bg-gray-200 dark:bg-gray-700 rounded w-40'></div>
            <div className='h-10 bg-gray-200 dark:bg-gray-700 rounded w-40'></div>
          </div>
        </div>
        {/* Search */}
        <div className='h-10 bg-gray-200 dark:bg-gray-700 rounded-lg'></div>
        {/* Cards Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {Array.from({ length: 6 }).map((_, index) => (
            <CardSkeleton key={index} height='200px' />
          ))}
        </div>
      </div>
    }
  >
    <LazyConvenioServicos />
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

// Financial Pages with skeletons
export const DashboardFinanceiroLazy = () => (
  <LazyWrapper
    fallback={
      <div className='p-6 space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center space-x-3'>
            <div className='h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg'></div>
            <div>
              <div className='h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2'></div>
              <div className='h-5 bg-gray-200 dark:bg-gray-700 rounded w-80'></div>
            </div>
          </div>
          <div className='flex space-x-2'>
            <div className='h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg'></div>
            <div className='h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg'></div>
          </div>
        </div>
        {/* Metrics Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {Array.from({ length: 4 }).map((_, index) => (
            <CardSkeleton key={index} height='120px' />
          ))}
        </div>
        {/* Charts */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <CardSkeleton height='400px' />
          <CardSkeleton height='400px' />
        </div>
      </div>
    }
  >
    <LazyDashboardFinanceiro />
  </LazyWrapper>
);

export const ContasReceberLazy = () => (
  <LazyWrapper
    fallback={
      <div className='p-6 space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center space-x-3'>
            <div className='h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg'></div>
            <div>
              <div className='h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2'></div>
              <div className='h-5 bg-gray-200 dark:bg-gray-700 rounded w-80'></div>
            </div>
          </div>
          <div className='h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg'></div>
        </div>
        {/* Filters */}
        <CardSkeleton height='120px' />
        {/* Table */}
        <TableSkeleton rows={10} columns={6} />
      </div>
    }
  >
    <LazyContasReceber />
  </LazyWrapper>
);

export const PagamentosLazy = () => (
  <LazyWrapper
    fallback={
      <div className='p-6 space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center space-x-3'>
            <div className='h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg'></div>
            <div>
              <div className='h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2'></div>
              <div className='h-5 bg-gray-200 dark:bg-gray-700 rounded w-80'></div>
            </div>
          </div>
          <div className='h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg'></div>
        </div>
        {/* Filters */}
        <CardSkeleton height='120px' />
        {/* Table */}
        <TableSkeleton rows={10} columns={6} />
      </div>
    }
  >
    <LazyPagamentos />
  </LazyWrapper>
);

export const FluxoCaixaLazy = () => (
  <LazyWrapper
    fallback={
      <div className='p-6 space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center space-x-3'>
            <div className='h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg'></div>
            <div>
              <div className='h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2'></div>
              <div className='h-5 bg-gray-200 dark:bg-gray-700 rounded w-80'></div>
            </div>
          </div>
          <div className='h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg'></div>
        </div>
        {/* Filters */}
        <CardSkeleton height='120px' />
        {/* Table */}
        <TableSkeleton rows={10} columns={6} />
      </div>
    }
  >
    <LazyFluxoCaixa />
  </LazyWrapper>
);

// ============================================================================
// EXPORTAÇÕES
// ============================================================================
// As exportações já estão feitas individualmente acima
