// ============================================================================
// PÁGINA: Histórico Médico - Prontuário Eletrônico
// ============================================================================
// Esta página gerencia o histórico médico completo dos pacientes,
// incluindo consultas, diagnósticos, prescrições e evoluções.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Calendar,
  User,
  Stethoscope,
  Pill,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  FileImage,
  Upload,
} from 'lucide-react';
import { Card, CardContent } from '@/design-system';
import { LoadingSpinner } from '@/components/LazyLoading/LazyWrapper';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { formatDate, formatPhone } from '@/lib/utils';

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

interface Prontuario {
  id: string;
  paciente_id: string;
  agendamento_id: string;
  profissional_id: string;
  data_consulta: string;
  sintomas: string;
  diagnostico: string;
  prescricao: string;
  observacoes: string;
  status: 'ativo' | 'arquivado';
  created_at: string;
  updated_at: string;
  // Relacionamentos
  paciente?: {
    nome: string;
    telefone: string;
    email?: string;
    data_nascimento: string;
  };
  profissional?: {
    nome: string;
    especialidade: string;
    crm_cro: string;
  };
  agendamento?: {
    data: string;
    hora: string;
    servico: {
      nome: string;
      duracao_minutos: number;
    };
  };
  prescricoes?: Prescricao[];
  exames?: Exame[];
  evolucoes?: Evolucao[];
}

interface Prescricao {
  id: string;
  prontuario_id: string;
  medicamento: string;
  dosagem: string;
  frequencia: string;
  duracao: string;
  observacoes?: string;
  created_at: string;
}

interface Exame {
  id: string;
  paciente_id: string;
  prontuario_id: string;
  nome_exame: string;
  tipo_exame: string;
  data_exame: string;
  resultado: string;
  arquivo_url?: string;
  status: 'pendente' | 'realizado' | 'cancelado';
  observacoes?: string;
  created_at: string;
}

interface Evolucao {
  id: string;
  paciente_id: string;
  prontuario_id: string;
  profissional_id: string;
  data_evolucao: string;
  tipo_evolucao: 'consulta' | 'retorno' | 'emergencia' | 'internacao';
  descricao: string;
  observacoes?: string;
  created_at: string;
}

