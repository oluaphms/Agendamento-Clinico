// ============================================================================
// HOOK: useAsync - Gerenciamento de Operações Assíncronas
// ============================================================================
// Hook customizado para gerenciar estados de operações assíncronas
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseAsyncOptions {
  immediate?: boolean;
  onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export function useAsync<T>(
  asyncFunction: (...args: unknown[]) => Promise<T>,
  options: UseAsyncOptions = {}
) {
  const {
    immediate = false,
    onSuccess,
    onError,
  } = options;

  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const isMountedRef = useRef(true);

  // ============================================================================
  // FUNÇÃO PARA EXECUTAR OPERAÇÃO ASSÍNCRONA
  // ============================================================================
  
  const execute = useCallback(
    async (...args: unknown[]) => {
      if (!isMountedRef.current) return;

      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const result = await asyncFunction(...args);
        
        if (isMountedRef.current) {
          setState({
            data: result,
            loading: false,
            error: null,
          });
          
          onSuccess?.(result);
        }
        
        return result;
      } catch (error) {
        if (isMountedRef.current) {
          const errorObj = error instanceof Error ? error : new Error(String(error));
          
          setState({
            data: null,
            loading: false,
            error: errorObj,
          });
          
          onError?.(errorObj);
        }
        
        throw error;
      }
    },
    [asyncFunction, onSuccess, onError]
  );

  // ============================================================================
  // FUNÇÃO PARA RESETAR ESTADO
  // ============================================================================
  
  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  // ============================================================================
  // EXECUÇÃO IMEDIATA
  // ============================================================================
  
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  // ============================================================================
  // CLEANUP
  // ============================================================================
  
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // ============================================================================
  // RETORNO
  // ============================================================================
  
  return {
    ...state,
    execute,
    reset,
  };
}
