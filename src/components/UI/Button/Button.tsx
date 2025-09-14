// ============================================================================
// COMPONENTE: Button - Botão Reutilizável
// ============================================================================
// Componente base para botões com variantes e estados padronizados
// ============================================================================

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { utilityClasses } from '@/lib/design-tokens';
// import { createToggleButtonAriaProps } from '@/lib/accessibility';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonType = 'button' | 'submit' | 'reset';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
  'aria-label'?: string;
  'aria-describedby'?: string;
  'aria-pressed'?: boolean;
  'aria-expanded'?: boolean;
  'aria-controls'?: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    // ============================================================================
    // CONFIGURAÇÕES DE TAMANHO
    // ============================================================================
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    // ============================================================================
    // CONFIGURAÇÕES DE VARIANTE
    // ============================================================================
    
    const variantClasses = {
      primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500',
      secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100',
      success: 'bg-success-600 hover:bg-success-700 text-white focus:ring-success-500',
      warning: 'bg-warning-600 hover:bg-warning-700 text-white focus:ring-warning-500',
      danger: 'bg-danger-600 hover:bg-danger-700 text-white focus:ring-danger-500',
      outline: 'border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700',
    };

    // ============================================================================
    // CLASSES FINAIS
    // ============================================================================
    
    const baseClasses = utilityClasses.button.base;
    const variantClass = variantClasses[variant];
    const sizeClass = sizeClasses[size];
    const widthClass = fullWidth ? 'w-full' : '';
    const disabledClass = (disabled || loading) ? utilityClasses.disabled : '';
    
    const finalClassName = [
      baseClasses,
      variantClass,
      sizeClass,
      widthClass,
      disabledClass,
      className,
    ].filter(Boolean).join(' ');

    // ============================================================================
    // RENDERIZAÇÃO
    // ============================================================================
    
    return (
      <motion.button
        ref={ref}
        type="button"
        className={finalClassName}
        disabled={disabled || loading}
        whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        transition={{ duration: 0.1 }}
        {...(props as any)}
      >
        <div className="flex items-center justify-center gap-2">
          {loading && (
            <motion.div
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          )}
          {!loading && leftIcon && <span>{leftIcon}</span>}
          <span>{children}</span>
          {!loading && rightIcon && <span>{rightIcon}</span>}
        </div>
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
