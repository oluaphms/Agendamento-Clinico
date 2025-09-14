// ============================================================================
// COMPONENTE: CardiacMenuButton - Botão Flutuante do Menu Cardíaco
// ============================================================================
// Botão flutuante que pode ser usado como alternativa ao botão do header
// para acessar o menu cardíaco de qualquer lugar da aplicação.
// ============================================================================

import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

interface CardiacMenuButtonProps {
  onClick: () => void;
  className?: string;
}

export default function CardiacMenuButton({ onClick, className = '' }: CardiacMenuButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`
        fixed bottom-6 right-6 z-40 p-4 rounded-full
        bg-gradient-to-r from-red-500 to-pink-500
        text-white shadow-lg hover:shadow-xl
        transition-all duration-300 group
        ${className}
      `}
      whileHover={{ 
        scale: 1.1,
        boxShadow: "0 0 30px rgba(239, 68, 68, 0.6)"
      }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 200, 
        damping: 20 
      }}
    >
      {/* Efeito de pulso contínuo */}
      <motion.div
        className="absolute inset-0 rounded-full bg-red-400"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.7, 0, 0.7],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Ícone do coração */}
      <motion.div
        className="relative z-10"
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Heart size={24} />
      </motion.div>

      {/* Tooltip */}
      <motion.div
        className="absolute right-full mr-3 top-1/2 -translate-y-1/2
                   bg-gray-900 text-white text-sm px-3 py-2 rounded-lg
                   opacity-0 group-hover:opacity-100 transition-opacity duration-300
                   whitespace-nowrap pointer-events-none"
        initial={{ opacity: 0, x: 10 }}
        whileHover={{ opacity: 1, x: 0 }}
      >
        Menu Cardíaco
        <div className="absolute left-full top-1/2 -translate-y-1/2
                        border-4 border-transparent border-l-gray-900" />
      </motion.div>
    </motion.button>
  );
}
