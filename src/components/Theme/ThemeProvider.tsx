import React, { useEffect } from 'react';
import { useThemeStore } from '@/stores/themeStore';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { initializeTheme } = useThemeStore();

  useEffect(() => {
    // Garantir que o tema claro seja aplicado por padrão
    const html = document.documentElement;
    const body = document.body;
    
    // Remover classes de tema escuro se existirem
    html.classList.remove('dark');
    body.classList.remove('dark-theme');
    body.classList.add('light-theme');
    
    // Inicializar tema quando o componente montar
    initializeTheme();
  }, [initializeTheme]);

  return <>{children}</>;
};
