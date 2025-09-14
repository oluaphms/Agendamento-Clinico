// ============================================================================
// CONFIGURAÇÕES DE DESENVOLVIMENTO
// ============================================================================
// Configurações específicas para o ambiente de desenvolvimento
// ============================================================================

export const developmentConfig = {
  // Configurações do Service Worker
  serviceWorker: {
    // Desabilitar cache em desenvolvimento para evitar problemas
    enableCache: false,
    // Reduzir logs de erro em desenvolvimento
    verboseLogging: false,
    // Timeout mais curto para desenvolvimento
    requestTimeout: 5000,
  },
  
  // Configurações de conectividade
  connectivity: {
    // Verificação mais frequente em desenvolvimento
    checkInterval: 30000, // 30 segundos
    // Menos tentativas de retry em desenvolvimento
    maxRetries: 2,
    // Timeout mais curto
    requestTimeout: 5000,
  },
  
  // Configurações de notificações
  notifications: {
    // Desabilitar notificações de conectividade em desenvolvimento
    showConnectivityWarnings: false,
    // Logs mais detalhados no console
    verboseLogging: true,
  },
  
  // Configurações do Supabase
  supabase: {
    // Usar cache local como fallback em desenvolvimento
    enableLocalFallback: true,
    // Logs detalhados de requisições
    logRequests: true,
    // Retry mais agressivo em desenvolvimento
    retryOnFailure: true,
  }
};

// Função para verificar se estamos em desenvolvimento
export const isDevelopment = () => {
  return import.meta.env.DEV || import.meta.env.VITE_APP_ENVIRONMENT === 'development';
};

// Função para obter configuração baseada no ambiente
export const getConfig = () => {
  if (isDevelopment()) {
    return developmentConfig;
  }
  
  // Configurações de produção
  return {
    serviceWorker: {
      enableCache: true,
      verboseLogging: false,
      requestTimeout: 10000,
    },
    connectivity: {
      checkInterval: 60000,
      maxRetries: 3,
      requestTimeout: 10000,
    },
    notifications: {
      showConnectivityWarnings: true,
      verboseLogging: false,
    },
    supabase: {
      enableLocalFallback: true,
      logRequests: false,
      retryOnFailure: true,
    }
  };
};

export default developmentConfig;
