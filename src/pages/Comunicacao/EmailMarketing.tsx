// ============================================================================
// PÁGINA: Email Marketing - Sistema de Comunicação
// ============================================================================
// Esta página gerencia campanhas de email marketing para pacientes,
// incluindo templates, segmentação e relatórios de performance.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

import { Card, CardContent } from '@/design-system';
import { LoadingSpinner } from '@/components/LazyLoading/LazyWrapper';

import toast from 'react-hot-toast';

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

interface EmailMarketing {
  id: string;
  paciente_id: string;
  agendamento_id: string;
  email_destino: string;
  assunto: string;
  corpo: string;
  tipo: 'lembrete' | 'confirmacao' | 'cancelamento' | 'reagendamento' | 'marketing' | 'geral';
  status: 'pendente' | 'enviado' | 'entregue' | 'falhou' | 'aberto' | 'clicado';
  data_envio?: string;
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

interface CampanhaEmail {
  id: string;
  nome: string;
  assunto: string;
  corpo: string;
  segmentacao: any;
  status: 'rascunho' | 'agendada' | 'enviando' | 'enviada' | 'pausada' | 'cancelada';
  data_criacao: string;
  data_envio?: string;
  total_envios: number;
  total_abertos: number;
  total_cliques: number;
  taxa_abertura: number;
  taxa_clique: number;
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

const EmailMarketing: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [emails, setEmails] = useState<EmailMarketing[]>([]);
  const [campanhas, setCampanhas] = useState<CampanhaEmail[]>([]);
  const [filtros, setFiltros] = useState<Filtros>({
    tipo: '',
    status: '',
    data_inicio: '',
    data_fim: '',
    busca: '',
  });
  const [modalAberto, setModalAberto] = useState(false);
  const [emailSelecionado, setEmailSelecionado] = useState<EmailMarketing | null>(null);
  const [viewMode, setViewMode] = useState<'emails' | 'campanhas'>('emails');
  const [configuracao, setConfiguracao] = useState({
    smtp_host: '',
    smtp_port: '',
    smtp_user: '',
    smtp_pass: '',
    ativo: false,
  });

  // ============================================================================
  // EFEITOS
  // ============================================================================

  useEffect(() => {
    loadDados();
  }, [filtros, viewMode]);

  // ============================================================================
  // FUNÇÕES
  // ============================================================================

  const loadDados = async () => {
    setLoading(true);
    try {
      if (viewMode === 'emails') {
        await loadEmails();
      } else {
        await loadCampanhas();
      }
      await loadConfiguracao();
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do email marketing');
    } finally {
      setLoading(false);
    }
  };

  const loadEmails = async () => {
    try {
      let query = supabase
        .from('emails')
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
        console.error('Erro ao carregar emails:', error);
        toast.error('Erro ao carregar emails');
        return;
      }

      // Filtrar por busca se necessário
      let emailsFiltrados = data || [];
      if (filtros.busca) {
        const busca = filtros.busca.toLowerCase();
        emailsFiltrados = emailsFiltrados.filter(email =>
          email.paciente?.nome.toLowerCase().includes(busca) ||
          email.assunto.toLowerCase().includes(busca) ||
          email.email_destino.toLowerCase().includes(busca)
        );
      }

      setEmails(emailsFiltrados);
    } catch (error) {
      console.error('Erro ao carregar emails:', error);
      toast.error('Erro ao carregar emails');
    }
  };

