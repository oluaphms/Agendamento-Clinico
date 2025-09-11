// ============================================================================
// SERVIÇO: BackupService - Sistema de Backup Automático
// ============================================================================
// Serviço para backup automático e manual de dados da aplicação
// ============================================================================

import { supabase } from '@/lib/supabase';
import { config, devLog } from '@/config/environment';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export interface BackupConfig {
  enabled: boolean;
  interval: number; // em minutos
  retention: number; // número de backups para manter
  tables: string[];
  includeFiles: boolean;
  compression: boolean;
}

export interface BackupData {
  id: string;
  timestamp: string;
  tables: Record<string, unknown[]>;
  metadata: {
    version: string;
    userCount: number;
    totalRecords: number;
    size: number;
  };
  files?: Record<string, string>; // base64 encoded files
}

export interface BackupStatus {
  isRunning: boolean;
  lastBackup?: string;
  nextBackup?: string;
  totalBackups: number;
  totalSize: number;
  error?: string;
}

// ============================================================================
// CONFIGURAÇÃO PADRÃO
// ============================================================================

const DEFAULT_CONFIG: BackupConfig = {
  enabled: true,
  interval: 60, // 1 hora
  retention: 7, // 7 backups
  tables: [
    'usuarios',
    'pacientes',
    'profissionais',
    'servicos',
    'agendamentos',
    'pagamentos',
    'notificacoes',
    'configuracoes',
  ],
  includeFiles: false,
  compression: true,
};

// ============================================================================
// CLASSE PRINCIPAL
// ============================================================================

class BackupService {
  private config: BackupConfig;
  private intervalId: NodeJS.Timeout | null = null;
  private status: BackupStatus = {
    isRunning: false,
    totalBackups: 0,
    totalSize: 0,
  };

  constructor() {
    this.config = { ...DEFAULT_CONFIG };
    this.loadConfig();
  }

  // ============================================================================
  // CONFIGURAÇÃO
  // ============================================================================

