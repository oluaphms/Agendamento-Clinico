// ============================================================================
// TRATAMENTO DE ERROS GLOBAL
// ============================================================================
// Sistema centralizado para tratamento de erros da aplicação
// ============================================================================

import toast from 'react-hot-toast';
import { ApiError } from '@/types';

// ============================================================================
// TIPOS DE ERRO
// ============================================================================

export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
}

export interface AppError {
  type: ErrorType;
  message: string;
  code?: string;
  details?: unknown;
  timestamp: number;
  stack?: string;
}

// ============================================================================
// CLASSE DE ERRO PERSONALIZADA
// ============================================================================

export class AppErrorClass extends Error {
  public readonly type: ErrorType;
  public readonly code?: string;
  public readonly details?: unknown;
  public readonly timestamp: number;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    code?: string,
    details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.code = code;
    this.details = details;
    this.timestamp = Date.now();

    // Manter o stack trace correto
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppErrorClass);
    }
  }
}

// ============================================================================
// FUNÇÕES DE TRATAMENTO DE ERRO
// ============================================================================

/**
 * Converte um erro desconhecido em AppError
 */
export function normalizeError(error: unknown): AppError {
  if (error instanceof AppErrorClass) {
    return {
      type: error.type,
      message: error.message,
      code: error.code,
      details: error.details,
      timestamp: error.timestamp,
      stack: error.stack,
    };
  }

  if (error instanceof Error) {
    return {
      type: ErrorType.UNKNOWN,
      message: error.message,
      timestamp: Date.now(),
      stack: error.stack,
    };
  }

  if (typeof error === 'string') {
    return {
      type: ErrorType.UNKNOWN,
      message: error,
      timestamp: Date.now(),
    };
  }

  return {
    type: ErrorType.UNKNOWN,
    message: 'Erro desconhecido',
    details: error,
    timestamp: Date.now(),
  };
}

/**
 * Determina o tipo de erro baseado na resposta da API
 */
export function determineErrorType(error: ApiError | Error): ErrorType {
  if ('code' in error) {
    const code = error.code?.toUpperCase();
    
    switch (code) {
      case 'NETWORK_ERROR':
      case 'TIMEOUT':
        return ErrorType.NETWORK;
      case 'VALIDATION_ERROR':
      case 'INVALID_INPUT':
        return ErrorType.VALIDATION;
      case 'UNAUTHORIZED':
      case 'INVALID_CREDENTIALS':
        return ErrorType.AUTHENTICATION;
      case 'FORBIDDEN':
      case 'INSUFFICIENT_PERMISSIONS':
        return ErrorType.AUTHORIZATION;
      case 'NOT_FOUND':
      case 'RESOURCE_NOT_FOUND':
        return ErrorType.NOT_FOUND;
      case 'INTERNAL_SERVER_ERROR':
      case 'SERVICE_UNAVAILABLE':
        return ErrorType.SERVER;
      default:
        return ErrorType.UNKNOWN;
    }
  }

  // Verificar mensagem de erro
  const message = error.message.toLowerCase();
  
  if (message.includes('network') || message.includes('fetch')) {
    return ErrorType.NETWORK;
  }
  
  if (message.includes('validation') || message.includes('invalid')) {
    return ErrorType.VALIDATION;
  }
  
  if (message.includes('unauthorized') || message.includes('authentication')) {
    return ErrorType.AUTHENTICATION;
  }
  
  if (message.includes('forbidden') || message.includes('permission')) {
    return ErrorType.AUTHORIZATION;
  }
  
  if (message.includes('not found') || message.includes('404')) {
    return ErrorType.NOT_FOUND;
  }
  
  if (message.includes('server') || message.includes('500')) {
    return ErrorType.SERVER;
  }

  return ErrorType.UNKNOWN;
}

/**
 * Obtém uma mensagem amigável para o usuário baseada no tipo de erro
 */
export function getErrorMessage(error: AppError): string {
  switch (error.type) {
    case ErrorType.NETWORK:
      return 'Problema de conexão. Verifique sua internet e tente novamente.';
    
    case ErrorType.VALIDATION:
      return error.message || 'Dados inválidos. Verifique as informações e tente novamente.';
    
    case ErrorType.AUTHENTICATION:
      return 'Sessão expirada. Faça login novamente.';
    
    case ErrorType.AUTHORIZATION:
      return 'Você não tem permissão para realizar esta ação.';
    
    case ErrorType.NOT_FOUND:
      return 'Recurso não encontrado.';
    
    case ErrorType.SERVER:
      return 'Erro interno do servidor. Tente novamente mais tarde.';
    
    case ErrorType.UNKNOWN:
    default:
      return error.message || 'Ocorreu um erro inesperado. Tente novamente.';
  }
}

/**
 * Obtém o ícone apropriado para o tipo de erro
 */
export function getErrorIcon(error: AppError): string {
  switch (error.type) {
    case ErrorType.NETWORK:
      return '🌐';
    case ErrorType.VALIDATION:
      return '⚠️';
    case ErrorType.AUTHENTICATION:
      return '🔐';
    case ErrorType.AUTHORIZATION:
      return '🚫';
    case ErrorType.NOT_FOUND:
      return '🔍';
    case ErrorType.SERVER:
      return '⚙️';
    case ErrorType.UNKNOWN:
    default:
      return '❌';
  }
}

