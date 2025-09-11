// ============================================================================
// PROVEDOR PWA
// ============================================================================

import React, { createContext, useContext, useEffect, useState } from 'react';
import { PWAManager, initializePWA } from '../../utils/pwa';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

interface PWAContextType {
  // Estados
  isOnline: boolean;
  canInstall: boolean;
  isInstalled: boolean;
  updateAvailable: boolean;
  
  // PWA Manager
  pwaManager: PWAManager;
  
  // Funções
  showInstallPrompt: () => Promise<boolean>;
  showNotification: (title: string, options?: NotificationOptions) => Promise<void>;
  share: (data: ShareData) => Promise<boolean>;
  copyToClipboard: (text: string) => Promise<boolean>;
  applyUpdate: () => Promise<void>;
  setBadge: (count: number) => Promise<void>;
  clearBadge: () => Promise<void>;
}

// ============================================================================
// CONTEXTO
// ============================================================================

const PWAContext = createContext<PWAContextType | null>(null);

// ============================================================================
// PROVEDOR
// ============================================================================

interface PWAProviderProps {
  children: React.ReactNode;
  config?: {
    enableNotifications?: boolean;
    enableBackgroundSync?: boolean;
    enableOfflineMode?: boolean;
    enableInstallPrompt?: boolean;
    updateCheckInterval?: number;
  };
}

export const PWAProvider: React.FC<PWAProviderProps> = ({
  children,
  config = {},
}) => {
  // ============================================================================
  // ESTADOS
  // ============================================================================
  
  const [pwaManager] = useState(() => initializePWA(config));
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(
    window.matchMedia('(display-mode: standalone)').matches
  );
  const [updateAvailable, setUpdateAvailable] = useState(false);

  // ============================================================================
  // EFEITOS
  // ============================================================================
  
  useEffect(() => {
    // Detectar mudanças de conectividade
    const handleOnline = () => {
      setIsOnline(true);
      pwaManager.showNotification('Conexão Restaurada', {
        body: 'Você está online novamente.',
        icon: '/icons/online.png',
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      pwaManager.showNotification('Modo Offline', {
        body: 'Você está offline. Algumas funcionalidades podem estar limitadas.',
        icon: '/icons/offline.png',
        requireInteraction: true,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Detectar mudanças de instalação
    const handleInstallPrompt = () => {
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setCanInstall(false);
      setIsInstalled(true);
      pwaManager.showNotification('App Instalado', {
        body: 'O sistema clínico foi instalado com sucesso!',
        icon: '/icons/icon-192x192.png',
      });
    };

    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Detectar atualizações
    const handleUpdateAvailable = () => {
      setUpdateAvailable(true);
    };

    // Escutar mensagens do service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'UPDATE_AVAILABLE') {
          handleUpdateAvailable();
        }
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [pwaManager]);

  // ============================================================================
  // FUNÇÕES
  // ============================================================================
  
  const showInstallPrompt = async (): Promise<boolean> => {
    const result = await pwaManager.showInstallPrompt();
    if (result) {
      setCanInstall(false);
    }
    return result;
  };

  const showNotification = async (title: string, options?: NotificationOptions): Promise<void> => {
    await pwaManager.showNotification(title, options);
  };

  const share = async (data: ShareData): Promise<boolean> => {
    return await pwaManager.share(data);
  };

  const copyToClipboard = async (text: string): Promise<boolean> => {
    return await pwaManager.copyToClipboard(text);
  };

  const applyUpdate = async (): Promise<void> => {
    await pwaManager.applyUpdate();
    setUpdateAvailable(false);
  };

  const setBadge = async (count: number): Promise<void> => {
    await pwaManager.setBadge(count);
  };

  const clearBadge = async (): Promise<void> => {
    await pwaManager.clearBadge();
  };

  // ============================================================================
  // CONTEXTO
  // ============================================================================
  
  const contextValue: PWAContextType = {
    isOnline,
    canInstall,
    isInstalled,
    updateAvailable,
    pwaManager,
    showInstallPrompt,
    showNotification,
    share,
    copyToClipboard,
    applyUpdate,
    setBadge,
    clearBadge,
  };

  return (
    <PWAContext.Provider value={contextValue}>
      {children}
    </PWAContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const usePWA = (): PWAContextType => {
  const context = useContext(PWAContext);
  
  if (!context) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  
  return context;
};

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

export const InstallButton: React.FC<{
  className?: string;
  children?: React.ReactNode;
}> = ({ className = '', children = 'Instalar App' }) => {
  const { canInstall, showInstallPrompt } = usePWA();

  if (!canInstall) {
    return null;
  }

  return (
    <button
      onClick={showInstallPrompt}
      className={`bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md transition-colors ${className}`}
    >
      {children}
    </button>
  );
};

export const UpdateNotification: React.FC<{
  onUpdate?: () => void;
  onDismiss?: () => void;
}> = ({ onUpdate, onDismiss }) => {
  const { updateAvailable, applyUpdate } = usePWA();
  const [show, setShow] = useState(updateAvailable);

  useEffect(() => {
    setShow(updateAvailable);
  }, [updateAvailable]);

  if (!show) {
    return null;
  }

  const handleUpdate = async () => {
    await applyUpdate();
    onUpdate?.();
    setShow(false);
  };

  const handleDismiss = () => {
    setShow(false);
    onDismiss?.();
  };

  return (
    <div className="fixed top-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium">Atualização Disponível</h3>
          <p className="text-sm mt-1">
            Uma nova versão do sistema está disponível.
          </p>
          <div className="mt-3 flex space-x-2">
            <button
              onClick={handleUpdate}
              className="bg-white text-blue-500 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100"
            >
              Atualizar
            </button>
            <button
              onClick={handleDismiss}
              className="text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-600"
            >
              Depois
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const OfflineIndicator: React.FC = () => {
  const { isOnline } = usePWA();

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
      <div className="flex items-center space-x-2">
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
        </svg>
        <span className="text-sm font-medium">Offline</span>
      </div>
    </div>
  );
};

export const ConnectionStatus: React.FC = () => {
  const { isOnline } = usePWA();

  return (
    <div className={`flex items-center space-x-2 ${isOnline ? 'text-green-500' : 'text-red-500'}`}>
      <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
      <span className="text-sm">
        {isOnline ? 'Online' : 'Offline'}
      </span>
    </div>
  );
};
