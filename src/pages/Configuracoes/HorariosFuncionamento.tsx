// ============================================================================
// PÁGINA: Horários de Funcionamento - Sistema de Configurações Avançadas
// ============================================================================
// Esta página implementa a configuração de horários de funcionamento da clínica,
// incluindo diferentes turnos, dias da semana e configurações especiais.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Clock,
  Save,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Calendar,
  Sun,
  Moon,
  Coffee,
  Zap,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Settings,
  Users,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Shield,
  CreditCard,
  FileText,
  Image,
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

interface HorarioFuncionamento {
  id: string;
  configuracao_clinica_id: string;
  dia_semana: number; // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
  turno: string; // 'manha', 'tarde', 'noite', 'integral'
  hora_inicio: string;
  hora_fim: string;
  ativo: boolean;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

interface ConfiguracaoEspecial {
  id: string;
  configuracao_clinica_id: string;
  tipo: string; // 'feriado', 'recesso', 'atendimento_especial'
  data_inicio: string;
  data_fim: string;
  horario_inicio?: string;
  horario_fim?: string;
  descricao: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

interface Filtros {
  busca: string;
  dia_semana: string;
  turno: string;
  ativo: string;
  data_inicio: string;
  data_fim: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const HorariosFuncionamento: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [horarios, setHorarios] = useState<HorarioFuncionamento[]>([]);
  const [configuracoesEspeciais, setConfiguracoesEspeciais] = useState<ConfiguracaoEspecial[]>([]);
  const [filtros, setFiltros] = useState<Filtros>({
    busca: '',
    dia_semana: '',
    turno: '',
    ativo: '',
    data_inicio: '',
    data_fim: '',
  });
  const [modalAberto, setModalAberto] = useState(false);
  const [modalEspecialAberto, setModalEspecialAberto] = useState(false);
  const [horarioSelecionado, setHorarioSelecionado] = useState<HorarioFuncionamento | null>(null);
  const [configuracaoEspecialSelecionada, setConfiguracaoEspecialSelecionada] = useState<ConfiguracaoEspecial | null>(null);
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState<Partial<HorarioFuncionamento>>({});
  const [formDataEspecial, setFormDataEspecial] = useState<Partial<ConfiguracaoEspecial>>({});

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
        loadHorarios(),
        loadConfiguracoesEspeciais(),
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar horários de funcionamento');
    } finally {
      setLoading(false);
    }
  };

  const loadHorarios = async () => {
    try {
      const { data, error } = await supabase
        .from('horarios_funcionamento')
        .select('*')
        .order('dia_semana, turno');

      if (error) {
        console.error('Erro ao carregar horários:', error);
        return;
      }

      setHorarios(data || []);
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
    }
  };

  const loadConfiguracoesEspeciais = async () => {
    try {
      const { data, error } = await supabase
        .from('configuracoes_especiais')
        .select('*')
        .order('data_inicio');

      if (error) {
        console.error('Erro ao carregar configurações especiais:', error);
        return;
      }

      setConfiguracoesEspeciais(data || []);
    } catch (error) {
      console.error('Erro ao carregar configurações especiais:', error);
    }
  };

