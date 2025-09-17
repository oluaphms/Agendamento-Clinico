// ============================================================================
// PÁGINA: Integração WhatsApp - Sistema de Comunicação
// ============================================================================
// Esta página gerencia a integração com WhatsApp para envio de
// lembretes, confirmações e notificações aos pacientes.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  MessageCircle,
  Send,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  Plus,
  Eye,
  Edit,
  Trash2,
  Settings,
  Zap,
  Bell,
  Shield,
} from 'lucide-react';
import { Card, CardContent } from '@/design-system';
import { LoadingSpinner } from '@/components/LazyLoading/LazyWrapper';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { formatDate, formatTime, formatPhone } from '@/lib/utils';

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

interface MensagemWhatsApp {
  id: string;
  paciente_id: string;
  agendamento_id: string;
  numero_telefone: string;
  mensagem: string;
  tipo: 'lembrete' | 'confirmacao' | 'cancelamento' | 'reagendamento' | 'geral';
  status: 'pendente' | 'enviada' | 'entregue' | 'falhou';
  data_envio?: string;
  resposta?: string;
  created_at: string;
  updated_at: string;
  // Relacionamentos
  paciente?: {
    nome: string;
    telefone: string;
    email?: string;
  };
  agendamento?: {
    data: string;
    hora: string;
    servico: {
      nome: string;
    };
  };
}

interface TemplateMensagem {
  id: string;
  nome: string;
  tipo: string;
  conteudo: string;
  variaveis: string[];
  ativo: boolean;
}

interface Filtros {
  tipo: string;
  status: string;
  data_inicio: string;
  data_fim: string;
  busca: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const WhatsAppIntegration: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [mensagens, setMensagens] = useState<MensagemWhatsApp[]>([]);
  const [templates, setTemplates] = useState<TemplateMensagem[]>([]);
  const [filtros, setFiltros] = useState<Filtros>({
    tipo: '',
    status: '',
    data_inicio: '',
    data_fim: '',
    busca: '',
  });
  const [modalAberto, setModalAberto] = useState(false);
  const [mensagemSelecionada, setMensagemSelecionada] = useState<MensagemWhatsApp | null>(null);
  const [configuracao, setConfiguracao] = useState({
    token: '',
    webhook: '',
    ativo: false,
  });

  // ============================================================================
  // EFEITOS
  // ============================================================================

  useEffect(() => {
    loadDados();
  }, [filtros]);

  // ============================================================================
  // FUNÇÕES
  // ============================================================================