/**
 * Obtém a cor apropriada para o tipo de erro
 */
export function getErrorColor(error: AppError): string {
  switch (error.type) {
    case ErrorType.NETWORK:
      return 'text-yellow-600';
    case ErrorType.VALIDATION:
      return 'text-orange-600';
    case ErrorType.AUTHENTICATION:
      return 'text-blue-600';
    case ErrorType.AUTHORIZATION:
      return 'text-red-600';
    case ErrorType.NOT_FOUND:
      return 'text-gray-600';
    case ErrorType.SERVER:
      return 'text-red-600';
    case ErrorType.UNKNOWN:
    default:
      return 'text-red-600';
  }
}

// ============================================================================
// HANDLERS DE ERRO
// ============================================================================

/**
 * Handler para erros de API
 */
export function handleApiError(error: unknown): AppError {
  const normalizedError = normalizeError(error);
  
  // Log do erro para desenvolvimento
  if (import.meta.env.DEV) {
    console.error('API Error:', normalizedError);
  }
  
  return normalizedError;
}

/**
 * Handler para erros de validação
 */
export function handleValidationError(errors: Record<string, string>): AppError {
  const firstError = Object.values(errors)[0];
  
  return {
    type: ErrorType.VALIDATION,
    message: firstError || 'Erro de validação',
    details: errors,
    timestamp: Date.now(),
  };
}

/**
 * Handler para erros de rede
 */
export function handleNetworkError(error: unknown): AppError {
  return {
    type: ErrorType.NETWORK,
    message: 'Erro de conexão',
    details: error,
    timestamp: Date.now(),
  };
}

// ============================================================================
// NOTIFICAÇÕES DE ERRO
// ============================================================================

/**
 * Exibe uma notificação de erro usando toast
 */
export function showErrorNotification(error: AppError): void {
  const message = getErrorMessage(error);
  const icon = getErrorIcon(error);
  
  toast.error(message, {
    icon,
    duration: error.type === ErrorType.NETWORK ? 8000 : 5000,
  });
}

/**
 * Exibe uma notificação de sucesso
 */
export function showSuccessNotification(message: string): void {
  toast.success(message, {
    icon: '✅',
    duration: 3000,
  });
}

/**
 * Exibe uma notificação de aviso
 */
export function showWarningNotification(message: string): void {
  toast(message, {
    icon: '⚠️',
    duration: 4000,
  });
}

/**
 * Exibe uma notificação de informação
 */
export function showInfoNotification(message: string): void {
  toast(message, {
    icon: 'ℹ️',
    duration: 4000,
  });
}

// ============================================================================
// UTILITÁRIOS
// ============================================================================

/**
 * Verifica se um erro é do tipo especificado
 */
export function isErrorType(error: unknown, type: ErrorType): boolean {
  const normalizedError = normalizeError(error);
  return normalizedError.type === type;
}

/**
 * Cria um erro personalizado
 */
export function createError(
  message: string,
  type: ErrorType = ErrorType.UNKNOWN,
  code?: string,
  details?: unknown
): AppErrorClass {
  return new AppErrorClass(message, type, code, details);
}

/**
 * Wrapper para funções assíncronas com tratamento de erro
 */
export async function withErrorHandling<T>(
  asyncFn: () => Promise<T>,
  errorHandler?: (error: AppError) => void
): Promise<T | null> {
  try {
    return await asyncFn();
  } catch (error) {
    const appError = normalizeError(error);
    
    if (errorHandler) {
      errorHandler(appError);
    } else {
      showErrorNotification(appError);
    }
    
    return null;
  }
}

/**
 * Wrapper para funções síncronas com tratamento de erro
 */
export function withSyncErrorHandling<T>(
  syncFn: () => T,
  errorHandler?: (error: AppError) => void
): T | null {
  try {
    return syncFn();
  } catch (error) {
    const appError = normalizeError(error);
    
    if (errorHandler) {
      errorHandler(appError);
    } else {
      showErrorNotification(appError);
    }
    
    return null;
  }
}

// ============================================================================
// CONFIGURAÇÃO GLOBAL DE ERRO
// ============================================================================

/**
 * Configura o handler global de erros não capturados
 */
export function setupGlobalErrorHandler(): void {
  // Handler para erros não capturados
  window.addEventListener('error', (event) => {
    const error = normalizeError(event.error);
    
    if (import.meta.env.DEV) {
      console.error('Uncaught Error:', error);
    }
    
    showErrorNotification(error);
  });

  // Handler para promises rejeitadas
  window.addEventListener('unhandledrejection', (event) => {
    const error = normalizeError(event.reason);
    
    if (import.meta.env.DEV) {
      console.error('Unhandled Promise Rejection:', error);
    }
    
    showErrorNotification(error);
    
    // Prevenir o log padrão do navegador
    event.preventDefault();
  });
}

// ============================================================================
// EXPORTAÇÕES
// ============================================================================

// Todas as exportações já estão feitas individualmente acima
