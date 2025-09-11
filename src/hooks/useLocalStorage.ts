// ============================================================================
// HOOK: useLocalStorage - Gerenciamento de Local Storage
// ============================================================================
// Hook para gerenciar dados no localStorage com tipagem e sincronização
// ============================================================================

import { useState, useEffect, useCallback } from 'react';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

type SetValue<T> = T | ((val: T) => T);

interface UseLocalStorageOptions {
  serializer?: {
    parse: (value: string) => unknown;
    stringify: (value: unknown) => string;
  };
  syncAcrossTabs?: boolean;
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions = {}
) {
  const {
    serializer = JSON,
    syncAcrossTabs = true,
  } = options;

  // Estado para armazenar o valor
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (serializer.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Erro ao ler localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Função para atualizar o valor
  const setValue = useCallback(
    (value: SetValue<T>) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, serializer.stringify(valueToStore));
      } catch (error) {
        console.warn(`Erro ao salvar no localStorage key "${key}":`, error);
      }
    },
    [key, serializer, storedValue]
  );

  // Função para remover o valor
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`Erro ao remover do localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Sincronização entre abas
  useEffect(() => {
    if (!syncAcrossTabs) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(serializer.parse(e.newValue) as T);
        } catch (error) {
          console.warn(`Erro ao sincronizar localStorage key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, serializer, syncAcrossTabs]);

  return [storedValue, setValue, removeValue] as const;
}

// ============================================================================
// HOOKS ESPECÍFICOS
// ============================================================================

/**
 * Hook para gerenciar preferências do usuário
 */
export function useUserPreferences() {
  const [preferences, setPreferences, removePreferences] = useLocalStorage(
    'user-preferences',
    {
      theme: 'dark' as 'light' | 'dark' | 'auto',
      language: 'pt-BR',
      notifications: true,
      sidebarCollapsed: false,
      compactMode: false,
    }
  );

  const updatePreference = useCallback(
    <K extends keyof typeof preferences>(
      key: K,
      value: typeof preferences[K]
    ) => {
      setPreferences(prev => ({ ...prev, [key]: value }));
    },
    [setPreferences]
  );

  return {
    preferences,
    updatePreference,
    removePreferences,
  };
}

/**
 * Hook para gerenciar histórico de navegação
 */
export function useNavigationHistory() {
  const [history, setHistory, removeHistory] = useLocalStorage(
    'navigation-history',
    [] as string[]
  );

  const addToHistory = useCallback(
    (path: string) => {
      setHistory(prev => {
        const newHistory = [path, ...prev.filter(p => p !== path)];
        return newHistory.slice(0, 10); // Manter apenas os últimos 10
      });
    },
    [setHistory]
  );

  const clearHistory = useCallback(() => {
    removeHistory();
  }, [removeHistory]);

  return {
    history,
    addToHistory,
    clearHistory,
  };
}

/**
 * Hook para gerenciar favoritos
 */
export function useFavorites() {
  const [favorites, setFavorites, removeFavorites] = useLocalStorage(
    'favorites',
    [] as string[]
  );

  const addFavorite = useCallback(
    (item: string) => {
      setFavorites(prev => [...prev.filter(f => f !== item), item]);
    },
    [setFavorites]
  );

  const removeFavorite = useCallback(
    (item: string) => {
      setFavorites(prev => prev.filter(f => f !== item));
    },
    [setFavorites]
  );

  const isFavorite = useCallback(
    (item: string) => favorites.includes(item),
    [favorites]
  );

  const toggleFavorite = useCallback(
    (item: string) => {
      if (isFavorite(item)) {
        removeFavorite(item);
      } else {
        addFavorite(item);
      }
    },
    [isFavorite, removeFavorite, addFavorite]
  );

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
    clearFavorites: removeFavorites,
  };
}

/**
 * Hook para gerenciar cache de dados
 */
export function useDataCache<T>(key: string, ttl: number = 5 * 60 * 1000) {
  const [cache, setCache, removeCache] = useLocalStorage(
    `cache-${key}`,
    {
      data: null as T | null,
      timestamp: 0,
    }
  );

  const setCachedData = useCallback(
    (data: T) => {
      setCache({
        data,
        timestamp: Date.now(),
      });
    },
    [setCache]
  );

  const getCachedData = useCallback((): T | null => {
    if (!cache.data || !cache.timestamp) return null;
    
    const isExpired = Date.now() - cache.timestamp > ttl;
    if (isExpired) {
      removeCache();
      return null;
    }
    
    return cache.data;
  }, [cache, ttl, removeCache]);

  const clearCache = useCallback(() => {
    removeCache();
  }, [removeCache]);

  return {
    getCachedData,
    setCachedData,
    clearCache,
    isExpired: cache.timestamp ? Date.now() - cache.timestamp > ttl : true,
  };
}

/**
 * Hook para gerenciar formulários com persistência
 */
export function usePersistentForm<T extends Record<string, unknown>>(
  key: string,
  initialValues: T
) {
  const [formData, setFormData, clearFormData] = useLocalStorage(
    `form-${key}`,
    initialValues
  );

  const updateField = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    },
    [setFormData]
  );

  const updateFields = useCallback(
    (fields: Partial<T>) => {
      setFormData(prev => ({ ...prev, ...fields }));
    },
    [setFormData]
  );

  const resetForm = useCallback(() => {
    setFormData(initialValues);
  }, [setFormData, initialValues]);

  const clearForm = useCallback(() => {
    clearFormData();
  }, [clearFormData]);

  return {
    formData,
    updateField,
    updateFields,
    resetForm,
    clearForm,
  };
}

// ============================================================================
// UTILITÁRIOS
// ============================================================================

/**
 * Verifica se o localStorage está disponível
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__';
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Obtém o tamanho usado pelo localStorage
 */
export function getLocalStorageSize(): number {
  let total = 0;
  for (const key in window.localStorage) {
    if (window.localStorage.hasOwnProperty(key)) {
      total += window.localStorage[key].length + key.length;
    }
  }
  return total;
}

/**
 * Limpa todos os dados do localStorage
 */
export function clearAllLocalStorage(): void {
  window.localStorage.clear();
}

/**
 * Obtém todas as chaves do localStorage
 */
export function getAllLocalStorageKeys(): string[] {
  return Object.keys(window.localStorage);
}

// ============================================================================
// EXPORTAÇÕES
// ============================================================================

export {
  useLocalStorage,
  useUserPreferences,
  useNavigationHistory,
  useFavorites,
  useDataCache,
  usePersistentForm,
  isLocalStorageAvailable,
  getLocalStorageSize,
  clearAllLocalStorage,
  getAllLocalStorageKeys,
};