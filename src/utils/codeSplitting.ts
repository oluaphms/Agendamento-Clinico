// ============================================================================
// UTILITÁRIOS DE CODE SPLITTING
// ============================================================================

import { lazy, ComponentType } from 'react';

// Declarações de tipos globais para APIs do navegador
// Declaração global já existe em outros arquivos

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

interface LazyComponentOptions {
  fallback?: ComponentType;
  preload?: boolean;
  chunkName?: string;
}

// ============================================================================
// FUNÇÃO DE LAZY LOADING AVANÇADO
// ============================================================================

export const createLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyComponentOptions = {}
): T => {
  const { preload = false, chunkName } = options;

  // Criar o componente lazy
  const LazyComponent = lazy(importFn);

  // Se preload estiver habilitado, pre-carregar o componente
  if (preload) {
    importFn().catch(() => {
      // Ignorar erros de preload
    });
  }

  // Adicionar nome do chunk para melhor debugging
  if (chunkName) {
    (LazyComponent as any).displayName = `Lazy(${chunkName})`;
  }

  return LazyComponent as unknown as T;
};

// ============================================================================
// PRELOADER DE COMPONENTES
// ============================================================================

export class ComponentPreloader {
  private static preloadedComponents = new Set<string>();

  static async preloadComponent(
    importFn: () => Promise<any>,
    componentName: string
  ): Promise<void> {
    if (this.preloadedComponents.has(componentName)) {
      return;
    }

    try {
      await importFn();
      this.preloadedComponents.add(componentName);
    } catch (error) {
      console.warn(`Failed to preload component ${componentName}:`, error);
    }
  }

  static preloadOnHover(
    importFn: () => Promise<any>,
    componentName: string
  ): () => void {
    return () => {
      this.preloadComponent(importFn, componentName);
    };
  }

  static preloadOnIdle(
    importFn: () => Promise<any>,
    componentName: string,
    timeout: number = 2000
  ): void {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(
        () => {
          this.preloadComponent(importFn, componentName);
        },
        { timeout }
      );
    } else {
      setTimeout(() => {
        this.preloadComponent(importFn, componentName);
      }, timeout);
    }
  }
}

// ============================================================================
// CHUNK LOADER COM RETRY
// ============================================================================

export class ChunkLoader {
  private static retryCount = 3;
  private static retryDelay = 1000;

  static async loadChunk<T>(
    importFn: () => Promise<T>,
    retries: number = this.retryCount
  ): Promise<T> {
    try {
      return await importFn();
    } catch (error) {
      if (retries > 0) {
        console.warn(
          `Chunk load failed, retrying... (${retries} attempts left)`
        );
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.loadChunk(importFn, retries - 1);
      }
      throw error;
    }
  }
}

// ============================================================================
// BUNDLE ANALYZER HELPER
// ============================================================================

export const analyzeBundle = () => {
  if (import.meta.env.DEV) {
    // Adicionar informações de bundle no desenvolvimento
    const scripts = document.querySelectorAll('script[src]');
    const styles = document.querySelectorAll('link[rel="stylesheet"]');

    console.group('📦 Bundle Analysis');
    console.log('Scripts:', scripts.length);
    console.log('Stylesheets:', styles.length);
    console.log(
      'Total size estimate:',
      Array.from(scripts).reduce((total, script) => {
        const src = script.getAttribute('src');
        return total + (src?.includes('chunk') ? 1 : 0);
      }, 0)
    );
    console.groupEnd();
  }
};

// ============================================================================
// LAZY LOADING COM INTERSECTION OBSERVER
// ============================================================================

export const createIntersectionLazy = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: IntersectionObserverInit = {}
): T => {
  const defaultOptions: IntersectionObserverInit = {
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  };

  const LazyComponent = lazy(() => {
    return new Promise<{ default: T }>((resolve, reject) => {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            observer.disconnect();
            importFn().then(resolve).catch(reject);
          }
        });
      }, defaultOptions);

      // Observar um elemento temporário
      const tempElement = document.createElement('div');
      document.body.appendChild(tempElement);
      observer.observe(tempElement);

      // Cleanup após 10 segundos
      setTimeout(() => {
        observer.disconnect();
        document.body.removeChild(tempElement);
      }, 10000);
    });
  });

  return LazyComponent as unknown as T;
};

// ============================================================================
// UTILITÁRIOS DE PERFORMANCE
// ============================================================================

export const measureComponentLoad = (componentName: string) => {
  const startTime = performance.now();

  return () => {
    const endTime = performance.now();
    const loadTime = endTime - startTime;

    if (import.meta.env.DEV) {
      console.log(`🚀 ${componentName} loaded in ${loadTime.toFixed(2)}ms`);
    }

    // Enviar métricas para analytics se disponível
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'component_load', {
        component_name: componentName,
        load_time: Math.round(loadTime),
      });
    }
  };
};

// ============================================================================
// CACHE DE COMPONENTES
// ============================================================================

export class ComponentCache {
  private static cache = new Map<string, any>();

  static get<T>(key: string): T | null {
    return this.cache.get(key) || null;
  }

  static set<T>(key: string, component: T): void {
    this.cache.set(key, component);
  }

  static has(key: string): boolean {
    return this.cache.has(key);
  }

  static clear(): void {
    this.cache.clear();
  }

  static size(): number {
    return this.cache.size;
  }
}
