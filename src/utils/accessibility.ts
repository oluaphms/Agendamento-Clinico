// ============================================================================
// UTILITÁRIOS DE ACESSIBILIDADE
// ============================================================================

import React, { useState, useEffect } from 'react';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

interface A11yConfig {
  enableFocusManagement: boolean;
  enableKeyboardNavigation: boolean;
  enableScreenReader: boolean;
  enableHighContrast: boolean;
  enableReducedMotion: boolean;
}

interface FocusTrapOptions {
  initialFocus?: HTMLElement;
  returnFocus?: boolean;
  escapeDeactivates?: boolean;
}

// ============================================================================
// CONFIGURAÇÃO DE ACESSIBILIDADE
// ============================================================================

const defaultA11yConfig: A11yConfig = {
  enableFocusManagement: true,
  enableKeyboardNavigation: true,
  enableScreenReader: true,
  enableHighContrast: true,
  enableReducedMotion: true,
};

// ============================================================================
// GERENCIADOR DE FOCO
// ============================================================================

export class FocusManager {
  private static instance: FocusManager;
  private focusHistory: HTMLElement[] = [];
  private config: A11yConfig;

  constructor(config: A11yConfig = defaultA11yConfig) {
    this.config = config;
    this.initializeFocusManagement();
  }

  static getInstance(config?: A11yConfig): FocusManager {
    if (!FocusManager.instance) {
      FocusManager.instance = new FocusManager(config);
    }
    return FocusManager.instance;
  }

  // ============================================================================
  // INICIALIZAÇÃO
  // ============================================================================

  private initializeFocusManagement(): void {
    if (!this.config.enableFocusManagement) return;

    // Salvar foco atual
    document.addEventListener('focusin', this.saveFocus.bind(this));

    // Gerenciar navegação por teclado
    if (this.config.enableKeyboardNavigation) {
      document.addEventListener(
        'keydown',
        this.handleKeyboardNavigation.bind(this)
      );
    }
  }

  // ============================================================================
  // GERENCIAMENTO DE FOCO
  // ============================================================================

  private saveFocus(event: FocusEvent): void {
    const target = event.target as HTMLElement;
    if (target && target !== document.body) {
      this.focusHistory.push(target);
      // Manter apenas os últimos 10 elementos
      if (this.focusHistory.length > 10) {
        this.focusHistory.shift();
      }
    }
  }

  focusElement(element: HTMLElement): void {
    if (element && typeof element.focus === 'function') {
      element.focus();
    }
  }

