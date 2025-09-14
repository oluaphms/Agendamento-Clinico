// ============================================================================
// COMPONENTE: Card - Card Reutilizável
// ============================================================================
// Componente base para cards com header, body e footer
// ============================================================================

import React from 'react';
import { motion } from 'framer-motion';
// import { utilityClasses } from '@/lib/design-tokens';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export type CardVariant = 'default' | 'elevated' | 'outlined';
export type CardSize = 'sm' | 'md' | 'lg';

export interface CardProps {
  variant?: CardVariant;
  size?: CardSize;
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL - CARD
// ============================================================================

const Card: React.FC<CardProps> = ({
  variant = 'default',
  size = 'md',
  children,
  className = '',
  hover = false,
  onClick,
}) => {
  // ============================================================================
  // CONFIGURAÇÕES DE VARIANTE
  // ============================================================================
  
  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700',
    elevated: 'bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700',
    outlined: 'bg-white dark:bg-gray-800 shadow-none border-2 border-gray-200 dark:border-gray-700',
  };

  // ============================================================================
  // CONFIGURAÇÕES DE TAMANHO
  // ============================================================================
  
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  // ============================================================================
  // CLASSES FINAIS
  // ============================================================================
  
  const baseClasses = 'rounded-lg transition-all duration-200';
  const variantClass = variantClasses[variant];
  const sizeClass = sizeClasses[size];
  const hoverClass = hover ? 'hover:shadow-lg hover:scale-105 cursor-pointer' : '';
  const clickableClass = onClick ? 'cursor-pointer' : '';
  
  const finalClassName = [
    baseClasses,
    variantClass,
    sizeClass,
    hoverClass,
    clickableClass,
    className,
  ].filter(Boolean).join(' ');

  // ============================================================================
  // RENDERIZAÇÃO
  // ============================================================================
  
  const CardComponent = (
    <div className={finalClassName} onClick={onClick}>
      {children}
    </div>
  );

  if (hover || onClick) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.1 }}
      >
        {CardComponent}
      </motion.div>
    );
  }

  return CardComponent;
};

// ============================================================================
// COMPONENTE CARD HEADER
// ============================================================================

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  );
};

// ============================================================================
// COMPONENTE CARD BODY
// ============================================================================

export const CardBody: React.FC<CardBodyProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  );
};

// ============================================================================
// COMPONENTE CARD FOOTER
// ============================================================================

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`px-6 py-4 border-t border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