  const loadCampanhas = async () => {
    try {
      // Simular carregamento de campanhas
      const campanhasMock: CampanhaEmail[] = [
        {
          id: '1',
          nome: 'Lembretes de Consulta',
          assunto: 'Lembrete: Sua consulta está chegando',
          corpo: 'Olá {nome}, sua consulta está agendada para {data} às {hora}.',
          segmentacao: { tipo: 'todos' },
          status: 'enviada',
          data_criacao: '2024-01-01',
          data_envio: '2024-01-01',
          total_envios: 150,
          total_abertos: 120,
          total_cliques: 45,
          taxa_abertura: 80,
          taxa_clique: 30,
        },
        {
          id: '2',
          nome: 'Promoção de Serviços',
          assunto: 'Confira nossas promoções especiais',
          corpo: 'Olá {nome}, temos promoções especiais para você!',
          segmentacao: { tipo: 'ativos' },
          status: 'enviando',
          data_criacao: '2024-01-15',
          data_envio: '2024-01-15',
          total_envios: 200,
          total_abertos: 160,
          total_cliques: 60,
          taxa_abertura: 80,
          taxa_clique: 30,
        },
      ];

      setCampanhas(campanhasMock);
    } catch (error) {
      console.error('Erro ao carregar campanhas:', error);
      toast.error('Erro ao carregar campanhas');
    }
  };

