// ============================================================================
// PROVEDOR DE ACESSIBILIDADE
// ============================================================================

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  FocusManager, 
  initializeAccessibility,
  useReducedMotion,
  useHighContrast,
  useAriaLive,
  announceToScreenReader 
} from '../../utils/accessibility';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

interface AccessibilityContextType {
  // Estados
  isReducedMotion: boolean;
  isHighContrast: boolean;
  focusManager: FocusManager;
  
  // Funções
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  focusElement: (element: HTMLElement) => void;
  focusFirstFocusable: (container: HTMLElement) => void;
  focusLastFocusable: (container: HTMLElement) => void;
  returnFocus: () => void;
  
  // Utilitários
  validateA11y: (element: HTMLElement) => string[];
  generateId: (prefix?: string) => string;
}

// ============================================================================
// CONTEXTO
// ============================================================================

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

// ============================================================================
// PROVEDOR
// ============================================================================

interface AccessibilityProviderProps {
  children: React.ReactNode;
  config?: {
    enableFocusManagement?: boolean;
    enableKeyboardNavigation?: boolean;
    enableScreenReader?: boolean;
    enableHighContrast?: boolean;
    enableReducedMotion?: boolean;
  };
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({
  children,
  config = {},
}) => {
  // ============================================================================
  // ESTADOS
  // ============================================================================
  
  const [focusManager] = useState(() => initializeAccessibility(config));
  const isReducedMotion = useReducedMotion();
  const isHighContrast = useHighContrast();
  const [announceMessage, setAnnounceMessage] = useState<string>('');
  const [announcePriority, setAnnouncePriority] = useState<'polite' | 'assertive'>('polite');

  // ============================================================================
  // HOOKS
  // ============================================================================
  
  useAriaLive(announceMessage, announcePriority);

  // ============================================================================
  // FUNÇÕES
  // ============================================================================
  
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnounceMessage(message);
    setAnnouncePriority(priority);
    announceToScreenReader(message, priority);
    
    // Limpar mensagem após anunciar
    setTimeout(() => {
      setAnnounceMessage('');
    }, 1000);
  };

  const focusElement = (element: HTMLElement) => {
    focusManager.focusElement(element);
  };

  const focusFirstFocusable = (container: HTMLElement) => {
    focusManager.focusFirstFocusable(container);
  };

  const focusLastFocusable = (container: HTMLElement) => {
    focusManager.focusLastFocusable(container);
  };

  const returnFocus = () => {
    focusManager.returnFocus();
  };

  const validateA11y = (element: HTMLElement) => {
    // Implementar validação de acessibilidade
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

    return errors;
  };

  const generateId = (prefix: string = 'id'): string => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // ============================================================================
  // EFEITOS
  // ============================================================================
  
  useEffect(() => {
    // Aplicar classes CSS baseadas nas preferências
    const root = document.documentElement;
    
    if (isReducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
    
    if (isHighContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Cleanup
    return () => {
      root.classList.remove('reduced-motion', 'high-contrast');
    };
  }, [isReducedMotion, isHighContrast]);

  // ============================================================================
  // CONTEXTO
  // ============================================================================
  
  const contextValue: AccessibilityContextType = {
    isReducedMotion,
    isHighContrast,
    focusManager,
    announce,
    focusElement,
    focusFirstFocusable,
    focusLastFocusable,
    returnFocus,
    validateA11y,
    generateId,
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
    </AccessibilityContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  
  return context;
};

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

export const SkipLink: React.FC<{ href: string; children: React.ReactNode }> = ({
  href,
  children,
}) => {
  const { focusElement } = useAccessibility();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.querySelector(href) as HTMLElement;
    if (target) {
      focusElement(target);
    }
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary-500 text-white px-4 py-2 rounded-md z-50"
    >
      {children}
    </a>
  );
};

export const ScreenReaderOnly: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <span className="sr-only">
      {children}
    </span>
  );
};

export const FocusTrap: React.FC<{
  children: React.ReactNode;
  active: boolean;
  returnFocus?: boolean;
}> = ({ children, active, returnFocus = true }) => {
  const { focusFirstFocusable, focusLastFocusable, returnFocus: returnFocusFn } = useAccessibility();
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    focusFirstFocusable(container);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        const focusableElements = container.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
        
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          focusLastFocusable(container);
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          focusFirstFocusable(container);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (returnFocus) {
        returnFocusFn();
      }
    };
  }, [active, focusFirstFocusable, focusLastFocusable, returnFocus, returnFocusFn]);

  return (
    <div ref={containerRef}>
      {children}
    </div>
  );
};

export const A11yAnnouncer: React.FC<{
  message: string;
  priority?: 'polite' | 'assertive';
}> = ({ message, priority = 'polite' }) => {
  const { announce } = useAccessibility();

  useEffect(() => {
    if (message) {
      announce(message, priority);
    }
  }, [message, priority, announce]);

  return null;
};
