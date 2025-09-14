// ============================================================================
// COMPONENTE: Icon - Sistema de Ícones Padronizado
// ============================================================================
// Componente base para ícones com tamanhos e cores consistentes
// ============================================================================

import React from 'react';
import { LucideIcon } from 'lucide-react';
// import { designTokens } from '@/lib/design-tokens';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type IconVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';

export interface IconProps {
  icon: LucideIcon;
  size?: IconSize;
  variant?: IconVariant;
  className?: string;
  'aria-label'?: string;
  'aria-hidden'?: boolean;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const Icon: React.FC<IconProps> = ({
  icon: IconComponent,
  size = 'md',
  variant = 'default',
  className = '',
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden = true,
}) => {
  // ============================================================================
  // CONFIGURAÇÕES DE TAMANHO
  // ============================================================================
  
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
    '2xl': 'w-10 h-10',
  };

  // ============================================================================
  // CONFIGURAÇÕES DE VARIANTE
  // ============================================================================
  
  const variantClasses = {
    default: 'text-gray-600 dark:text-gray-400',
    primary: 'text-primary-600 dark:text-primary-400',
    secondary: 'text-secondary-600 dark:text-secondary-400',
    success: 'text-success-600 dark:text-success-400',
    warning: 'text-warning-600 dark:text-warning-400',
    danger: 'text-danger-600 dark:text-danger-400',
    info: 'text-info-600 dark:text-info-400',
  };

  // ============================================================================
  // CLASSES FINAIS
  // ============================================================================
  
  const sizeClass = sizeClasses[size];
  const variantClass = variantClasses[variant];
  
  const finalClassName = [
    sizeClass,
    variantClass,
    'transition-colors duration-200',
    className,
  ].filter(Boolean).join(' ');

  // ============================================================================
  // RENDERIZAÇÃO
  // ============================================================================
  
  return (
    <IconComponent
      className={finalClassName}
      aria-label={ariaLabel}
      aria-hidden={ariaHidden}
    />
  );
};

export default Icon;
