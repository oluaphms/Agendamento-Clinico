// ============================================================================
// UTILITÁRIOS DE PWA
// ============================================================================

import React from 'react';

// Declarações de tipos globais para APIs do navegador
declare global {
  interface NotificationOptions {
    body?: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: any;
    requireInteraction?: boolean;
    silent?: boolean;
    timestamp?: number;
    vibrate?: number[];
    actions?: NotificationAction[];
  }

  interface NotificationAction {
    action: string;
    title: string;
    icon?: string;
  }

  interface ShareData {
    title?: string;
    text?: string;
    url?: string;
    files?: File[];
  }
}

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

interface PWAConfig {
  enableNotifications: boolean;
  enableBackgroundSync: boolean;
  enableOfflineMode: boolean;
  enableInstallPrompt: boolean;
  updateCheckInterval: number;
}

// interface InstallPromptEvent extends Event {
//   prompt(): Promise<void>;
//   userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
// }

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// ============================================================================
// CONFIGURAÇÃO PWA
// ============================================================================

const defaultPWAConfig: PWAConfig = {
  enableNotifications: true,
  enableBackgroundSync: true,
  enableOfflineMode: true,
  enableInstallPrompt: true,
  updateCheckInterval: 300000, // 5 minutos
};

// ============================================================================
// GERENCIADOR PWA
// ============================================================================

export class PWAManager {
  private static instance: PWAManager;
  private config: PWAConfig;
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private updateAvailable = false;
  private registration: ServiceWorkerRegistration | null = null;

  constructor(config: PWAConfig = defaultPWAConfig) {
    this.config = config;
    this.initializePWA();
  }

  static getInstance(config?: PWAConfig): PWAManager {
    if (!PWAManager.instance) {
      PWAManager.instance = new PWAManager(config);
    }
    return PWAManager.instance;
  }

  // ============================================================================
  // INICIALIZAÇÃO
  // ============================================================================

  private async initializePWA(): Promise<void> {
    if ('serviceWorker' in navigator) {
      await this.registerServiceWorker();
    }

    if (this.config.enableInstallPrompt) {
      this.setupInstallPrompt();
    }

    if (this.config.enableNotifications) {
      await this.requestNotificationPermission();
    }

    if (this.config.enableBackgroundSync) {
      this.setupBackgroundSync();
    }

    this.setupUpdateCheck();
  }

  // ============================================================================
  // SERVICE WORKER
  // ============================================================================