  const loadConfiguracao = async () => {
    try {
      const { data, error } = await supabase
        .from('configuracao_financeira')
        .select('*')
        .eq('chave', 'email_config');

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

  const enviarEmail = async (assunto: string, corpo: string, email: string, tipo: string) => {
    try {
      const { error } = await supabase
        .from('emails')
        .insert({
          email_destino: email,
          assunto: assunto,
          corpo: corpo,
          tipo: tipo,
          status: 'enviado',
          data_envio: new Date().toISOString(),
        });

      if (error) {
        console.error('Erro ao enviar email:', error);
        toast.error('Erro ao enviar email');
        return;
      }

      toast.success('Email enviado com sucesso');
      loadEmails();
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      toast.error('Erro ao enviar email');
    }
  };

  const handleExcluir = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este email?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('emails')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir email:', error);
        toast.error('Erro ao excluir email');
        return;
      }

      toast.success('Email excluído com sucesso');
      loadEmails();
    } catch (error) {
      console.error('Erro ao excluir email:', error);
      toast.error('Erro ao excluir email');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'enviado':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'entregue':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'aberto':
        return <EyeIcon className="h-5 w-5 text-blue-500" />;
      case 'clicado':
        return <MousePointer className="h-5 w-5 text-purple-500" />;
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
      case 'enviado':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'entregue':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'aberto':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'clicado':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
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
      case 'marketing':
        return <Target className="h-4 w-4 text-purple-500" />;
      case 'geral':
        return <Mail className="h-4 w-4 text-gray-500" />;
      default:
        return <Mail className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTipoLabel = (tipo: string) => {
    const labels = {
      lembrete: 'Lembrete',
      confirmacao: 'Confirmação',
      cancelamento: 'Cancelamento',
      reagendamento: 'Reagendamento',
      marketing: 'Marketing',
      geral: 'Geral',
    };
    return labels[tipo as keyof typeof labels] || tipo;
  };

  const emailsFiltrados = emails.filter(email => {
    const matchesTipo = !filtros.tipo || email.tipo === filtros.tipo;
    const matchesStatus = !filtros.status || email.status === filtros.status;
    const matchesDataInicio = !filtros.data_inicio || 
      new Date(email.created_at) >= new Date(filtros.data_inicio);
    const matchesDataFim = !filtros.data_fim || 
      new Date(email.created_at) <= new Date(filtros.data_fim);
    const matchesBusca = !filtros.busca || 
      email.paciente?.nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      email.assunto.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      email.email_destino.toLowerCase().includes(filtros.busca.toLowerCase());

    return matchesTipo && matchesStatus && matchesDataInicio && matchesDataFim && matchesBusca;
  });

  // Estatísticas
  const totalEmails = emails.length;
  const emailsEnviados = emails.filter(e => e.status === 'enviado').length;
  const emailsAbertos = emails.filter(e => e.status === 'aberto').length;
  const emailsClicados = emails.filter(e => e.status === 'clicado').length;

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
        <title>Email Marketing - Sistema de Gestão de Clínica</title>
        <meta name="description" content="Gerencie campanhas de email marketing" />
      </Helmet>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Mail className="h-8 w-8 text-blue-600" />
                Email Marketing
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Gerencie campanhas de email marketing e comunicação
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('emails')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'emails'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Emails
                </button>
                <button
                  onClick={() => setViewMode('campanhas')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'campanhas'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Campanhas
                </button>
              </div>
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
                {viewMode === 'emails' ? 'Novo Email' : 'Nova Campanha'}
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">SMTP Host</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {configuracao.smtp_host ? 'Configurado' : 'Não configurado'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">SMTP User</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {configuracao.smtp_user ? 'Configurado' : 'Não configurado'}
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
                <Mail className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Total de Emails
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalEmails}
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
                    Enviados
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {emailsEnviados}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <EyeIcon className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Abertos
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {emailsAbertos}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MousePointer className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Clicados
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {emailsClicados}
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
                  <option value="marketing">Marketing</option>
                  <option value="geral">Geral</option>
                </select>
                <select
                  value={filtros.status}
                  onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">Todos os status</option>
                  <option value="pendente">Pendente</option>
                  <option value="enviado">Enviado</option>
                  <option value="entregue">Entregue</option>
                  <option value="aberto">Aberto</option>
                  <option value="clicado">Clicado</option>
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
                    placeholder="Buscar emails..."
                    value={filtros.busca}
                    onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm min-w-[200px]"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conteúdo Principal */}
        {viewMode === 'emails' ? (
          /* Lista de Emails */
          <div className="space-y-4">
            {emailsFiltrados.map((email) => (
              <Card key={email.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="flex items-center space-x-2">
                          {getTipoIcon(email.tipo)}
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {getTipoLabel(email.tipo)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(email.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(email.status)}`}>
                            {email.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(email.created_at)}
                          </span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Assunto
                        </p>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {email.assunto}
                        </p>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Conteúdo
                        </p>
                        <p className="text-sm text-gray-900 dark:text-white line-clamp-2">
                          {email.corpo}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Destinatário</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {email.paciente?.nome || 'N/A'}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400">
                            {email.email_destino}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Agendamento</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {email.agendamento?.data ? formatDate(email.agendamento.data) : 'N/A'}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400">
                            {email.agendamento?.hora || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => setEmailSelecionado(email)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Ver detalhes"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => setEmailSelecionado(email)}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleExcluir(email.id)}
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
        ) : (
          /* Lista de Campanhas */
          <div className="space-y-4">
            {campanhas.map((campanha) => (
              <Card key={campanha.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <Target className="h-5 w-5 text-purple-500" />
                          <span className="text-lg font-semibold text-gray-900 dark:text-white">
                            {campanha.nome}
                          </span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          campanha.status === 'enviada' ? 'bg-green-100 text-green-800' :
                          campanha.status === 'enviando' ? 'bg-blue-100 text-blue-800' :
                          campanha.status === 'pausada' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {campanha.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Assunto
                        </p>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {campanha.assunto}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Total de Envios</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {campanha.total_envios}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Taxa de Abertura</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {campanha.taxa_abertura}%
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Taxa de Clique</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {campanha.taxa_clique}%
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Data de Envio</p>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {campanha.data_envio ? formatDate(campanha.data_envio) : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => setEmailSelecionado(campanha as any)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Ver detalhes"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => setEmailSelecionado(campanha as any)}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Mensagem quando não há conteúdo */}
        {((viewMode === 'emails' && emailsFiltrados.length === 0) || 
          (viewMode === 'campanhas' && campanhas.length === 0)) && (
          <Card className="text-center py-12">
            <CardContent>
              <Mail className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nenhum {viewMode === 'emails' ? 'email' : 'campanha'} encontrado
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Não há {viewMode === 'emails' ? 'emails' : 'campanhas'} que correspondam aos filtros selecionados.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EmailMarketing;
