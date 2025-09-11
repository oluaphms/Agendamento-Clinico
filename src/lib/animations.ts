// ============================================================================
// SISTEMA DE ANIMAÇÕES
// ============================================================================
// Configurações centralizadas para animações e transições
// ============================================================================

import { Variants } from 'framer-motion';

// ============================================================================
// CONFIGURAÇÕES DE TRANSIÇÃO
// ============================================================================

export const transitions = {
  // Transições básicas
  fast: { duration: 0.15, ease: 'easeInOut' },
  normal: { duration: 0.3, ease: 'easeInOut' },
  slow: { duration: 0.5, ease: 'easeInOut' },
  
  // Transições com bounce
  bounce: { duration: 0.4, ease: [0.68, -0.55, 0.265, 1.55] },
  elastic: { duration: 0.6, ease: [0.175, 0.885, 0.32, 1.275] },
  
  // Transições de entrada
  slideIn: { duration: 0.3, ease: 'easeOut' },
  fadeIn: { duration: 0.2, ease: 'easeOut' },
  scaleIn: { duration: 0.2, ease: 'easeOut' },
  
  // Transições de saída
  slideOut: { duration: 0.2, ease: 'easeIn' },
  fadeOut: { duration: 0.15, ease: 'easeIn' },
  scaleOut: { duration: 0.15, ease: 'easeIn' },
} as const;

// ============================================================================
// VARIANTS DE ANIMAÇÃO
// ============================================================================

// Fade in/out
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

// Slide in/out
export const slideVariants: Variants = {
  hidden: { x: -100, opacity: 0 },
  visible: { x: 0, opacity: 1 },
  exit: { x: 100, opacity: 0 },
};

// Slide up/down
export const slideUpVariants: Variants = {
  hidden: { y: 100, opacity: 0 },
  visible: { y: 0, opacity: 1 },
  exit: { y: -100, opacity: 0 },
};

// Scale in/out
export const scaleVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1 },
  exit: { scale: 0, opacity: 0 },
};

// Rotate in/out
export const rotateVariants: Variants = {
  hidden: { rotate: -180, opacity: 0 },
  visible: { rotate: 0, opacity: 1 },
  exit: { rotate: 180, opacity: 0 },
};

// Stagger children
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: transitions.normal,
  },
};

// ============================================================================
// ANIMAÇÕES DE HOVER
// ============================================================================

export const hoverVariants = {
  // Hover básico
  basic: {
    scale: 1.05,
    transition: transitions.fast,
  },
  
  // Hover com elevação
  lift: {
    y: -2,
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
    transition: transitions.fast,
  },
  
  // Hover com rotação
  rotate: {
    rotate: 5,
    transition: transitions.fast,
  },
  
  // Hover com brilho
  glow: {
    boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
    transition: transitions.fast,
  },
};

// ============================================================================
// ANIMAÇÕES DE TAP
// ============================================================================

export const tapVariants = {
  // Tap básico
  basic: {
    scale: 0.95,
    transition: transitions.fast,
  },
  
  // Tap com bounce
  bounce: {
    scale: 0.9,
    transition: transitions.bounce,
  },
  
  // Tap com ripple
  ripple: {
    scale: 0.95,
    transition: {
      duration: 0.1,
      ease: 'easeOut',
    },
  },
};

// ============================================================================
// ANIMAÇÕES DE LOADING
// ============================================================================

export const loadingVariants = {
  // Spinner
  spinner: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
  
  // Pulse
  pulse: {
    scale: [1, 1.1, 1],
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
  
  // Bounce
  bounce: {
    y: [0, -10, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
  
  // Wave
  wave: {
    scaleY: [1, 1.5, 1],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// ============================================================================
// ANIMAÇÕES DE MODAL
// ============================================================================

export const modalVariants = {
  // Overlay
  overlay: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  },
  
  // Modal content
  content: {
    hidden: { 
      opacity: 0, 
      scale: 0.95, 
      y: 20 
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: transitions.normal,
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      y: 20,
      transition: transitions.fast,
    },
  },
};

// ============================================================================
// ANIMAÇÕES DE NOTIFICAÇÃO
// ============================================================================

export const notificationVariants = {
  hidden: { 
    x: 300, 
    opacity: 0 
  },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: transitions.bounce,
  },
  exit: { 
    x: 300, 
    opacity: 0,
    transition: transitions.fast,
  },
};

// ============================================================================
// ANIMAÇÕES DE MENU
// ============================================================================

export const menuVariants = {
  hidden: { 
    x: -300, 
    opacity: 0 
  },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: transitions.slideIn,
  },
  exit: { 
    x: -300, 
    opacity: 0,
    transition: transitions.slideOut,
  },
};

// ============================================================================
// ANIMAÇÕES DE CARD
// ============================================================================

export const cardVariants = {
  hidden: { 
    y: 20, 
    opacity: 0 
  },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: transitions.normal,
  },
  hover: {
    y: -5,
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
    transition: transitions.fast,
  },
};

// ============================================================================
// ANIMAÇÕES DE FORM
// ============================================================================

export const formVariants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  error: {
    x: [-10, 10, -10, 10, 0],
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
    },
  },
};

// ============================================================================
// ANIMAÇÕES DE PÁGINA
// ============================================================================

export const pageVariants = {
  hidden: { 
    opacity: 0, 
    x: -20 
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
  exit: { 
    opacity: 0, 
    x: 20,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

// ============================================================================
// UTILITÁRIOS DE ANIMAÇÃO
// ============================================================================

/**
 * Cria uma animação de stagger para uma lista de itens
 */
export function createStaggerAnimation(
  staggerDelay: number = 0.1,
  itemDelay: number = 0.1
): Variants {
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: itemDelay,
      },
    },
  };
}

/**
 * Cria uma animação de entrada com delay
 */
export function createEnterAnimation(
  delay: number = 0,
  duration: number = 0.3
): Variants {
  return {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration,
        delay,
        ease: 'easeOut',
      },
    },
  };
}

/**
 * Cria uma animação de hover personalizada
 */
export function createHoverAnimation(
  scale: number = 1.05,
  duration: number = 0.2
): Variants {
  return {
    hover: {
      scale,
      transition: { duration, ease: 'easeInOut' },
    },
  };
}

/**
 * Cria uma animação de tap personalizada
 */
export function createTapAnimation(
  scale: number = 0.95,
  duration: number = 0.1
): Variants {
  return {
    tap: {
      scale,
      transition: { duration, ease: 'easeOut' },
    },
  };
}
