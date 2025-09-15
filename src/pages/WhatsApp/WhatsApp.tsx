// ============================================================================
// PÁGINA: WhatsApp - Integração Completa com WhatsApp Business
// ============================================================================
// Esta página fornece integração completa com WhatsApp Business para
// comunicação automatizada com pacientes e gestão de mensagens.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  MessageCircle,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
  Bot,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Eye,
  Copy,
  DollarSign,
  FileText,
} from 'lucide-react';

import { Card, CardContent } from '@/design-system';
import { LoadingSpinner } from '@/components/LazyLoading/LazyWrapper';
import toast from 'react-hot-toast';

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

interface MensagemWhatsApp {
  id: string;
  numero: string;
  nome: string;
  tipo: 'texto' | 'template' | 'midia' | 'documento';
  conteudo: string;
  status: 'enviada' | 'entregue' | 'lida' | 'falhou' | 'pendente';
  dataEnvio: string;
  dataEntrega?: string;
  dataLeitura?: string;
  templateId?: string;
  midiaUrl?: string;
  resposta?: string;
  agendamentoId?: string;
  pacienteId?: string;
  profissionalId?: string;
  custo?: number;
  erro?: string;
}

interface TemplateWhatsApp {
  id: string;
  nome: string;
  categoria:
    | 'agendamento'
    | 'lembrete'
    | 'confirmacao'
    | 'cancelamento'
    | 'promocional'
    | 'informativo';
  conteudo: string;
  variaveis: string[];
  aprovado: boolean;
  dataCriacao: string;
  dataAprovacao?: string;
  uso: number;
  status: 'rascunho' | 'pendente' | 'aprovado' | 'rejeitado';
  exemplo: string;
}

interface CampanhaWhatsApp {
  id: string;
  nome: string;
  descricao: string;
  template: TemplateWhatsApp;
  destinatarios: string[];
  status:
    | 'rascunho'
    | 'agendada'
    | 'enviando'
    | 'concluida'
    | 'pausada'
    | 'cancelada';
  dataCriacao: string;
  dataEnvio?: string;
  dataConclusao?: string;
  totalEnviadas: number;
  totalEntregues: number;
  totalLidas: number;
  totalFalhas: number;
  custoTotal: number;
}

interface ConfiguracaoWhatsApp {
  token: string;
  numeroTelefone: string;
  webhookUrl: string;
  ativo: boolean;
  limiteDiario: number;
  custoPorMensagem: number;
  horarioFuncionamento: {
    inicio: string;
    fim: string;
    diasSemana: number[];
  };
  respostasAutomaticas: {
    ativo: boolean;
    mensagem: string;
    horarioFora: string;
  };
}

// ============================================================================
// DADOS MOCK
// ============================================================================

const MOCK_MENSAGENS: MensagemWhatsApp[] = [
  {
    id: '1',
    numero: '+5511999999999',
    nome: 'Maria Santos',
    tipo: 'template',
    conteudo:
      'Olá {{nome}}, seu agendamento para {{data}} às {{hora}} foi confirmado. Aguardamos você!',
    status: 'entregue',
    dataEnvio: '2024-12-20T10:30:00Z',
    dataEntrega: '2024-12-20T10:30:15Z',
    templateId: '1',
    agendamentoId: '123',
    pacienteId: '456',
    custo: 0.05,
  },
  {
    id: '2',
    numero: '+5511888888888',
    nome: 'João Silva',
    tipo: 'texto',
    conteudo:
      'Lembrete: Sua consulta é amanhã às 14:30. Por favor, confirme sua presença.',
    status: 'lida',
    dataEnvio: '2024-12-20T09:00:00Z',
    dataEntrega: '2024-12-20T09:00:10Z',
    dataLeitura: '2024-12-20T09:15:00Z',
    agendamentoId: '124',
    pacienteId: '457',
    custo: 0.05,
  },
  {
    id: '3',
    numero: '+5511777777777',
    nome: 'Ana Costa',
    tipo: 'template',
    conteudo: 'Sua consulta foi cancelada. Entre em contato para reagendar.',
    status: 'falhou',
    dataEnvio: '2024-12-20T11:00:00Z',
    erro: 'Número inválido',
    agendamentoId: '125',
    pacienteId: '458',
    custo: 0,
  },
];

