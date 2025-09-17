import { formatDate, formatPhone } from '@/lib/utils';
import { Activity, Plus, Search, Filter, Download, Eye, Edit, Trash2, Calendar, User, Stethoscope, AlertCircle, CheckCircle, Clock, RefreshCw, FileText, TrendingUp, Heart, Brain, Shield } from 'lucide-react';
// ============================================================================
// PÁGINA: Evolução do Paciente - Prontuário Eletrônico
// ============================================================================
// Esta página gerencia as evoluções e notas de progresso dos pacientes,
// incluindo consultas, retornos e internações.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

import { Card, CardContent } from '@/design-system';
import { LoadingSpinner } from '@/components/LazyLoading/LazyWrapper';

import toast from 'react-hot-toast';

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

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
  prontuario?: {
    id: string;
    data_consulta: string;
    diagnostico: string;
  };
}

interface Filtros {
  paciente: string;
  profissional: string;
  tipo_evolucao: string;
  data_inicio: string;
  data_fim: string;
  busca: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const EvolucaoPaciente: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [evolucoes, setEvolucoes] = useState<Evolucao[]>([]);
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [profissionais, setProfissionais] = useState<any[]>([]);
  const [filtros, setFiltros] = useState<Filtros>({
    paciente: '',
    profissional: '',
    tipo_evolucao: '',
    data_inicio: '',
    data_fim: '',
    busca: '',
  });
  const [modalAberto, setModalAberto] = useState(false);
  const [evolucaoSelecionada, setEvolucaoSelecionada] =
    useState<Evolucao | null>(null);
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
        loadEvolucoes(),
        loadPacientes(),
        loadProfissionais(),
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados das evoluções');
    } finally {
      setLoading(false);
    }
  };

  const loadEvolucoes = async () => {
    try {
      let query = supabase
        .from('evolucao_paciente')
        .select(
          `
          *,
          paciente:pacientes(nome, telefone, email, data_nascimento),
          profissional:profissionais(nome, especialidade, crm_cro),
          prontuario:prontuarios(
            id,
            data_consulta,
            diagnostico
          )
        `
        )
        .order('data_evolucao', { ascending: false });

      // Aplicar filtros
      if (filtros.paciente) {
        query = query.eq('paciente_id', filtros.paciente);
      }
      if (filtros.profissional) {
        query = query.eq('profissional_id', filtros.profissional);
      }
      if (filtros.tipo_evolucao) {
        query = query.eq('tipo_evolucao', filtros.tipo_evolucao);
      }
      if (filtros.data_inicio) {
        query = query.gte('data_evolucao', filtros.data_inicio);
      }
      if (filtros.data_fim) {
        query = query.lte('data_evolucao', filtros.data_fim);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao carregar evoluções:', error);
        toast.error('Erro ao carregar evoluções');
        return;
      }

      // Filtrar por busca se necessário
      let evolucoesFiltradas = data || [];
      if (filtros.busca) {
        const busca = filtros.busca.toLowerCase();
        evolucoesFiltradas = evolucoesFiltradas.filter(
          evolucao =>
            evolucao.descricao.toLowerCase().includes(busca) ||
            evolucao.observacoes?.toLowerCase().includes(busca) ||
            evolucao.paciente?.nome.toLowerCase().includes(busca) ||
            evolucao.profissional?.nome.toLowerCase().includes(busca)
        );
      }

      setEvolucoes(evolucoesFiltradas);
    } catch (error) {
      console.error('Erro ao carregar evoluções:', error);
      toast.error('Erro ao carregar evoluções');
    }
  };

  const loadPacientes = async () => {
    try {
      const { data, error } = await supabase
        .from('pacientes')
        .select('id, nome, telefone, email, data_nascimento')
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
    if (!window.confirm('Tem certeza que deseja excluir esta evolução?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('evolucao_paciente')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir evolução:', error);
        toast.error('Erro ao excluir evolução');
        return;
      }

      toast.success('Evolução excluída com sucesso');
      loadEvolucoes();
    } catch (error) {
      console.error('Erro ao excluir evolução:', error);
      toast.error('Erro ao excluir evolução');
    }
  };

  const getTipoEvolucaoIcon = (tipo: string) => {
    switch (tipo) {
      case 'consulta':
        return <Stethoscope className='h-5 w-5 text-blue-500' />;
      case 'retorno':
        return <RefreshCw className='h-5 w-5 text-green-500' />;
      case 'emergencia':
        return <AlertCircle className='h-5 w-5 text-red-500' />;
      case 'internacao':
        return <Heart className='h-5 w-5 text-purple-500' />;
      default:
        return <Activity className='h-5 w-5 text-gray-500' />;
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

  const getTipoEvolucaoLabel = (tipo: string) => {
    const labels = {
      consulta: 'Consulta',
      retorno: 'Retorno',
      emergencia: 'Emergência',
      internacao: 'Internação',
    };
    return labels[tipo as keyof typeof labels] || tipo;
  };

  const calcularIdade = (dataNascimento: string) => {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesAtual = hoje.getMonth();
    const mesNascimento = nascimento.getMonth();

    if (
      mesAtual < mesNascimento ||
      (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())
    ) {
      idade--;
    }

    return idade;
  };

  const evolucoesFiltradas = evolucoes.filter(evolucao => {
    const matchesPaciente =
      !filtros.paciente || evolucao.paciente_id === filtros.paciente;
    const matchesProfissional =
      !filtros.profissional ||
      evolucao.profissional_id === filtros.profissional;
    const matchesTipo =
      !filtros.tipo_evolucao ||
      evolucao.tipo_evolucao === filtros.tipo_evolucao;
    const matchesDataInicio =
      !filtros.data_inicio ||
      new Date(evolucao.data_evolucao) >= new Date(filtros.data_inicio);
    const matchesDataFim =
      !filtros.data_fim ||
      new Date(evolucao.data_evolucao) <= new Date(filtros.data_fim);
    const matchesBusca =
      !filtros.busca ||
      evolucao.descricao.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      evolucao.observacoes
        ?.toLowerCase()
        .includes(filtros.busca.toLowerCase()) ||
      evolucao.paciente?.nome
        .toLowerCase()
        .includes(filtros.busca.toLowerCase()) ||
      evolucao.profissional?.nome
        .toLowerCase()
        .includes(filtros.busca.toLowerCase());

    return (
      matchesPaciente &&
      matchesProfissional &&
      matchesTipo &&
      matchesDataInicio &&
      matchesDataFim &&
      matchesBusca
    );
  });

  // Estatísticas
  const totalEvolucoes = evolucoes.length;
  const evolucoesHoje = evolucoes.filter(
    e => new Date(e.data_evolucao).toDateString() === new Date().toDateString()
  ).length;
  const evolucoesConsulta = evolucoes.filter(
    e => e.tipo_evolucao === 'consulta'
  ).length;
  const evolucoesEmergencia = evolucoes.filter(
    e => e.tipo_evolucao === 'emergencia'
  ).length;

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
        <title>Evolução do Paciente - Sistema de Gestão de Clínica</title>
        <meta
          name='description'
          content='Gerencie as evoluções dos pacientes'
        />
      </Helmet>

      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3'>
                <Activity className='h-8 w-8 text-blue-600' />
                Evolução do Paciente
              </h1>
              <p className='text-gray-600 dark:text-gray-400 mt-2'>
                Gerencie as evoluções e progresso dos pacientes
              </p>
            </div>
            <div className='flex items-center gap-4'>
              <div className='flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1'>
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
                className='flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors'
              >
                <RefreshCw className='mr-2' size={16} />
                Atualizar
              </button>
              <button
                onClick={() => setModalAberto(true)}
                className='flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
              >
                <Plus className='mr-2' size={16} />
                Nova Evolução
              </button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <Activity className='h-8 w-8 text-blue-600' />
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                    Total de Evoluções
                  </p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {totalEvolucoes}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <Calendar className='h-8 w-8 text-green-600' />
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                    Hoje
                  </p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {evolucoesHoje}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <Stethoscope className='h-8 w-8 text-purple-600' />
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                    Consultas
                  </p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {evolucoesConsulta}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center'>
                <AlertCircle className='h-8 w-8 text-red-600' />
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                    Emergências
                  </p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {evolucoesEmergencia}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className='mb-6'>
          <CardContent className='p-6'>
            <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0'>
              <div className='flex items-center space-x-4'>
                <div className='flex items-center space-x-2'>
                  <Filter className='h-5 w-5 text-gray-500' />
                  <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                    Filtros:
                  </span>
                </div>
                <select
                  value={filtros.paciente}
                  onChange={e =>
                    setFiltros({ ...filtros, paciente: e.target.value })
                  }
                  className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm'
                >
                  <option value=''>Todos os pacientes</option>
                  {pacientes.map(paciente => (
                    <option key={paciente.id} value={paciente.id}>
                      {paciente.nome}
                    </option>
                  ))}
                </select>
                <select
                  value={filtros.profissional}
                  onChange={e =>
                    setFiltros({ ...filtros, profissional: e.target.value })
                  }
                  className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm'
                >
                  <option value=''>Todos os profissionais</option>
                  {profissionais.map(profissional => (
                    <option key={profissional.id} value={profissional.id}>
                      {profissional.nome}
                    </option>
                  ))}
                </select>
                <select
                  value={filtros.tipo_evolucao}
                  onChange={e =>
                    setFiltros({ ...filtros, tipo_evolucao: e.target.value })
                  }
                  className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm'
                >
                  <option value=''>Todos os tipos</option>
                  <option value='consulta'>Consulta</option>
                  <option value='retorno'>Retorno</option>
                  <option value='emergencia'>Emergência</option>
                  <option value='internacao'>Internação</option>
                </select>
              </div>
              <div className='flex items-center space-x-4'>
                <input
                  type='date'
                  value={filtros.data_inicio}
                  onChange={e =>
                    setFiltros({ ...filtros, data_inicio: e.target.value })
                  }
                  className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm'
                  placeholder='Data início'
                />
                <input
                  type='date'
                  value={filtros.data_fim}
                  onChange={e =>
                    setFiltros({ ...filtros, data_fim: e.target.value })
                  }
                  className='px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm'
                  placeholder='Data fim'
                />
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                  <input
                    type='text'
                    placeholder='Buscar evoluções...'
                    value={filtros.busca}
                    onChange={e =>
                      setFiltros({ ...filtros, busca: e.target.value })
                    }
                    className='pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm min-w-[200px]'
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conteúdo Principal */}
        {viewMode === 'lista' ? (
          /* Lista de Evoluções */
          <div className='space-y-4'>
            {evolucoesFiltradas.map(evolucao => (
              <Card
                key={evolucao.id}
                className='hover:shadow-lg transition-shadow'
              >
                <CardContent className='p-6'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center space-x-4 mb-4'>
                        <div className='flex items-center space-x-2'>
                          {getTipoEvolucaoIcon(evolucao.tipo_evolucao)}
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoEvolucaoColor(evolucao.tipo_evolucao)}`}
                          >
                            {getTipoEvolucaoLabel(evolucao.tipo_evolucao)}
                          </span>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <Calendar className='h-4 w-4 text-gray-500' />
                          <span className='text-sm text-gray-600 dark:text-gray-400'>
                            {formatDate(evolucao.data_evolucao)}
                          </span>
                        </div>
                      </div>

                      <div className='mb-4'>
                        <p className='text-sm font-medium text-gray-600 dark:text-gray-400 mb-1'>
                          Descrição da Evolução
                        </p>
                        <p className='text-sm text-gray-900 dark:text-white'>
                          {evolucao.descricao}
                        </p>
                      </div>

                      {evolucao.observacoes && (
                        <div className='mb-4'>
                          <p className='text-sm font-medium text-gray-600 dark:text-gray-400 mb-1'>
                            Observações
                          </p>
                          <p className='text-sm text-gray-900 dark:text-white'>
                            {evolucao.observacoes}
                          </p>
                        </div>
                      )}

                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                        <div>
                          <p className='text-gray-600 dark:text-gray-400'>
                            Paciente
                          </p>
                          <p className='font-medium text-gray-900 dark:text-white'>
                            {evolucao.paciente?.nome || 'N/A'}
                          </p>
                          <p className='text-gray-500 dark:text-gray-400'>
                            {evolucao.paciente?.data_nascimento
                              ? `${calcularIdade(evolucao.paciente.data_nascimento)} anos`
                              : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className='text-gray-600 dark:text-gray-400'>
                            Profissional
                          </p>
                          <p className='font-medium text-gray-900 dark:text-white'>
                            {evolucao.profissional?.nome || 'N/A'}
                          </p>
                          <p className='text-gray-500 dark:text-gray-400'>
                            {evolucao.profissional?.especialidade || 'N/A'}
                          </p>
                        </div>
                      </div>

                      {evolucao.prontuario && (
                        <div className='mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
                          <p className='text-sm font-medium text-gray-600 dark:text-gray-400 mb-1'>
                            Prontuário Relacionado
                          </p>
                          <p className='text-sm text-gray-900 dark:text-white'>
                            <strong>Data da Consulta:</strong>{' '}
                            {formatDate(evolucao.prontuario.data_consulta)}
                          </p>
                          <p className='text-sm text-gray-900 dark:text-white'>
                            <strong>Diagnóstico:</strong>{' '}
                            {evolucao.prontuario.diagnostico || 'Não informado'}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className='flex items-center space-x-2 ml-4'>
                      <button
                        onClick={() => setEvolucaoSelecionada(evolucao)}
                        className='p-2 text-gray-400 hover:text-blue-600 transition-colors'
                        title='Ver detalhes'
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => setEvolucaoSelecionada(evolucao)}
                        className='p-2 text-gray-400 hover:text-green-600 transition-colors'
                        title='Editar'
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleExcluir(evolucao.id)}
                        className='p-2 text-gray-400 hover:text-red-600 transition-colors'
                        title='Excluir'
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
          <div className='space-y-6'>
            {evolucoesFiltradas.map(evolucao => (
              <Card
                key={evolucao.id}
                className='hover:shadow-lg transition-shadow'
              >
                <CardContent className='p-6'>
                  <div className='flex items-start space-x-4'>
                    <div className='flex-shrink-0'>
                      <div className='w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center'>
                        {getTipoEvolucaoIcon(evolucao.tipo_evolucao)}
                      </div>
                    </div>
                    <div className='flex-1'>
                      <div className='flex items-center justify-between mb-2'>
                        <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                          {evolucao.paciente?.nome || 'N/A'}
                        </h3>
                        <span className='text-sm text-gray-500 dark:text-gray-400'>
                          {formatDate(evolucao.data_evolucao)}
                        </span>
                      </div>
                      <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>
                        {evolucao.profissional?.nome || 'N/A'} -{' '}
                        {evolucao.profissional?.especialidade || 'N/A'}
                      </p>
                      <p className='text-sm text-gray-900 dark:text-white'>
                        {evolucao.descricao}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Mensagem quando não há evoluções */}
        {evolucoesFiltradas.length === 0 && (
          <Card className='text-center py-12'>
            <CardContent>
              <Activity className='mx-auto h-12 w-12 text-gray-400 mb-4' />
              <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
                Nenhuma evolução encontrada
              </h3>
              <p className='text-gray-500 dark:text-gray-400'>
                Não há evoluções que correspondam aos filtros selecionados.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EvolucaoPaciente;
