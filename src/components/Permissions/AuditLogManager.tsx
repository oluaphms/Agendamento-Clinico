// ============================================================================
// COMPONENTE: AuditLogManager - Gerenciador de Log de Auditoria
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Clock,
  User,
  Shield,
  Edit,
  Plus,
  Trash2,
  Search,
  Filter,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Input } from '@/design-system';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: 'create' | 'update' | 'delete' | 'assign' | 'remove' | 'approve' | 'reject';
  resource: string;
  details: string;
  oldValue?: string;
  newValue?: string;
  ipAddress: string;
  userAgent: string;
}

// ============================================================================
// DADOS MOCKADOS
// ============================================================================

const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: '1',
    timestamp: '2025-01-08T10:30:00Z',
    user: 'João Silva',
    action: 'assign',
    resource: 'user-role',
    details: 'Atribuiu role "Médico" para Maria Santos',
    oldValue: 'Recepcionista',
    newValue: 'Médico',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
  {
    id: '2',
    timestamp: '2025-01-08T09:15:00Z',
    user: 'João Silva',
    action: 'create',
    resource: 'permission',
    details: 'Criou nova permissão "patients:export"',
    newValue: 'patients:export',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
  {
    id: '3',
    timestamp: '2025-01-08T08:45:00Z',
    user: 'Maria Santos',
    action: 'update',
    resource: 'user-permission',
    details: 'Atualizou permissões customizadas para Ana Costa',
    oldValue: 'patients:read, schedule:read',
    newValue: 'patients:read, patients:update, schedule:read',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  },
  {
    id: '4',
    timestamp: '2025-01-07T16:20:00Z',
    user: 'João Silva',
    action: 'approve',
    resource: 'pending-user',
    details: 'Aprovou usuário Carlos Oliveira para role "Enfermeiro"',
    newValue: 'Enfermeiro',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
  {
    id: '5',
    timestamp: '2025-01-07T14:10:00Z',
    user: 'João Silva',
    action: 'delete',
    resource: 'role',
    details: 'Removeu role "Temporário" do sistema',
    oldValue: 'Temporário',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
  {
    id: '6',
    timestamp: '2025-01-07T11:30:00Z',
    user: 'Ana Costa',
    action: 'update',
    resource: 'user-profile',
    details: 'Atualizou seu próprio perfil',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export const AuditLogManager: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(MOCK_AUDIT_LOGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterResource, setFilterResource] = useState('all');
  const [filterUser, setFilterUser] = useState('all');
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);

  // ============================================================================
  // FUNÇÕES AUXILIARES
  // ============================================================================

  const getActionIcon = (action: string) => {
    const icons: Record<string, React.ReactNode> = {
      'create': <Plus className='h-4 w-4' />,
      'update': <Edit className='h-4 w-4' />,
      'delete': <Trash2 className='h-4 w-4' />,
      'assign': <Shield className='h-4 w-4' />,
      'remove': <XCircle className='h-4 w-4' />,
      'approve': <CheckCircle className='h-4 w-4' />,
      'reject': <XCircle className='h-4 w-4' />,
    };
    return icons[action] || <AlertTriangle className='h-4 w-4' />;
  };

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      'create': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200',
      'update': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200',
      'delete': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200',
      'assign': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200',
      'remove': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200',
      'approve': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200',
      'reject': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200',
    };
    return colors[action] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
  };

  const getActionText = (action: string) => {
    const texts: Record<string, string> = {
      'create': 'Criou',
      'update': 'Atualizou',
      'delete': 'Removeu',
      'assign': 'Atribuiu',
      'remove': 'Removeu',
      'approve': 'Aprovou',
      'reject': 'Rejeitou',
    };
    return texts[action] || action;
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.resource.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const matchesResource = filterResource === 'all' || log.resource === filterResource;
    const matchesUser = filterUser === 'all' || log.user === filterUser;
    
    return matchesSearch && matchesAction && matchesResource && matchesUser;
  });

  const uniqueUsers = Array.from(new Set(auditLogs.map(log => log.user)));
  const uniqueResources = Array.from(new Set(auditLogs.map(log => log.resource)));
  const uniqueActions = Array.from(new Set(auditLogs.map(log => log.action)));

  // ============================================================================
  // RENDERIZAÇÃO
  // ============================================================================

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
            Log de Auditoria
          </h2>
          <p className='text-gray-600 dark:text-gray-400 mt-1'>
            Histórico de todas as mudanças de permissões e configurações
          </p>
        </div>
        <div className='flex space-x-2'>
          <Button variant='outline' size='sm'>
            <Download className='h-4 w-4 mr-2' />
            Exportar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Buscar
            </label>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
              <Input
                placeholder='Buscar no log...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10'
              />
            </div>
          </div>
          
          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Ação
            </label>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
            >
              <option value='all'>Todas as ações</option>
              {uniqueActions.map(action => (
                <option key={action} value={action}>
                  {getActionText(action)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Recurso
            </label>
            <select
              value={filterResource}
              onChange={(e) => setFilterResource(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
            >
              <option value='all'>Todos os recursos</option>
              {uniqueResources.map(resource => (
                <option key={resource} value={resource}>{resource}</option>
              ))}
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
              Usuário
            </label>
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
            >
              <option value='all'>Todos os usuários</option>
              {uniqueUsers.map(user => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Logs */}
      <div className='space-y-4'>
        {filteredLogs.length === 0 ? (
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center'>
            <AlertTriangle className='h-12 w-12 text-gray-400 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
              Nenhum log encontrado
            </h3>
            <p className='text-gray-600 dark:text-gray-400'>
              Não há entradas de log que correspondam aos filtros aplicados
            </p>
          </div>
        ) : (
          filteredLogs.map(log => (
            <Card key={log.id} className='hover:shadow-md transition-shadow'>
              <CardContent className='p-4'>
                <div className='flex items-start space-x-4'>
                  <div className='flex-shrink-0'>
                    <div className={`p-2 rounded-full ${getActionColor(log.action)}`}>
                      {getActionIcon(log.action)}
                    </div>
                  </div>
                  
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center justify-between mb-2'>
                      <div className='flex items-center space-x-2'>
                        <Badge className={getActionColor(log.action)}>
                          {getActionText(log.action)}
                        </Badge>
                        <span className='text-sm text-gray-600 dark:text-gray-400'>
                          {log.resource}
                        </span>
                      </div>
                      <div className='flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400'>
                        <Clock className='h-4 w-4' />
                        <span>{new Date(log.timestamp).toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                    
                    <div className='mb-2'>
                      <p className='text-sm text-gray-900 dark:text-white'>
                        {log.details}
                      </p>
                    </div>
                    
                    <div className='flex items-center justify-between text-xs text-gray-500 dark:text-gray-400'>
                      <div className='flex items-center space-x-4'>
                        <div className='flex items-center space-x-1'>
                          <User className='h-3 w-3' />
                          <span>{log.user}</span>
                        </div>
                        <div className='flex items-center space-x-1'>
                          <Shield className='h-3 w-3' />
                          <span>{log.ipAddress}</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => setSelectedEntry(log)}
                        variant='outline'
                        size='sm'
                      >
                        <Eye className='h-3 w-3 mr-1' />
                        Detalhes
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal de Detalhes */}
      {selectedEntry && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                Detalhes do Log
              </h3>
              <Button
                onClick={() => setSelectedEntry(null)}
                variant='outline'
                size='sm'
              >
                ✕
              </Button>
            </div>
            
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
                    Usuário
                  </label>
                  <p className='text-sm text-gray-900 dark:text-white'>{selectedEntry.user}</p>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
                    Data/Hora
                  </label>
                  <p className='text-sm text-gray-900 dark:text-white'>
                    {new Date(selectedEntry.timestamp).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
                    Ação
                  </label>
                  <p className='text-sm text-gray-900 dark:text-white'>
                    {getActionText(selectedEntry.action)}
                  </p>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
                    Recurso
                  </label>
                  <p className='text-sm text-gray-900 dark:text-white'>{selectedEntry.resource}</p>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
                    IP
                  </label>
                  <p className='text-sm text-gray-900 dark:text-white'>{selectedEntry.ipAddress}</p>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
                    User Agent
                  </label>
                  <p className='text-sm text-gray-900 dark:text-white truncate'>{selectedEntry.userAgent}</p>
                </div>
              </div>
              
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
                  Detalhes
                </label>
                <p className='text-sm text-gray-900 dark:text-white'>{selectedEntry.details}</p>
              </div>
              
              {selectedEntry.oldValue && (
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
                    Valor Anterior
                  </label>
                  <p className='text-sm text-gray-900 dark:text-white bg-red-50 dark:bg-red-900/20 p-2 rounded'>
                    {selectedEntry.oldValue}
                  </p>
                </div>
              )}
              
              {selectedEntry.newValue && (
                <div>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
                    Novo Valor
                  </label>
                  <p className='text-sm text-gray-900 dark:text-white bg-green-50 dark:bg-green-900/20 p-2 rounded'>
                    {selectedEntry.newValue}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogManager;
