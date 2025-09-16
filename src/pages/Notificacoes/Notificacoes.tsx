// ============================================================================
// PÁGINA: Notificações - Centro de Notificações em Tempo Real
// ============================================================================
// Esta página fornece um centro completo de notificações para gestão
// de alertas, lembretes e comunicações do sistema.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Bell,
  BellRing,
  CheckCircle,
  AlertCircle,
  Info,
  XCircle,
  Clock,
  User,
  Calendar,
  DollarSign,
  Trash2,
  Check,
  RefreshCw,
  Archive,
  Star,
  StarOff,
} from 'lucide-react';
import { Card, CardContent } from '@/design-system';
import { LoadingSpinner } from '@/components/LazyLoading/LazyWrapper';
import {
  notificationService,
  Notificacao,
} from '@/services/notificationService';
import toast from 'react-hot-toast';

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

interface Filtros {
  tipo: string;
  prioridade: string;
  status: string;
  dataInicio: string;
  dataFim: string;
  busca: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const Notificacoes: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [filtros, setFiltros] = useState<Filtros>({
    tipo: '',
    prioridade: '',
    status: '',
    dataInicio: '',
    dataFim: '',
    busca: '',
  });
  const [viewMode, setViewMode] = useState<
    'todas' | 'nao-lidas' | 'favoritas' | 'arquivadas'
  >('todas');

  // ============================================================================
  // EFEITOS
  // ============================================================================

  useEffect(() => {
    loadNotificacoes();

    // Subscrever para atualizações em tempo real
    const unsubscribe = notificationService.subscribe(novasNotificacoes => {
      setNotificacoes(novasNotificacoes);
    });

    return unsubscribe;
  }, []);

  // ============================================================================
  // FUNÇÕES
  // ============================================================================

