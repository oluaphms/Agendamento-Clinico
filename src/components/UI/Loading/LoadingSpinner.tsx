// ============================================================================
// COMPONENTE: LoadingSpinner - Spinner de Carregamento
// ============================================================================
// Componente reutilizável para indicadores de carregamento
// ============================================================================

import React from 'react';
import { motion } from 'framer-motion';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export type LoadingSize = 'sm' | 'md' | 'lg' | 'xl';
export type LoadingVariant = 'spinner' | 'dots' | 'pulse' | 'bars';

export interface LoadingSpinnerProps {
  size?: LoadingSize;
  variant?: LoadingVariant;
  color?: string;
  className?: string;
  text?: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'spinner',
  color = 'currentColor',
  className = '',
  text,
}) => {
  // ============================================================================
  // CONFIGURAÇÕES DE TAMANHO
  // ============================================================================
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  // ============================================================================
  // RENDERIZAÇÃO POR VARIANTE
  // ============================================================================
  
  const renderSpinner = () => (
    <motion.div
      className={`${sizeClasses[size]} border-2 border-current border-t-transparent rounded-full`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      style={{ color }}
    />
  );

  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={`${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'} rounded-full`}
          style={{ backgroundColor: color }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: index * 0.2,
          }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <motion.div
      className={`${sizeClasses[size]} rounded-full`}
      style={{ backgroundColor: color }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );

  const renderBars = () => (
    <div className="flex space-x-1">
      {[0, 1, 2, 3].map((index) => (
        <motion.div
          key={index}
          className={`${size === 'sm' ? 'w-1' : size === 'md' ? 'w-2' : 'w-3'} ${sizeClasses[size]}`}
          style={{ backgroundColor: color }}
          animate={{
            scaleY: [1, 2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: index * 0.1,
          }}
        />
      ))}
    </div>
  );

  // ============================================================================
  // RENDERIZAÇÃO PRINCIPAL
  // ============================================================================
  
  const renderLoading = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'bars':
        return renderBars();
      default:
        return renderSpinner();
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {renderLoading()}
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 text-sm text-gray-600 dark:text-gray-400"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

export default LoadingSpinner;
