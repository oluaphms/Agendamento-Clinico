import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

// Chaves para localStorage
const LAST_VISITED_PATH_KEY = 'lastVisitedPath';
const USER_LOGGED_OUT_KEY = 'userLoggedOut';

export const NavigationManager: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuthStore();

  // Salvar a rota atual quando o usuário navega
  useEffect(() => {
    if (!loading && user && location.pathname !== '/') {
      // Não salvar rotas de autenticação, apresentação ou páginas de erro
      const excludedRoutes = [
        '/login',
        '/register',
        '/change-password',
        '/first-access-password',
        '/app', // Não salvar a rota base do app
      ];

      if (
        !excludedRoutes.includes(location.pathname) &&
        !location.pathname.startsWith('/app/')
      ) {
        return; // Não salvar se não for uma rota válida do app
      }

      if (location.pathname.startsWith('/app/')) {
        localStorage.setItem(LAST_VISITED_PATH_KEY, location.pathname);
        // Limpar flag de logout quando usuário navega
        localStorage.removeItem(USER_LOGGED_OUT_KEY);
      }
    }
  }, [location.pathname, user, loading]);

  // Redirecionar usuário logado para última página visitada
  useEffect(() => {
    if (!loading && user && location.pathname === '/') {
      const lastVisitedPath = localStorage.getItem(LAST_VISITED_PATH_KEY);
      const userLoggedOut = localStorage.getItem(USER_LOGGED_OUT_KEY);

      // Se usuário não fez logout e tem última página salva, redirecionar
      if (!userLoggedOut && lastVisitedPath && lastVisitedPath !== '/') {
        console.log(
          '🔄 Redirecionando para última página visitada:',
          lastVisitedPath
        );
        navigate(lastVisitedPath, { replace: true });
      } else {
        // Se não tem última página ou fez logout, ir para dashboard
        console.log('🔄 Redirecionando para dashboard');
        navigate('/app/dashboard', { replace: true });
      }
    }
  }, [user, loading, location.pathname, navigate]);

  // Interceptar redirecionamentos para login quando usuário está carregando
  useEffect(() => {
    if (loading && location.pathname === '/login') {
      console.log('🔄 Usuário ainda carregando, aguardando...');
      // Não fazer nada, apenas aguardar o carregamento terminar
    }
  }, [loading, location.pathname]);

  // Redirecionar usuário logado que foi redirecionado para login incorretamente
  useEffect(() => {
    if (!loading && user && location.pathname === '/login') {
      console.log(
        '🔄 Usuário logado redirecionado incorretamente para login, corrigindo...'
      );
      const lastVisitedPath = localStorage.getItem(LAST_VISITED_PATH_KEY);
      const userLoggedOut = localStorage.getItem(USER_LOGGED_OUT_KEY);

      if (!userLoggedOut && lastVisitedPath && lastVisitedPath !== '/') {
        navigate(lastVisitedPath, { replace: true });
      } else {
        navigate('/app/dashboard', { replace: true });
      }
    }
  }, [user, loading, location.pathname, navigate]);

  // Redirecionar usuário não logado para apresentação
  useEffect(() => {
    if (!loading && !user && location.pathname.startsWith('/app/')) {
      console.log('🔄 Usuário não logado, redirecionando para apresentação');
      navigate('/', { replace: true });
    }
  }, [user, loading, location.pathname, navigate]);

  // Interceptar redirecionamentos para login quando usuário está carregando
  useEffect(() => {
    if (loading && location.pathname === '/login') {
      console.log('🔄 Usuário ainda carregando, aguardando...');
      // Não fazer nada, apenas aguardar o carregamento terminar
    }
  }, [loading, location.pathname]);

  return null; // Este componente não renderiza nada
};
