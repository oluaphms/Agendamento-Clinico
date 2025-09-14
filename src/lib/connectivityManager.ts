// ============================================================================
// GERENCIADOR DE CONECTIVIDADE
// ============================================================================
// Gerencia a conectividade com serviços externos e fallbacks
// ============================================================================

import { supabase } from './supabase';
import { localDb } from './database';
import { isMockDataEnabled } from '@/config/environment';

interface ConnectivityStatus {
  isOnline: boolean;
  supabaseAvailable: boolean;
  lastCheck: Date;
  retryCount: number;
}

class ConnectivityManager {
  private status: ConnectivityStatus = {
    isOnline: navigator.onLine,
    supabaseAvailable: false,
    lastCheck: new Date(),
    retryCount: 0
  };

  private maxRetries = import.meta.env.DEV ? 2 : 3;
  private checkInterval = import.meta.env.DEV ? 30000 : 60000; // 30s em dev, 60s em prod
  private intervalId: number | null = null;

  constructor() {
    this.setupEventListeners();
    this.startPeriodicCheck();
  }

  private setupEventListeners(): void {
    // Monitorar mudanças de conectividade
    window.addEventListener('online', () => {
      console.log('🌐 Conectividade restaurada');
      this.status.isOnline = true;
      this.checkSupabaseConnection();
    });

    window.addEventListener('offline', () => {
      console.log('📴 Conectividade perdida');
      this.status.isOnline = false;
      this.status.supabaseAvailable = false;
    });
  }

  private startPeriodicCheck(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.intervalId = window.setInterval(() => {
      if (this.status.isOnline) {
        this.checkSupabaseConnection();
      }
    }, this.checkInterval);
  }

  private async checkSupabaseConnection(): Promise<boolean> {
    try {
      // Verificar se estamos usando dados mock
      if (isMockDataEnabled()) {
        this.status.supabaseAvailable = false;
        return false;
      }

      // Verificar se temos credenciais válidas do Supabase
      const hasValidCredentials = 
        import.meta.env.VITE_SUPABASE_URL &&
        import.meta.env.VITE_SUPABASE_ANON_KEY &&
        import.meta.env.VITE_SUPABASE_URL !== '' &&
        import.meta.env.VITE_SUPABASE_ANON_KEY !== '' &&
        import.meta.env.VITE_SUPABASE_URL.startsWith('https://') &&
        import.meta.env.VITE_SUPABASE_URL.includes('.supabase.co');

      if (!hasValidCredentials) {
        this.status.supabaseAvailable = false;
        return false;
      }

      // Verificar se supabase é realmente uma instância do Supabase (não mock)
      if (!supabase || typeof supabase.from !== 'function') {
        this.status.supabaseAvailable = false;
        return false;
      }

      // Fazer uma requisição simples para testar a conectividade
      const { error } = await supabase
        .from('usuarios')
        .select('id')
        .limit(1);

      const isAvailable = !error;
      
      if (isAvailable !== this.status.supabaseAvailable) {
        console.log(`🔗 Supabase ${isAvailable ? 'disponível' : 'indisponível'}`);
        this.status.supabaseAvailable = isAvailable;
      }

      this.status.lastCheck = new Date();
      this.status.retryCount = 0;
      
      return isAvailable;
    } catch (error) {
      // Só logar erro se não for erro 503 (servidor indisponível)
      if (error instanceof Error && !error.message.includes('503') && !error.message.includes('Failed to fetch')) {
        console.warn('❌ Erro ao verificar conectividade com Supabase:', error);
      }
      this.status.supabaseAvailable = false;
      this.status.retryCount++;
      return false;
    }
  }

  public async getDatabase(): Promise<any> {
    // Se estamos offline, usar sempre dados mock
    if (!this.status.isOnline) {
      console.log('📴 Offline - usando dados mock');
      return localDb;
    }

    // Se estamos usando dados mock intencionalmente, não tentar Supabase
    if (isMockDataEnabled()) {
      return localDb;
    }

    // Se Supabase está disponível, usar Supabase
    if (this.status.supabaseAvailable) {
      return supabase;
    }

    // Se Supabase não está disponível, tentar verificar novamente
    const isAvailable = await this.checkSupabaseConnection();
    
    if (isAvailable) {
      return supabase;
    }

    // Se ainda não está disponível e não excedeu o limite de tentativas, usar dados mock
    if (this.status.retryCount < this.maxRetries) {
      console.log(`🔄 Supabase indisponível (tentativa ${this.status.retryCount + 1}/${this.maxRetries}) - usando dados mock`);
      return localDb;
    }

    // Se excedeu o limite de tentativas, usar dados mock permanentemente até próxima verificação
    console.log('⚠️ Supabase indisponível - usando dados mock permanentemente');
    return localDb;
  }

  public getStatus(): ConnectivityStatus {
    return { ...this.status };
  }

  public isSupabaseAvailable(): boolean {
    return this.status.supabaseAvailable;
  }

  public isOnline(): boolean {
    return this.status.isOnline;
  }

  public async forceReconnect(): Promise<boolean> {
    console.log('🔄 Forçando reconexão...');
    this.status.retryCount = 0;
    return await this.checkSupabaseConnection();
  }

  public destroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

// Instância singleton
export const connectivityManager = new ConnectivityManager();

// Função utilitária para obter o banco de dados apropriado
export const getDatabase = async () => {
  return await connectivityManager.getDatabase();
};

// Função utilitária para verificar se Supabase está disponível
export const isSupabaseAvailable = () => {
  return connectivityManager.isSupabaseAvailable();
};

// Função utilitária para verificar se está online
export const isOnline = () => {
  return connectivityManager.isOnline();
};

// Função utilitária para forçar reconexão
export const forceReconnect = async () => {
  return await connectivityManager.forceReconnect();
};