  const loadNotificacoes = async () => {
    setLoading(true);
    try {
      const notificacoesCarregadas =
        await notificationService.loadNotificacoes();
      setNotificacoes(notificacoesCarregadas);
      toast.success('Notificações carregadas com sucesso!');
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      toast.error('Erro ao carregar notificações');
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarComoLida = async (id: string) => {
    try {
      await notificationService.marcarComoLida(id);
      toast.success('Notificação marcada como lida');
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
      toast.error('Erro ao marcar notificação como lida');
    }
  };

  const handleMarcarTodasComoLidas = async () => {
    try {
      const notificacoesNaoLidas = notificacoes.filter(
        n => !n.lida && !n.arquivada
      );
      for (const notif of notificacoesNaoLidas) {
        await notificationService.marcarComoLida(notif.id);
      }
      toast.success('Todas as notificações foram marcadas como lidas');
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
      toast.error('Erro ao marcar notificações como lidas');
    }
  };

  const handleToggleFavorita = async (id: string) => {
    try {
      await notificationService.toggleFavorita(id);
    } catch (error) {
      console.error('Erro ao toggle favorita:', error);
      toast.error('Erro ao alterar favorito');
    }
  };

  const handleArquivar = async (id: string) => {
    try {
      await notificationService.arquivar(id);
      toast.success('Notificação arquivada');
    } catch (error) {
      console.error('Erro ao arquivar:', error);
      toast.error('Erro ao arquivar notificação');
    }
  };

  const handleExcluir = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta notificação?')) {
      try {
        await notificationService.excluir(id);
        toast.success('Notificação excluída');
      } catch (error) {
        console.error('Erro ao excluir:', error);
        toast.error('Erro ao excluir notificação');
      }
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'appointment':
        return <Calendar className='h-5 w-5' />;
      case 'payment':
        return <DollarSign className='h-5 w-5' />;
      case 'reminder':
        return <Clock className='h-5 w-5' />;
      case 'info':
        return <Info className='h-5 w-5' />;
      case 'success':
        return <CheckCircle className='h-5 w-5' />;
      case 'error':
        return <XCircle className='h-5 w-5' />;
      case 'warning':
        return <AlertCircle className='h-5 w-5' />;
      default:
        return <Bell className='h-5 w-5' />;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'appointment':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900';
      case 'payment':
        return 'text-green-600 bg-green-100 dark:bg-green-900';
      case 'reminder':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900';
      case 'info':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900';
      case 'success':
        return 'text-green-600 bg-green-100 dark:bg-green-900';
      case 'error':
        return 'text-red-600 bg-red-100 dark:bg-red-900';
      case 'warning':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900';
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'urgente':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'alta':
        return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'media':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'baixa':
        return 'border-l-green-500 bg-green-50 dark:bg-green-900/20';
      default:
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const notificacoesFiltradas = notificacoes.filter(notif => {
    const matchesTipo = !filtros.tipo || notif.tipo === filtros.tipo;
    const matchesPrioridade =
      !filtros.prioridade || notif.prioridade === filtros.prioridade;
    const matchesStatus =
      !filtros.status ||
      (filtros.status === 'lidas' && notif.lida) ||
      (filtros.status === 'nao-lidas' && !notif.lida);
    const matchesBusca =
      !filtros.busca ||
      notif.titulo.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      notif.mensagem.toLowerCase().includes(filtros.busca.toLowerCase());

    // Filtro por modo de visualização
    const matchesViewMode =
      (viewMode === 'todas' && !notif.arquivada) ||
      (viewMode === 'nao-lidas' && !notif.lida && !notif.arquivada) ||
      (viewMode === 'favoritas' && notif.favorita && !notif.arquivada) ||
      (viewMode === 'arquivadas' && notif.arquivada);

    return (
      matchesTipo &&
      matchesPrioridade &&
      matchesStatus &&
      matchesBusca &&
      matchesViewMode
    );
  });

  const notificacoesNaoLidas = notificationService.getTotalNaoLidas();
  const notificacoesFavoritas =
    notificationService.getNotificacoesFavoritas().length;

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 p-6'>
      <Helmet>
        <title>Notificações - Sistema de Gestão de Clínica</title>
        <meta
          name='description'
          content='Centro de notificações em tempo real'
        />
      </Helmet>

      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center justify-between'>
            <div></div>
            <div className='flex items-center space-x-4'>
              <button
                onClick={loadNotificacoes}
                className='flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors'
              >
                <RefreshCw className='mr-2' size={16} />
                Atualizar
              </button>
              <button
                onClick={handleMarcarTodasComoLidas}
                className='flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
              >
                <Check className='mr-2' size={16} />
                Marcar Todas como Lidas
              </button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <Bell className='h-8 w-8 text-blue-600' />
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                    Total
                  </p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {notificacoes.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <BellRing className='h-8 w-8 text-red-600' />
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                    Não Lidas
                  </p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {notificacoesNaoLidas}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <Star className='h-8 w-8 text-yellow-600' />
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                    Favoritas
                  </p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {notificacoesFavoritas}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <Archive className='h-8 w-8 text-gray-600' />
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                    Arquivadas
                  </p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {notificacoes.filter(n => n.arquivada).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Modos de Visualização */}
        <Card className='mb-6'>
          <CardContent className='p-6'>
            <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0'>
              {/* Modos de Visualização */}
              <div className='flex space-x-2'>
                {[
                  {
                    key: 'todas',
                    label: 'Todas',
                    count: notificacoes.filter(n => !n.arquivada).length,
                  },
                  {
                    key: 'nao-lidas',
                    label: 'Não Lidas',
                    count: notificacoesNaoLidas,
                  },
                  {
                    key: 'favoritas',
                    label: 'Favoritas',
                    count: notificacoesFavoritas,
                  },
                  {
                    key: 'arquivadas',
                    label: 'Arquivadas',
                    count: notificacoes.filter(n => n.arquivada).length,
                  },
                ].map(mode => (
                  <button
                    key={mode.key}
                    onClick={() => setViewMode(mode.key as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      viewMode === mode.key
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {mode.label} ({mode.count})
                  </button>
                ))}
              </div>

              {/* Filtros */}
              <div className='flex flex-wrap gap-4'>
                <select
                  value={filtros.tipo}
                  onChange={e =>
                    setFiltros({ ...filtros, tipo: e.target.value })
                  }
                  className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm'
                >
                  <option value=''>Todos os tipos</option>
                  <option value='appointment'>Agendamentos</option>
                  <option value='payment'>Pagamentos</option>
                  <option value='reminder'>Lembretes</option>
                  <option value='info'>Informações</option>
                  <option value='success'>Sucessos</option>
                  <option value='error'>Erros</option>
                  <option value='warning'>Avisos</option>
                </select>

                <select
                  value={filtros.prioridade}
                  onChange={e =>
                    setFiltros({ ...filtros, prioridade: e.target.value })
                  }
                  className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm'
                >
                  <option value=''>Todas as prioridades</option>
                  <option value='urgente'>Urgente</option>
                  <option value='alta'>Alta</option>
                  <option value='media'>Média</option>
                  <option value='baixa'>Baixa</option>
                </select>

                <input
                  type='text'
                  placeholder='Buscar notificações...'
                  value={filtros.busca}
                  onChange={e =>
                    setFiltros({ ...filtros, busca: e.target.value })
                  }
                  className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm min-w-[200px]'
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Notificações */}
        <div className='space-y-4'>
          {notificacoesFiltradas.map(notificacao => (
            <Card
              key={notificacao.id}
              className={`transition-all duration-200 hover:shadow-lg ${
                !notificacao.lida
                  ? 'ring-2 ring-blue-200 dark:ring-blue-800'
                  : ''
              } ${getPrioridadeColor(notificacao.prioridade)}`}
            >
              <CardContent className='p-6'>
                <div className='flex items-start space-x-4'>
                  {/* Ícone do tipo */}
                  <div
                    className={`p-2 rounded-full ${getTipoColor(notificacao.tipo)}`}
                  >
                    {getTipoIcon(notificacao.tipo)}
                  </div>

                  {/* Conteúdo */}
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <div className='flex items-center space-x-2 mb-1'>
                          <h3
                            className={`text-lg font-semibold ${
                              !notificacao.lida
                                ? 'text-gray-900 dark:text-white'
                                : 'text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            {notificacao.titulo}
                          </h3>
                          {!notificacao.lida && (
                            <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                          )}
                          {notificacao.favorita && (
                            <Star className='h-4 w-4 text-yellow-500 fill-current' />
                          )}
                        </div>

                        <p className='text-gray-600 dark:text-gray-300 mb-2'>
                          {notificacao.mensagem}
                        </p>

                        <div className='flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400'>
                          <span className='flex items-center'>
                            <User className='mr-1' size={14} />
                            {notificacao.remetente}
                          </span>
                          <span className='flex items-center'>
                            <Clock className='mr-1' size={14} />
                            {new Date(notificacao.dataCriacao).toLocaleString(
                              'pt-BR'
                            )}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              notificacao.prioridade === 'urgente'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                : notificacao.prioridade === 'alta'
                                  ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                                  : notificacao.prioridade === 'media'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            }`}
                          >
                            {notificacao.prioridade.toUpperCase()}
                          </span>
                        </div>

                        {/* Ações da notificação */}
                        {notificacao.acoes && notificacao.acoes.length > 0 && (
                          <div className='mt-3 flex space-x-2'>
                            {notificacao.acoes.map(acao => (
                              <button
                                key={acao.id}
                                onClick={acao.acao}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                  acao.cor === 'primary'
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : acao.cor === 'success'
                                      ? 'bg-green-600 text-white hover:bg-green-700'
                                      : acao.cor === 'warning'
                                        ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                                        : acao.cor === 'danger'
                                          ? 'bg-red-600 text-white hover:bg-red-700'
                                          : 'bg-gray-600 text-white hover:bg-gray-700'
                                }`}
                              >
                                {acao.icone && (
                                  <acao.icone className='mr-1' size={14} />
                                )}
                                {acao.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Ações */}
                      <div className='flex items-center space-x-2'>
                        {!notificacao.lida && (
                          <button
                            onClick={() => handleMarcarComoLida(notificacao.id)}
                            className='p-2 text-gray-400 hover:text-blue-600 transition-colors'
                            title='Marcar como lida'
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}

                        <button
                          onClick={() => handleToggleFavorita(notificacao.id)}
                          className={`p-2 transition-colors ${
                            notificacao.favorita
                              ? 'text-yellow-500 hover:text-yellow-600'
                              : 'text-gray-400 hover:text-yellow-500'
                          }`}
                          title={
                            notificacao.favorita
                              ? 'Remover dos favoritos'
                              : 'Adicionar aos favoritos'
                          }
                        >
                          {notificacao.favorita ? (
                            <Star size={16} className='fill-current' />
                          ) : (
                            <StarOff size={16} />
                          )}
                        </button>

                        <button
                          onClick={() => handleArquivar(notificacao.id)}
                          className='p-2 text-gray-400 hover:text-gray-600 transition-colors'
                          title='Arquivar'
                        >
                          <Archive size={16} />
                        </button>

                        <button
                          onClick={() => handleExcluir(notificacao.id)}
                          className='p-2 text-gray-400 hover:text-red-600 transition-colors'
                          title='Excluir'
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mensagem quando não há notificações */}
        {notificacoesFiltradas.length === 0 && (
          <Card className='text-center py-12'>
            <CardContent>
              <Bell className='mx-auto h-12 w-12 text-gray-400 mb-4' />
              <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
                Nenhuma notificação encontrada
              </h3>
              <p className='text-gray-500 dark:text-gray-400'>
                {viewMode === 'todas'
                  ? 'Você está em dia com todas as notificações!'
                  : viewMode === 'nao-lidas'
                    ? 'Todas as notificações foram lidas!'
                    : viewMode === 'favoritas'
                      ? 'Nenhuma notificação favoritada!'
                      : 'Nenhuma notificação arquivada!'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Notificacoes;