  private async loadConfig(): Promise<void> {
    try {
      if (config.mockDataEnabled) {
        devLog('BackupService: Usando configuração mock');
        return;
      }

      const { data, error } = await supabase
        .from('configuracoes')
        .select('backup_config')
        .eq('chave', 'backup')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar configuração de backup:', error);
        return;
      }

      if (data?.backup_config) {
        this.config = { ...DEFAULT_CONFIG, ...data.backup_config };
        devLog('BackupService: Configuração carregada:', this.config);
      }
    } catch (error) {
      console.error('Erro ao carregar configuração de backup:', error);
    }
  }

  async updateConfig(newConfig: Partial<BackupConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig };
    
    try {
      if (config.mockDataEnabled) {
        devLog('BackupService: Configuração atualizada (mock):', this.config);
        return;
      }

      await supabase
        .from('configuracoes')
        .upsert({
          chave: 'backup',
          backup_config: this.config,
          updated_at: new Date().toISOString(),
        });

      devLog('BackupService: Configuração salva no banco');
    } catch (error) {
      console.error('Erro ao salvar configuração de backup:', error);
      throw error;
    }
  }

  getConfig(): BackupConfig {
    return { ...this.config };
  }

  // ============================================================================
  // BACKUP MANUAL
  // ============================================================================

  async createBackup(): Promise<BackupData> {
    if (this.status.isRunning) {
      throw new Error('Backup já está em execução');
    }

    this.status.isRunning = true;
    this.status.error = undefined;

    try {
      devLog('BackupService: Iniciando backup manual');
      
      const backupData: BackupData = {
        id: this.generateBackupId(),
        timestamp: new Date().toISOString(),
        tables: {},
        metadata: {
          version: '2.0.0',
          userCount: 0,
          totalRecords: 0,
          size: 0,
        },
      };

      // Backup das tabelas
      for (const table of this.config.tables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('*');

          if (error) {
            console.warn(`Erro ao fazer backup da tabela ${table}:`, error);
            backupData.tables[table] = [];
          } else {
            backupData.tables[table] = data || [];
            backupData.metadata.totalRecords += (data || []).length;
          }
        } catch (error) {
          console.warn(`Erro ao fazer backup da tabela ${table}:`, error);
          backupData.tables[table] = [];
        }
      }

      // Backup de arquivos (se habilitado)
      if (this.config.includeFiles) {
        backupData.files = await this.backupFiles();
      }

      // Calcular tamanho
      backupData.metadata.size = this.calculateSize(backupData);

      // Salvar backup
      await this.saveBackup(backupData);

      // Limpar backups antigos
      await this.cleanupOldBackups();

      this.status.lastBackup = backupData.timestamp;
      this.status.totalBackups++;
      this.status.totalSize += backupData.metadata.size;

      devLog('BackupService: Backup concluído com sucesso');
      return backupData;

    } catch (error) {
      this.status.error = error instanceof Error ? error.message : 'Erro desconhecido';
      throw error;
    } finally {
      this.status.isRunning = false;
    }
  }

  // ============================================================================
  // BACKUP AUTOMÁTICO
  // ============================================================================

  startAutomaticBackup(): void {
    if (!this.config.enabled) {
      devLog('BackupService: Backup automático desabilitado');
      return;
    }

    if (this.intervalId) {
      this.stopAutomaticBackup();
    }

    const intervalMs = this.config.interval * 60 * 1000;
    
    this.intervalId = setInterval(async () => {
      try {
        await this.createBackup();
        devLog('BackupService: Backup automático executado');
      } catch (error) {
        console.error('Erro no backup automático:', error);
      }
    }, intervalMs);

    // Calcular próximo backup
    this.status.nextBackup = new Date(Date.now() + intervalMs).toISOString();
    
    devLog(`BackupService: Backup automático iniciado (intervalo: ${this.config.interval}min)`);
  }

  stopAutomaticBackup(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.status.nextBackup = undefined;
      devLog('BackupService: Backup automático parado');
    }
  }

  // ============================================================================
  // RESTAURAÇÃO
  // ============================================================================

  async restoreBackup(backupId: string): Promise<void> {
    if (this.status.isRunning) {
      throw new Error('Operação já está em execução');
    }

    this.status.isRunning = true;

    try {
      devLog(`BackupService: Iniciando restauração do backup ${backupId}`);
      
      const backupData = await this.loadBackup(backupId);
      
      if (!backupData) {
        throw new Error('Backup não encontrado');
      }

      // Restaurar tabelas
      for (const [table, data] of Object.entries(backupData.tables)) {
        try {
          // Limpar tabela existente
          await supabase.from(table).delete().neq('id', '');
          
          // Inserir dados do backup
          if (Array.isArray(data) && data.length > 0) {
            const { error } = await supabase
              .from(table)
              .insert(data);

            if (error) {
              console.warn(`Erro ao restaurar tabela ${table}:`, error);
            }
          }
        } catch (error) {
          console.warn(`Erro ao restaurar tabela ${table}:`, error);
        }
      }

      // Restaurar arquivos (se existirem)
      if (backupData.files) {
        await this.restoreFiles(backupData.files);
      }

      devLog('BackupService: Restauração concluída com sucesso');

    } catch (error) {
      this.status.error = error instanceof Error ? error.message : 'Erro desconhecido';
      throw error;
    } finally {
      this.status.isRunning = false;
    }
  }

  // ============================================================================
  // LISTAGEM E GERENCIAMENTO
  // ============================================================================

  async listBackups(): Promise<BackupData[]> {
    try {
      if (config.mockDataEnabled) {
        return this.getMockBackups();
      }

      const { data, error } = await supabase
        .from('backups')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Erro ao listar backups:', error);
        return [];
      }

      return (data || []).map(item => item.backup_data as BackupData);

    } catch (error) {
      console.error('Erro ao listar backups:', error);
      return [];
    }
  }

  async deleteBackup(backupId: string): Promise<void> {
    try {
      if (config.mockDataEnabled) {
        devLog(`BackupService: Backup ${backupId} deletado (mock)`);
        return;
      }

      const { error } = await supabase
        .from('backups')
        .delete()
        .eq('id', backupId);

      if (error) {
        throw error;
      }

      devLog(`BackupService: Backup ${backupId} deletado`);

    } catch (error) {
      console.error('Erro ao deletar backup:', error);
      throw error;
    }
  }

  // ============================================================================
  // UTILITÁRIOS
  // ============================================================================

  private generateBackupId(): string {
    return `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateSize(data: BackupData): number {
    return new Blob([JSON.stringify(data)]).size;
  }

  private async saveBackup(backupData: BackupData): Promise<void> {
    try {
      if (config.mockDataEnabled) {
        devLog('BackupService: Backup salvo (mock)');
        return;
      }

      const { error } = await supabase
        .from('backups')
        .insert({
          id: backupData.id,
          backup_data: backupData,
          timestamp: backupData.timestamp,
          size: backupData.metadata.size,
        });

      if (error) {
        throw error;
      }

    } catch (error) {
      console.error('Erro ao salvar backup:', error);
      throw error;
    }
  }

  private async loadBackup(backupId: string): Promise<BackupData | null> {
    try {
      if (config.mockDataEnabled) {
        const mockBackups = this.getMockBackups();
        return mockBackups.find(b => b.id === backupId) || null;
      }

      const { data, error } = await supabase
        .from('backups')
        .select('backup_data')
        .eq('id', backupId)
        .single();

      if (error) {
        return null;
      }

      return data?.backup_data as BackupData;

    } catch (error) {
      console.error('Erro ao carregar backup:', error);
      return null;
    }
  }

  private async cleanupOldBackups(): Promise<void> {
    try {
      const backups = await this.listBackups();
      
      if (backups.length > this.config.retention) {
        const backupsToDelete = backups.slice(this.config.retention);
        
        for (const backup of backupsToDelete) {
          await this.deleteBackup(backup.id);
        }
        
        devLog(`BackupService: ${backupsToDelete.length} backups antigos removidos`);
      }

    } catch (error) {
      console.error('Erro ao limpar backups antigos:', error);
    }
  }

  private async backupFiles(): Promise<Record<string, string>> {
    // Implementar backup de arquivos se necessário
    return {};
  }

  private async restoreFiles(files: Record<string, string>): Promise<void> {
    // Implementar restauração de arquivos se necessário
  }

  private getMockBackups(): BackupData[] {
    return [
      {
        id: 'backup_1',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        tables: {
          usuarios: [{ id: 1, nome: 'Admin' }],
          pacientes: [{ id: 1, nome: 'João Silva' }],
        },
        metadata: {
          version: '2.0.0',
          userCount: 1,
          totalRecords: 2,
          size: 1024,
        },
      },
    ];
  }

  // ============================================================================
  // STATUS E INFORMAÇÕES
  // ============================================================================

  getStatus(): BackupStatus {
    return { ...this.status };
  }

  async getBackupStats(): Promise<{
    totalBackups: number;
    totalSize: number;
    lastBackup?: string;
    nextBackup?: string;
  }> {
    const backups = await this.listBackups();
    const totalSize = backups.reduce((sum, backup) => sum + backup.metadata.size, 0);

    return {
      totalBackups: backups.length,
      totalSize,
      lastBackup: backups[0]?.timestamp,
      nextBackup: this.status.nextBackup,
    };
  }

  // ============================================================================
  // EXPORTAÇÃO E IMPORTAÇÃO
  // ============================================================================

  async exportBackup(backupId: string): Promise<Blob> {
    const backupData = await this.loadBackup(backupId);
    
    if (!backupData) {
      throw new Error('Backup não encontrado');
    }

    const jsonString = JSON.stringify(backupData, null, 2);
    return new Blob([jsonString], { type: 'application/json' });
  }

  async importBackup(file: File): Promise<void> {
    try {
      const text = await file.text();
      const backupData: BackupData = JSON.parse(text);
      
      // Validar estrutura do backup
      if (!backupData.id || !backupData.timestamp || !backupData.tables) {
        throw new Error('Arquivo de backup inválido');
      }

      // Salvar backup importado
      await this.saveBackup(backupData);
      
      devLog('BackupService: Backup importado com sucesso');

    } catch (error) {
      console.error('Erro ao importar backup:', error);
      throw error;
    }
  }
}

// ============================================================================
// INSTÂNCIA SINGLETON
// ============================================================================

export const backupService = new BackupService();

// ============================================================================
// EXPORTAÇÕES
// ============================================================================

export {
  BackupService,
  DEFAULT_CONFIG,
};