  focusFirstFocusable(container: HTMLElement): void {
    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length > 0) {
      this.focusElement(focusableElements[0]);
    }
  }

  focusLastFocusable(container: HTMLElement): void {
    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length > 0) {
      this.focusElement(focusableElements[focusableElements.length - 1]);
    }
  }

  returnFocus(): void {
    const lastFocused = this.focusHistory[this.focusHistory.length - 1];
    if (lastFocused && document.contains(lastFocused)) {
      this.focusElement(lastFocused);
    }
  }

  // ============================================================================
  // ELEMENTOS FOCÁVEIS
  // ============================================================================

  private getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ');

    return Array.from(
      container.querySelectorAll(focusableSelectors)
    ) as HTMLElement[];
  }

  // ============================================================================
  // NAVEGAÇÃO POR TECLADO
  // ============================================================================

  private handleKeyboardNavigation(event: KeyboardEvent): void {
    const { key, ctrlKey, altKey, shiftKey } = event;

    // Skip links
    if (key === 'Tab' && !shiftKey && !ctrlKey && !altKey) {
      this.handleTabNavigation(event);
    }

    // Escape para fechar modais
    if (key === 'Escape') {
      this.handleEscapeKey();
    }

    // Enter e Space para ativar elementos
    if (key === 'Enter' || key === ' ') {
      this.handleActivation(event);
    }

    // Navegação por setas
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
      this.handleArrowNavigation(event);
    }
  }

  private handleTabNavigation(event: KeyboardEvent): void {
    const activeElement = document.activeElement as HTMLElement;
    const focusableElements = this.getFocusableElements(document.body);
    const currentIndex = focusableElements.indexOf(activeElement);

    if (currentIndex === -1) return;

    // Verificar se está em um modal ou dropdown
    const modal = activeElement.closest('[role="dialog"], [role="menu"]');
    if (modal) {
      this.handleModalTabNavigation(
        event,
        modal as HTMLElement,
        focusableElements,
        currentIndex
      );
    }
  }

  private handleModalTabNavigation(
    event: KeyboardEvent,
    modal: HTMLElement,
    focusableElements: HTMLElement[],
    currentIndex: number
  ): void {
    const modalFocusableElements = this.getFocusableElements(modal);
    const modalStartIndex = focusableElements.indexOf(
      modalFocusableElements[0]
    );
    const modalEndIndex = focusableElements.indexOf(
      modalFocusableElements[modalFocusableElements.length - 1]
    );

    if (event.shiftKey) {
      // Shift + Tab
      if (currentIndex === modalStartIndex) {
        event.preventDefault();
        this.focusElement(
          modalFocusableElements[modalFocusableElements.length - 1]
        );
      }
    } else {
      // Tab
      if (currentIndex === modalEndIndex) {
        event.preventDefault();
        this.focusElement(modalFocusableElements[0]);
      }
    }
  }

  private handleEscapeKey(): void {
    const activeElement = document.activeElement as HTMLElement;
    const modal = activeElement.closest('[role="dialog"]');

    if (modal) {
      const closeButton = modal.querySelector(
        '[aria-label*="close"], [aria-label*="fechar"]'
      ) as HTMLElement;
      if (closeButton) {
        closeButton.click();
      }
    }
  }

  private handleActivation(event: KeyboardEvent): void {
    const activeElement = document.activeElement as HTMLElement;

    // Verificar se o elemento precisa de ativação manual
    if (
      activeElement.getAttribute('role') === 'button' &&
      !activeElement.tagName.toLowerCase().includes('button')
    ) {
      event.preventDefault();
      activeElement.click();
    }
  }

  private handleArrowNavigation(event: KeyboardEvent): void {
    const activeElement = document.activeElement as HTMLElement;
    const container = activeElement.closest(
      '[role="menu"], [role="listbox"], [role="tablist"]'
    );

    if (container) {
      this.handleContainerArrowNavigation(
        event,
        container as HTMLElement,
        activeElement
      );
    }
  }

  private handleContainerArrowNavigation(
    event: KeyboardEvent,
    container: HTMLElement,
    activeElement: HTMLElement
  ): void {
    const items = this.getFocusableElements(container);
    const currentIndex = items.indexOf(activeElement);

    if (currentIndex === -1) return;

    let nextIndex = currentIndex;

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        nextIndex = (currentIndex + 1) % items.length;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        nextIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
        break;
    }

    event.preventDefault();
    this.focusElement(items[nextIndex]);
  }
}

// ============================================================================
// TRAP DE FOCO
// ============================================================================

export const useFocusTrap = (options: FocusTrapOptions = {}) => {
  const containerRef = React.useRef<HTMLElement>(null);
  const previousActiveElement = React.useRef<HTMLElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const focusManager = FocusManager.getInstance();

    // Salvar elemento ativo anterior
    if (options.returnFocus) {
      previousActiveElement.current = document.activeElement as HTMLElement;
    }

    // Focar elemento inicial
    if (options.initialFocus) {
      focusManager.focusElement(options.initialFocus);
    } else {
      focusManager.focusFirstFocusable(container);
    }

    // Cleanup
    return () => {
      if (options.returnFocus && previousActiveElement.current) {
        focusManager.focusElement(previousActiveElement.current);
      }
    };
  }, [options.initialFocus, options.returnFocus]);

  return containerRef;
};

// ============================================================================
// HOOKS DE ACESSIBILIDADE
// ============================================================================