  const loadDados = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadMensagens(),
        loadTemplates(),
        loadConfiguracao(),
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  const loadMensagens = async () => {
    try {
      let query = supabase
        .from('mensagens_whatsapp')
        .select(`
          *,
          paciente:pacientes(nome, telefone, email),
          agendamento:agendamentos(
            data,
            hora,
            servico:servicos(nome)
          )
        `)
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filtros.tipo) {
        query = query.eq('tipo', filtros.tipo);
      }
      if (filtros.status) {
        query = query.eq('status', filtros.status);
      }
      if (filtros.data_inicio) {
        query = query.gte('created_at', filtros.data_inicio);
      }
      if (filtros.data_fim) {
        query = query.lte('created_at', filtros.data_fim);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao carregar mensagens:', error);
        toast.error('Erro ao carregar mensagens');
        return;
      }

      // Filtrar por busca se necessário
      let mensagensFiltradas = data || [];
      if (filtros.busca) {
        const busca = filtros.busca.toLowerCase();
        mensagensFiltradas = mensagensFiltradas.filter(mensagem =>
          mensagem.paciente?.nome.toLowerCase().includes(busca) ||
          mensagem.mensagem.toLowerCase().includes(busca) ||
          mensagem.numero_telefone.includes(busca)
        );
      }

      setMensagens(mensagensFiltradas);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      toast.error('Erro ao carregar mensagens');
    }
  };

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('tipo', 'whatsapp')
        .eq('ativo', true)
        .order('nome');

      if (error) {
        console.error('Erro ao carregar templates:', error);
        return;
      }

      setTemplates(data || []);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    }
  };

  const loadConfiguracao = async () => {
    try {
      const { data, error } = await supabase
        .from('configuracao_financeira')
        .select('*')
        .eq('chave', 'whatsapp_config');

      if (error) {
        console.error('Erro ao carregar configuração:', error);
        return;
      }

      if (data && data.length > 0) {
        setConfiguracao(data[0].valor);
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
    }
  };

  const enviarMensagem = async (mensagem: string, numero: string, tipo: string) => {
    try {
      // Simular envio via API do WhatsApp
      const { error } = await supabase
        .from('mensagens_whatsapp')
        .insert({
          numero_telefone: numero,
          mensagem: mensagem,
          tipo: tipo,
          status: 'enviada',
          data_envio: new Date().toISOString(),
        });

      if (error) {
        console.error('Erro ao enviar mensagem:', error);
        toast.error('Erro ao enviar mensagem');
        return;
      }

      toast.success('Mensagem enviada com sucesso');
      loadMensagens();
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem');
    }
  };

  const reenviarMensagem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('mensagens_whatsapp')
        .update({ 
          status: 'enviada',
          data_envio: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Erro ao reenviar mensagem:', error);
        toast.error('Erro ao reenviar mensagem');
        return;
      }

      toast.success('Mensagem reenviada com sucesso');
      loadMensagens();
    } catch (error) {
      console.error('Erro ao reenviar mensagem:', error);
      toast.error('Erro ao reenviar mensagem');
    }
  };

  const handleExcluir = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta mensagem?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('mensagens_whatsapp')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir mensagem:', error);
        toast.error('Erro ao excluir mensagem');
        return;
      }

      toast.success('Mensagem excluída com sucesso');
      loadMensagens();
    } catch (error) {
      console.error('Erro ao excluir mensagem:', error);
      toast.error('Erro ao excluir mensagem');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'enviada':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'entregue':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'falhou':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pendente':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enviada':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'entregue':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'falhou':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'lembrete':
        return <Bell className="h-4 w-4 text-blue-500" />;
      case 'confirmacao':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelamento':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'reagendamento':
        return <RefreshCw className="h-4 w-4 text-orange-500" />;
      case 'geral':
        return <MessageCircle className="h-4 w-4 text-purple-500" />;
      default:
        return <MessageCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTipoLabel = (tipo: string) => {
    const labels = {
      lembrete: 'Lembrete',
      confirmacao: 'Confirmação',
      cancelamento: 'Cancelamento',
      reagendamento: 'Reagendamento',
      geral: 'Geral',
    };
    return labels[tipo as keyof typeof labels] || tipo;
  };

  const mensagensFiltradas = mensagens.filter(mensagem => {
    const matchesTipo = !filtros.tipo || mensagem.tipo === filtros.tipo;
    const matchesStatus = !filtros.status || mensagem.status === filtros.status;
    const matchesDataInicio = !filtros.data_inicio || 
      new Date(mensagem.created_at) >= new Date(filtros.data_inicio);
    const matchesDataFim = !filtros.data_fim || 
      new Date(mensagem.created_at) <= new Date(filtros.data_fim);
    const matchesBusca = !filtros.busca || 
      mensagem.paciente?.nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      mensagem.mensagem.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      mensagem.numero_telefone.includes(filtros.busca);

    return matchesTipo && matchesStatus && matchesDataInicio && matchesDataFim && matchesBusca;
  });

  // Estatísticas
  const totalMensagens = mensagens.length;
  const mensagensEnviadas = mensagens.filter(m => m.status === 'enviada').length;
  const mensagensEntregues = mensagens.filter(m => m.status === 'entregue').length;
  const mensagensFalharam = mensagens.filter(m => m.status === 'falhou').length;

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <Helmet>
        <title>Integração WhatsApp - Sistema de Gestão de Clínica</title>
        <meta name="description" content="Gerencie mensagens e notificações via WhatsApp" />
      </Helmet>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <MessageCircle className="h-8 w-8 text-blue-600" />
                Integração WhatsApp
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Gerencie mensagens e notificações via WhatsApp
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={loadDados}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="mr-2" size={16} />
                Atualizar
              </button>
              <button
                onClick={() => setModalAberto(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="mr-2" size={16} />
                Nova Mensagem
              </button>
              <button
                onClick={() => setModalAberto(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Settings className="mr-2" size={16} />
                Configurações
              </button>
            </div>
          </div>
        </div>

        {/* Status da Integração */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${configuracao.ativo ? 'bg-green-500' : 'bg-red-500'}`} />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Status da Integração
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {configuracao.ativo ? 'Ativa' : 'Inativa'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Token</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {configuracao.token ? 'Configurado' : 'Não configurado'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Webhook</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {configuracao.webhook ? 'Configurado' : 'Não configurado'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageCircle className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Total de Mensagens
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalMensagens}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Send className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Enviadas
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {mensagensEnviadas}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Entregues
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {mensagensEntregues}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Falharam
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {mensagensFalharam}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-5 w-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Filtros:
                  </span>
                </div>
                <select
                  value={filtros.tipo}
                  onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">Todos os tipos</option>
                  <option value="lembrete">Lembrete</option>
                  <option value="confirmacao">Confirmação</option>
                  <option value="cancelamento">Cancelamento</option>
                  <option value="reagendamento">Reagendamento</option>
                  <option value="geral">Geral</option>
                </select>
                <select
                  value={filtros.status}
                  onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">Todos os status</option>
                  <option value="pendente">Pendente</option>
                  <option value="enviada">Enviada</option>
                  <option value="entregue">Entregue</option>
                  <option value="falhou">Falhou</option>
                </select>
              </div>
              <div className="flex items-center space-x-4">
                <input
                  type="date"
                  value={filtros.data_inicio}
                  onChange={(e) => setFiltros({ ...filtros, data_inicio: e.target.value })}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  placeholder="Data início"
                />
                <input
                  type="date"
                  value={filtros.data_fim}
                  onChange={(e) => setFiltros({ ...filtros, data_fim: e.target.value })}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  placeholder="Data fim"
                />
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar mensagens..."
                    value={filtros.busca}
                    onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm min-w-[200px]"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Mensagens */}
        <div className="space-y-4">
          {mensagensFiltradas.map((mensagem) => (
            <Card key={mensagem.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="flex items-center space-x-2">
                        {getTipoIcon(mensagem.tipo)}
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {getTipoLabel(mensagem.tipo)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(mensagem.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(mensagem.status)}`}>
                          {mensagem.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(mensagem.created_at)}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Mensagem
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {mensagem.mensagem}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Paciente</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {mensagem.paciente?.nome || 'N/A'}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400">
                          {formatPhone(mensagem.numero_telefone)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Agendamento</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {mensagem.agendamento?.data ? formatDate(mensagem.agendamento.data) : 'N/A'}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400">
                          {mensagem.agendamento?.hora || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {mensagem.resposta && (
                      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Resposta do Paciente
                        </p>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {mensagem.resposta}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {mensagem.status === 'falhou' && (
                      <button
                        onClick={() => reenviarMensagem(mensagem.id)}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="Reenviar mensagem"
                      >
                        <RefreshCw size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => setMensagemSelecionada(mensagem)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Ver detalhes"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => setMensagemSelecionada(mensagem)}
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleExcluir(mensagem.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mensagem quando não há mensagens */}
        {mensagensFiltradas.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nenhuma mensagem encontrada
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Não há mensagens que correspondam aos filtros selecionados.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WhatsAppIntegration;
