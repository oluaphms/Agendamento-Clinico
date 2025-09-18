// ============================================================================
// COMPONENTE: Grid - Sistema de Grid Responsivo
// ============================================================================
// Sistema de grid flexível com breakpoints responsivos
// ============================================================================

import React from 'react';

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

export type GridCols = 1 | 2 | 3 | 4 | 5 | 6 | 12;
export type GridGap = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export interface GridProps {
  cols?: GridCols;
  gap?: GridGap;
  children: React.ReactNode;
  className?: string;
  as?: string;
  md?: GridCols;
  lg?: GridCols;
}

export interface GridItemProps {
  colSpan?: GridCols;
  className?: string;
  children: React.ReactNode;
  as?: string;
}

// ============================================================================
// COMPONENTE GRID
// ============================================================================

const Grid: React.FC<GridProps> = ({
  cols = 1,
  gap = 'md',
  children,
  className = '',
  as: Component = 'div',
}) => {
  // ============================================================================
  // CONFIGURAÇÕES DE COLUNAS
  // ============================================================================

  const colsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
    12: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6',
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

  const colsClass = colsClasses[cols];
  const gapClass = gapClasses[gap];

  const finalClassName = ['grid', colsClass, gapClass, className]
    .filter(Boolean)
    .join(' ');

  // ============================================================================
  // RENDERIZAÇÃO
  // ============================================================================

  return React.createElement(
    Component as any,
    { className: finalClassName },
    children
  );
};

// ============================================================================
// COMPONENTE GRID ITEM
// ============================================================================

export const GridItem: React.FC<GridItemProps> = ({
  colSpan = 1,
  children,
  className = '',
  as: Component = 'div',
}) => {
  // ============================================================================
  // CONFIGURAÇÕES DE COLSPAN
  // ============================================================================

  const colSpanClasses = {
    1: 'col-span-1',
    2: 'col-span-1 md:col-span-2',
    3: 'col-span-1 md:col-span-2 lg:col-span-3',
    4: 'col-span-1 md:col-span-2 lg:col-span-4',
    5: 'col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-5',
    6: 'col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-6',
    12: 'col-span-full',
  };

  // ============================================================================
  // CLASSES FINAIS
  // ============================================================================

  const colSpanClass = colSpanClasses[colSpan];

  const finalClassName = [colSpanClass, className].filter(Boolean).join(' ');

  // ============================================================================
  // RENDERIZAÇÃO
  // ============================================================================

  return React.createElement(
    Component as any,
    { className: finalClassName },
    children
  );
};

export default Grid;
