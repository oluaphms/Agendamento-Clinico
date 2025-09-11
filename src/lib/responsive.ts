// ============================================================================
// UTILITÁRIOS DE RESPONSIVIDADE
// ============================================================================
// Funções e hooks para gerenciar responsividade
// ============================================================================

import { useState, useEffect } from 'react';

// ============================================================================
// BREAKPOINTS
// ============================================================================

export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof breakpoints;

// ============================================================================
// HOOKS DE RESPONSIVIDADE
// ============================================================================

/**
 * Hook para detectar o tamanho da tela atual
 */
export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('xs');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      
      if (width >= breakpoints['2xl']) {
        setBreakpoint('2xl');
      } else if (width >= breakpoints.xl) {
        setBreakpoint('xl');
      } else if (width >= breakpoints.lg) {
        setBreakpoint('lg');
      } else if (width >= breakpoints.md) {
        setBreakpoint('md');
      } else if (width >= breakpoints.sm) {
        setBreakpoint('sm');
      } else {
        setBreakpoint('xs');
      }
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return breakpoint;
}

/**
 * Hook para verificar se a tela é maior que um breakpoint específico
 */
export function useIsLargerThan(breakpoint: Breakpoint): boolean {
  const [isLarger, setIsLarger] = useState(false);
  const currentBreakpoint = useBreakpoint();

  useEffect(() => {
    const currentWidth = breakpoints[currentBreakpoint];
    const targetWidth = breakpoints[breakpoint];
    setIsLarger(currentWidth > targetWidth);
  }, [currentBreakpoint, breakpoint]);

  return isLarger;
}

/**
 * Hook para verificar se a tela é menor que um breakpoint específico
 */
export function useIsSmallerThan(breakpoint: Breakpoint): boolean {
  const [isSmaller, setIsSmaller] = useState(false);
  const currentBreakpoint = useBreakpoint();

  useEffect(() => {
    const currentWidth = breakpoints[currentBreakpoint];
    const targetWidth = breakpoints[breakpoint];
    setIsSmaller(currentWidth < targetWidth);
  }, [currentBreakpoint, breakpoint]);

  return isSmaller;
}

/**
 * Hook para verificar se a tela está em um range específico
 */
export function useIsInRange(minBreakpoint: Breakpoint, maxBreakpoint: Breakpoint): boolean {
  const [isInRange, setIsInRange] = useState(false);
  const currentBreakpoint = useBreakpoint();

  useEffect(() => {
    const currentWidth = breakpoints[currentBreakpoint];
    const minWidth = breakpoints[minBreakpoint];
    const maxWidth = breakpoints[maxBreakpoint];
    setIsInRange(currentWidth >= minWidth && currentWidth <= maxWidth);
  }, [currentBreakpoint, minBreakpoint, maxBreakpoint]);

  return isInRange;
}

/**
 * Hook para detectar orientação da tela
 */
export function useOrientation(): 'portrait' | 'landscape' {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const updateOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    
    return () => window.removeEventListener('resize', updateOrientation);
  }, []);

  return orientation;
}

/**
 * Hook para detectar se é dispositivo móvel
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      const width = window.innerWidth;
      const isMobileWidth = width < breakpoints.md;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      setIsMobile(isMobileWidth && isTouchDevice);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
}

/**
 * Hook para detectar se é tablet
 */
export function useIsTablet(): boolean {
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkIsTablet = () => {
      const width = window.innerWidth;
      const isTabletWidth = width >= breakpoints.md && width < breakpoints.lg;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      setIsTablet(isTabletWidth && isTouchDevice);
    };

    checkIsTablet();
    window.addEventListener('resize', checkIsTablet);
    
    return () => window.removeEventListener('resize', checkIsTablet);
  }, []);

  return isTablet;
}

/**
 * Hook para detectar se é desktop
 */
export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkIsDesktop = () => {
      const width = window.innerWidth;
      setIsDesktop(width >= breakpoints.lg);
    };

    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);
    
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

  return isDesktop;
}

// ============================================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================================

/**
 * Verifica se a tela é maior que um breakpoint específico
 */
export function isLargerThan(breakpoint: Breakpoint): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth > breakpoints[breakpoint];
}

/**
 * Verifica se a tela é menor que um breakpoint específico
 */
export function isSmallerThan(breakpoint: Breakpoint): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < breakpoints[breakpoint];
}

/**
 * Verifica se a tela está em um range específico
 */
export function isInRange(minBreakpoint: Breakpoint, maxBreakpoint: Breakpoint): boolean {
  if (typeof window === 'undefined') return false;
  const width = window.innerWidth;
  return width >= breakpoints[minBreakpoint] && width <= breakpoints[maxBreakpoint];
}

/**
 * Obtém o breakpoint atual baseado na largura da tela
 */
export function getCurrentBreakpoint(): Breakpoint {
  if (typeof window === 'undefined') return 'xs';
  
  const width = window.innerWidth;
  
  if (width >= breakpoints['2xl']) return '2xl';
  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  if (width >= breakpoints.sm) return 'sm';
  return 'xs';
}

/**
 * Obtém classes CSS responsivas baseadas no breakpoint
 */
export function getResponsiveClasses(
  classes: Partial<Record<Breakpoint, string>>
): string {
  const currentBreakpoint = getCurrentBreakpoint();
  return classes[currentBreakpoint] || classes.xs || '';
}

/**
 * Cria um objeto de classes CSS responsivas
 */
export function createResponsiveClasses<T extends Record<string, string>>(
  classes: T
): T {
  return classes;
}

// ============================================================================
// CONSTANTES DE RESPONSIVIDADE
// ============================================================================

export const responsive = {
  // Container max-widths
  container: {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    '2xl': 'max-w-8xl',
  },
  
  // Grid columns
  grid: {
    cols: {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
      6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
    },
  },
  
  // Spacing
  spacing: {
    padding: {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-12',
    },
    margin: {
      sm: 'm-4',
      md: 'm-6',
      lg: 'm-8',
      xl: 'm-12',
    },
  },
  
  // Text sizes
  text: {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
  },
} as const;
