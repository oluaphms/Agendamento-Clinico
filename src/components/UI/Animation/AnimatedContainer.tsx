// ============================================================================
// COMPONENTE: AnimatedContainer - Container com Animações
// ============================================================================
// Container que aplica animações de entrada e saída
// ============================================================================

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeVariants, slideVariants, scaleVariants, staggerContainer } from '@/lib/animations';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export type AnimationType = 'fade' | 'slide' | 'scale' | 'stagger';
export type AnimationDirection = 'up' | 'down' | 'left' | 'right';

export interface AnimatedContainerProps {
  children: React.ReactNode;
  animation?: AnimationType;
  direction?: AnimationDirection;
  delay?: number;
  duration?: number;
  stagger?: boolean;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  children,
  animation = 'fade',
  direction = 'up',
  delay = 0,
  duration = 0.3,
  stagger = false,
  className = '',
}) => {
  // ============================================================================
  // CONFIGURAÇÕES DE ANIMAÇÃO
  // ============================================================================
  
  const getVariants = () => {
    switch (animation) {
      case 'fade':
        return fadeVariants;
      case 'slide':
        return slideVariants;
      case 'scale':
        return scaleVariants;
      case 'stagger':
        return staggerContainer;
      default:
        return fadeVariants;
    }
  };

  // ============================================================================
  // CONFIGURAÇÕES DE DIREÇÃO
  // ============================================================================
  
  const getDirectionVariants = () => {
    if (animation !== 'slide') return getVariants();
    
    const baseVariants = { ...slideVariants };
    
    switch (direction) {
      case 'up':
        return {
          ...baseVariants,
          hidden: { y: 100, opacity: 0 },
          visible: { y: 0, opacity: 1 },
          exit: { y: -100, opacity: 0 },
        };
      case 'down':
        return {
          ...baseVariants,
          hidden: { y: -100, opacity: 0 },
          visible: { y: 0, opacity: 1 },
          exit: { y: 100, opacity: 0 },
        };
      case 'left':
        return {
          ...baseVariants,
          hidden: { x: 100, opacity: 0 },
          visible: { x: 0, opacity: 1 },
          exit: { x: -100, opacity: 0 },
        };
      case 'right':
        return baseVariants;
      default:
        return baseVariants;
    }
  };

  // ============================================================================
  // CONFIGURAÇÕES DE TRANSIÇÃO
  // ============================================================================
  
  const getTransition = () => ({
    duration,
    delay,
    ease: 'easeOut' as const,
  });

  // ============================================================================
  // RENDERIZAÇÃO
  // ============================================================================
  
  const variants = getDirectionVariants();
  const transition = getTransition();

  if (stagger) {
    return (
      <motion.div
        className={className}
        variants={variants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={transition}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className={className}
        variants={variants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={transition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default AnimatedContainer;
