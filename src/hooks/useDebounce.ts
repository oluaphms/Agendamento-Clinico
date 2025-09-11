// ============================================================================
// HOOK: useDebounce - Debounce de Valores
// ============================================================================
// Hook para debounce de valores com tipagem e configurações
// ============================================================================

import { useState, useEffect, useRef, useCallback } from 'react';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

interface UseDebounceOptions {
  delay?: number;
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

interface UseDebounceCallbackOptions {
  delay?: number;
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

function useDebounce<T>(
  value: T,
  delay: number = 500,
  options: UseDebounceOptions = {}
): T {
  const { leading = false, trailing = true, maxWait } = options;

  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const maxTimeoutRef = useRef<NodeJS.Timeout>();
  const lastCallTime = useRef<number>();
  const lastInvokeTime = useRef<number>(0);
  const leadingEdge = useRef<boolean>(false);

  const invokeFunc = useCallback((val: T) => {
    setDebouncedValue(val);
    lastInvokeTime.current = Date.now();
  }, []);

  const shouldInvoke = useCallback(
    (time: number) => {
      const timeSinceLastCall = time - (lastCallTime.current || 0);
      const timeSinceLastInvoke = time - lastInvokeTime.current;

      return (
        lastCallTime.current === undefined ||
        timeSinceLastCall >= delay ||
        (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
      );
    },
    [delay, maxWait]
  );

  const leadingEdgeInvoke = useCallback((val: T, time: number) => {
    lastInvokeTime.current = time;
    setDebouncedValue(val);
  }, []);

  const timerExpired = useCallback(
    (val: T, time: number) => {
      const timeSinceLastCall = time - (lastCallTime.current || 0);
      const timeSinceLastInvoke = time - lastInvokeTime.current;

      if (
        timeSinceLastCall >= delay &&
        (maxWait === undefined || timeSinceLastInvoke >= maxWait)
      ) {
        invokeFunc(val);
      }
    },
    [delay, maxWait, invokeFunc]
  );

  useEffect(() => {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastCallTime.current = time;

    if (isInvoking) {
      if (leading && !leadingEdge.current) {
        leadingEdgeInvoke(value, time);
      }
      leadingEdge.current = true;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (isInvoking) {
      if (maxWait !== undefined) {
        if (maxTimeoutRef.current) {
          clearTimeout(maxTimeoutRef.current);
        }
        maxTimeoutRef.current = setTimeout(() => {
          invokeFunc(value);
        }, maxWait);
      }
    } else if (trailing) {
      timeoutRef.current = setTimeout(() => {
        timerExpired(value, Date.now());
      }, delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (maxTimeoutRef.current) {
        clearTimeout(maxTimeoutRef.current);
      }
    };
  }, [
    value,
    delay,
    leading,
    trailing,
    maxWait,
    shouldInvoke,
    leadingEdgeInvoke,
    timerExpired,
    invokeFunc,
  ]);

  return debouncedValue;
}

// ============================================================================
// HOOK PARA DEBOUNCE DE CALLBACK
// ============================================================================

function useDebounceCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500,
  options: UseDebounceCallbackOptions = {}
): T {
  const { leading = false, trailing = true, maxWait } = options;

  const timeoutRef = useRef<NodeJS.Timeout>();
  const maxTimeoutRef = useRef<NodeJS.Timeout>();
  const lastCallTime = useRef<number>();
  const lastInvokeTime = useRef<number>(0);
  const lastArgs = useRef<Parameters<T>>();
  const lastThis = useRef<any>();
  const result = useRef<ReturnType<T>>();
  const leadingEdge = useRef<boolean>(false);

  const invokeFunc = useCallback(
    (time: number) => {
      const args = lastArgs.current;
      const thisArg = lastThis.current;

      lastArgs.current = undefined;
      lastThis.current = undefined;
      lastInvokeTime.current = time;
      result.current = callback.apply(thisArg, args as Parameters<T>);
      return result.current;
    },
    [callback]
  );

  const shouldInvoke = useCallback(
    (time: number) => {
      const timeSinceLastCall = time - (lastCallTime.current || 0);
      const timeSinceLastInvoke = time - lastInvokeTime.current;

      return (
        lastCallTime.current === undefined ||
        timeSinceLastCall >= delay ||
        (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
      );
    },
    [delay, maxWait]
  );

  const leadingEdgeInvoke = useCallback(
    (time: number) => {
      lastInvokeTime.current = time;
      leadingEdge.current = true;
      return invokeFunc(time);
    },
    [invokeFunc]
  );

  const timerExpired = useCallback(
    (time: number) => {
      const timeSinceLastCall = time - (lastCallTime.current || 0);
      const timeSinceLastInvoke = time - lastInvokeTime.current;

      if (
        timeSinceLastCall >= delay &&
        (maxWait === undefined || timeSinceLastInvoke >= maxWait)
      ) {
        return invokeFunc(time);
      }
    },
    [delay, maxWait, invokeFunc]
  );

  const debounced = useCallback(
    function (this: any, ...args: Parameters<T>) {
      const time = Date.now();
      const isInvoking = shouldInvoke(time);

      lastArgs.current = args;
      lastThis.current = this;
      lastCallTime.current = time;

      if (isInvoking) {
        if (leading && !leadingEdge.current) {
          return leadingEdgeInvoke(time);
        }
        leadingEdge.current = true;
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (isInvoking) {
        if (maxWait !== undefined) {
          if (maxTimeoutRef.current) {
            clearTimeout(maxTimeoutRef.current);
          }
          maxTimeoutRef.current = setTimeout(() => {
            invokeFunc(Date.now());
          }, maxWait);
        }
      } else if (trailing) {
        timeoutRef.current = setTimeout(() => {
          timerExpired(Date.now());
        }, delay);
      }

      return result.current;
    } as T,
    [
      delay,
      leading,
      trailing,
      maxWait,
      shouldInvoke,
      leadingEdgeInvoke,
      timerExpired,
      invokeFunc,
    ]
  );

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (maxTimeoutRef.current) {
        clearTimeout(maxTimeoutRef.current);
      }
    };
  }, []);

  return debounced;
}

// ============================================================================
// HOOKS ESPECÍFICOS
// ============================================================================

/**
 * Hook para debounce de busca
 */
function useSearchDebounce(searchTerm: string, delay: number = 300): string {
  return useDebounce(searchTerm, delay);
}

/**
 * Hook para debounce de input
 */
function useInputDebounce(value: string, delay: number = 500): string {
  return useDebounce(value, delay);
}

/**
 * Hook para debounce de scroll
 */
function useScrollDebounce(callback: () => void, delay: number = 100): void {
  const debouncedCallback = useDebounceCallback(callback, delay);

  useEffect(() => {
    const handleScroll = () => {
      debouncedCallback();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [debouncedCallback]);
}

/**
 * Hook para debounce de resize
 */
function useResizeDebounce(callback: () => void, delay: number = 250): void {
  const debouncedCallback = useDebounceCallback(callback, delay);

  useEffect(() => {
    const handleResize = () => {
      debouncedCallback();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [debouncedCallback]);
}

/**
 * Hook para debounce de API calls
 */
function useApiDebounce<T extends (...args: any[]) => Promise<any>>(
  apiCall: T,
  delay: number = 500
): T {
  return useDebounceCallback(apiCall, delay);
}

// ============================================================================
// UTILITÁRIOS
// ============================================================================

/**
 * Cria uma função debounced
 */
function createDebouncedFunction<T extends (...args: any[]) => any>(
  func: T,
  delay: number = 500,
  options: UseDebounceCallbackOptions = {}
): T {
  let timeoutId: NodeJS.Timeout;
  let lastCallTime = 0;
  let lastInvokeTime = 0;
  let lastArgs: Parameters<T>;
  let lastThis: any;
  let result: ReturnType<T>;
  let leadingEdge = false;

  const { leading = false, trailing = true, maxWait } = options;

  const invokeFunc = (time: number) => {
    const args = lastArgs;
    const thisArg = lastThis;

    lastArgs = undefined as any;
    lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  };

  const shouldInvoke = (time: number) => {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;

    return (
      lastCallTime === 0 ||
      timeSinceLastCall >= delay ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    );
  };

  const leadingEdgeInvoke = (time: number) => {
    lastInvokeTime = time;
    leadingEdge = true;
    return invokeFunc(time);
  };

  const timerExpired = (time: number) => {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;

    if (
      timeSinceLastCall >= delay &&
      (maxWait === undefined || timeSinceLastInvoke >= maxWait)
    ) {
      return invokeFunc(time);
    }
  };

  const debounced = function (this: any, ...args: Parameters<T>) {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastArgs = args;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (leading && !leadingEdge) {
        return leadingEdgeInvoke(time);
      }
      leadingEdge = true;
    }

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (isInvoking) {
      if (maxWait !== undefined) {
        setTimeout(() => {
          invokeFunc(Date.now());
        }, maxWait);
      }
    } else if (trailing) {
      timeoutId = setTimeout(() => {
        timerExpired(Date.now());
      }, delay);
    }

    return result;
  } as T;

  return debounced;
}

// ============================================================================
// EXPORTAÇÕES
// ============================================================================

export {
  useDebounce,
  useDebounceCallback,
  useSearchDebounce,
  useInputDebounce,
  useScrollDebounce,
  useResizeDebounce,
  useApiDebounce,
  createDebouncedFunction,
};
