// ============================================================================
// PÁGINA: Check-in/Check-out - Sistema de Consultas
// ============================================================================
// Esta página gerencia o sistema de check-in e check-out das consultas,
// incluindo controle de presença e tempo de consulta.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

import { Card, CardContent } from '@/design-system';
import { LoadingSpinner } from '@/components/LazyLoading/LazyWrapper';

import toast from 'react-hot-toast';

// ============================================================================
// INTERFACES E TIPOS
// ============================================================================

interface Consulta {
  id: string;
  agendamento_id: string;
  paciente_id: string;
  profissional_id: string;
  data: string;
  hora: string;
  duracao_minutos: number;
  status: 'agendada' | 'em_andamento' | 'concluida' | 'cancelada' | 'faltou';
  check_in?: string;
  check_out?: string;
  observacoes?: string;
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
  servico?: {
    nome: string;
    valor: number;
    duracao_minutos: number;
  };
}

interface Cronometro {
  consultaId: string;
  tempoInicio: Date;
  tempoDecorrido: number;
  isRunning: boolean;
}

interface Filtros {
  data: string;
  status: string;
  profissional: string;
  busca: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const CheckInCheckOut: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [profissionais, setProfissionais] = useState<any[]>([]);
  const [filtros, setFiltros] = useState<Filtros>({
    data: new Date().toISOString().split('T')[0],
    status: '',
    profissional: '',
    busca: '',
  });
  const [cronometros, setCronometros] = useState<Map<string, Cronometro>>(new Map());
  const [consultaSelecionada, setConsultaSelecionada] = useState<Consulta | null>(null);

  // ============================================================================
  // EFEITOS
  // ============================================================================

  useEffect(() => {
    loadDados();
  }, [filtros]);

