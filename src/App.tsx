import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/authStore';
import { NavigationManager } from './components/Navigation';

// Lazy Pages
import {
  LoginLazy,
  RegisterLazy,
  ApresentacaoLazy,
  DashboardLazy,
  AgendaLazy,
  PacientesLazy,
  ServicosLazy,
  ServicosConveniosLazy,
  ConvenioServicosLazy,
  ProfissionaisLazy,
  UsuariosLazy,
  ConfiguracoesLazy,
  ChangePasswordLazy,
  FirstAccessPasswordLazy,
  ForgotPasswordLazy,
  PermissionsLazy,
  RelatoriosLazy,
  NotificacoesLazy,
  WhatsAppLazy,
  BackupLazy,
  // Financial Pages
  DashboardFinanceiroLazy,
  ContasReceberLazy,
  PagamentosLazy,
  FluxoCaixaLazy,
} from './components/LazyLoading/LazyPages';

// Components
import ProtectedRoute from './components/Auth/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { AccessibilityProvider } from './components/Accessibility';
import {
  PWAProvider,
  UpdateNotification,
  OfflineIndicator,
} from './components/PWA';
import { ThemeProvider } from './components/Theme/ThemeProvider';

// Contexts
import { AppProvider } from './contexts/AppContext';

// Layout
import Layout from './components/Layout/Layout';

// Configuração do React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [loading, setLoading] = useState(true);
  const { initialize } = useAuthStore();

  useEffect(() => {
    // Inicializar authStore
    const initAuth = async () => {
      try {
        await initialize();
        setLoading(false);
      } catch (error) {
        console.error('Erro ao inicializar auth:', error);
        setLoading(false);
      }
    };

    initAuth();
  }, [initialize]);

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4'></div>
          <p className='text-gray-600'>Carregando sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AppProvider>
            <AccessibilityProvider>
              <PWAProvider>
                <ErrorBoundary>
                  <NavigationManager />
                  <div className='min-h-screen'>
                    <Routes>
                      {/* Página de Apresentação */}
                      <Route path='/' element={<ApresentacaoLazy />} />

                      {/* Páginas de Autenticação */}
                      <Route path='/login' element={<LoginLazy />} />
                      <Route path='/register' element={<RegisterLazy />} />
                      <Route
                        path='/change-password'
                        element={<ChangePasswordLazy />}
                      />
                      <Route
                        path='/first-access-password'
                        element={<FirstAccessPasswordLazy />}
                      />
                      <Route
                        path='/forgot-password'
                        element={<ForgotPasswordLazy />}
                      />

                      {/* Rotas Protegidas */}
                      <Route path='/app' element={<Layout />}>
                        <Route
                          index
                          element={<Navigate to='/app/dashboard' replace />}
                        />
                        <Route
                          path='dashboard'
                          element={
                            <ProtectedRoute>
                              <DashboardLazy />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path='agenda'
                          element={
                            <ProtectedRoute>
                              <AgendaLazy />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path='pacientes'
                          element={
                            <ProtectedRoute>
                              <PacientesLazy />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path='profissionais'
                          element={
                            <ProtectedRoute>
                              <ProfissionaisLazy />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path='servicos'
                          element={
                            <ProtectedRoute>
                              <ServicosLazy />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path='servicos-convenios'
                          element={
                            <ProtectedRoute>
                              <ServicosConveniosLazy />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path='convenio-servicos'
                          element={
                            <ProtectedRoute>
                              <ConvenioServicosLazy />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path='usuarios'
                          element={
                            <ProtectedRoute>
                              <UsuariosLazy />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path='relatorios'
                          element={
                            <ProtectedRoute>
                              <RelatoriosLazy />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path='notificacoes'
                          element={
                            <ProtectedRoute>
                              <NotificacoesLazy />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path='whatsapp'
                          element={
                            <ProtectedRoute>
                              <WhatsAppLazy />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path='backup'
                          element={
                            <ProtectedRoute>
                              <BackupLazy />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path='configuracoes'
                          element={
                            <ProtectedRoute>
                              <ConfiguracoesLazy />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path='permissions'
                          element={
                            <ProtectedRoute>
                              <PermissionsLazy />
                            </ProtectedRoute>
                          }
                        />
                        {/* Financial Routes */}
                        <Route
                          path='financeiro'
                          element={
                            <ProtectedRoute>
                              <DashboardFinanceiroLazy />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path='financeiro/contas-receber'
                          element={
                            <ProtectedRoute>
                              <ContasReceberLazy />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path='financeiro/pagamentos'
                          element={
                            <ProtectedRoute>
                              <PagamentosLazy />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path='financeiro/fluxo-caixa'
                          element={
                            <ProtectedRoute>
                              <FluxoCaixaLazy />
                            </ProtectedRoute>
                          }
                        />
                      </Route>

                      {/* Rota padrão */}
                      <Route path='*' element={<Navigate to='/' replace />} />
                    </Routes>

                    {/* Notificações e Indicadores */}
                    <UpdateNotification />
                    <OfflineIndicator />

                    {/* Toast Notifications */}
                    <Toaster
                      position='top-right'
                      toastOptions={{
                        duration: 4000,
                        style: {
                          background: '#363636',
                          color: '#fff',
                        },
                      }}
                    />
                  </div>
                </ErrorBoundary>
              </PWAProvider>
            </AccessibilityProvider>
          </AppProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
