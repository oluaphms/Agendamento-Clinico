// ============================================================================
// COMPONENTE: AnimatedText - Texto com Animações
// ============================================================================
// Componente para animar texto com efeitos especiais
// ============================================================================

import React from 'react';
import { motion } from 'framer-motion';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export type TextAnimation =
  | 'typewriter'
  | 'fadeIn'
  | 'slideUp'
  | 'bounce'
  | 'glow';

export interface AnimatedTextProps {
  children: string;
  animation?: TextAnimation;
  delay?: number;
  duration?: number;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const AnimatedText: React.FC<AnimatedTextProps> = ({
  children,
  animation = 'fadeIn',
  delay = 0,
  duration = 0.5,
  className = '',
}) => {
  // ============================================================================
  // CONFIGURAÇÕES DE ANIMAÇÃO
  // ============================================================================

  const getAnimationProps = () => {
    switch (animation) {
      case 'typewriter':
        return {
          initial: { width: 0 },
          animate: { width: 'auto' },
          transition: {
            duration: duration * children.length * 0.05,
            delay,
            ease: 'easeInOut' as any,
          },
        };

      case 'fadeIn':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: {
            duration,
            delay,
            ease: 'easeOut' as any,
          },
        };

      case 'slideUp':
        return {
          initial: { y: 20, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          transition: {
            duration,
            delay,
            ease: 'easeOut' as any,
          },
        };

      case 'bounce':
        return {
          initial: { y: -20, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          transition: {
            duration,
            delay,
            ease: [0.68, -0.55, 0.265, 1.55],
          },
        };

      case 'glow':
        return {
          initial: { opacity: 0, textShadow: '0 0 0px rgba(59, 130, 246, 0)' },
          animate: {
            opacity: 1,
            textShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
          },
          transition: {
            duration,
            delay,
            ease: 'easeOut' as any,
          },
        };

      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration, delay },
        };
    }
  };

  // ============================================================================
  // RENDERIZAÇÃO
  // ============================================================================

  const animationProps = getAnimationProps();

  if (animation === 'typewriter') {
    return (
      <motion.div
        className={`overflow-hidden whitespace-nowrap ${className}`}
        {...animationProps}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div className={className} {...animationProps}>
      {children}
    </motion.div>
  );
};

export default AnimatedText;
