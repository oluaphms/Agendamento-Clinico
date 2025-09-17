// ============================================================================
// PÁGINA: Configuração da Clínica - Sistema de Configurações Avançadas
// ============================================================================
// Esta página implementa as configurações gerais da clínica, incluindo
// dados da empresa, configurações de sistema e preferências.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Building2,
  Save,
  RefreshCw,
  Upload,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Settings,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Shield,
  Users,
  CreditCard,
  FileText,
  Image,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Calendar,
  DollarSign,
  Zap,
  Bell,
  Lock,
  Unlock,
  Copy,
  ExternalLink,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  Star,
  Heart,
  Award,
  Target,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Database,
  Server,
  Cloud,
  Wifi,
  WifiOff,
  Check,
  X,
  AlertTriangle,
  HelpCircle,
  BookOpen,
  MessageSquare,
  Send,
  Archive,
  Tag,
  Flag,
  Bookmark,
  Star as StarIcon,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Link,
  QrCode,
  Key,
  UserCheck,
  UserX,
  UserPlus,
  UserMinus,
  UserCog,
  UserEdit,
  UserSearch,
  UserShield,
  UserStar,
  UserHeart,
  UserAward,
  UserTarget,
  UserTrendingUp,
  UserBarChart,
  UserPieChart,
  UserActivity,
  UserDatabase,
  UserServer,
  UserCloud,
  UserWifi,
  UserWifiOff,
  UserCheck as UserCheckIcon,
  UserX as UserXIcon,
  UserPlus as UserPlusIcon,
  UserMinus as UserMinusIcon,
  UserCog as UserCogIcon,
  UserEdit as UserEditIcon,
  UserSearch as UserSearchIcon,
  UserShield as UserShieldIcon,
  UserStar as UserStarIcon,
  UserHeart as UserHeartIcon,
  UserAward as UserAwardIcon,
  UserTarget as UserTargetIcon,
  UserTrendingUp as UserTrendingUpIcon,
  UserBarChart as UserBarChartIcon,
  UserPieChart as UserPieChartIcon,
  UserActivity as UserActivityIcon,
  UserDatabase as UserDatabaseIcon,
  UserServer as UserServerIcon,
  UserCloud as UserCloudIcon,
  UserWifi as UserWifiIcon,
  UserWifiOff as UserWifiOffIcon,
} from 'lucide-react';
import { Card, CardContent } from '@/design-system';
import { LoadingSpinner } from '@/components/LazyLoading/LazyWrapper';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { formatDate, formatTime, formatPhone } from '@/lib/utils';

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

interface ConfiguracaoClinica {
  id: string;
  nome_clinica: string;
  cnpj: string;
  inscricao_estadual?: string;
  inscricao_municipal?: string;
  endereco: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone: string;
  email: string;
  website?: string;
  logo_url?: string;
  cor_primaria: string;
  cor_secundaria: string;
  timezone: string;
  idioma: string;
  moeda: string;
  formato_data: string;
  formato_hora: string;
  created_at: string;
  updated_at: string;
}

interface ConfiguracaoSistema {
  id: string;
  configuracao_clinica_id: string;
  tipo: string;
  chave: string;
  valor: string;
  descricao?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

interface Filtros {
  busca: string;
  categoria: string;
  ativo: string;
  data_inicio: string;
  data_fim: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const ConfiguracaoClinica: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [configuracao, setConfiguracao] = useState<ConfiguracaoClinica | null>(null);
  const [configuracoes, setConfiguracoes] = useState<ConfiguracaoSistema[]>([]);
  const [filtros, setFiltros] = useState<Filtros>({
    busca: '',
    categoria: '',
    ativo: '',
    data_inicio: '',
    data_fim: '',
  });
  const [modalAberto, setModalAberto] = useState(false);
  const [configuracaoSelecionada, setConfiguracaoSelecionada] = useState<ConfiguracaoSistema | null>(null);
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState<Partial<ConfiguracaoClinica>>({});

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
        loadConfiguracaoClinica(),
        loadConfiguracoesSistema(),
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const loadConfiguracaoClinica = async () => {
    try {
      const { data, error } = await supabase
        .from('configuracao_clinica')
        .select('*')
        .single();

      if (error) {
        console.error('Erro ao carregar configuração da clínica:', error);
        return;
      }

      setConfiguracao(data);
      setFormData(data || {});
    } catch (error) {
      console.error('Erro ao carregar configuração da clínica:', error);
    }
  };

