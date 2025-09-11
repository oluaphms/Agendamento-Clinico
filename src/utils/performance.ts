// ============================================================================
// UTILITÁRIOS DE PERFORMANCE
// ============================================================================

import React from 'react';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

interface PerformanceMetrics {
  componentLoadTime: number;
  renderTime: number;
  memoryUsage: number;
  bundleSize: number;
}

interface PerformanceConfig {
  enableMetrics: boolean;
  enableProfiling: boolean;
  enableMemoryTracking: boolean;
  reportInterval: number;
}

// ============================================================================
// CONFIGURAÇÃO DE PERFORMANCE
// ============================================================================

const defaultConfig: PerformanceConfig = {
  enableMetrics: import.meta.env.DEV,
  enableProfiling: import.meta.env.DEV,
  enableMemoryTracking: import.meta.env.DEV,
  reportInterval: 30000, // 30 segundos
};

// ============================================================================
// PERFORMANCE MONITOR
// ============================================================================

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private config: PerformanceConfig;
  private reportTimer: number | null = null;

  constructor(config: PerformanceConfig = defaultConfig) {
    this.config = config;
    this.startReporting();
  }

  static getInstance(config?: PerformanceConfig): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor(config);
    }
    return PerformanceMonitor.instance;
  }

  // ============================================================================
  // MÉTRICAS DE COMPONENTE
  // ============================================================================

  startComponentTimer(componentName: string): () => void {
    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();

    return () => {
      const endTime = performance.now();
      const endMemory = this.getMemoryUsage();

      const metric: PerformanceMetrics = {
        componentLoadTime: endTime - startTime,
        renderTime: 0, // Será preenchido pelo React Profiler
        memoryUsage: endMemory - startMemory,
        bundleSize: 0, // Será calculado separadamente
      };

      this.recordMetric(componentName, metric);
    };
  }

  // ============================================================================
  // MÉTRICAS DE MEMÓRIA
  // ============================================================================

  private getMemoryUsage(): number {
    if (this.config.enableMemoryTracking && 'memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  // ============================================================================
  // REGISTRO DE MÉTRICAS
  // ============================================================================

  private recordMetric(
    componentName: string,
    metric: PerformanceMetrics
  ): void {
    if (!this.config.enableMetrics) return;

    this.metrics.push(metric);

    if (import.meta.env.DEV) {
      console.log(`📊 ${componentName} Performance:`, {
        loadTime: `${metric.componentLoadTime.toFixed(2)}ms`,
        memoryDelta: `${metric.memoryUsage} bytes`,
      });
    }
  }

  // ============================================================================
  // RELATÓRIOS
  // ============================================================================

  private startReporting(): void {
    if (!this.config.enableMetrics) return;

    this.reportTimer = window.setInterval(() => {
      this.generateReport();
    }, this.config.reportInterval);
  }

  private generateReport(): void {
    if (this.metrics.length === 0) return;

    const avgLoadTime =
      this.metrics.reduce((sum, m) => sum + m.componentLoadTime, 0) /
      this.metrics.length;
    const avgMemoryUsage =
      this.metrics.reduce((sum, m) => sum + m.memoryUsage, 0) /
      this.metrics.length;
    const totalComponents = this.metrics.length;

    const report = {
      totalComponents,
      averageLoadTime: avgLoadTime,
      averageMemoryUsage: avgMemoryUsage,
      timestamp: new Date().toISOString(),
    };

    if (import.meta.env.DEV) {
      console.group('📈 Performance Report');
      console.table(report);
      console.groupEnd();
    }

    // Enviar para analytics se disponível
    this.sendToAnalytics(report);
  }

  private sendToAnalytics(report: any): void {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'performance_report', report);
    }
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  destroy(): void {
    if (this.reportTimer) {
      clearInterval(this.reportTimer);
      this.reportTimer = null;
    }
    this.metrics = [];
  }
}

// ============================================================================
// REACT PROFILER
// ============================================================================

export const withProfiler = <P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
): React.ComponentType<P> => {
  return React.memo((props: P) => {
    const monitor = PerformanceMonitor.getInstance();
    const endTimer = monitor.startComponentTimer(componentName);

    React.useEffect(() => {
      endTimer();
    });

    return React.createElement(Component, props);
  });
};

// ============================================================================
// DEBOUNCE E THROTTLE
// ============================================================================

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate: boolean = false
): T => {
  let timeout: number | null = null;

  return ((...args: Parameters<T>) => {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };

    const callNow = immediate && !timeout;

    if (timeout) clearTimeout(timeout);
    timeout = window.setTimeout(later, wait);

    if (callNow) func(...args);
  }) as T;
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T => {
  let inThrottle: boolean;

  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  }) as T;
};

// ============================================================================
// VIRTUAL SCROLLING
// ============================================================================

export interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export const useVirtualScroll = <T>(
  items: T[],
  options: VirtualScrollOptions
) => {
  const { itemHeight, containerHeight, overscan = 5 } = options;
  const [scrollTop, setScrollTop] = React.useState(0);

  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    startIndex + visibleCount + overscan * 2
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = React.useCallback(
    throttle((e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    }, 16), // ~60fps
    []
  );

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
  };
};

// ============================================================================
// IMAGE LAZY LOADING
// ============================================================================

export const useLazyImage = (src: string, placeholder?: string) => {
  const [imageSrc, setImageSrc] = React.useState(placeholder || '');
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isError, setIsError] = React.useState(false);

  React.useEffect(() => {
    const img = new Image();

    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
    };

    img.onerror = () => {
      setIsError(true);
    };

    img.src = src;
  }, [src]);

  return { imageSrc, isLoaded, isError };
};

// ============================================================================
// BUNDLE SIZE OPTIMIZATION
// ============================================================================

export const optimizeBundle = () => {
  // Remover console.logs em produção
  if (import.meta.env.PROD) {
    console.log = () => {};
    console.warn = () => {};
    console.info = () => {};
  }

  // Preload de recursos críticos
  const preloadCriticalResources = () => {
    const criticalCSS = document.querySelector(
      'link[rel="preload"][as="style"]'
    );
    if (criticalCSS) {
      (criticalCSS as HTMLLinkElement).rel = 'stylesheet';
    }
  };

  // Otimizar fontes
  const optimizeFonts = () => {
    const fontLinks = document.querySelectorAll(
      'link[rel="preload"][as="font"]'
    );
    fontLinks.forEach(link => {
      (link as HTMLLinkElement).crossOrigin = 'anonymous';
    });
  };

  // Executar otimizações
  preloadCriticalResources();
  optimizeFonts();
};

// ============================================================================
// MEMORY LEAK DETECTION
// ============================================================================

export const detectMemoryLeaks = () => {
  if (!import.meta.env.DEV) return;

  const checkMemoryLeaks = () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMB = memory.usedJSHeapSize / 1024 / 1024;
      const totalMB = memory.totalJSHeapSize / 1024 / 1024;

      if (usedMB > 100) {
        // Mais de 100MB
        console.warn('⚠️ High memory usage detected:', {
          used: `${usedMB.toFixed(2)}MB`,
          total: `${totalMB.toFixed(2)}MB`,
        });
      }
    }
  };

  // Verificar a cada 30 segundos
  setInterval(checkMemoryLeaks, 30000);
};

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================

export const initializePerformance = () => {
  const monitor = PerformanceMonitor.getInstance();
  optimizeBundle();
  detectMemoryLeaks();

  return monitor;
};
