import React, { useEffect } from 'react';
import { useThemeStore } from '@/stores/themeStore';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { initializeTheme } = useThemeStore();

  useEffect(() => {
    // Inicializar tema quando o componente montar
    initializeTheme();
  }, [initializeTheme]);

  return <>{children}</>;
};