  useEffect(() => {
    // Atualizar cronômetros a cada segundo
    const interval = setInterval(() => {
      setCronometros(prev => {
        const novosCronometros = new Map(prev);
        novosCronometros.forEach((cronometro, id) => {
          if (cronometro.isRunning) {
            const agora = new Date();
            const tempoDecorrido = Math.floor((agora.getTime() - cronometro.tempoInicio.getTime()) / 1000);
            novosCronometros.set(id, {
              ...cronometro,
              tempoDecorrido,
            });
          }
        });
        return novosCronometros;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ============================================================================
  // FUNÇÕES
  // ============================================================================

  const loadDados = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadConsultas(),
        loadProfissionais(),
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados das consultas');
    } finally {
      setLoading(false);
    }
  };

  const loadConsultas = async () => {
    try {
      let query = supabase
        .from('agendamentos')
        .select(`
          *,
          paciente:pacientes(nome, telefone, email, data_nascimento),
          profissional:profissionais(nome, especialidade, crm_cro),
          servico:servicos(nome, valor, duracao_minutos)
        `)
        .eq('data', filtros.data)
        .order('hora', { ascending: true });

      // Aplicar filtros
      if (filtros.status) {
        query = query.eq('status', filtros.status);
      }
      if (filtros.profissional) {
        query = query.eq('profissional_id', filtros.profissional);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao carregar consultas:', error);
        toast.error('Erro ao carregar consultas');
        return;
      }

      // Filtrar por busca se necessário
      let consultasFiltradas = data || [];
      if (filtros.busca) {
        const busca = filtros.busca.toLowerCase();
        consultasFiltradas = consultasFiltradas.filter(consulta =>
          consulta.paciente?.nome.toLowerCase().includes(busca) ||
          consulta.profissional?.nome.toLowerCase().includes(busca) ||
          consulta.servico?.nome.toLowerCase().includes(busca) ||
          consulta.observacoes?.toLowerCase().includes(busca)
        );
      }

      setConsultas(consultasFiltradas);
    } catch (error) {
      console.error('Erro ao carregar consultas:', error);
      toast.error('Erro ao carregar consultas');
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

  const handleCheckIn = async (consultaId: string) => {
    try {
      const agora = new Date().toISOString();
      
      const { error } = await supabase
        .from('agendamentos')
        .update({ 
          status: 'em_andamento',
          check_in: agora
        })
        .eq('id', consultaId);

      if (error) {
        console.error('Erro ao fazer check-in:', error);
        toast.error('Erro ao fazer check-in');
        return;
      }

      // Iniciar cronômetro
      setCronometros(prev => {
        const novosCronometros = new Map(prev);
        novosCronometros.set(consultaId, {
          consultaId,
          tempoInicio: new Date(),
          tempoDecorrido: 0,
          isRunning: true,
        });
        return novosCronometros;
      });

      toast.success('Check-in realizado com sucesso');
      loadConsultas();
    } catch (error) {
      console.error('Erro ao fazer check-in:', error);
      toast.error('Erro ao fazer check-in');
    }
  };

  const handleCheckOut = async (consultaId: string) => {
    try {
      const agora = new Date().toISOString();
      
      const { error } = await supabase
        .from('agendamentos')
        .update({ 
          status: 'concluida',
          check_out: agora
        })
        .eq('id', consultaId);

      if (error) {
        console.error('Erro ao fazer check-out:', error);
        toast.error('Erro ao fazer check-out');
        return;
      }

      // Parar cronômetro
      setCronometros(prev => {
        const novosCronometros = new Map(prev);
        novosCronometros.delete(consultaId);
        return novosCronometros;
      });

      toast.success('Check-out realizado com sucesso');
      loadConsultas();
    } catch (error) {
      console.error('Erro ao fazer check-out:', error);
      toast.error('Erro ao fazer check-out');
    }
  };

  const handleStatusChange = async (consultaId: string, novoStatus: string) => {
    try {
      const { error } = await supabase
        .from('agendamentos')
        .update({ status: novoStatus })
        .eq('id', consultaId);

      if (error) {
        console.error('Erro ao atualizar status:', error);
        toast.error('Erro ao atualizar status da consulta');
        return;
      }

      toast.success('Status atualizado com sucesso');
      loadConsultas();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status da consulta');
    }
  };

  const formatarTempo = (segundos: number) => {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = segundos % 60;
    
    if (horas > 0) {
      return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
    }
    return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'agendada':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'em_andamento':
        return <Play className="h-5 w-5 text-green-500" />;
      case 'concluida':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelada':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'faltou':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendada':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'em_andamento':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'concluida':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelada':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'faltou':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      agendada: 'Agendada',
      em_andamento: 'Em Andamento',
      concluida: 'Concluída',
      cancelada: 'Cancelada',
      faltou: 'Faltou',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const calcularIdade = (dataNascimento: string) => {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesAtual = hoje.getMonth();
    const mesNascimento = nascimento.getMonth();
    
    if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    
    return idade;
  };

  const consultasFiltradas = consultas.filter(consulta => {
    const matchesStatus = !filtros.status || consulta.status === filtros.status;
    const matchesProfissional = !filtros.profissional || consulta.profissional_id === filtros.profissional;
    const matchesBusca = !filtros.busca || 
      consulta.paciente?.nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      consulta.profissional?.nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      consulta.servico?.nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      consulta.observacoes?.toLowerCase().includes(filtros.busca.toLowerCase());

    return matchesStatus && matchesProfissional && matchesBusca;
  });

  // Estatísticas
  const totalConsultas = consultas.length;
  const consultasAgendadas = consultas.filter(c => c.status === 'agendada').length;
  const consultasEmAndamento = consultas.filter(c => c.status === 'em_andamento').length;
  const consultasConcluidas = consultas.filter(c => c.status === 'concluida').length;
  const consultasFaltaram = consultas.filter(c => c.status === 'faltou').length;

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
        <title>Check-in/Check-out - Sistema de Gestão de Clínica</title>
        <meta name="description" content="Gerencie o check-in e check-out das consultas" />
      </Helmet>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <CheckIn className="h-8 w-8 text-blue-600" />
                Check-in/Check-out
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Gerencie o controle de presença e tempo das consultas
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
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Total de Consultas
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalConsultas}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Agendadas
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {consultasAgendadas}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Play className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Em Andamento
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {consultasEmAndamento}
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
                    Concluídas
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {consultasConcluidas}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Faltaram
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {consultasFaltaram}
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
                <input
                  type="date"
                  value={filtros.data}
                  onChange={(e) => setFiltros({ ...filtros, data: e.target.value })}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                />
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
                  <option value="agendada">Agendada</option>
                  <option value="em_andamento">Em Andamento</option>
                  <option value="concluida">Concluída</option>
                  <option value="cancelada">Cancelada</option>
                  <option value="faltou">Faltou</option>
                </select>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar consultas..."
                    value={filtros.busca}
                    onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm min-w-[200px]"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Consultas */}
        <div className="space-y-4">
          {consultasFiltradas.map((consulta) => {
            const cronometro = cronometros.get(consulta.id);
            const tempoDecorrido = cronometro ? cronometro.tempoDecorrido : 0;
            
            return (
              <Card key={consulta.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(consulta.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(consulta.status)}`}>
                            {getStatusLabel(consulta.status)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {formatTime(consulta.hora)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Timer className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {consulta.duracao_minutos} min
                          </span>
                        </div>
                        {cronometro && (
                          <div className="flex items-center space-x-2">
                            <Activity className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium text-green-600">
                              {formatarTempo(tempoDecorrido)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Paciente
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {consulta.paciente?.nome || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {consulta.paciente?.data_nascimento ? 
                              `${calcularIdade(consulta.paciente.data_nascimento)} anos` : 'N/A'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatPhone(consulta.paciente?.telefone || '')}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Profissional
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {consulta.profissional?.nome || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {consulta.profissional?.especialidade || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Serviço
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {consulta.servico?.nome || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            R$ {consulta.servico?.valor?.toFixed(2) || '0,00'}
                          </p>
                        </div>
                      </div>

                      {consulta.observacoes && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                            Observações
                          </p>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {consulta.observacoes}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Check-in</p>
                          <p className="text-gray-900 dark:text-white">
                            {consulta.check_in ? formatTime(consulta.check_in.split('T')[1]) : 'Não realizado'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Check-out</p>
                          <p className="text-gray-900 dark:text-white">
                            {consulta.check_out ? formatTime(consulta.check_out.split('T')[1]) : 'Não realizado'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {consulta.status === 'agendada' && (
                        <button
                          onClick={() => handleCheckIn(consulta.id)}
                          className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          <CheckIn className="mr-2" size={16} />
                          Check-in
                        </button>
                      )}
                      
                      {consulta.status === 'em_andamento' && (
                        <button
                          onClick={() => handleCheckOut(consulta.id)}
                          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          <CheckOut className="mr-2" size={16} />
                          Check-out
                        </button>
                      )}

                      {consulta.status === 'agendada' && (
                        <button
                          onClick={() => handleStatusChange(consulta.id, 'faltou')}
                          className="flex items-center px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                        >
                          <AlertCircle className="mr-2" size={16} />
                          Faltou
                        </button>
                      )}

                      <button
                        onClick={() => setConsultaSelecionada(consulta)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Ver detalhes"
                      >
                        <User size={16} />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Mensagem quando não há consultas */}
        {consultasFiltradas.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nenhuma consulta encontrada
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Não há consultas para os filtros selecionados.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CheckInCheckOut;
