import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Lazy Pages
import {
  LoginLazy,
  RegisterLazy,
  ApresentacaoLazy,
  DashboardLazy,
  AgendaLazy,
  PacientesLazy,
  ServicosLazy,
  ProfissionaisLazy,
  UsuariosLazy,
  ConfiguracoesLazy,
  ChangePasswordLazy,
  PermissionsLazy,
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

// Contexts
import { MenuProvider } from './contexts/MenuContext';
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

  useEffect(() => {
    // Simular carregamento inicial
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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
        <AppProvider>
          <AccessibilityProvider>
            <PWAProvider>
              <MenuProvider>
                <ErrorBoundary>
                  <div className='min-h-screen bg-gray-50'>
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
                            <ProtectedRoute
                              requiredRoles={['admin', 'gerente']}
                            >
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
                          path='usuarios'
                          element={
                            <ProtectedRoute
                              requiredRoles={['admin', 'desenvolvedor']}
                            >
                              <UsuariosLazy />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path='configuracoes'
                          element={
                            <ProtectedRoute requiredRoles={['admin']}>
                              <ConfiguracoesLazy />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path='permissions'
                          element={
                            <ProtectedRoute
                              requiredRoles={['admin', 'desenvolvedor']}
                            >
                              <PermissionsLazy />
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
              </MenuProvider>
            </PWAProvider>
          </AccessibilityProvider>
        </AppProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