  private async registerServiceWorker(): Promise<void> {
    try {
      // Verificar se estamos em desenvolvimento
      const isDev =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';

      if (isDev) {
        // Em desenvolvimento, registrar o service worker mas com configurações especiais
        console.log(
          '🔧 Service Worker enabled in development mode with HMR protection'
        );

        // Aguardar um pouco para garantir que o Vite HMR esteja funcionando
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service Worker registered successfully');

      // Verificar atualizações
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration!.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              this.updateAvailable = true;
              this.showUpdateNotification();
            }
          });
        }
      });

      // Escutar mensagens do service worker
      navigator.serviceWorker.addEventListener('message', event => {
        this.handleServiceWorkerMessage(event);
      });
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
    }
  }

  private handleServiceWorkerMessage(event: MessageEvent): void {
    const { data } = event;

    switch (data.type) {
      case 'UPDATE_AVAILABLE':
        this.updateAvailable = true;
        this.showUpdateNotification();
        break;
      case 'CACHE_UPDATED':
        this.showCacheUpdateNotification();
        break;
      default:
        console.log('Service Worker message:', data);
    }
  }

  // ============================================================================
  // INSTALL PROMPT
  // ============================================================================

  private setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', event => {
      event.preventDefault();
      this.deferredPrompt = event as BeforeInstallPromptEvent;
      this.showInstallButton();
    });

    window.addEventListener('appinstalled', () => {
      console.log('📱 App installed successfully');
      this.deferredPrompt = null;
      this.hideInstallButton();
    });
  }

  async showInstallPrompt(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const choiceResult = await this.deferredPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        console.log('✅ User accepted the install prompt');
        return true;
      } else {
        console.log('❌ User dismissed the install prompt');
        return false;
      }
    } catch (error) {
      console.error('Error showing install prompt:', error);
      return false;
    }
  }

  private showInstallButton(): void {
    // Implementar lógica para mostrar botão de instalação
    const installButton = document.getElementById('install-button');
    if (installButton) {
      installButton.style.display = 'block';
      installButton.addEventListener('click', () => {
        this.showInstallPrompt();
      });
    }
  }

  private hideInstallButton(): void {
    const installButton = document.getElementById('install-button');
    if (installButton) {
      installButton.style.display = 'none';
    }
  }

  // ============================================================================
  // NOTIFICAÇÕES
  // ============================================================================

  private async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('❌ This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.log('❌ Notification permission denied');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  async showNotification(
    title: string,
    options?: NotificationOptions
  ): Promise<void> {
    if (
      !this.config.enableNotifications ||
      Notification.permission !== 'granted'
    ) {
      return;
    }

    const defaultOptions: NotificationOptions = {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      requireInteraction: false,
      ...options,
    };

    try {
      const notification = new Notification(title, defaultOptions);

      notification.addEventListener('click', () => {
        window.focus();
        notification.close();
      });

      // Auto-close após 5 segundos
      setTimeout(() => {
        notification.close();
      }, 5000);
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  private showUpdateNotification(): void {
    this.showNotification('Atualização Disponível', {
      body: 'Uma nova versão do sistema está disponível. Clique para atualizar.',
      requireInteraction: true,
    });
  }

  private showCacheUpdateNotification(): void {
    this.showNotification('Cache Atualizado', {
      body: 'O sistema foi atualizado com novos recursos.',
    });
  }

  // ============================================================================
  // BACKGROUND SYNC
  // ============================================================================

  private setupBackgroundSync(): void {
    if (
      'serviceWorker' in navigator &&
      'sync' in window.ServiceWorkerRegistration.prototype
    ) {
      // Background sync está disponível
      console.log('✅ Background sync is supported');
    } else {
      console.log('❌ Background sync is not supported');
    }
  }

  async registerBackgroundSync(tag: string, _data?: any): Promise<void> {
    if (
      !this.registration ||
      !('sync' in window.ServiceWorkerRegistration.prototype)
    ) {
      return;
    }

    try {
      // @ts-ignore - sync pode não estar disponível em todos os navegadores
      await this.registration.sync.register(tag);
      console.log(`✅ Background sync registered: ${tag}`);
    } catch (error) {
      console.error('Error registering background sync:', error);
    }
  }

  // ============================================================================
  // VERIFICAÇÃO DE ATUALIZAÇÕES
  // ============================================================================

  private setupUpdateCheck(): void {
    setInterval(() => {
      this.checkForUpdates();
    }, this.config.updateCheckInterval);
  }

  async checkForUpdates(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      // Verificar se estamos em desenvolvimento
      const isDev =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';

      if (isDev) {
        // Em desenvolvimento, não verificar atualizações
        return false;
      }

      await this.registration.update();
      return this.updateAvailable;
    } catch (error) {
      console.error('Error checking for updates:', error);
      return false;
    }
  }

  async applyUpdate(): Promise<void> {
    if (!this.registration || !this.updateAvailable) {
      return;
    }

    try {
      const newWorker = this.registration.waiting;
      if (newWorker) {
        newWorker.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    } catch (error) {
      console.error('Error applying update:', error);
    }
  }

  // ============================================================================
  // MODO OFFLINE
  // ============================================================================

  isOnline(): boolean {
    return navigator.onLine;
  }

  setupOfflineDetection(): void {
    window.addEventListener('online', () => {
      this.showNotification('Conexão Restaurada', {
        body: 'Você está online novamente.',
        icon: '/icons/online.png',
      });
    });

    window.addEventListener('offline', () => {
      this.showNotification('Modo Offline', {
        body: 'Você está offline. Algumas funcionalidades podem estar limitadas.',
        icon: '/icons/offline.png',
        requireInteraction: true,
      });
    });
  }

  // ============================================================================
  // SHARE API
  // ============================================================================

  async share(data: ShareData): Promise<boolean> {
    if (!navigator.share) {
      console.log('❌ Web Share API is not supported');
      return false;
    }

    try {
      await navigator.share(data);
      return true;
    } catch (error) {
      if ((error as any).name !== 'AbortError') {
        console.error('Error sharing:', error);
      }
      return false;
    }
  }

  // ============================================================================
  // CLIPBOARD API
  // ============================================================================

  async copyToClipboard(text: string): Promise<boolean> {
    if (!navigator.clipboard) {
      console.log('❌ Clipboard API is not supported');
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      return false;
    }
  }

  async readFromClipboard(): Promise<string | null> {
    if (!navigator.clipboard) {
      console.log('❌ Clipboard API is not supported');
      return null;
    }

    try {
      const text = await navigator.clipboard.readText();
      return text;
    } catch (error) {
      console.error('Error reading from clipboard:', error);
      return null;
    }
  }

  // ============================================================================
  // BADGE API
  // ============================================================================

  async setBadge(count: number): Promise<void> {
    if ('setAppBadge' in navigator) {
      try {
        await (navigator as any).setAppBadge(count);
      } catch (error) {
        console.error('Error setting badge:', error);
      }
    }
  }

  async clearBadge(): Promise<void> {
    if ('clearAppBadge' in navigator) {
      try {
        await (navigator as any).clearAppBadge();
      } catch (error) {
        console.error('Error clearing badge:', error);
      }
    }
  }

  // ============================================================================
  // UTILITÁRIOS
  // ============================================================================

  getInstallabilityStatus(): {
    canInstall: boolean;
    isInstalled: boolean;
    isStandalone: boolean;
  } {
    return {
      canInstall: !!this.deferredPrompt,
      isInstalled: window.matchMedia('(display-mode: standalone)').matches,
      isStandalone: window.matchMedia('(display-mode: standalone)').matches,
    };
  }

  getConnectionInfo(): {
    effectiveType: string;
    downlink: number;
    rtt: number;
  } | null {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
      };
    }
    return null;
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  destroy(): void {
    // Cleanup de event listeners e timers
    this.deferredPrompt = null;
    this.updateAvailable = false;
    this.registration = null;
  }
}

// ============================================================================
// HOOKS REACT
// ============================================================================

export const usePWA = (config?: PWAConfig) => {
  const [pwaManager] = React.useState(() => PWAManager.getInstance(config));
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [canInstall, setCanInstall] = React.useState(false);
  const [isInstalled, setIsInstalled] = React.useState(
    window.matchMedia('(display-mode: standalone)').matches
  );

  React.useEffect(() => {
    // Detectar mudanças de conectividade
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Detectar mudanças de instalação
    const handleInstallPrompt = () => setCanInstall(true);
    const handleAppInstalled = () => {
      setCanInstall(false);
      setIsInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handleInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  return {
    pwaManager,
    isOnline,
    canInstall,
    isInstalled,
    showInstallPrompt: () => pwaManager.showInstallPrompt(),
    showNotification: (title: string, options?: NotificationOptions) =>
      pwaManager.showNotification(title, options),
    share: (data: ShareData) => pwaManager.share(data),
    copyToClipboard: (text: string) => pwaManager.copyToClipboard(text),
  };
};

// ============================================================================
// INICIALIZAÇÃO
// ============================================================================

export const initializePWA = (config?: PWAConfig): PWAManager => {
  return PWAManager.getInstance(config);
};