interface Filtros {
  paciente: string;
  profissional: string;
  data_inicio: string;
  data_fim: string;
  status: string;
  busca: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const HistoricoMedico: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [prontuarios, setProntuarios] = useState<Prontuario[]>([]);
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [profissionais, setProfissionais] = useState<any[]>([]);
  const [filtros, setFiltros] = useState<Filtros>({
    paciente: '',
    profissional: '',
    data_inicio: '',
    data_fim: '',
    status: '',
    busca: '',
  });
  const [modalAberto, setModalAberto] = useState(false);
  const [prontuarioSelecionado, setProntuarioSelecionado] = useState<Prontuario | null>(null);
  const [viewMode, setViewMode] = useState<'lista' | 'timeline'>('lista');

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
        loadProntuarios(),
        loadPacientes(),
        loadProfissionais(),
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do prontuário');
    } finally {
      setLoading(false);
    }
  };

  const loadProntuarios = async () => {
    try {
      let query = supabase
        .from('prontuarios')
        .select(`
          *,
          paciente:pacientes(nome, telefone, email, data_nascimento),
          profissional:profissionais(nome, especialidade, crm_cro),
          agendamento:agendamentos(
            data,
            hora,
            servico:servicos(nome, duracao_minutos)
          ),
          prescricoes:prescricoes(*),
          exames:exames(*),
          evolucoes:evolucao_paciente(*)
        `)
        .order('data_consulta', { ascending: false });

      // Aplicar filtros
      if (filtros.paciente) {
        query = query.eq('paciente_id', filtros.paciente);
      }
      if (filtros.profissional) {
        query = query.eq('profissional_id', filtros.profissional);
      }
      if (filtros.data_inicio) {
        query = query.gte('data_consulta', filtros.data_inicio);
      }
      if (filtros.data_fim) {
        query = query.lte('data_consulta', filtros.data_fim);
      }
      if (filtros.status) {
        query = query.eq('status', filtros.status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao carregar prontuários:', error);
        toast.error('Erro ao carregar prontuários');
        return;
      }

      // Filtrar por busca se necessário
      let prontuariosFiltrados = data || [];
      if (filtros.busca) {
        const busca = filtros.busca.toLowerCase();
        prontuariosFiltrados = prontuariosFiltrados.filter(prontuario =>
          prontuario.paciente?.nome.toLowerCase().includes(busca) ||
          prontuario.diagnostico?.toLowerCase().includes(busca) ||
          prontuario.sintomas?.toLowerCase().includes(busca) ||
          prontuario.observacoes?.toLowerCase().includes(busca)
        );
      }

      setProntuarios(prontuariosFiltrados);
    } catch (error) {
      console.error('Erro ao carregar prontuários:', error);
      toast.error('Erro ao carregar prontuários');
    }
  };

  const loadPacientes = async () => {
    try {
      const { data, error } = await supabase
        .from('pacientes')
        .select('id, nome, telefone, email')
        .eq('status', 'ativo')
        .order('nome');

      if (error) {
        console.error('Erro ao carregar pacientes:', error);
        return;
      }

      setPacientes(data || []);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
    }
  };

  const loadProfissionais = async () => {
    try {
      const { data, error } = await supabase
        .from('profissionais')
        .select('id, nome, especialidade, crm_cro')
        .eq('status', 'ativo')
        .order('nome');

      if (error) {
        console.error('Erro ao carregar profissionais:', error);
        return;
      }

      setProfissionais(data || []);
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
    }
  };

  const handleExcluir = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este prontuário?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('prontuarios')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir prontuário:', error);
        toast.error('Erro ao excluir prontuário');
        return;
      }

      toast.success('Prontuário excluído com sucesso');
      loadProntuarios();
    } catch (error) {
      console.error('Erro ao excluir prontuário:', error);
      toast.error('Erro ao excluir prontuário');
    }
  };

  const getTipoEvolucaoIcon = (tipo: string) => {
    switch (tipo) {
      case 'consulta':
        return <Stethoscope className="h-4 w-4 text-blue-500" />;
      case 'retorno':
        return <RefreshCw className="h-4 w-4 text-green-500" />;
      case 'emergencia':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'internacao':
        return <Activity className="h-4 w-4 text-purple-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTipoEvolucaoColor = (tipo: string) => {
    switch (tipo) {
      case 'consulta':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'retorno':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'emergencia':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'internacao':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusExameIcon = (status: string) => {
    switch (status) {
      case 'realizado':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pendente':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'cancelado':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const prontuariosFiltrados = prontuarios.filter(prontuario => {
    const matchesPaciente = !filtros.paciente || prontuario.paciente_id === filtros.paciente;
    const matchesProfissional = !filtros.profissional || prontuario.profissional_id === filtros.profissional;
    const matchesDataInicio = !filtros.data_inicio || new Date(prontuario.data_consulta) >= new Date(filtros.data_inicio);
    const matchesDataFim = !filtros.data_fim || new Date(prontuario.data_consulta) <= new Date(filtros.data_fim);
    const matchesStatus = !filtros.status || prontuario.status === filtros.status;
    const matchesBusca = !filtros.busca || 
      prontuario.paciente?.nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      prontuario.diagnostico?.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      prontuario.sintomas?.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      prontuario.observacoes?.toLowerCase().includes(filtros.busca.toLowerCase());

    return matchesPaciente && matchesProfissional && matchesDataInicio && matchesDataFim && matchesStatus && matchesBusca;
  });

  // Estatísticas
  const totalProntuarios = prontuarios.length;
  const prontuariosAtivos = prontuarios.filter(p => p.status === 'ativo').length;
  const prontuariosArquivados = prontuarios.filter(p => p.status === 'arquivado').length;
  const totalPrescricoes = prontuarios.reduce((acc, p) => acc + (p.prescricoes?.length || 0), 0);
  const totalExames = prontuarios.reduce((acc, p) => acc + (p.exames?.length || 0), 0);

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
        <title>Histórico Médico - Sistema de Gestão de Clínica</title>
        <meta name="description" content="Gerencie o histórico médico dos pacientes" />
      </Helmet>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-600" />
                Histórico Médico
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Gerencie o prontuário eletrônico completo dos pacientes
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('lista')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'lista'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Lista
                </button>
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'timeline'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Timeline
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
                Novo Prontuário
              </button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Total Prontuários
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalProntuarios}
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
                    Ativos
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {prontuariosAtivos}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Arquivados
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {prontuariosArquivados}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Pill className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Prescrições
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalPrescricoes}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileImage className="h-8 w-8 text-cyan-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Exames
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalExames}
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
                  value={filtros.paciente}
                  onChange={(e) => setFiltros({ ...filtros, paciente: e.target.value })}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">Todos os pacientes</option>
                  {pacientes.map(paciente => (
                    <option key={paciente.id} value={paciente.id}>
                      {paciente.nome}
                    </option>
                  ))}
                </select>
                <select
                  value={filtros.profissional}
                  onChange={(e) => setFiltros({ ...filtros, profissional: e.target.value })}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">Todos os profissionais</option>
                  {profissionais.map(profissional => (
                    <option key={profissional.id} value={profissional.id}>
                      {profissional.nome}
                    </option>
                  ))}
                </select>
                <select
                  value={filtros.status}
                  onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">Todos os status</option>
                  <option value="ativo">Ativo</option>
                  <option value="arquivado">Arquivado</option>
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
                    placeholder="Buscar prontuários..."
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
        {viewMode === 'lista' ? (
          /* Lista de Prontuários */
          <div className="space-y-4">
            {prontuariosFiltrados.map((prontuario) => (
              <Card key={prontuario.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <User className="h-5 w-5 text-blue-500" />
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {prontuario.paciente?.nome || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Stethoscope className="h-5 w-5 text-green-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {prontuario.profissional?.nome || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-5 w-5 text-purple-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(prontuario.data_consulta)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Sintomas
                          </p>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {prontuario.sintomas || 'Não informado'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Diagnóstico
                          </p>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {prontuario.diagnostico || 'Não informado'}
                          </p>
                        </div>
                      </div>

                      {prontuario.prescricao && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Prescrição
                          </p>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {prontuario.prescricao}
                          </p>
                        </div>
                      )}

                      {prontuario.observacoes && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Observações
                          </p>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {prontuario.observacoes}
                          </p>
                        </div>
                      )}

                      {/* Prescrições */}
                      {prontuario.prescricoes && prontuario.prescricoes.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                            Medicamentos Prescritos
                          </p>
                          <div className="space-y-2">
                            {prontuario.prescricoes.map((prescricao) => (
                              <div key={prescricao.id} className="flex items-center space-x-2 text-sm">
                                <Pill className="h-4 w-4 text-orange-500" />
                                <span className="font-medium">{prescricao.medicamento}</span>
                                <span className="text-gray-500">-</span>
                                <span className="text-gray-600">{prescricao.dosagem}</span>
                                <span className="text-gray-500">-</span>
                                <span className="text-gray-600">{prescricao.frequencia}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Exames */}
                      {prontuario.exames && prontuario.exames.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                            Exames Solicitados
                          </p>
                          <div className="space-y-2">
                            {prontuario.exames.map((exame) => (
                              <div key={exame.id} className="flex items-center space-x-2 text-sm">
                                {getStatusExameIcon(exame.status)}
                                <span className="font-medium">{exame.nome_exame}</span>
                                <span className="text-gray-500">-</span>
                                <span className="text-gray-600">{exame.tipo_exame}</span>
                                {exame.data_exame && (
                                  <>
                                    <span className="text-gray-500">-</span>
                                    <span className="text-gray-600">{formatDate(exame.data_exame)}</span>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Evoluções */}
                      {prontuario.evolucoes && prontuario.evolucoes.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                            Evoluções
                          </p>
                          <div className="space-y-2">
                            {prontuario.evolucoes.map((evolucao) => (
                              <div key={evolucao.id} className="flex items-start space-x-2 text-sm">
                                {getTipoEvolucaoIcon(evolucao.tipo_evolucao)}
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoEvolucaoColor(evolucao.tipo_evolucao)}`}>
                                      {evolucao.tipo_evolucao.toUpperCase()}
                                    </span>
                                    <span className="text-gray-500">{formatDate(evolucao.data_evolucao)}</span>
                                  </div>
                                  <p className="text-gray-900 dark:text-white mt-1">
                                    {evolucao.descricao}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => setProntuarioSelecionado(prontuario)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Ver detalhes"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => setProntuarioSelecionado(prontuario)}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleExcluir(prontuario.id)}
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
          /* Timeline */
          <div className="space-y-6">
            {prontuariosFiltrados.map((prontuario) => (
              <Card key={prontuario.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <Stethoscope className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {prontuario.paciente?.nome || 'N/A'}
                        </h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(prontuario.data_consulta)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {prontuario.profissional?.nome || 'N/A'} - {prontuario.profissional?.especialidade || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {prontuario.diagnostico || 'Sem diagnóstico registrado'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Mensagem quando não há prontuários */}
        {prontuariosFiltrados.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nenhum prontuário encontrado
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Não há prontuários que correspondam aos filtros selecionados.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default HistoricoMedico;
