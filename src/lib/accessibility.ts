// ============================================================================
// UTILITÁRIOS DE ACESSIBILIDADE
// ============================================================================
// Funções e constantes para melhorar a acessibilidade da aplicação
// ============================================================================

// ============================================================================
// CONSTANTES DE ACESSIBILIDADE
// ============================================================================

export const A11Y = {
  // Roles ARIA
  roles: {
    button: 'button',
    link: 'link',
    menu: 'menu',
    menuitem: 'menuitem',
    dialog: 'dialog',
    alert: 'alert',
    alertdialog: 'alertdialog',
    banner: 'banner',
    main: 'main',
    navigation: 'navigation',
    complementary: 'complementary',
    contentinfo: 'contentinfo',
    form: 'form',
    search: 'search',
    region: 'region',
  },

  // Estados ARIA
  states: {
    expanded: 'aria-expanded',
    selected: 'aria-selected',
    checked: 'aria-checked',
    disabled: 'aria-disabled',
    hidden: 'aria-hidden',
    pressed: 'aria-pressed',
    current: 'aria-current',
    live: 'aria-live',
    atomic: 'aria-atomic',
    busy: 'aria-busy',
  },

  // Propriedades ARIA
  properties: {
    label: 'aria-label',
    labelledBy: 'aria-labelledby',
    describedBy: 'aria-describedby',
    controls: 'aria-controls',
    owns: 'aria-owns',
    flowTo: 'aria-flowto',
    posInSet: 'aria-posinset',
    setSize: 'aria-setsize',
    level: 'aria-level',
    sort: 'aria-sort',
    required: 'aria-required',
    invalid: 'aria-invalid',
    hasPopup: 'aria-haspopup',
    expanded: 'aria-expanded',
    selected: 'aria-selected',
    checked: 'aria-checked',
    disabled: 'aria-disabled',
    hidden: 'aria-hidden',
    pressed: 'aria-pressed',
    current: 'aria-current',
    live: 'aria-live',
    atomic: 'aria-atomic',
    busy: 'aria-busy',
  },

  // Níveis de live region
  liveRegions: {
    off: 'off',
    polite: 'polite',
    assertive: 'assertive',
  },

  // Orientação
  orientation: {
    horizontal: 'horizontal',
    vertical: 'vertical',
  },

  // Níveis de heading
  headingLevels: [1, 2, 3, 4, 5, 6] as const,
} as const;

// ============================================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================================

/**
 * Gera um ID único para elementos que precisam de referência ARIA
 */