  const loadConfiguracoesSistema = async () => {
    try {
      const { data, error } = await supabase
        .from('configuracao_sistema')
        .select('*')
        .order('tipo, chave');

      if (error) {
        console.error('Erro ao carregar configurações do sistema:', error);
        return;
      }

      setConfiguracoes(data || []);
    } catch (error) {
      console.error('Erro ao carregar configurações do sistema:', error);
    }
  };

  const salvarConfiguracao = async () => {
    if (!formData.nome_clinica || !formData.cnpj || !formData.email) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    try {
      if (configuracao) {
        // Atualizar configuração existente
        const { error } = await supabase
          .from('configuracao_clinica')
          .update(formData)
          .eq('id', configuracao.id);

        if (error) {
          console.error('Erro ao atualizar configuração:', error);
          toast.error('Erro ao atualizar configuração');
          return;
        }
      } else {
        // Criar nova configuração
        const { error } = await supabase
          .from('configuracao_clinica')
          .insert([formData]);

        if (error) {
          console.error('Erro ao criar configuração:', error);
          toast.error('Erro ao criar configuração');
          return;
        }
      }

      toast.success('Configuração salva com sucesso');
      loadConfiguracaoClinica();
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast.error('Erro ao salvar configuração');
    }
  };

  const salvarConfiguracaoSistema = async (config: Partial<ConfiguracaoSistema>) => {
    try {
      if (configuracaoSelecionada) {
        // Atualizar configuração existente
        const { error } = await supabase
          .from('configuracao_sistema')
          .update(config)
          .eq('id', configuracaoSelecionada.id);

        if (error) {
          console.error('Erro ao atualizar configuração do sistema:', error);
          toast.error('Erro ao atualizar configuração');
          return;
        }
      } else {
        // Criar nova configuração
        const { error } = await supabase
          .from('configuracao_sistema')
          .insert([{
            ...config,
            configuracao_clinica_id: configuracao?.id,
          }]);

        if (error) {
          console.error('Erro ao criar configuração do sistema:', error);
          toast.error('Erro ao criar configuração');
          return;
        }
      }

      toast.success('Configuração salva com sucesso');
      loadConfiguracoesSistema();
      setModalAberto(false);
      setConfiguracaoSelecionada(null);
    } catch (error) {
      console.error('Erro ao salvar configuração do sistema:', error);
      toast.error('Erro ao salvar configuração');
    }
  };

  const handleExcluir = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta configuração?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('configuracao_sistema')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir configuração:', error);
        toast.error('Erro ao excluir configuração');
        return;
      }

