// ============================================================================
// CONFIGURAÇÃO DE AMBIENTE
// ============================================================================
// Configurações centralizadas baseadas no ambiente de execução
// ============================================================================

// ============================================================================
// TIPOS DE AMBIENTE
// ============================================================================

export type Environment = 'development' | 'staging' | 'production';

export interface EnvironmentConfig {
  environment: Environment;
  isDevelopment: boolean;
  isStaging: boolean;
  isProduction: boolean;
  apiUrl: string;
  supabaseUrl: string;
  supabaseKey: string;
  enableMockData: boolean;
  enableDebugLogs: boolean;
  enableErrorReporting: boolean;
  appVersion: string;
  appName: string;
  // Adicionar propriedade que está sendo usada nos serviços
  mockDataEnabled: boolean;
}

// ============================================================================
// CONFIGURAÇÕES POR AMBIENTE
// ============================================================================

const getEnvironmentConfig = (): EnvironmentConfig => {
  const environment = (import.meta.env.VITE_APP_ENVIRONMENT ||
    'development') as Environment;

  const isDevelopment = environment === 'development';
  const isStaging = environment === 'staging';
  const isProduction = environment === 'production';

  return {
    environment,
    isDevelopment,
    isStaging,
    isProduction,

    // URLs da API
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
    supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',

    // Configurações de funcionalidades
    enableMockData:
      isDevelopment && import.meta.env.VITE_ENABLE_MOCK_DATA !== 'false',
    enableDebugLogs:
      isDevelopment || import.meta.env.VITE_ENABLE_DEBUG_LOGS === 'true',
    enableErrorReporting:
      isProduction || import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true',

    // Informações da aplicação
    appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
    appName: import.meta.env.VITE_APP_TITLE || 'Sistema Clínico',
    
    // Alias para compatibilidade com serviços
    mockDataEnabled: isDevelopment && import.meta.env.VITE_ENABLE_MOCK_DATA !== 'false',
  };
};

// ============================================================================
// CONFIGURAÇÃO GLOBAL
// ============================================================================

export const config = getEnvironmentConfig();

// ============================================================================
// VALIDAÇÃO DE CONFIGURAÇÃO
// ============================================================================

export function validateEnvironmentConfig(): void {
  const errors: string[] = [];

  // Validar URLs obrigatórias em produção
  if (config.isProduction) {
    if (!config.supabaseUrl) {
      errors.push('VITE_SUPABASE_URL é obrigatório em produção');
    }

    if (!config.supabaseKey) {
      errors.push('VITE_SUPABASE_ANON_KEY é obrigatório em produção');
    }

    if (!config.supabaseUrl.startsWith('https://')) {
      errors.push('VITE_SUPABASE_URL deve usar HTTPS em produção');
    }
  }

  // Validar formato das URLs
  if (config.apiUrl && !config.apiUrl.startsWith('http')) {
    errors.push('VITE_API_URL deve ser uma URL válida');
  }

  if (config.supabaseUrl && !config.supabaseUrl.startsWith('https://')) {
    errors.push('VITE_SUPABASE_URL deve usar HTTPS');
  }

  // Exibir erros se houver
  if (errors.length > 0) {
    const errorMessage = `Erros de configuração:\n${errors.join('\n')}`;

    if (config.isDevelopment) {
      console.warn(errorMessage);
    } else {
      throw new Error(errorMessage);
    }
  }
}

// ============================================================================
// UTILITÁRIOS
// ============================================================================

/**
 * Verifica se o mock data está habilitado
 */
export function isMockDataEnabled(): boolean {
  return config.enableMockData;
}

/**
 * Verifica se os logs de debug estão habilitados
 */
export function isDebugLogsEnabled(): boolean {
  return config.enableDebugLogs;
}

/**
 * Verifica se o relatório de erros está habilitado
 */
export function isErrorReportingEnabled(): boolean {
  return config.enableErrorReporting;
}

/**
 * Obtém a URL base da API
 */
export function getApiUrl(): string {
  return config.apiUrl;
}

/**
 * Obtém a URL do Supabase
 */
export function getSupabaseUrl(): string {
  return config.supabaseUrl;
}

/**
 * Obtém a chave do Supabase
 */
export function getSupabaseKey(): string {
  return config.supabaseKey;
}

/**
 * Obtém informações da aplicação
 */
export function getAppInfo(): { name: string; version: string } {
  return {
    name: config.appName,
    version: config.appVersion,
  };
}

// ============================================================================
// LOGS CONDICIONAIS
// ============================================================================

/**
 * Log apenas em desenvolvimento
 */
export function devLog(message: string, ...args: unknown[]): void {
  if (config.enableDebugLogs) {
    console.log(`[DEV] ${message}`, ...args);
  }
}

/**
 * Log de aviso apenas em desenvolvimento
 */
export function devWarn(message: string, ...args: unknown[]): void {
  if (config.enableDebugLogs) {
    console.warn(`[DEV] ${message}`, ...args);
  }
}

/**
 * Log de erro apenas em desenvolvimento
 */
export function devError(message: string, ...args: unknown[]): void {
  if (config.enableDebugLogs) {
    console.error(`[DEV] ${message}`, ...args);
  }
}

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================

// Validar configuração apenas uma vez
let configValidated = false;
if (!configValidated) {
  validateEnvironmentConfig();
  configValidated = true;

  // Log de informações do ambiente
  if (config.enableDebugLogs) {
    devLog('Configuração do ambiente:', {
      environment: config.environment,
      appName: config.appName,
      appVersion: config.appVersion,
      mockDataEnabled: config.enableMockData,
      supabaseConfigured: !!config.supabaseUrl && !!config.supabaseKey,
    });
  }
}
