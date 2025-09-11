// ============================================================================
// COMPONENTE: Flex - Sistema de Flexbox Responsivo
// ============================================================================
// Componente flexível com direção, alinhamento e espaçamento responsivos
// ============================================================================

import React from 'react';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export type FlexDirection = 'row' | 'col' | 'row-reverse' | 'col-reverse';
export type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';
export type FlexJustify = 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
export type FlexAlign = 'start' | 'end' | 'center' | 'baseline' | 'stretch';
export type FlexGap = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export interface FlexProps {
  direction?: FlexDirection;
  wrap?: FlexWrap;
  justify?: FlexJustify;
  align?: FlexAlign;
  gap?: FlexGap;
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const Flex: React.FC<FlexProps> = ({
  direction = 'row',
  wrap = 'nowrap',
  justify = 'start',
  align = 'start',
  gap = 'none',
  children,
  className = '',
  as: Component = 'div',
}) => {
  // ============================================================================
  // CONFIGURAÇÕES DE DIREÇÃO
  // ============================================================================
  
  const directionClasses = {
    row: 'flex-row',
    col: 'flex-col',
    'row-reverse': 'flex-row-reverse',
    'col-reverse': 'flex-col-reverse',
  };

  // ============================================================================
  // CONFIGURAÇÕES DE WRAP
  // ============================================================================
  
  const wrapClasses = {
    nowrap: 'flex-nowrap',
    wrap: 'flex-wrap',
    'wrap-reverse': 'flex-wrap-reverse',
  };

  // ============================================================================
  // CONFIGURAÇÕES DE JUSTIFY
  // ============================================================================
  
  const justifyClasses = {
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };

  // ============================================================================
  // CONFIGURAÇÕES DE ALIGN
  // ============================================================================
  
  const alignClasses = {
    start: 'items-start',
    end: 'items-end',
    center: 'items-center',
    baseline: 'items-baseline',
    stretch: 'items-stretch',
  };

  // ============================================================================
  // CONFIGURAÇÕES DE GAP
  // ============================================================================
  
  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  };

  // ============================================================================
  // CLASSES FINAIS
  // ============================================================================
  
  const directionClass = directionClasses[direction];
  const wrapClass = wrapClasses[wrap];
  const justifyClass = justifyClasses[justify];
  const alignClass = alignClasses[align];
  const gapClass = gapClasses[gap];
  
  const finalClassName = [
    'flex',
    directionClass,
    wrapClass,
    justifyClass,
    alignClass,
    gapClass,
    className,
  ].filter(Boolean).join(' ');

  // ============================================================================
  // RENDERIZAÇÃO
  // ============================================================================
  
  return (
    <Component className={finalClassName}>
      {children}
    </Component>
  );
};

export default Flex;
