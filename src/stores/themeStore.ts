import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeState {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initializeTheme: () => void;
  applyTheme: (theme: Theme) => void;
  resetTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'light', // Tema claro como padrão
  isDark: false,

  setTheme: (theme: Theme) => {
    set({ theme });
    get().applyTheme(theme);
    // Salvar no localStorage
    localStorage.setItem('theme', theme);
  },

  toggleTheme: () => {
    const currentTheme = get().theme;
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    get().setTheme(newTheme);
  },

  initializeTheme: () => {
    // Carregar tema do localStorage ou usar padrão claro
    const savedTheme = (localStorage.getItem('theme') as Theme) || 'light';
    
    // Se não há tema salvo, garantir que o tema claro seja aplicado
    if (!localStorage.getItem('theme')) {
      localStorage.setItem('theme', 'light');
    }
    
    set({ theme: savedTheme });
    get().applyTheme(savedTheme);
  },

  applyTheme: (theme: Theme) => {
    const html = document.documentElement;
    const body = document.body;

    if (theme === 'auto') {
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      set({ isDark: prefersDark });
      html.classList.toggle('dark', prefersDark);
      html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      const isDark = theme === 'dark';
      set({ isDark });
      html.classList.toggle('dark', isDark);
      html.setAttribute('data-theme', theme);

      // Aplicar classes específicas para tema claro/escuro
      if (isDark) {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
      } else {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
      }
    }
  },

  resetTheme: () => {
    // Resetar para tema claro e limpar localStorage
    localStorage.removeItem('theme');
    set({ theme: 'light', isDark: false });
    get().applyTheme('light');
  },
}));

// Não inicializar automaticamente - será inicializado pelo ThemeProvider
