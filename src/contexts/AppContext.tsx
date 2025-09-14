// ============================================================================
// CONTEXT: AppContext - Contexto Global da Aplicação
// ============================================================================
// Contexto centralizado para gerenciar estado global da aplicação
// ============================================================================

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

interface AppState {
  // Estado de carregamento global
  isLoading: boolean;

  // Notificações
  notifications: Notification[];

  // Modal global
  modal: {
    isOpen: boolean;
    content: ReactNode | null;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
  };

  // Sidebar
  sidebar: {
    isOpen: boolean;
    isCollapsed: boolean;
  };

  // Breadcrumb
  breadcrumb: {
    items: BreadcrumbItem[];
  };

  // Filtros globais
  filters: Record<string, unknown>;

  // Configurações da aplicação
  settings: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
  };
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: number;
}

interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: ReactNode;
}

// ============================================================================
// TIPOS DE AÇÕES (mantidos para compatibilidade)
// ============================================================================

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | {
      type: 'ADD_NOTIFICATION';
      payload: Omit<Notification, 'id' | 'timestamp'>;
    }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | {
      type: 'OPEN_MODAL';
      payload: {
        content: ReactNode;
        title?: string;
        size?: 'sm' | 'md' | 'lg' | 'xl';
      };
    }
  | { type: 'CLOSE_MODAL' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR_OPEN'; payload: boolean }
  | { type: 'TOGGLE_SIDEBAR_COLLAPSED' }
  | { type: 'SET_SIDEBAR_COLLAPSED'; payload: boolean }
  | { type: 'SET_BREADCRUMB'; payload: BreadcrumbItem[] }
  | { type: 'SET_FILTER'; payload: { key: string; value: unknown } }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'SET_SETTINGS'; payload: Partial<AppState['settings']> };

// ============================================================================
// ESTADO INICIAL
// ============================================================================

const initialState: AppState = {
  isLoading: false,
  notifications: [],
  modal: {
    isOpen: false,
    content: null,
    title: undefined,
    size: 'md',
  },
  sidebar: {
    isOpen: false,
    isCollapsed: false,
  },
  breadcrumb: {
    items: [],
  },
  filters: {},
  settings: {
    theme: 'dark',
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
  },
};

// ============================================================================
// FUNÇÕES DE AÇÃO (substituindo o reducer)
// ============================================================================

// ============================================================================
// CONTEXT
// ============================================================================

const AppContext = createContext<{
  state: AppState;
  dispatch: (action: AppAction) => void;
} | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, setState] = useState<AppState>(initialState);

  const dispatch = useCallback((action: AppAction) => {
    setState(prevState => {
      switch (action.type) {
        case 'SET_LOADING':
          return { ...prevState, isLoading: action.payload };

        case 'ADD_NOTIFICATION':
          const notification: Notification = {
            ...action.payload,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: Date.now(),
          };
          return {
            ...prevState,
            notifications: [...prevState.notifications, notification],
          };

        case 'REMOVE_NOTIFICATION':
          return {
            ...prevState,
            notifications: prevState.notifications.filter(
              n => n.id !== action.payload
            ),
          };

        case 'CLEAR_NOTIFICATIONS':
          return { ...prevState, notifications: [] };

        case 'OPEN_MODAL':
          return {
            ...prevState,
            modal: {
              isOpen: true,
              content: action.payload.content,
              title: action.payload.title,
              size: action.payload.size || 'md',
            },
          };

        case 'CLOSE_MODAL':
          return {
            ...prevState,
            modal: {
              ...prevState.modal,
              isOpen: false,
              content: null,
              title: undefined,
            },
          };

        case 'TOGGLE_SIDEBAR':
          return {
            ...prevState,
            sidebar: {
              ...prevState.sidebar,
              isOpen: !prevState.sidebar.isOpen,
            },
          };

        case 'SET_SIDEBAR_OPEN':
          return {
            ...prevState,
            sidebar: {
              ...prevState.sidebar,
              isOpen: action.payload,
            },
          };

        case 'TOGGLE_SIDEBAR_COLLAPSED':
          return {
            ...prevState,
            sidebar: {
              ...prevState.sidebar,
              isCollapsed: !prevState.sidebar.isCollapsed,
            },
          };

        case 'SET_SIDEBAR_COLLAPSED':
          return {
            ...prevState,
            sidebar: {
              ...prevState.sidebar,
              isCollapsed: action.payload,
            },
          };

        case 'SET_BREADCRUMB':
          return {
            ...prevState,
            breadcrumb: {
              items: action.payload,
            },
          };

        case 'SET_FILTER':
          return {
            ...prevState,
            filters: {
              ...prevState.filters,
              [action.payload.key]: action.payload.value,
            },
          };

        case 'CLEAR_FILTERS':
          return { ...prevState, filters: {} };

        case 'SET_SETTINGS':
          return {
            ...prevState,
            settings: {
              ...prevState.settings,
              ...action.payload,
            },
          };

        default:
          return prevState;
      }
    });
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// ============================================================================
// HOOK PERSONALIZADO
// ============================================================================

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser usado dentro de um AppProvider');
  }
  return context;
}