export const useAriaLive = (
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
) => {
  useEffect(() => {
    if (!message) return;

    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.position = 'absolute';
    liveRegion.style.left = '-10000px';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.overflow = 'hidden';

    document.body.appendChild(liveRegion);
    liveRegion.textContent = message;

    // Cleanup após 1 segundo
    const timer = setTimeout(() => {
      document.body.removeChild(liveRegion);
    }, 1000);

    return () => {
      clearTimeout(timer);
      if (document.body.contains(liveRegion)) {
        document.body.removeChild(liveRegion);
      }
    };
  }, [message, priority]);
};

export const useKeyboardShortcut = (
  key: string,
  callback: (event: KeyboardEvent) => void,
  dependencies: React.DependencyList = []
) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === key) {
        callback(event);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, dependencies);
};

export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};

export const useHighContrast = () => {
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setPrefersHighContrast(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersHighContrast(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersHighContrast;
};

// ============================================================================
// UTILITÁRIOS DE ARIA
// ============================================================================

export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

export const getAriaLabel = (element: HTMLElement): string => {
  return (
    element.getAttribute('aria-label') ||
    element.getAttribute('aria-labelledby') ||
    element.textContent?.trim() ||
    element.getAttribute('title') ||
    ''
  );
};

export const announceToScreenReader = (
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void => {
  const liveRegion = document.createElement('div');
  liveRegion.setAttribute('aria-live', priority);
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.className = 'sr-only';
  liveRegion.textContent = message;

  document.body.appendChild(liveRegion);

  // Remover após anunciar
  setTimeout(() => {
    document.body.removeChild(liveRegion);
  }, 1000);
};

// ============================================================================
// VALIDAÇÃO DE ACESSIBILIDADE
// ============================================================================

export const validateA11y = (element: HTMLElement): string[] => {
  const errors: string[] = [];

  // Verificar alt text em imagens
  const images = element.querySelectorAll('img');
  images.forEach((img, index) => {
    if (!img.getAttribute('alt') && !img.getAttribute('aria-label')) {
      errors.push(`Image ${index + 1} missing alt text`);
    }
  });

  // Verificar labels em inputs
  const inputs = element.querySelectorAll('input, select, textarea');
  inputs.forEach((input, index) => {
    const id = input.getAttribute('id');
    const ariaLabel = input.getAttribute('aria-label');
    const ariaLabelledby = input.getAttribute('aria-labelledby');
    const label = id ? element.querySelector(`label[for="${id}"]`) : null;

    if (!ariaLabel && !ariaLabelledby && !label) {
      errors.push(`Input ${index + 1} missing label`);
    }
  });

  // Verificar contraste de cores
  const elements = element.querySelectorAll('*');
  elements.forEach((el, index) => {
    const styles = window.getComputedStyle(el);
    const color = styles.color;
    const backgroundColor = styles.backgroundColor;

    if (color && backgroundColor && color !== backgroundColor) {
      // Verificação básica de contraste (simplificada)
      const contrastRatio = getContrastRatio(color, backgroundColor);
      if (contrastRatio < 4.5) {
        errors.push(
          `Element ${index + 1} has low contrast ratio: ${contrastRatio.toFixed(2)}`
        );
      }
    }
  });

  return errors;
};

const getContrastRatio = (color1: string, color2: string): number => {
  // Implementação simplificada - em produção, usar uma biblioteca especializada
  const luminance1 = getLuminance(color1);
  const luminance2 = getLuminance(color2);
  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);
  return (lighter + 0.05) / (darker + 0.05);
};

const getLuminance = (color: string): number => {
  // Implementação simplificada
  const rgb = color.match(/\d+/g);
  if (!rgb || rgb.length < 3) return 0;

  const [r, g, b] = rgb.map(Number);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================

export const initializeAccessibility = (config?: A11yConfig): FocusManager => {
  const focusManager = FocusManager.getInstance(config);

  // Adicionar estilos para screen readers
  const style = document.createElement('style');
  style.textContent = `
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
    
    .focus-visible {
      outline: 2px solid #0066cc;
      outline-offset: 2px;
    }
    
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  `;
  document.head.appendChild(style);

  return focusManager;
};
