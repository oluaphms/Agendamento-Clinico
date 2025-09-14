// ============================================================================
// COMPONENTE: Input - Campo de Entrada Reutilizável
// ============================================================================
// Componente base para campos de entrada com validação e estados
// ============================================================================

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { utilityClasses } from '@/lib/design-tokens';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export type InputVariant = 'default' | 'error' | 'success';
export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: InputVariant;
  size?: InputSize;
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = 'default',
      size = 'md',
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = true,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    // ============================================================================
    // CONFIGURAÇÕES DE TAMANHO
    // ============================================================================
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-3 py-2 text-base',
      lg: 'px-4 py-3 text-lg',
    };

    // ============================================================================
    // CONFIGURAÇÕES DE VARIANTE
    // ============================================================================
    
    const variantClasses = {
      default: 'border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:border-gray-600',
      error: 'border-danger-500 focus:ring-danger-500 focus:border-danger-500',
      success: 'border-success-500 focus:ring-success-500 focus:border-success-500',
    };

    // ============================================================================
    // CLASSES FINAIS
    // ============================================================================
    
    const baseClasses = utilityClasses.input;
    const variantClass = variantClasses[variant];
    const sizeClass = sizeClasses[size];
    const widthClass = fullWidth ? 'w-full' : '';
    const iconPadding = leftIcon ? 'pl-10' : rightIcon ? 'pr-10' : '';
    
    const finalClassName = [
      baseClasses,
      variantClass,
      sizeClass,
      widthClass,
      iconPadding,
      className,
    ].filter(Boolean).join(' ');

    // ============================================================================
    // ID GERADO AUTOMATICAMENTE
    // ============================================================================
    
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    // ============================================================================
    // RENDERIZAÇÃO
    // ============================================================================
    
    return (
      <div className={fullWidth ? 'w-full' : 'inline-block'}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {label}
          </label>
        )}

        {/* Container do Input */}
        <div className="relative">
          {/* Ícone Esquerdo */}
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400 dark:text-gray-500">
                {leftIcon}
              </span>
            </div>
          )}

          {/* Input */}
          <motion.input
            ref={ref}
            id={inputId}
            className={finalClassName}
            whileFocus={{ scale: 1.01 }}
            transition={{ duration: 0.1 }}
            {...(props as any)}
          />

          {/* Ícone Direito */}
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-400 dark:text-gray-500">
                {rightIcon}
              </span>
            </div>
          )}
        </div>

        {/* Mensagem de Erro */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 text-sm text-danger-600 dark:text-danger-400"
          >
            {error}
          </motion.p>
        )}

        {/* Texto de Ajuda */}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