export function generateAriaId(prefix: string = 'aria'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Cria propriedades ARIA para um elemento de menu
 */
export function createMenuAriaProps(menuId: string, isOpen: boolean) {
  return {
    role: A11Y.roles.menu,
    'aria-expanded': isOpen,
    'aria-controls': menuId,
  };
}

/**
 * Cria propriedades ARIA para um item de menu
 */
export function createMenuItemAriaProps(
  itemId: string,
  isSelected: boolean = false,
  isDisabled: boolean = false
) {
  return {
    role: A11Y.roles.menuitem,
    'aria-selected': isSelected,
    'aria-disabled': isDisabled,
    id: itemId,
  };
}

/**
 * Cria propriedades ARIA para um botão toggle
 */
export function createToggleButtonAriaProps(
  buttonId: string,
  isPressed: boolean,
  controlsId: string
) {
  return {
    'aria-pressed': isPressed,
    'aria-controls': controlsId,
    'aria-expanded': isPressed,
    id: buttonId,
  };
}

/**
 * Cria propriedades ARIA para um modal
 */
export function createModalAriaProps(
  modalId: string,
  titleId: string,
  isOpen: boolean
) {
  return {
    role: A11Y.roles.dialog,
    'aria-modal': true,
    'aria-labelledby': titleId,
    'aria-hidden': !isOpen,
    id: modalId,
  };
}

/**
 * Cria propriedades ARIA para um formulário
 */
export function createFormAriaProps(formId: string, hasErrors: boolean = false) {
  return {
    role: A11Y.roles.form,
    'aria-invalid': hasErrors,
    id: formId,
  };
}

/**
 * Cria propriedades ARIA para um campo de entrada
 */
export function createInputAriaProps(
  inputId: string,
  labelId: string,
  errorId?: string,
  helperTextId?: string
) {
  const describedBy = [errorId, helperTextId].filter(Boolean).join(' ');
  
  return {
    'aria-labelledby': labelId,
    'aria-describedby': describedBy || undefined,
    'aria-invalid': !!errorId,
    id: inputId,
  };
}

/**
 * Cria propriedades ARIA para uma live region
 */
export function createLiveRegionAriaProps(
  liveRegionId: string,
  level: 'off' | 'polite' | 'assertive' = 'polite',
  atomic: boolean = false
) {
  return {
    'aria-live': level,
    'aria-atomic': atomic,
    id: liveRegionId,
  };
}

/**
 * Cria propriedades ARIA para navegação
 */
export function createNavigationAriaProps(navId: string, label: string) {
  return {
    role: A11Y.roles.navigation,
    'aria-label': label,
    id: navId,
  };
}

/**
 * Cria propriedades ARIA para uma lista
 */
export function createListAriaProps(
  listId: string,
  isOrdered: boolean = false,
  label?: string
) {
  return {
    role: isOrdered ? 'list' : 'list',
    'aria-label': label,
    id: listId,
  };
}

/**
 * Cria propriedades ARIA para um item de lista
 */
export function createListItemAriaProps(itemId: string) {
  return {
    role: 'listitem',
    id: itemId,
  };
}

// ============================================================================
// HOOKS DE ACESSIBILIDADE
// ============================================================================

/**
 * Hook para gerenciar foco em modais
 */
export function useModalFocus(modalRef: React.RefObject<HTMLElement>, isOpen: boolean) {
  React.useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (firstElement) {
      firstElement.focus();
    }

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isOpen, modalRef]);
}

/**
 * Hook para gerenciar escape key
 */
export function useEscapeKey(onEscape: () => void) {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onEscape();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onEscape]);
}

/**
 * Hook para gerenciar arrow keys em listas
 */
export function useArrowKeys(
  onArrowUp: () => void,
  onArrowDown: () => void,
  onArrowLeft: () => void,
  onArrowRight: () => void
) {
  React.useEffect(() => {
    const handleArrowKeys = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          onArrowUp();
          break;
        case 'ArrowDown':
          e.preventDefault();
          onArrowDown();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onArrowLeft();
          break;
        case 'ArrowRight':
          e.preventDefault();
          onArrowRight();
          break;
      }
    };

    document.addEventListener('keydown', handleArrowKeys);
    return () => document.removeEventListener('keydown', handleArrowKeys);
  }, [onArrowUp, onArrowDown, onArrowLeft, onArrowRight]);
}

// ============================================================================
// VALIDAÇÕES DE ACESSIBILIDADE
// ============================================================================

/**
 * Valida se um elemento tem contraste adequado
 */
export function validateContrast(foreground: string, background: string): boolean {
  // Implementação simplificada - em produção, use uma biblioteca como color-contrast
  const getLuminance = (color: string) => {
    const rgb = color.match(/\d+/g)?.map(Number) || [0, 0, 0];
    const [r, g, b] = rgb.map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const fgLuminance = getLuminance(foreground);
  const bgLuminance = getLuminance(background);
  const contrast = (Math.max(fgLuminance, bgLuminance) + 0.05) / (Math.min(fgLuminance, bgLuminance) + 0.05);
  
  return contrast >= 4.5; // WCAG AA standard
}

/**
 * Valida se um elemento tem tamanho mínimo para toque
 */
export function validateTouchTarget(size: number): boolean {
  return size >= 44; // 44px é o tamanho mínimo recomendado para targets de toque
}

/**
 * Valida se um elemento tem foco visível
 */
export function validateFocusVisible(element: HTMLElement): boolean {
  const computedStyle = window.getComputedStyle(element);
  const outline = computedStyle.outline;
  const boxShadow = computedStyle.boxShadow;
  
  return outline !== 'none' || boxShadow !== 'none';
}