// ============================================================================
// HOOKS ESPECÍFICOS
// ============================================================================

export function useLoading() {
  const { state, dispatch } = useApp();

  return {
    isLoading: state.isLoading,
    setLoading: (loading: boolean) =>
      dispatch({ type: 'SET_LOADING', payload: loading }),
  };
}

export function useNotifications() {
  const { state, dispatch } = useApp();

  return {
    notifications: state.notifications,
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) =>
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification }),
    removeNotification: (id: string) =>
      dispatch({ type: 'REMOVE_NOTIFICATION', payload: id }),
    clearNotifications: () => dispatch({ type: 'CLEAR_NOTIFICATIONS' }),
  };
}

export function useModal() {
  const { state, dispatch } = useApp();

  return {
    modal: state.modal,
    openModal: (
      content: ReactNode,
      title?: string,
      size?: 'sm' | 'md' | 'lg' | 'xl'
    ) => dispatch({ type: 'OPEN_MODAL', payload: { content, title, size } }),
    closeModal: () => dispatch({ type: 'CLOSE_MODAL' }),
  };
}

export function useSidebar() {
  const { state, dispatch } = useApp();

  return {
    sidebar: state.sidebar,
    toggleSidebar: () => dispatch({ type: 'TOGGLE_SIDEBAR' }),
    setSidebarOpen: (isOpen: boolean) =>
      dispatch({ type: 'SET_SIDEBAR_OPEN', payload: isOpen }),
    toggleSidebarCollapsed: () =>
      dispatch({ type: 'TOGGLE_SIDEBAR_COLLAPSED' }),
    setSidebarCollapsed: (isCollapsed: boolean) =>
      dispatch({ type: 'SET_SIDEBAR_COLLAPSED', payload: isCollapsed }),
  };
}

export function useBreadcrumb() {
  const { state, dispatch } = useApp();

  return {
    breadcrumb: state.breadcrumb,
    setBreadcrumb: (items: BreadcrumbItem[]) =>
      dispatch({ type: 'SET_BREADCRUMB', payload: items }),
  };
}

export function useFilters() {
  const { state, dispatch } = useApp();

  return {
    filters: state.filters,
    setFilter: (key: string, value: unknown) =>
      dispatch({ type: 'SET_FILTER', payload: { key, value } }),
    clearFilters: () => dispatch({ type: 'CLEAR_FILTERS' }),
  };
}

export function useSettings() {
  const { state, dispatch } = useApp();

  return {
    settings: state.settings,
    setSettings: (settings: Partial<AppState['settings']>) =>
      dispatch({ type: 'SET_SETTINGS', payload: settings }),
  };
}
