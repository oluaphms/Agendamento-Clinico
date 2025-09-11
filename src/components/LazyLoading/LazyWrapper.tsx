// ============================================================================
// COMPONENTE: LazyWrapper - Wrapper para Lazy Loading
// ============================================================================
// Componente wrapper para lazy loading com fallback e error boundary
// ============================================================================

import React, { Suspense, ComponentType, ReactNode } from 'react';
import { ErrorBoundary } from '../ErrorBoundary/ErrorBoundary';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

interface LazyWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  errorFallback?: ReactNode;
}

interface LazyComponentProps {
  component: ComponentType<unknown>;
  fallback?: ReactNode;
  errorFallback?: ReactNode;
  [key: string]: unknown;
}

// ============================================================================
// COMPONENTE DE LOADING PADRÃO
// ============================================================================

const DefaultLoadingFallback: React.FC = () => (
  <div className='flex items-center justify-center min-h-[200px]'>
    <div className='flex flex-col items-center space-y-4'>
      <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500'></div>
      <p className='text-gray-600 dark:text-gray-400 text-sm'>Carregando...</p>
    </div>
  </div>
);

// ============================================================================
// COMPONENTE DE ERRO PADRÃO
// ============================================================================

const DefaultErrorFallback: React.FC<{ error?: Error; retry?: () => void }> = ({
  error,
  retry,
}) => (
  <div className='flex items-center justify-center min-h-[200px]'>
    <div className='text-center'>
      <div className='text-red-500 mb-4'>
        <svg
          className='w-12 h-12 mx-auto'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
          />
        </svg>
      </div>
      <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
        Erro ao carregar componente
      </h3>
      <p className='text-gray-600 dark:text-gray-400 mb-4'>
        {error?.message || 'Ocorreu um erro inesperado'}
      </p>
      {retry && (
        <button
          onClick={retry}
          className='px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors'
        >
          Tentar novamente
        </button>
      )}
    </div>
  </div>
);

// ============================================================================
// WRAPPER PRINCIPAL
// ============================================================================

export const LazyWrapper: React.FC<LazyWrapperProps> = ({
  children,
  fallback = <DefaultLoadingFallback />,
  errorFallback,
}) => {
  return (
    <ErrorBoundary fallback={errorFallback || <DefaultErrorFallback />}>
      <Suspense fallback={fallback}>{children}</Suspense>
    </ErrorBoundary>
  );
};

// ============================================================================
// COMPONENTE LAZY COM WRAPPER
// ============================================================================

export const LazyComponent: React.FC<LazyComponentProps> = ({
  component: Component,
  fallback,
  errorFallback,
  ...props
}) => {
  return (
    <LazyWrapper fallback={fallback} errorFallback={errorFallback}>
      <Component {...props} />
    </LazyWrapper>
  );
};

// ============================================================================
// HOOK PARA LAZY LOADING
// ============================================================================

export const useLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: ReactNode
) => {
  const LazyComponent = React.useMemo(() => React.lazy(importFn), [importFn]);

  return React.useMemo(() => {
    return (props: any) => (
      <LazyWrapper fallback={fallback}>
        <LazyComponent {...props} />
      </LazyWrapper>
    );
  }, [LazyComponent, fallback]);
};

// ============================================================================
// UTILITÁRIOS PARA LAZY LOADING
// ============================================================================

/**
 * Cria um componente lazy com retry automático
 */
export const createLazyWithRetry = <T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>,
  maxRetries: number = 3
) => {
  return React.lazy(() => {
    return new Promise<{ default: T }>((resolve, reject) => {
      let retries = 0;

      const attemptImport = () => {
        importFn()
          .then(resolve)
          .catch(error => {
            retries++;
            if (retries < maxRetries) {
              console.warn(
                `Tentativa ${retries} de carregamento falhou, tentando novamente...`,
                error
              );
              setTimeout(attemptImport, 1000 * retries); // Backoff exponencial
            } else {
              reject(error);
            }
          });
      };

      attemptImport();
    });
  });
};

/**
 * Cria um componente lazy com preload
 */
export const createLazyWithPreload = <T extends ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>
) => {
  const LazyComponent = React.lazy(importFn);

  // Adiciona método de preload
  (LazyComponent as any).preload = importFn;

  return LazyComponent;
};

// ============================================================================
// COMPONENTE DE LOADING PERSONALIZADO
// ============================================================================

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text = 'Carregando...',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  return (
    <div
      className={`flex flex-col items-center justify-center space-y-3 ${className}`}
    >
      <div
        className={`animate-spin rounded-full border-b-2 border-primary-500 ${sizeClasses[size]}`}
      ></div>
      {text && (
        <p className='text-gray-600 dark:text-gray-400 text-sm'>{text}</p>
      )}
    </div>
  );
};

// ============================================================================
// COMPONENTE DE SKELETON LOADING
// ============================================================================

interface SkeletonProps {
  className?: string;
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  lines = 1,
}) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className='h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2'
          style={{
            width: index === lines - 1 ? '75%' : '100%',
          }}
        />
      ))}
    </div>
  );
};

// ============================================================================
// COMPONENTE DE SKELETON PARA CARDS
// ============================================================================

export const CardSkeleton: React.FC = () => (
  <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6'>
    <div className='animate-pulse'>
      <div className='flex items-center space-x-4 mb-4'>
        <div className='h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full'></div>
        <div className='flex-1'>
          <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2'></div>
          <div className='h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2'></div>
        </div>
      </div>
      <div className='space-y-2'>
        <div className='h-3 bg-gray-200 dark:bg-gray-700 rounded'></div>
        <div className='h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6'></div>
        <div className='h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6'></div>
      </div>
    </div>
  </div>
);

// ============================================================================
// COMPONENTE DE SKELETON PARA TABELAS
// ============================================================================

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4,
}) => (
  <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden'>
    <div className='animate-pulse'>
      {/* Header */}
      <div className='px-6 py-4 border-b border-gray-200 dark:border-gray-700'>
        <div
          className='grid gap-4'
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, index) => (
            <div
              key={index}
              className='h-4 bg-gray-200 dark:bg-gray-700 rounded'
            ></div>
          ))}
        </div>
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className='px-6 py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0'
        >
          <div
            className='grid gap-4'
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div
                key={colIndex}
                className='h-3 bg-gray-200 dark:bg-gray-700 rounded'
              ></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ============================================================================
// EXPORTAÇÕES
// ============================================================================

// Todas as exportações já estão feitas individualmente acima