const MOCK_TEMPLATES: TemplateWhatsApp[] = [
  {
    id: '1',
    nome: 'Confirmação de Agendamento',
    categoria: 'confirmacao',
    conteudo:
      'Olá {{nome}}, seu agendamento para {{data}} às {{hora}} com {{profissional}} foi confirmado. Aguardamos você!',
    variaveis: ['nome', 'data', 'hora', 'profissional'],
    aprovado: true,
    dataCriacao: '2024-12-01T10:00:00Z',
    dataAprovacao: '2024-12-01T10:30:00Z',
    uso: 45,
    status: 'aprovado',
    exemplo:
      'Olá Maria Santos, seu agendamento para 25/12/2024 às 14:30 com Dr. Carlos Silva foi confirmado. Aguardamos você!',
  },
  {
    id: '2',
    nome: 'Lembrete de Consulta',
    categoria: 'lembrete',
    conteudo:
      'Lembrete: Sua consulta é {{data}} às {{hora}}. Por favor, confirme sua presença respondendo SIM ou NÃO.',
    variaveis: ['data', 'hora'],
    aprovado: true,
    dataCriacao: '2024-12-01T10:00:00Z',
    dataAprovacao: '2024-12-01T10:30:00Z',
    uso: 32,
    status: 'aprovado',
    exemplo:
      'Lembrete: Sua consulta é 25/12/2024 às 14:30. Por favor, confirme sua presença respondendo SIM ou NÃO.',
  },
  {
    id: '3',
    nome: 'Cancelamento de Consulta',
    categoria: 'cancelamento',
    conteudo:
      'Sua consulta de {{data}} às {{hora}} foi cancelada. Entre em contato para reagendar.',
    variaveis: ['data', 'hora'],
    aprovado: false,
    dataCriacao: '2024-12-15T14:00:00Z',
    uso: 0,
    status: 'pendente',
    exemplo:
      'Sua consulta de 25/12/2024 às 14:30 foi cancelada. Entre em contato para reagendar.',
  },
];

const MOCK_CAMPANHAS: CampanhaWhatsApp[] = [
  {
    id: '1',
    nome: 'Lembretes de Consulta - Dezembro',
    descricao: 'Envio de lembretes para consultas agendadas em dezembro',
    template: MOCK_TEMPLATES[1],
    destinatarios: ['+5511999999999', '+5511888888888', '+5511777777777'],
    status: 'concluida',
    dataCriacao: '2024-12-01T10:00:00Z',
    dataEnvio: '2024-12-01T10:30:00Z',
    dataConclusao: '2024-12-01T10:45:00Z',
    totalEnviadas: 3,
    totalEntregues: 2,
    totalLidas: 1,
    totalFalhas: 1,
    custoTotal: 0.15,
  },
];

