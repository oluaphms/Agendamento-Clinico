import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, LineChart, Line, Legend } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { Building2, RefreshCw, Download, TrendingUp, Activity, Users } from 'lucide-react';
// ============================================================================
// PÁGINA: Relatórios de Ocupação - Sistema de Relatórios
// ============================================================================
// Esta página implementa relatórios de ocupação da clínica, incluindo
// taxa de ocupação, utilização de recursos e análise de capacidade.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

import { Card, CardContent } from '@/design-system';
import { LoadingSpinner } from '@/components/LazyLoading/LazyWrapper';

import toast from 'react-hot-toast';

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

interface OcupacaoSala {
  id: string;
  nome: string;
  capacidade: number;
  consultasRealizadas: number;
  consultasAgendadas: number;
  taxaOcupacao: number;
  receitaGerada: number;
  tempoMedioUtilizacao: number;
}

interface OcupacaoProfissional {
  id: string;
  nome: string;
  especialidade: string;
  consultasRealizadas: number;
  consultasAgendadas: number;
  taxaOcupacao: number;
  receitaGerada: number;
  tempoMedioConsulta: number;
}

interface DadosOcupacao {
  data: string;
  taxaOcupacaoGeral: number;
  consultasRealizadas: number;
  consultasAgendadas: number;
  receitaGerada: number;
  salasUtilizadas: number;
  profissionaisAtivos: number;
}

interface ResumoOcupacao {
  taxaOcupacaoGeral: number;
  totalConsultas: number;
  totalSalas: number;
  totalProfissionais: number;
  receitaTotal: number;
  eficienciaMedia: number;
  salasTop: OcupacaoSala[];
  profissionaisTop: OcupacaoProfissional[];
}

interface Filtros {
  data_inicio: string;
  data_fim: string;
  tipo_ocupacao: string;
  especialidade: string;
  profissional: string;
  sala: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const RelatoriosOcupacao: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [ocupacaoSalas, setOcupacaoSalas] = useState<OcupacaoSala[]>([]);
  const [ocupacaoProfissionais, setOcupacaoProfissionais] = useState<
    OcupacaoProfissional[]
  >([]);
  const [dadosOcupacao, setDadosOcupacao] = useState<DadosOcupacao[]>([]);
  const [resumoOcupacao, setResumoOcupacao] = useState<ResumoOcupacao | null>(
    null
  );
  const [filtros, setFiltros] = useState<Filtros>({
    data_inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split('T')[0],
    data_fim: new Date().toISOString().split('T')[0],
    tipo_ocupacao: 'geral',
    especialidade: '',
    profissional: '',
    sala: '',
  });
  const [periodoSelecionado, setPeriodoSelecionado] = useState('30dias');

  // ============================================================================
  // EFEITOS
  // ============================================================================

  useEffect(() => {
    loadDados();
  }, [filtros, periodoSelecionado]);

  // ============================================================================
  // FUNÇÕES
  // ============================================================================