      toast.success('Configuração excluída com sucesso');
      loadConfiguracoesSistema();
    } catch (error) {
      console.error('Erro ao excluir configuração:', error);
      toast.error('Erro ao excluir configuração');
    }
  };

  const handleEditar = (config: ConfiguracaoSistema) => {
    setConfiguracaoSelecionada(config);
    setEditando(true);
    setModalAberto(true);
  };

  const handleNovo = () => {
    setConfiguracaoSelecionada(null);
    setEditando(false);
    setModalAberto(true);
  };

  const getCategoriaIcon = (categoria: string) => {
    switch (categoria) {
      case 'geral':
        return <Settings className="h-4 w-4" />;
      case 'financeiro':
        return <DollarSign className="h-4 w-4" />;
      case 'notificacoes':
        return <Bell className="h-4 w-4" />;
      case 'seguranca':
        return <Shield className="h-4 w-4" />;
      case 'integracao':
        return <Zap className="h-4 w-4" />;
      case 'backup':
        return <Database className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'geral':
        return 'text-blue-500';
      case 'financeiro':
        return 'text-green-500';
      case 'notificacoes':
        return 'text-yellow-500';
      case 'seguranca':
        return 'text-red-500';
      case 'integracao':
        return 'text-purple-500';
      case 'backup':
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
  };

  const configuracoesFiltradas = configuracoes.filter(config => {
    const matchesBusca = !filtros.busca || 
      config.chave.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      config.descricao?.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      config.valor.toLowerCase().includes(filtros.busca.toLowerCase());
    
    const matchesCategoria = !filtros.categoria || config.tipo === filtros.categoria;
    const matchesAtivo = !filtros.ativo || 
      (filtros.ativo === 'ativo' && config.ativo) ||
      (filtros.ativo === 'inativo' && !config.ativo);
    
    const matchesDataInicio = !filtros.data_inicio || 
      new Date(config.created_at) >= new Date(filtros.data_inicio);
    const matchesDataFim = !filtros.data_fim || 
      new Date(config.created_at) <= new Date(filtros.data_fim);

    return matchesBusca && matchesCategoria && matchesAtivo && matchesDataInicio && matchesDataFim;
  });

  // Estatísticas
  const totalConfiguracoes = configuracoes.length;
  const configuracoesAtivas = configuracoes.filter(c => c.ativo).length;
  const configuracoesInativas = configuracoes.filter(c => !c.ativo).length;
  const categorias = [...new Set(configuracoes.map(c => c.tipo))].length;

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
        <title>Configuração da Clínica - Sistema de Gestão de Clínica</title>
        <meta name="description" content="Configurações gerais da clínica e sistema" />
      </Helmet>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Building2 className="h-8 w-8 text-blue-600" />
                Configuração da Clínica
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Gerencie as configurações gerais da clínica e sistema
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
                onClick={salvarConfiguracao}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="mr-2" size={16} />
                Salvar
              </button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Settings className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Total de Configurações
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalConfiguracoes}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Ativas
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {configuracoesAtivas}
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
                    Inativas
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {configuracoesInativas}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Tag className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Categorias
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {categorias}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configuração da Clínica */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Dados da Clínica
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nome da Clínica *
                    </label>
                    <input
                      type="text"
                      value={formData.nome_clinica || ''}
                      onChange={(e) => setFormData({ ...formData, nome_clinica: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Digite o nome da clínica"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      CNPJ *
                    </label>
                    <input
                      type="text"
                      value={formData.cnpj || ''}
                      onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Inscrição Estadual
                    </label>
                    <input
                      type="text"
                      value={formData.inscricao_estadual || ''}
                      onChange={(e) => setFormData({ ...formData, inscricao_estadual: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Digite a inscrição estadual"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Inscrição Municipal
                    </label>
                    <input
                      type="text"
                      value={formData.inscricao_municipal || ''}
                      onChange={(e) => setFormData({ ...formData, inscricao_municipal: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Digite a inscrição municipal"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Endereço
                  </label>
                  <input
                    type="text"
                    value={formData.endereco || ''}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Digite o endereço"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Número
                    </label>
                    <input
                      type="text"
                      value={formData.numero || ''}
                      onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="123"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Complemento
                    </label>
                    <input
                      type="text"
                      value={formData.complemento || ''}
                      onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Sala 101"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      CEP
                    </label>
                    <input
                      type="text"
                      value={formData.cep || ''}
                      onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="00000-000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bairro
                    </label>
                    <input
                      type="text"
                      value={formData.bairro || ''}
                      onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Digite o bairro"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cidade
                    </label>
                    <input
                      type="text"
                      value={formData.cidade || ''}
                      onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Digite a cidade"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Estado
                    </label>
                    <input
                      type="text"
                      value={formData.estado || ''}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Digite o estado"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Telefone
                    </label>
                    <input
                      type="text"
                      value={formData.telefone || ''}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="(00) 0000-0000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="contato@clinica.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={formData.website || ''}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="https://www.clinica.com"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Configurações do Sistema
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cor Primária
                    </label>
                    <input
                      type="color"
                      value={formData.cor_primaria || '#3B82F6'}
                      onChange={(e) => setFormData({ ...formData, cor_primaria: e.target.value })}
                      className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cor Secundária
                    </label>
                    <input
                      type="color"
                      value={formData.cor_secundaria || '#10B981'}
                      onChange={(e) => setFormData({ ...formData, cor_secundaria: e.target.value })}
                      className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Timezone
                    </label>
                    <select
                      value={formData.timezone || 'America/Sao_Paulo'}
                      onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="America/Sao_Paulo">America/Sao_Paulo</option>
                      <option value="America/New_York">America/New_York</option>
                      <option value="Europe/London">Europe/London</option>
                      <option value="Asia/Tokyo">Asia/Tokyo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Idioma
                    </label>
                    <select
                      value={formData.idioma || 'pt-BR'}
                      onChange={(e) => setFormData({ ...formData, idioma: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="pt-BR">Português (Brasil)</option>
                      <option value="en-US">English (US)</option>
                      <option value="es-ES">Español</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Moeda
                    </label>
                    <select
                      value={formData.moeda || 'BRL'}
                      onChange={(e) => setFormData({ ...formData, moeda: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="BRL">Real (R$)</option>
                      <option value="USD">Dólar ($)</option>
                      <option value="EUR">Euro (€)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Formato de Data
                    </label>
                    <select
                      value={formData.formato_data || 'DD/MM/YYYY'}
                      onChange={(e) => setFormData({ ...formData, formato_data: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Formato de Hora
                  </label>
                  <select
                    value={formData.formato_hora || '24h'}
                    onChange={(e) => setFormData({ ...formData, formato_hora: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="24h">24 horas</option>
                    <option value="12h">12 horas (AM/PM)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Logo da Clínica
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      {formData.logo_url ? (
                        <img
                          src={formData.logo_url}
                          alt="Logo"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Image className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="url"
                        value={formData.logo_url || ''}
                        onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="URL da logo"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Cole a URL da imagem da logo
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configurações do Sistema */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Configurações Avançadas
              </h3>
              <button
                onClick={handleNovo}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="mr-2" size={16} />
                Nova Configuração
              </button>
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar configurações..."
                  value={filtros.busca}
                  onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm w-full"
                />
              </div>
              <select
                value={filtros.categoria}
                onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="">Todas as categorias</option>
                <option value="geral">Geral</option>
                <option value="financeiro">Financeiro</option>
                <option value="notificacoes">Notificações</option>
                <option value="seguranca">Segurança</option>
                <option value="integracao">Integração</option>
                <option value="backup">Backup</option>
              </select>
              <select
                value={filtros.ativo}
                onChange={(e) => setFiltros({ ...filtros, ativo: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="">Todos os status</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
              <input
                type="date"
                value={filtros.data_inicio}
                onChange={(e) => setFiltros({ ...filtros, data_inicio: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                placeholder="Data início"
              />
            </div>

            {/* Lista de Configurações */}
            <div className="space-y-4">
              {configuracoesFiltradas.map((config) => (
                <div
                  key={config.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${getCategoriaColor(config.tipo)} bg-opacity-10`}>
                      {getCategoriaIcon(config.tipo)}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {config.chave}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {config.descricao || 'Sem descrição'}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        Valor: {config.valor}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      config.ativo
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {config.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                    <button
                      onClick={() => handleEditar(config)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleExcluir(config.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConfiguracaoClinica;
