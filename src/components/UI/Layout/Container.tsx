// ============================================================================
// COMPONENTE: Container - Container Responsivo
// ============================================================================
// Componente base para containers com breakpoints responsivos
// ============================================================================

import React from 'react';
// import { designTokens } from '@/lib/design-tokens';

// Declaração global para JSX
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
export type ContainerPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export interface ContainerProps {
  size?: ContainerSize;
  padding?: ContainerPadding;
  children: React.ReactNode;
  className?: string;
  as?: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const Container: React.FC<ContainerProps> = ({
  size = 'xl',
  padding = 'md',
  children,
  className = '',
  as: Component = 'div',
}) => {
  // ============================================================================
  // CONFIGURAÇÕES DE TAMANHO
  // ============================================================================

  const sizeClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    '2xl': 'max-w-8xl',
    full: 'max-w-full',
  };

  // ============================================================================
  // CONFIGURAÇÕES DE PADDING
  // ============================================================================

  const paddingClasses = {
    none: 'px-0',
    sm: 'px-4',
    md: 'px-6',
    lg: 'px-8',
    xl: 'px-12',
  };

  // ============================================================================
  // CLASSES FINAIS
  // ============================================================================

  const sizeClass = sizeClasses[size];
  const paddingClass = paddingClasses[padding];

  const finalClassName = ['mx-auto', sizeClass, paddingClass, className]
    .filter(Boolean)
    .join(' ');

  // ============================================================================
  // RENDERIZAÇÃO
  // ============================================================================

  return <Component className={finalClassName}>{children}</Component>;
};

export default Container;