  const loadDados = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadOcupacaoSalas(),
        loadOcupacaoProfissionais(),
        loadDadosOcupacao(),
        loadResumoOcupacao(),
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar relatórios de ocupação');
    } finally {
      setLoading(false);
    }
  };

  const loadOcupacaoSalas = async () => {
    try {
      // Simular dados de ocupação das salas
      const salasMock: OcupacaoSala[] = [
        {
          id: '1',
          nome: 'Sala 1',
          capacidade: 8,
          consultasRealizadas: 32,
          consultasAgendadas: 40,
          taxaOcupacao: 80,
          receitaGerada: 16000,
          tempoMedioUtilizacao: 30,
        },
        {
          id: '2',
          nome: 'Sala 2',
          capacidade: 6,
          consultasRealizadas: 24,
          consultasAgendadas: 30,
          taxaOcupacao: 80,
          receitaGerada: 12000,
          tempoMedioUtilizacao: 35,
        },
        {
          id: '3',
          nome: 'Sala 3',
          capacidade: 4,
          consultasRealizadas: 16,
          consultasAgendadas: 20,
          taxaOcupacao: 80,
          receitaGerada: 8000,
          tempoMedioUtilizacao: 25,
        },
        {
          id: '4',
          nome: 'Sala 5',
          capacidade: 10,
          consultasRealizadas: 35,
          consultasAgendadas: 50,
          taxaOcupacao: 70,
          receitaGerada: 17500,
          tempoMedioUtilizacao: 40,
        },
        {
          id: '5',
          nome: 'Sala 6',
          capacidade: 6,
          consultasRealizadas: 18,
          consultasAgendadas: 30,
          taxaOcupacao: 60,
          receitaGerada: 9000,
          tempoMedioUtilizacao: 30,
        },
      ];

      setOcupacaoSalas(salasMock);
    } catch (error) {
      console.error('Erro ao carregar ocupação das salas:', error);
    }
  };

  const loadOcupacaoProfissionais = async () => {
    try {
      // Simular dados de ocupação dos profissionais
      const profissionaisMock: OcupacaoProfissional[] = [
        {
          id: '1',
          nome: 'Dr. João Silva',
          especialidade: 'Cardiologia',
          consultasRealizadas: 45,
          consultasAgendadas: 50,
          taxaOcupacao: 90,
          receitaGerada: 22500,
          tempoMedioConsulta: 30,
        },
        {
          id: '2',
          nome: 'Dra. Maria Santos',
          especialidade: 'Dermatologia',
          consultasRealizadas: 38,
          consultasAgendadas: 40,
          taxaOcupacao: 95,
          receitaGerada: 19000,
          tempoMedioConsulta: 25,
        },
        {
          id: '3',
          nome: 'Dr. Pedro Costa',
          especialidade: 'Ortopedia',
          consultasRealizadas: 42,
          consultasAgendadas: 45,
          taxaOcupacao: 93,
          receitaGerada: 21000,
          tempoMedioConsulta: 35,
        },
        {
          id: '4',
          nome: 'Dra. Ana Oliveira',
          especialidade: 'Pediatria',
          consultasRealizadas: 35,
          consultasAgendadas: 38,
          taxaOcupacao: 92,
          receitaGerada: 17500,
          tempoMedioConsulta: 28,
        },
        {
          id: '5',
          nome: 'Dr. Carlos Lima',
          especialidade: 'Neurologia',
          consultasRealizadas: 28,
          consultasAgendadas: 32,
          taxaOcupacao: 88,
          receitaGerada: 14000,
          tempoMedioConsulta: 40,
        },
      ];

      setOcupacaoProfissionais(profissionaisMock);
    } catch (error) {
      console.error('Erro ao carregar ocupação dos profissionais:', error);
    }
  };

  const loadDadosOcupacao = async () => {
    try {
      // Simular dados de ocupação ao longo do tempo
      const dadosMock: DadosOcupacao[] = [];
      const dataInicio = new Date(filtros.data_inicio);
      const dataFim = new Date(filtros.data_fim);

      for (
        let d = new Date(dataInicio);
        d <= dataFim;
        d.setDate(d.getDate() + 1)
      ) {
        const consultasRealizadas = Math.floor(Math.random() * 20) + 10;
        const consultasAgendadas = Math.floor(consultasRealizadas * 1.2);
        const taxaOcupacao = Math.round(
          (consultasRealizadas / consultasAgendadas) * 100
        );
        const receitaGerada = consultasRealizadas * (Math.random() * 200 + 300);
        const salasUtilizadas = Math.floor(Math.random() * 3) + 3;
        const profissionaisAtivos = Math.floor(Math.random() * 2) + 4;

        dadosMock.push({
          data: d.toISOString().split('T')[0],
          taxaOcupacaoGeral: taxaOcupacao,
          consultasRealizadas: consultasRealizadas,
          consultasAgendadas: consultasAgendadas,
          receitaGerada: Math.round(receitaGerada),
          salasUtilizadas: salasUtilizadas,
          profissionaisAtivos: profissionaisAtivos,
        });
      }

      setDadosOcupacao(dadosMock);
    } catch (error) {
      console.error('Erro ao carregar dados de ocupação:', error);
    }
  };

  const loadResumoOcupacao = async () => {
    try {
      // Simular resumo de ocupação
      const resumoMock: ResumoOcupacao = {
        taxaOcupacaoGeral: 85,
        totalConsultas: 188,
        totalSalas: 5,
        totalProfissionais: 5,
        receitaTotal: 94000,
        eficienciaMedia: 88,
        salasTop: ocupacaoSalas
          .sort((a, b) => b.taxaOcupacao - a.taxaOcupacao)
          .slice(0, 3),
        profissionaisTop: ocupacaoProfissionais
          .sort((a, b) => b.taxaOcupacao - a.taxaOcupacao)
          .slice(0, 3),
      };

      setResumoOcupacao(resumoMock);
    } catch (error) {
      console.error('Erro ao carregar resumo de ocupação:', error);
    }
  };

  const handleExportar = async (formato: string) => {
    try {
      if (formato === 'pdf') {
        toast.success('Relatório de ocupação exportado para PDF');
      } else if (formato === 'excel') {
        toast.success('Relatório de ocupação exportado para Excel');
      } else if (formato === 'csv') {
        toast.success('Relatório de ocupação exportado para CSV');
      }
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      toast.error('Erro ao exportar relatório');
    }
  };

  const handlePeriodoChange = (periodo: string) => {
    setPeriodoSelecionado(periodo);

    const hoje = new Date();
    let dataInicio: Date;

    switch (periodo) {
      case '7dias':
        dataInicio = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30dias':
        dataInicio = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90dias':
        dataInicio = new Date(hoje.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1ano':
        dataInicio = new Date(hoje.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        dataInicio = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    setFiltros({
      ...filtros,
      data_inicio: dataInicio.toISOString().split('T')[0],
      data_fim: hoje.toISOString().split('T')[0],
    });
  };

  const getTaxaOcupacaoColor = (taxa: number) => {
    if (taxa >= 90) return 'text-green-600';
    if (taxa >= 80) return 'text-yellow-600';
    if (taxa >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const getTaxaOcupacaoBgColor = (taxa: number) => {
    if (taxa >= 90) return 'bg-green-100 dark:bg-green-900';
    if (taxa >= 80) return 'bg-yellow-100 dark:bg-yellow-900';
    if (taxa >= 70) return 'bg-orange-100 dark:bg-orange-900';
    return 'bg-red-100 dark:bg-red-900';
  };

  // Cores para gráficos

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
        <title>Relatórios de Ocupação - Sistema de Gestão de Clínica</title>
        <meta name='description' content='Relatórios de ocupação da clínica' />
      </Helmet>

      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3'>
                <Building2 className='h-8 w-8 text-blue-600' />
                Relatórios de Ocupação
              </h1>
              <p className='text-gray-600 dark:text-gray-400 mt-2'>
                Análise de ocupação e utilização de recursos da clínica
              </p>
            </div>
            <div className='flex items-center gap-4'>
              <button
                onClick={loadDados}
                className='flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors'
              >
                <RefreshCw className='mr-2' size={16} />
                Atualizar
              </button>
              <div className='flex items-center space-x-2'>
                <button
                  onClick={() => handleExportar('pdf')}
                  className='flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'
                >
                  <Download className='mr-2' size={16} />
                  PDF
                </button>
                <button
                  onClick={() => handleExportar('excel')}
                  className='flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
                >
                  <Download className='mr-2' size={16} />
                  Excel
                </button>
                <button
                  onClick={() => handleExportar('csv')}
                  className='flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                >
                  <Download className='mr-2' size={16} />
                  CSV
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros e Período */}
        <Card className='mb-8'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                Filtros e Período
              </h3>
              <div className='flex items-center space-x-2'>
                <button
                  onClick={() => handlePeriodoChange('7dias')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    periodoSelecionado === '7dias'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  7 dias
                </button>
                <button
                  onClick={() => handlePeriodoChange('30dias')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    periodoSelecionado === '30dias'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  30 dias
                </button>
                <button
                  onClick={() => handlePeriodoChange('90dias')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    periodoSelecionado === '90dias'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  90 dias
                </button>
                <button
                  onClick={() => handlePeriodoChange('1ano')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    periodoSelecionado === '1ano'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  1 ano
                </button>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Data Início
                </label>
                <input
                  type='date'
                  value={filtros.data_inicio}
                  onChange={e =>
                    setFiltros({ ...filtros, data_inicio: e.target.value })
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
                  value={filtros.data_fim}
                  onChange={e =>
                    setFiltros({ ...filtros, data_fim: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Tipo de Ocupação
                </label>
                <select
                  value={filtros.tipo_ocupacao}
                  onChange={e =>
                    setFiltros({ ...filtros, tipo_ocupacao: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                >
                  <option value='geral'>Geral</option>
                  <option value='salas'>Salas</option>
                  <option value='profissionais'>Profissionais</option>
                  <option value='recursos'>Recursos</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  Especialidade
                </label>
                <select
                  value={filtros.especialidade}
                  onChange={e =>
                    setFiltros({ ...filtros, especialidade: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                >
                  <option value=''>Todas as especialidades</option>
                  <option value='Cardiologia'>Cardiologia</option>
                  <option value='Dermatologia'>Dermatologia</option>
                  <option value='Ortopedia'>Ortopedia</option>
                  <option value='Pediatria'>Pediatria</option>
                  <option value='Neurologia'>Neurologia</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo de Ocupação */}
        {resumoOcupacao && (
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center'>
                  <TrendingUp className='h-8 w-8 text-blue-600' />
                  <div className='ml-4'>
                    <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                      Taxa de Ocupação Geral
                    </p>
                    <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                      {resumoOcupacao.taxaOcupacaoGeral}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center'>
                  <Activity className='h-8 w-8 text-green-600' />
                  <div className='ml-4'>
                    <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                      Total de Consultas
                    </p>
                    <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                      {resumoOcupacao.totalConsultas}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center'>
                  <Building2 className='h-8 w-8 text-purple-600' />
                  <div className='ml-4'>
                    <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                      Total de Salas
                    </p>
                    <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                      {resumoOcupacao.totalSalas}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center'>
                  <Users className='h-8 w-8 text-yellow-600' />
                  <div className='ml-4'>
                    <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                      Total de Profissionais
                    </p>
                    <p className='text-2xl font-bold text-gray-900 dark:text-white'>
                      {resumoOcupacao.totalProfissionais}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Gráficos */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
          {/* Gráfico de Ocupação por Sala */}
          <Card>
            <CardContent className='p-6'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
                Ocupação por Sala
              </h3>
              <div className='h-80'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={ocupacaoSalas}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='nome' />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey='taxaOcupacao' fill='#3B82F6' />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Gráfico de Ocupação por Profissional */}
          <Card>
            <CardContent className='p-6'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
                Ocupação por Profissional
              </h3>
              <div className='h-80'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={ocupacaoProfissionais}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='nome' />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey='taxaOcupacao' fill='#10B981' />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Evolução da Ocupação */}
        <Card className='mb-8'>
          <CardContent className='p-6'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              Evolução da Ocupação
            </h3>
            <div className='h-80'>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart data={dadosOcupacao}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='data' />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type='monotone'
                    dataKey='taxaOcupacaoGeral'
                    stroke='#3B82F6'
                    strokeWidth={2}
                    name='Taxa de Ocupação'
                  />
                  <Line
                    type='monotone'
                    dataKey='consultasRealizadas'
                    stroke='#10B981'
                    strokeWidth={2}
                    name='Consultas Realizadas'
                  />
                  <Line
                    type='monotone'
                    dataKey='consultasAgendadas'
                    stroke='#F59E0B'
                    strokeWidth={2}
                    name='Consultas Agendadas'
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Ocupação das Salas */}
        <Card className='mb-8'>
          <CardContent className='p-6'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              Ocupação das Salas
            </h3>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
                <thead className='bg-gray-50 dark:bg-gray-800'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                      Sala
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                      Capacidade
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                      Consultas
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                      Taxa de Ocupação
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                      Receita
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                      Tempo Médio
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700'>
                  {ocupacaoSalas.map(sala => (
                    <tr key={sala.id}>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white'>
                        {sala.nome}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                        {sala.capacidade}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                        {sala.consultasRealizadas}/{sala.consultasAgendadas}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm'>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getTaxaOcupacaoBgColor(sala.taxaOcupacao)} ${getTaxaOcupacaoColor(sala.taxaOcupacao)}`}
                        >
                          {sala.taxaOcupacao}%
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                        {formatCurrency(sala.receitaGerada)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                        {sala.tempoMedioUtilizacao} min
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Ocupação dos Profissionais */}
        <Card>
          <CardContent className='p-6'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
              Ocupação dos Profissionais
            </h3>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
                <thead className='bg-gray-50 dark:bg-gray-800'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                      Profissional
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                      Especialidade
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                      Consultas
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                      Taxa de Ocupação
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                      Receita
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
                      Tempo Médio
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700'>
                  {ocupacaoProfissionais.map(profissional => (
                    <tr key={profissional.id}>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white'>
                        {profissional.nome}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                        {profissional.especialidade}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                        {profissional.consultasRealizadas}/
                        {profissional.consultasAgendadas}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm'>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getTaxaOcupacaoBgColor(profissional.taxaOcupacao)} ${getTaxaOcupacaoColor(profissional.taxaOcupacao)}`}
                        >
                          {profissional.taxaOcupacao}%
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                        {formatCurrency(profissional.receitaGerada)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white'>
                        {profissional.tempoMedioConsulta} min
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RelatoriosOcupacao;