const MOCK_CONFIGURACAO: ConfiguracaoWhatsApp = {
  token: 'EAABwzLixnjYBO...',
  numeroTelefone: '+5511999999999',
  webhookUrl: 'https://sistema-clinica.com/webhook/whatsapp',
  ativo: true,
  limiteDiario: 1000,
  custoPorMensagem: 0.05,
  horarioFuncionamento: {
    inicio: '08:00',
    fim: '18:00',
    diasSemana: [1, 2, 3, 4, 5], // Segunda a sexta
  },
  respostasAutomaticas: {
    ativo: true,
    mensagem:
      'Obrigado por entrar em contato! Nossa equipe retornará em breve.',
    horarioFora:
      'Estamos fora do horário de funcionamento. Retornaremos em breve.',
  },
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const WhatsApp: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'mensagens' | 'templates' | 'campanhas' | 'configuracoes'
  >('mensagens');
  const [mensagens, setMensagens] =
    useState<MensagemWhatsApp[]>(MOCK_MENSAGENS);
  const [templates, setTemplates] =
    useState<TemplateWhatsApp[]>(MOCK_TEMPLATES);
  const [campanhas, setCampanhas] =
    useState<CampanhaWhatsApp[]>(MOCK_CAMPANHAS);
  const [, setConfiguracao] =
    useState<ConfiguracaoWhatsApp>(MOCK_CONFIGURACAO);
  const [filtros, setFiltros] = useState({
    status: '',
    tipo: '',
    dataInicio: '',
    dataFim: '',
    busca: '',
  });

  // ============================================================================
  // EFEITOS
  // ============================================================================

  useEffect(() => {
    loadDados();
  }, []);

  // ============================================================================
  // FUNÇÕES
  // ============================================================================

  const loadDados = async () => {
    setLoading(true);
    try {
      // Simular carregamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMensagens(MOCK_MENSAGENS);
      setTemplates(MOCK_TEMPLATES);
      setCampanhas(MOCK_CAMPANHAS);
      setConfiguracao(MOCK_CONFIGURACAO);
    } catch (error) {
      console.error('Erro ao carregar dados do WhatsApp:', error);
      toast.error('Erro ao carregar dados do WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'enviada':
        return <CheckCircle className='h-4 w-4 text-blue-500' />;
      case 'entregue':
        return <CheckCircle className='h-4 w-4 text-green-500' />;
      case 'lida':
        return <CheckCircle className='h-4 w-4 text-green-600' />;
      case 'falhou':
        return <XCircle className='h-4 w-4 text-red-500' />;
      default:
        return <Clock className='h-4 w-4 text-yellow-500' />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'enviada':
        return 'Enviada';
      case 'entregue':
        return 'Entregue';
      case 'lida':
        return 'Lida';
      case 'falhou':
        return 'Falhou';
      default:
        return 'Pendente';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'texto':
        return <MessageCircle className='h-4 w-4' />;
      case 'template':
        return <FileText className='h-4 w-4' />;
      case 'midia':
        return <Upload className='h-4 w-4' />;
      case 'documento':
        return <Download className='h-4 w-4' />;
      default:
        return <MessageCircle className='h-4 w-4' />;
    }
  };

  const mensagensFiltradas = mensagens.filter(mensagem => {
    const matchesStatus = !filtros.status || mensagem.status === filtros.status;
    const matchesTipo = !filtros.tipo || mensagem.tipo === filtros.tipo;
    const matchesBusca =
      !filtros.busca ||
      mensagem.nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      mensagem.conteudo.toLowerCase().includes(filtros.busca.toLowerCase());

    return matchesStatus && matchesTipo && matchesBusca;
  });

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
        <title>WhatsApp - Sistema de Gestão de Clínica</title>
        <meta
          name='description'
          content='Integração completa com WhatsApp Business'
        />
      </Helmet>

      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center justify-between'>
            <div>
            </div>
            <div className='flex items-center space-x-4'>
              <button
                onClick={loadDados}
                className='flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors'
              >
                <RefreshCw className='mr-2' size={16} />
                Atualizar
              </button>
              <button
                onClick={() => {}}
                className='flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
              >
                <Send className='mr-2' size={16} />
                Nova Mensagem
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className='mb-6'>
          <div className='border-b border-gray-200 dark:border-gray-700'>
            <nav className='-mb-px flex space-x-8'>
              {[
                {
                  key: 'mensagens',
                  label: 'Mensagens',
                  icon: MessageCircle,
                  count: mensagens.length,
                },
                {
                  key: 'templates',
                  label: 'Templates',
                  icon: FileText,
                  count: templates.length,
                },
                {
                  key: 'campanhas',
                  label: 'Campanhas',
                  icon: Bot,
                  count: campanhas.length,
                },
                {
                  key: 'configuracoes',
                  label: 'Configurações',
                  icon: Settings,
                  count: 0,
                },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-green-500 text-green-600 dark:text-green-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <tab.icon className='mr-2' size={16} />
                  {tab.label}
                  {tab.count > 0 && (
                    <span className='ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-0.5 px-2 rounded-full text-xs'>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Conteúdo das Tabs */}
        {activeTab === 'mensagens' && (
          <div className='space-y-6'>
            {/* Filtros */}
            <Card>
              <CardContent className='p-6'>
                <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                      Status
                    </label>
                    <select
                      value={filtros.status}
                      onChange={e =>
                        setFiltros({ ...filtros, status: e.target.value })
                      }
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                    >
                      <option value=''>Todos os status</option>
                      <option value='enviada'>Enviada</option>
                      <option value='entregue'>Entregue</option>
                      <option value='lida'>Lida</option>
                      <option value='falhou'>Falhou</option>
                      <option value='pendente'>Pendente</option>
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                      Tipo
                    </label>
                    <select
                      value={filtros.tipo}
                      onChange={e =>
                        setFiltros({ ...filtros, tipo: e.target.value })
                      }
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                    >
                      <option value=''>Todos os tipos</option>
                      <option value='texto'>Texto</option>
                      <option value='template'>Template</option>
                      <option value='midia'>Mídia</option>
                      <option value='documento'>Documento</option>
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                      Data Início
                    </label>
                    <input
                      type='date'
                      value={filtros.dataInicio}
                      onChange={e =>
                        setFiltros({ ...filtros, dataInicio: e.target.value })
                      }
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                      Data Fim
                    </label>
                    <input
                      type='date'
                      value={filtros.dataFim}
                      onChange={e =>
                        setFiltros({ ...filtros, dataFim: e.target.value })
                      }
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                      Buscar
                    </label>
                    <input
                      type='text'
                      placeholder='Nome ou conteúdo...'
                      value={filtros.busca}
                      onChange={e =>
                        setFiltros({ ...filtros, busca: e.target.value })
                      }
                      className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Mensagens */}
            <div className='space-y-4'>
              {mensagensFiltradas.map(mensagem => (
                <Card
                  key={mensagem.id}
                  className='hover:shadow-lg transition-shadow'
                >
                  <CardContent className='p-6'>
                    <div className='flex items-start space-x-4'>
                      <div className='flex-shrink-0'>
                        <div className='w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center'>
                          <MessageCircle className='h-5 w-5 text-green-600' />
                        </div>
                      </div>

                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center justify-between mb-2'>
                          <div className='flex items-center space-x-2'>
                            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                              {mensagem.nome}
                            </h3>
                            <span className='text-sm text-gray-500 dark:text-gray-400'>
                              {mensagem.numero}
                            </span>
                          </div>
                          <div className='flex items-center space-x-2'>
                            {getTipoIcon(mensagem.tipo)}
                            {getStatusIcon(mensagem.status)}
                            <span className='text-sm text-gray-500 dark:text-gray-400'>
                              {getStatusText(mensagem.status)}
                            </span>
                          </div>
                        </div>

                        <p className='text-gray-600 dark:text-gray-300 mb-3'>
                          {mensagem.conteudo}
                        </p>

                        <div className='flex items-center justify-between text-sm text-gray-500 dark:text-gray-400'>
                          <div className='flex items-center space-x-4'>
                            <span className='flex items-center'>
                              <Clock className='mr-1' size={14} />
                              {new Date(mensagem.dataEnvio).toLocaleString(
                                'pt-BR'
                              )}
                            </span>
                            {mensagem.custo && (
                              <span className='flex items-center'>
                                <DollarSign className='mr-1' size={14} />
                                R$ {mensagem.custo.toFixed(2)}
                              </span>
                            )}
                          </div>

                          <div className='flex items-center space-x-2'>
                            <button className='p-1 text-gray-400 hover:text-blue-600 transition-colors'>
                              <Eye size={16} />
                            </button>
                            <button className='p-1 text-gray-400 hover:text-green-600 transition-colors'>
                              <Copy size={16} />
                            </button>
                            <button className='p-1 text-gray-400 hover:text-red-600 transition-colors'>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {mensagem.erro && (
                          <div className='mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md'>
                            <p className='text-sm text-red-600 dark:text-red-400'>
                              <AlertCircle className='inline mr-1' size={14} />
                              {mensagem.erro}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Mensagem quando não há mensagens */}
            {mensagensFiltradas.length === 0 && (
              <Card className='text-center py-12'>
                <CardContent>
                  <MessageCircle className='mx-auto h-12 w-12 text-gray-400 mb-4' />
                  <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
                    Nenhuma mensagem encontrada
                  </h3>
                  <p className='text-gray-500 dark:text-gray-400 mb-4'>
                    Ajuste os filtros de busca ou envie sua primeira mensagem.
                  </p>
                  <button
                    onClick={() => {}}
                    className='flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mx-auto'
                  >
                    <Send className='mr-2' size={16} />
                    Enviar Mensagem
                  </button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Outras tabs serão implementadas em seguida */}
        {activeTab === 'templates' && (
          <div className='text-center py-12'>
            <FileText className='mx-auto h-12 w-12 text-gray-400 mb-4' />
            <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
              Gerenciamento de Templates
            </h3>
            <p className='text-gray-500 dark:text-gray-400'>
              Em desenvolvimento...
            </p>
          </div>
        )}

        {activeTab === 'campanhas' && (
          <div className='text-center py-12'>
            <Bot className='mx-auto h-12 w-12 text-gray-400 mb-4' />
            <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
              Campanhas de Marketing
            </h3>
            <p className='text-gray-500 dark:text-gray-400'>
              Em desenvolvimento...
            </p>
          </div>
        )}

        {activeTab === 'configuracoes' && (
          <div className='text-center py-12'>
            <Settings className='mx-auto h-12 w-12 text-gray-400 mb-4' />
            <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
              Configurações do WhatsApp
            </h3>
            <p className='text-gray-500 dark:text-gray-400'>
              Em desenvolvimento...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsApp;
