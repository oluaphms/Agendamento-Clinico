// ============================================================================
// COMPONENTE: BackupManager - Gerenciador de Backup
// ============================================================================
// Interface para gerenciar backups automáticos e manuais
// ============================================================================

import React, { useState } from 'react';
import {
  Download,
  Upload,
  Play,
  Pause,
  Settings,
  Trash2,
  RotateCcw,
  Clock,
  HardDrive,
  AlertCircle,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import { useBackup } from '@/hooks/useBackup';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Alert,
  AlertDescription,
} from '@/design-system';
import { LoadingSpinner } from '@/components/LazyLoading/LazyWrapper';

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export const BackupManager: React.FC = () => {
  const {
    status,
    backups,
    config,
    loading,
    error,
    createBackup,
    restoreBackup,
    deleteBackup,
    updateConfig,
    startAutomaticBackup,
    stopAutomaticBackup,
    exportBackup,
    importBackup,
    refreshData,
    formatFileSize,
    formatDate,
    getBackupAge,
  } = useBackup();

  const [showConfig, setShowConfig] = useState(false);
  // const [selectedBackup, setSelectedBackup] = useState<string | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleCreateBackup = async () => {
    await createBackup();
    await refreshData();
  };

  const handleRestoreBackup = async (backupId: string) => {
    if (
      window.confirm(
        'Tem certeza que deseja restaurar este backup? Esta ação irá sobrescrever os dados atuais.'
      )
    ) {
      await restoreBackup(backupId);
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    if (window.confirm('Tem certeza que deseja deletar este backup?')) {
      await deleteBackup(backupId);
    }
  };

  const handleExportBackup = async (backupId: string) => {
    await exportBackup(backupId);
  };

  const handleImportBackup = async () => {
    if (importFile) {
      await importBackup(importFile);
      setImportFile(null);
    }
  };

  const handleToggleAutomaticBackup = () => {
    if (config.enabled) {
      stopAutomaticBackup();
      updateConfig({ enabled: false });
    } else {
      startAutomaticBackup();
      updateConfig({ enabled: true });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
            Gerenciador de Backup
          </h2>
          <p className='text-gray-600 dark:text-gray-400'>
            Gerencie backups automáticos e manuais do sistema
          </p>
        </div>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            onClick={() => setShowConfig(!showConfig)}
            disabled={loading}
          >
            <Settings size={16} className='mr-2' />
            Configurações
          </Button>
          <Button variant='outline' onClick={refreshData} disabled={loading}>
            <RefreshCw size={16} className='mr-2' />
            Atualizar
          </Button>
          <Button
            onClick={handleCreateBackup}
            disabled={loading || status.isRunning}
          >
            {loading ? (
              <LoadingSpinner size='sm' />
            ) : (
              <Download size={16} className='mr-2' />
            )}
            Criar Backup
          </Button>
        </div>
      </div>

      {/* Status */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  Status
                </p>
                <p className='text-lg font-semibold'>
                  {status.isRunning ? 'Executando' : 'Parado'}
                </p>
              </div>
              {status.isRunning ? (
                <RefreshCw className='h-8 w-8 text-blue-500 animate-spin' />
              ) : (
                <CheckCircle className='h-8 w-8 text-green-500' />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  Total de Backups
                </p>
                <p className='text-lg font-semibold'>{status.totalBackups}</p>
              </div>
              <HardDrive className='h-8 w-8 text-gray-500' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  Tamanho Total
                </p>
                <p className='text-lg font-semibold'>
                  {formatFileSize(status.totalSize)}
                </p>
              </div>
              <HardDrive className='h-8 w-8 text-gray-500' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  Último Backup
                </p>
                <p className='text-lg font-semibold'>
                  {(status as any).lastBackup
                    ? getBackupAge((status as any).lastBackup)
                    : 'Nunca'}
                </p>
              </div>
              <Clock className='h-8 w-8 text-gray-500' />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configurações */}
      {showConfig && (
        <Card>
          <CardHeader>
            <CardTitle>Configurações de Backup</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Backup Automático
                </label>
                <Button
                  variant={config.enabled ? 'default' : 'outline'}
                  onClick={handleToggleAutomaticBackup}
                  disabled={loading}
                >
                  {config.enabled ? (
                    <>
                      <Pause size={16} className='mr-2' />
                      Desabilitar
                    </>
                  ) : (
                    <>
                      <Play size={16} className='mr-2' />
                      Habilitar
                    </>
                  )}
                </Button>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Intervalo (minutos)
                </label>
                <input
                  type='number'
                  value={config.interval}
                  onChange={e =>
                    updateConfig({ interval: parseInt(e.target.value) })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  min='1'
                  max='1440'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Retenção (backups)
                </label>
                <input
                  type='number'
                  value={config.retention}
                  onChange={e =>
                    updateConfig({ retention: parseInt(e.target.value) })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  min='1'
                  max='30'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Incluir Arquivos
                </label>
                <input
                  type='checkbox'
                  checked={(config as any).includeFiles || false}
                  onChange={e =>
                    updateConfig({ includeFiles: e.target.checked } as any)
                  }
                  className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                />
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Tabelas Incluídas
              </label>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
                {((config as any).tables || []).map((table: any) => (
                  <label key={table} className='flex items-center'>
                    <input
                      type='checkbox'
                      checked={((config as any).tables || []).includes(table)}
                      onChange={e => {
                        if (e.target.checked) {
                          updateConfig({
                            tables: [...((config as any).tables || []), table],
                          } as any);
                        } else {
                          updateConfig({
                            tables: ((config as any).tables || []).filter(
                              (t: any) => t !== table
                            ),
                          } as any);
                        }
                      }}
                      className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2'
                    />
                    <span className='text-sm text-gray-700 dark:text-gray-300'>
                      {table}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Importar Backup */}
      <Card>
        <CardHeader>
          <CardTitle>Importar Backup</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex items-center gap-4'>
            <input
              type='file'
              accept='.json'
              onChange={handleFileSelect}
              className='block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
            />
            <Button
              onClick={handleImportBackup}
              disabled={!importFile || loading}
            >
              <Upload size={16} className='mr-2' />
              Importar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Backups */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Backups</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant='destructive' className='mb-4'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading && backups.length === 0 ? (
            <div className='flex justify-center py-8'>
              <LoadingSpinner />
            </div>
          ) : backups.length === 0 ? (
            <div className='text-center py-8'>
              <HardDrive className='h-12 w-12 text-gray-400 mx-auto mb-4' />
              <p className='text-gray-500'>Nenhum backup encontrado</p>
            </div>
          ) : (
            <div className='space-y-4'>
              {backups.map(backup => (
                <div
                  key={backup.id}
                  className='flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg'
                >
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-2'>
                      <h3 className='font-medium text-gray-900 dark:text-white'>
                        Backup {backup.id}
                      </h3>
                      <Badge variant='secondary'>
                        {formatFileSize(
                          (backup as any).metadata?.size ||
                            (backup as any).size ||
                            0
                        )}
                      </Badge>
                    </div>
                    <div className='text-sm text-gray-600 dark:text-gray-400'>
                      <p>Criado em: {formatDate(backup.timestamp)}</p>
                      <p>
                        Registros: {(backup as any).metadata?.totalRecords || 0}
                      </p>
                      <p>
                        Usuários: {(backup as any).metadata?.userCount || 0}
                      </p>
                    </div>
                  </div>
                  <div className='flex gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleExportBackup(backup.id)}
                    >
                      <Download size={16} />
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleRestoreBackup(backup.id)}
                    >
                      <RotateCcw size={16} />
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleDeleteBackup(backup.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ============================================================================
// EXPORTAÇÕES
// ============================================================================

export default BackupManager;
