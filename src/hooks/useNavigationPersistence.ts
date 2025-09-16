// Hook para gerenciar persistência de navegação
// Este hook é usado para marcar quando o usuário faz logout

// Chaves para localStorage
const LAST_VISITED_PATH_KEY = 'lastVisitedPath';
const USER_LOGGED_OUT_KEY = 'userLoggedOut';

export const useNavigationPersistence = () => {
  // Marcar logout quando usuário sair do sistema
  const markUserLoggedOut = () => {
    localStorage.setItem(USER_LOGGED_OUT_KEY, 'true');
    localStorage.removeItem(LAST_VISITED_PATH_KEY);
  };

  // Limpar dados de navegação
  const clearNavigationData = () => {
    localStorage.removeItem(LAST_VISITED_PATH_KEY);
    localStorage.removeItem(USER_LOGGED_OUT_KEY);
  };

  return {
    markUserLoggedOut,
    clearNavigationData,
  };
};