  const salvarHorario = async () => {
    if (!formData.dia_semana || !formData.turno || !formData.hora_inicio || !formData.hora_fim) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      if (horarioSelecionado) {
        // Atualizar horário existente
        const { error } = await supabase
          .from('horarios_funcionamento')
          .update(formData)
          .eq('id', horarioSelecionado.id);

        if (error) {
          console.error('Erro ao atualizar horário:', error);
          toast.error('Erro ao atualizar horário');
          return;
        }
      } else {
        // Criar novo horário
        const { error } = await supabase
          .from('horarios_funcionamento')
          .insert([formData]);

        if (error) {
          console.error('Erro ao criar horário:', error);
          toast.error('Erro ao criar horário');
          return;
        }
      }

      toast.success('Horário salvo com sucesso');
      loadHorarios();
      setModalAberto(false);
      setHorarioSelecionado(null);
      setFormData({});
    } catch (error) {
      console.error('Erro ao salvar horário:', error);
      toast.error('Erro ao salvar horário');
    }
  };

  const salvarConfiguracaoEspecial = async () => {
    if (!formDataEspecial.tipo || !formDataEspecial.data_inicio || !formDataEspecial.descricao) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      if (configuracaoEspecialSelecionada) {
        // Atualizar configuração existente
        const { error } = await supabase
          .from('configuracoes_especiais')
          .update(formDataEspecial)
          .eq('id', configuracaoEspecialSelecionada.id);

        if (error) {
          console.error('Erro ao atualizar configuração especial:', error);
          toast.error('Erro ao atualizar configuração especial');
          return;
        }
      } else {
        // Criar nova configuração
        const { error } = await supabase
          .from('configuracoes_especiais')
          .insert([formDataEspecial]);

        if (error) {
          console.error('Erro ao criar configuração especial:', error);
          toast.error('Erro ao criar configuração especial');
          return;
        }
      }

      toast.success('Configuração especial salva com sucesso');
      loadConfiguracoesEspeciais();
      setModalEspecialAberto(false);
      setConfiguracaoEspecialSelecionada(null);
      setFormDataEspecial({});
    } catch (error) {
      console.error('Erro ao salvar configuração especial:', error);
      toast.error('Erro ao salvar configuração especial');
    }
  };

  const handleExcluir = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este horário?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('horarios_funcionamento')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir horário:', error);
        toast.error('Erro ao excluir horário');
        return;
      }

      toast.success('Horário excluído com sucesso');
      loadHorarios();
    } catch (error) {
      console.error('Erro ao excluir horário:', error);
      toast.error('Erro ao excluir horário');
    }
  };

  const handleExcluirEspecial = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta configuração especial?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('configuracoes_especiais')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir configuração especial:', error);
        toast.error('Erro ao excluir configuração especial');
        return;
      }

      toast.success('Configuração especial excluída com sucesso');
      loadConfiguracoesEspeciais();
    } catch (error) {
      console.error('Erro ao excluir configuração especial:', error);
      toast.error('Erro ao excluir configuração especial');
    }
  };

  const handleEditar = (horario: HorarioFuncionamento) => {
    setHorarioSelecionado(horario);
    setFormData(horario);
    setEditando(true);
    setModalAberto(true);
  };

  const handleEditarEspecial = (config: ConfiguracaoEspecial) => {
    setConfiguracaoEspecialSelecionada(config);
    setFormDataEspecial(config);
    setEditando(true);
    setModalEspecialAberto(true);
  };

  const handleNovo = () => {
    setHorarioSelecionado(null);
    setFormData({});
    setEditando(false);
    setModalAberto(true);
  };

  const handleNovoEspecial = () => {
    setConfiguracaoEspecialSelecionada(null);
    setFormDataEspecial({});
    setEditando(false);
    setModalEspecialAberto(true);
  };

  const getDiaSemana = (dia: number) => {
    const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return dias[dia] || 'Desconhecido';
  };

  const getTurnoIcon = (turno: string) => {
    switch (turno) {
      case 'manha':
        return <Sun className="h-4 w-4 text-yellow-500" />;
      case 'tarde':
        return <Coffee className="h-4 w-4 text-orange-500" />;
      case 'noite':
        return <Moon className="h-4 w-4 text-blue-500" />;
      case 'integral':
        return <Zap className="h-4 w-4 text-purple-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTurnoColor = (turno: string) => {
    switch (turno) {
      case 'manha':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900';
      case 'tarde':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900';
      case 'noite':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900';
      case 'integral':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'feriado':
        return <Calendar className="h-4 w-4 text-red-500" />;
      case 'recesso':
        return <Coffee className="h-4 w-4 text-orange-500" />;
      case 'atendimento_especial':
        return <Zap className="h-4 w-4 text-green-500" />;
      default:
        return <Settings className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'feriado':
        return 'text-red-600 bg-red-100 dark:bg-red-900';
      case 'recesso':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900';
      case 'atendimento_especial':
        return 'text-green-600 bg-green-100 dark:bg-green-900';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900';
    }
  };

  const horariosFiltrados = horarios.filter(horario => {
    const matchesDiaSemana = !filtros.dia_semana || horario.dia_semana.toString() === filtros.dia_semana;
    const matchesTurno = !filtros.turno || horario.turno === filtros.turno;
    const matchesAtivo = !filtros.ativo || 
      (filtros.ativo === 'ativo' && horario.ativo) ||
      (filtros.ativo === 'inativo' && !horario.ativo);
    const matchesBusca = !filtros.busca || 
      getDiaSemana(horario.dia_semana).toLowerCase().includes(filtros.busca.toLowerCase()) ||
      horario.turno.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      horario.observacoes?.toLowerCase().includes(filtros.busca.toLowerCase());

    return matchesDiaSemana && matchesTurno && matchesAtivo && matchesBusca;
  });

  const configuracoesEspeciaisFiltradas = configuracoesEspeciais.filter(config => {
    const matchesTipo = !filtros.turno || config.tipo === filtros.turno;
    const matchesAtivo = !filtros.ativo || 
      (filtros.ativo === 'ativo' && config.ativo) ||
      (filtros.ativo === 'inativo' && !config.ativo);
    const matchesDataInicio = !filtros.data_inicio || 
      new Date(config.data_inicio) >= new Date(filtros.data_inicio);
    const matchesDataFim = !filtros.data_fim || 
      new Date(config.data_inicio) <= new Date(filtros.data_fim);
    const matchesBusca = !filtros.busca || 
      config.descricao.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      config.tipo.toLowerCase().includes(filtros.busca.toLowerCase());

    return matchesTipo && matchesAtivo && matchesDataInicio && matchesDataFim && matchesBusca;
  });

  // Estatísticas
  const totalHorarios = horarios.length;
  const horariosAtivos = horarios.filter(h => h.ativo).length;
  const totalConfiguracoesEspeciais = configuracoesEspeciais.length;
  const configuracoesEspeciaisAtivas = configuracoesEspeciais.filter(c => c.ativo).length;

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
        <title>Horários de Funcionamento - Sistema de Gestão de Clínica</title>
        <meta name="description" content="Configuração de horários de funcionamento da clínica" />
      </Helmet>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Clock className="h-8 w-8 text-blue-600" />
                Horários de Funcionamento
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Configure os horários de funcionamento da clínica
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
                onClick={handleNovo}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="mr-2" size={16} />
                Novo Horário
              </button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Total de Horários
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalHorarios}
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
                    Horários Ativos
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {horariosAtivos}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Configurações Especiais
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalConfiguracoesEspeciais}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Zap className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Especiais Ativas
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {configuracoesEspeciaisAtivas}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Horários Regulares */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Horários Regulares
              </h3>
              <button
                onClick={handleNovo}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="mr-2" size={16} />
                Novo Horário
              </button>
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar horários..."
                  value={filtros.busca}
                  onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm w-full"
                />
              </div>
              <select
                value={filtros.dia_semana}
                onChange={(e) => setFiltros({ ...filtros, dia_semana: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="">Todos os dias</option>
                <option value="0">Domingo</option>
                <option value="1">Segunda</option>
                <option value="2">Terça</option>
                <option value="3">Quarta</option>
                <option value="4">Quinta</option>
                <option value="5">Sexta</option>
                <option value="6">Sábado</option>
              </select>
              <select
                value={filtros.turno}
                onChange={(e) => setFiltros({ ...filtros, turno: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="">Todos os turnos</option>
                <option value="manha">Manhã</option>
                <option value="tarde">Tarde</option>
                <option value="noite">Noite</option>
                <option value="integral">Integral</option>
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
            </div>

            {/* Lista de Horários */}
            <div className="space-y-4">
              {horariosFiltrados.map((horario) => (
                <div
                  key={horario.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                      {getTurnoIcon(horario.turno)}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {getDiaSemana(horario.dia_semana)} - {horario.turno.charAt(0).toUpperCase() + horario.turno.slice(1)}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTime(horario.hora_inicio)} - {formatTime(horario.hora_fim)}
                      </p>
                      {horario.observacoes && (
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {horario.observacoes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getTurnoColor(horario.turno)}`}>
                      {horario.turno.charAt(0).toUpperCase() + horario.turno.slice(1)}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      horario.ativo
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {horario.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                    <button
                      onClick={() => handleEditar(horario)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleExcluir(horario.id)}
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

        {/* Configurações Especiais */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Configurações Especiais
              </h3>
              <button
                onClick={handleNovoEspecial}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="mr-2" size={16} />
                Nova Configuração
              </button>
            </div>

            {/* Filtros para Configurações Especiais */}
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
                value={filtros.turno}
                onChange={(e) => setFiltros({ ...filtros, turno: e.target.value })}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="">Todos os tipos</option>
                <option value="feriado">Feriado</option>
                <option value="recesso">Recesso</option>
                <option value="atendimento_especial">Atendimento Especial</option>
              </select>
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
            </div>

            {/* Lista de Configurações Especiais */}
            <div className="space-y-4">
              {configuracoesEspeciaisFiltradas.map((config) => (
                <div
                  key={config.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                      {getTipoIcon(config.tipo)}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {config.descricao}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(config.data_inicio)} - {formatDate(config.data_fim)}
                      </p>
                      {config.horario_inicio && config.horario_fim && (
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {formatTime(config.horario_inicio)} - {formatTime(config.horario_fim)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getTipoColor(config.tipo)}`}>
                      {config.tipo.charAt(0).toUpperCase() + config.tipo.slice(1)}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      config.ativo
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {config.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                    <button
                      onClick={() => handleEditarEspecial(config)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleExcluirEspecial(config.id)}
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

export default HorariosFuncionamento;
