import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Calendar,
  Plus,
  User,
  Clock,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  UserCheck,
  Repeat,
  FileText,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import {
  ModalAgendamento,
  ModalAgendamentoRecorrente,
} from '@/components/Modals';

import { usePermissions } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { printReport, ReportData } from '@/lib/reportTemplate';

import {
  notificarAgendamentoCancelado,
  verificarAgendamentosProximos,
} from '@/lib/notificationUtils';

interface Agendamento {
  id: number;
  data: string;
  hora: string;
  status: string;
  observacoes?: string;
  paciente_id: number;
  profissional_id: number;
  servico_id: number;
  pacientes?: { nome: string; telefone: string };
  profissionais?: { nome: string; especialidade: string };
  servicos?: { nome: string; duracao_min: number; preco: number };
  pagamentos?: { status: string; valor: number; forma_pagamento: string }[];
}

interface Filtros {
  data_inicio: string;
  data_fim: string;
  status: string;
  profissional_id: string;
  servico_id: string;
  busca: string;
}

const Agenda: React.FC = () => {
  const { canAccess } = usePermissions();
  const { isDark } = useThemeStore();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);

  // Função para gerar classes dos cards baseadas no tema
  const getCardClasses = () => {
    return isDark
      ? 'bg-gray-800 border border-gray-700'
      : 'bg-white border border-gray-200';
  };
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRecorrenteModal, setShowRecorrenteModal] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] =
    useState<Agendamento | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [filtros, setFiltros] = useState<Filtros>({
    data_inicio: '',
    data_fim: '',
    status: '',
    profissional_id: '',
    servico_id: '',
    busca: '',
  });
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [profissionais, setProfissionais] = useState<any[]>([]);
  const [servicos, setServicos] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    paciente_id: '',
    profissional_id: '',
    servico_id: '',
    data: '',
    hora: '',
    observacoes: '',
    status: 'agendado',
  });

  useEffect(() => {
    loadData();
    // Verificar agendamentos próximos após carregar os dados
    setTimeout(() => {
      verificarAgendamentosProximos();
    }, 1000);

    // Detectar se é mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Carregando dados da agenda...');
      console.log('🔍 Verificando configuração do Supabase...');
      console.log('📊 Supabase instance:', supabase);
      console.log('📊 Tipo do supabase:', typeof supabase);

      // Carregar agendamentos (versão simplificada para debug)
      console.log('🔄 Testando conexão com banco local...');
      const { data: agendamentosData, error: agendamentosError } =
        await supabase.from('agendamentos').select('*');

      console.log('📅 Dados de agendamentos:', {
        agendamentosData,
        agendamentosError,
        count: agendamentosData?.length || 0,
      });
      if (agendamentosError) throw agendamentosError;

      // Carregar pacientes
      console.log('🔄 Carregando pacientes...');
      const { data: pacientesData, error: pacientesError } = await supabase
        .from('pacientes')
        .select('*')
        .order('nome');

      console.log('👥 Dados de pacientes:', {
        pacientesData,
        pacientesError,
        count: pacientesData?.length || 0,
      });
      if (pacientesError) throw pacientesError;

      // Carregar profissionais
      console.log('🔄 Carregando profissionais...');
      const { data: profissionaisData, error: profissionaisError } =
        await supabase.from('profissionais').select('*').order('nome');

      console.log('👨‍⚕️ Dados de profissionais:', {
        profissionaisData,
        profissionaisError,
        count: profissionaisData?.length || 0,
      });
      if (profissionaisError) throw profissionaisError;

      // Carregar serviços
      console.log('🔄 Carregando serviços...');
      const { data: servicosData, error: servicosError } = await supabase
        .from('servicos')
        .select('*')
        .order('nome');

      console.log('🛠️ Dados de serviços:', {
        servicosData,
        servicosError,
        count: servicosData?.length || 0,
      });
      if (servicosError) throw servicosError;

      // Atualizar estados
      setAgendamentos(agendamentosData || []);
      setPacientes(pacientesData || []);
      setProfissionais(profissionaisData || []);
      setServicos(servicosData || []);
    } catch (error: any) {
      console.error('❌ Erro ao carregar dados:', error);
      console.error('❌ Stack trace:', error.stack);
      toast.error('Erro ao carregar dados da agenda');
    } finally {
      setLoading(false);
    }
  };

  const validateAgendamento = async (formData: any) => {
    // Verificar conflitos de horário
    const { data: conflitos, error } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('profissional_id', formData.profissional_id)
      .eq('data', formData.data)
      .eq('hora', formData.hora)
      .neq('status', 'cancelado')
      .neq('id', formData.id || 0); // Excluir o próprio agendamento se estiver editando

    if (error) throw error;

    if (conflitos && conflitos.length > 0) {
      throw new Error(
        'Já existe um agendamento para este profissional no mesmo horário'
      );
    }

    // Verificar se a data não é no passado
    const dataAgendamento = new Date(`${formData.data}T${formData.hora}`);
    const agora = new Date();
    if (dataAgendamento < agora) {
      throw new Error('Não é possível agendar para data/hora no passado');
    }

    // Verificar se o profissional está ativo
    const { data: profissional, error: profError } = await supabase
      .from('profissionais')
      .select('status, nome')
      .eq('id', formData.profissional_id)
      .single();

    if (profError) throw profError;

    if (profissional.status !== 'ativo') {
      throw new Error(
        `Profissional ${profissional.nome} não está disponível para agendamentos`
      );
    }

    return true;
  };

  // Função removida - não é mais usada

  const resetForm = () => {
    setFormData({
      paciente_id: '',
      profissional_id: '',
      servico_id: '',
      data: '',
      hora: '',
      observacoes: '',
      status: 'agendado',
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      agendado: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        icon: <Clock size={14} />,
      },
      confirmado: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: <CheckCircle size={14} />,
      },
      cancelado: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: <XCircle size={14} />,
      },
      realizado: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        icon: <CheckCircle size={14} />,
      },
      ausente: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        icon: <AlertCircle size={14} />,
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.agendado;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.icon}
        <span className='ml-1'>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </span>
    );
  };

  // Funções para edição e cancelamento
  const handleEditAgendamento = (agendamento: Agendamento) => {
    setSelectedAgendamento(agendamento);
    setFormData({
      paciente_id: agendamento.paciente_id.toString(),
      profissional_id: agendamento.profissional_id.toString(),
      servico_id: agendamento.servico_id.toString(),
      data: agendamento.data,
      hora: agendamento.hora,
      observacoes: agendamento.observacoes || '',
      status: agendamento.status,
    });
    setShowEditModal(true);
  };

  const handleDeleteAgendamento = (agendamento: Agendamento) => {
    setSelectedAgendamento(agendamento);
    setShowDeleteModal(true);
  };

  const confirmDeleteAgendamento = async () => {
    if (!selectedAgendamento) return;

    // Verificar permissões para excluir agendamento
    if (!canAccess(['admin', 'gerente', 'recepcao', 'desenvolvedor'])) {
      toast.error('Você não tem permissão para excluir agendamentos');
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from('agendamentos')
        .delete()
        .eq('id', selectedAgendamento.id);

      if (error) throw error;

      toast.success('Agendamento excluído com sucesso!');

      // Recarregar dados
      loadData();

      // Fechar modal
      setShowDeleteModal(false);
      setSelectedAgendamento(null);
    } catch (error: any) {
      console.error('Erro ao excluir agendamento:', error);
      toast.error(error.message || 'Erro ao excluir agendamento');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAgendamento = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAgendamento) return;

    // Verificar permissões para editar agendamento
    if (!canAccess(['admin', 'gerente', 'recepcao', 'desenvolvedor'])) {
      toast.error('Você não tem permissão para editar agendamentos');
      return;
    }

    try {
      // Validar agendamento antes de atualizar (exceto se for o mesmo agendamento)
      const formDataToValidate = {
        ...formData,
        id: selectedAgendamento.id,
      };

      // Só validar conflitos se mudou profissional, data ou hora
      if (
        formData.profissional_id !==
          selectedAgendamento.profissional_id.toString() ||
        formData.data !== selectedAgendamento.data ||
        formData.hora !== selectedAgendamento.hora
      ) {
        await validateAgendamento(formDataToValidate);
      }

      const { error } = await supabase
        .from('agendamentos')
        .update({
          paciente_id: formData.paciente_id,
          profissional_id: formData.profissional_id,
          servico_id: formData.servico_id,
          data: formData.data,
          hora: formData.hora,
          observacoes: formData.observacoes,
          status: formData.status,
        })
        .eq('id', selectedAgendamento.id);

      if (error) throw error;

      toast.success('Agendamento atualizado com sucesso!');
      setShowEditModal(false);
      setSelectedAgendamento(null);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Erro ao atualizar agendamento:', error);
      toast.error(error.message || 'Erro ao atualizar agendamento');
    }
  };

  const handleConfirmCancel = async () => {
    if (!selectedAgendamento) return;

    // Verificar permissões para cancelar agendamento
    if (!canAccess(['admin', 'gerente', 'recepcao', 'desenvolvedor'])) {
      toast.error('Você não tem permissão para cancelar agendamentos');
      return;
    }

    try {
      const { error } = await supabase
        .from('agendamentos')
        .update({
          status: 'cancelado',
          motivo_cancelamento: 'Cancelado pelo usuário',
          data_cancelamento: new Date().toISOString(),
        })
        .eq('id', selectedAgendamento.id);

      if (error) throw error;

      toast.success('Agendamento cancelado com sucesso!');

      // Notificar sobre o cancelamento
      await notificarAgendamentoCancelado(selectedAgendamento);

      setShowCancelModal(false);
      setSelectedAgendamento(null);
      loadData();
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      toast.error('Erro ao cancelar agendamento');
    }
  };

  const filteredAgendamentos = agendamentos.filter(agendamento => {
    // Filtro por data início
    if (filtros.data_inicio && agendamento.data < filtros.data_inicio)
      return false;

    // Filtro por data fim
    if (filtros.data_fim && agendamento.data > filtros.data_fim) return false;

    // Filtro por status
    if (filtros.status && agendamento.status !== filtros.status) return false;

    // Filtro por profissional
    if (
      filtros.profissional_id &&
      agendamento.profissional_id.toString() !== filtros.profissional_id
    )
      return false;

    // Filtro por serviço
    if (
      filtros.servico_id &&
      agendamento.servico_id.toString() !== filtros.servico_id
    )
      return false;

    // Filtro por busca (nome do paciente, profissional ou serviço)
    if (filtros.busca) {
      const buscaLower = filtros.busca.toLowerCase();
      const pacienteNome = agendamento.pacientes?.nome?.toLowerCase() || '';
      const profissionalNome =
        agendamento.profissionais?.nome?.toLowerCase() || '';
      const servicoNome = agendamento.servicos?.nome?.toLowerCase() || '';
      const observacoes = agendamento.observacoes?.toLowerCase() || '';

      if (
        !pacienteNome.includes(buscaLower) &&
        !profissionalNome.includes(buscaLower) &&
        !servicoNome.includes(buscaLower) &&
        !observacoes.includes(buscaLower)
      ) {
        return false;
      }
    }

    return true;
  });

  // Função para imprimir lista de agendamentos
  const imprimirAgendamentos = () => {
    if (filteredAgendamentos.length === 0) {
      toast.error('Nenhum agendamento encontrado para imprimir');
      return;
    }

    try {
      const agendados = filteredAgendamentos.filter(
        a => a.status === 'agendado'
      ).length;
      const confirmados = filteredAgendamentos.filter(
        a => a.status === 'confirmado'
      ).length;
      const realizados = filteredAgendamentos.filter(
        a => a.status === 'realizado'
      ).length;
      const cancelados = filteredAgendamentos.filter(
        a => a.status === 'cancelado'
      ).length;

      const reportData: ReportData = {
        title: 'Relatório de Agendamentos',
        data: filteredAgendamentos,
        columns: [
          {
            key: 'data',
            label: 'Data',
            format: (value: any) => new Date(value).toLocaleDateString('pt-BR'),
          },
          { key: 'hora', label: 'Hora' },
          {
            key: 'pacientes',
            label: 'Paciente',
            format: (value: any) => value?.nome || 'N/A',
          },
          {
            key: 'profissionais',
            label: 'Profissional',
            format: (value: any) => value?.nome || 'N/A',
          },
          {
            key: 'servicos',
            label: 'Serviço',
            format: (value: any) => value?.nome || 'N/A',
          },
          {
            key: 'status',
            label: 'Status',
            format: (value: any) =>
              value.charAt(0).toUpperCase() + value.slice(1),
          },
          {
            key: 'servicos',
            label: 'Valor',
            format: (value: any) =>
              value?.valor
                ? `R$ ${value.valor.toFixed(2).replace('.', ',')}`
                : 'N/A',
          },
        ],
        summary: [
          { label: 'Agendados', value: agendados },
          { label: 'Confirmados', value: confirmados },
          { label: 'Realizados', value: realizados },
          { label: 'Cancelados', value: cancelados },
        ],
        filters: {
          'Data Início': filtros.data_inicio,
          'Data Fim': filtros.data_fim,
          Status: filtros.status,
          Profissional: filtros.profissional_id
            ? profissionais.find(
                p => p.id.toString() === filtros.profissional_id
              )?.nome
            : '',
          Serviço: filtros.servico_id
            ? servicos.find(s => s.id.toString() === filtros.servico_id)?.nome
            : '',
          Busca: filtros.busca,
        },
      };

      printReport(reportData);
      toast.success('Relatório de impressão gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao imprimir relatório:', error);
      toast.error('Erro ao gerar relatório de impressão');
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Agenda - Sistema Clínica</title>
      </Helmet>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-8'>
          <div className='mb-6'>
            <h1 className='text-3xl font-bold text-gray-900 dark:text-white flex items-center'>
              <Calendar
                className='mr-3 !text-blue-600'
                size={32}
                style={{ color: '#2563eb !important' }}
              />
              Agenda de Consultas
            </h1>
            <p className='text-gray-600 dark:text-gray-300 mt-2'>
              Gerencie agendamentos, consultas e horários disponíveis
            </p>
          </div>
          <div
            className={`flex flex-col ${isMobile ? 'gap-3' : 'sm:flex-row justify-between items-start sm:items-center gap-4'}`}
          >
            <div
              className={`flex flex-wrap gap-2 ${isMobile ? 'justify-center' : 'gap-3'}`}
            >
              {/* Botão de Impressão */}
              <button
                className={`btn btn-outline-info btn-sm d-flex align-items-center gap-2 ${isMobile ? 'w-full justify-center' : ''}`}
                onClick={imprimirAgendamentos}
                title='Imprimir lista de agendamentos'
              >
                <FileText size={16} />
                Imprimir
              </button>

              {canAccess(['admin', 'gerente', 'recepcao', 'desenvolvedor']) && (
                <>
                  {/* Botão Agendamento Recorrente */}
                  <button
                    className='inline-flex items-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors'
                    onClick={() => setShowRecorrenteModal(true)}
                  >
                    <Repeat size={16} className='mr-2' />
                    Recorrente
                  </button>

                  {/* Botão Novo Agendamento */}
                  <button
                    className='inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors'
                    onClick={() => setShowModal(true)}
                  >
                    <Plus size={16} className='mr-2' />
                    Novo Agendamento
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Busca Rápida */}
        <div className='mb-6'>
          <div className={`rounded-lg shadow-sm p-6 ${getCardClasses()}`}>
            <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-4'>
              Busca Rápida
            </h3>
            <div className='relative'>
              <input
                type='text'
                placeholder='Buscar por paciente, profissional, serviço ou observações...'
                className='w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                value={filtros.busca}
                onChange={e =>
                  setFiltros({ ...filtros, busca: e.target.value })
                }
              />
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <svg
                  className='h-5 w-5 text-gray-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className='mb-6'>
          <div className={`rounded-lg shadow-sm p-6 ${getCardClasses()}`}>
            <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-4'>
              Filtros Avançados
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Data Início
                </label>
                <input
                  type='date'
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  value={filtros.data_inicio}
                  onChange={e =>
                    setFiltros({ ...filtros, data_inicio: e.target.value })
                  }
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Data Fim
                </label>
                <input
                  type='date'
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  value={filtros.data_fim}
                  onChange={e =>
                    setFiltros({ ...filtros, data_fim: e.target.value })
                  }
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Status
                </label>
                <select
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  value={filtros.status}
                  onChange={e =>
                    setFiltros({ ...filtros, status: e.target.value })
                  }
                >
                  <option value=''>Todos</option>
                  <option value='agendado'>Agendado</option>
                  <option value='confirmado'>Confirmado</option>
                  <option value='realizado'>Realizado</option>
                  <option value='cancelado'>Cancelado</option>
                  <option value='ausente'>Ausente</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Profissional
                </label>
                <select
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  value={filtros.profissional_id}
                  onChange={e =>
                    setFiltros({ ...filtros, profissional_id: e.target.value })
                  }
                >
                  <option value=''>Todos</option>
                  {profissionais.map(prof => (
                    <option key={prof.id} value={prof.id}>
                      {prof.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Serviço
                </label>
                <select
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  value={filtros.servico_id}
                  onChange={e =>
                    setFiltros({ ...filtros, servico_id: e.target.value })
                  }
                >
                  <option value=''>Todos</option>
                  {servicos.map(serv => (
                    <option key={serv.id} value={serv.id}>
                      {serv.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className='flex items-end'>
                <button
                  className='w-full px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors'
                  onClick={() =>
                    setFiltros({
                      data_inicio: '',
                      data_fim: '',
                      status: '',
                      profissional_id: '',
                      servico_id: '',
                      busca: '',
                    })
                  }
                >
                  <RefreshCw size={16} className='mr-2 inline' />
                  Limpar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Visualização de Agendamentos */}
        <div className={`rounded-lg shadow-sm ${getCardClasses()}`}>
          <div className='px-6 py-4 border-b border-gray-200'>
            <div className='flex justify-between items-center'>
              <h3 className='text-lg font-medium text-gray-900'>
                <Calendar
                  size={18}
                  className='inline mr-2 text-blue-600 dark:text-blue-200'
                />
                Lista de Agendamentos
              </h3>
              <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                {filteredAgendamentos.length} agendamentos
              </span>
            </div>
          </div>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Paciente
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Profissional
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Serviço
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Status
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Data
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Hora
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {filteredAgendamentos.map(agendamento => (
                  <tr key={agendamento.id} className='hover:bg-gray-50'>
                    {/* Paciente */}
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        <div className='flex-shrink-0 h-10 w-10'>
                          <div className='h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center'>
                            <User
                              size={16}
                              className='text-blue-600 dark:text-blue-200'
                            />
                          </div>
                        </div>
                        <div className='ml-4'>
                          <div className='text-sm font-medium text-gray-900'>
                            {agendamento.pacientes?.nome}
                          </div>
                          <div className='text-sm text-gray-500'>
                            {agendamento.pacientes?.telefone}
                          </div>
                        </div>
                      </div>
                    </td>
                    {/* Profissional */}
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        <div className='flex-shrink-0 h-10 w-10'>
                          <div className='h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center'>
                            <UserCheck size={16} className='text-indigo-600' />
                          </div>
                        </div>
                        <div className='ml-4'>
                          <div className='text-sm font-medium text-gray-900'>
                            {agendamento.profissionais?.nome}
                          </div>
                          <div className='text-sm text-gray-500'>
                            {agendamento.profissionais?.especialidade}
                          </div>
                        </div>
                      </div>
                    </td>
                    {/* Serviço */}
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm text-gray-900'>
                        {agendamento.servicos?.nome}
                      </div>
                      <div className='text-sm text-gray-500'>
                        R$ {agendamento.servicos?.preco?.toFixed(2)}
                      </div>
                    </td>
                    {/* Status */}
                    <td className='px-6 py-4 whitespace-nowrap'>
                      {getStatusBadge(agendamento.status)}
                    </td>
                    {/* Data */}
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm font-medium text-gray-900'>
                        {new Date(agendamento.data).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    {/* Hora */}
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='flex items-center'>
                        <Clock
                          size={16}
                          className='text-blue-600 dark:text-blue-200 mr-2'
                        />
                        <span className='text-sm font-medium text-gray-900'>
                          {agendamento.hora}
                        </span>
                      </div>
                    </td>
                    {/* Ações */}
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                      <div className='flex space-x-2'>
                        {canAccess([
                          'admin',
                          'gerente',
                          'recepcao',
                          'desenvolvedor',
                        ]) && (
                          <button
                            className='text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50'
                            title='Editar'
                            onClick={() => handleEditAgendamento(agendamento)}
                          >
                            <Edit size={16} />
                          </button>
                        )}
                        {canAccess([
                          'admin',
                          'gerente',
                          'recepcao',
                          'desenvolvedor',
                        ]) && (
                          <button
                            className='text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50'
                            title='Excluir'
                            onClick={() => handleDeleteAgendamento(agendamento)}
                          >
                            <XCircle size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Novo Agendamento */}
      <ModalAgendamento
        open={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          loadData();
          toast.success('Agendamento criado com sucesso!');
        }}
      />

      {/* Modal Excluir Agendamento */}
      {showDeleteModal && selectedAgendamento && (
        <div className='fixed inset-0 z-50 overflow-y-auto'>
          <div className='flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0'>
            <div
              className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity'
              onClick={() => setShowDeleteModal(false)}
            ></div>
            <div
              className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${getCardClasses()}`}
            >
              <div className='bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4'>
                <div className='sm:flex sm:items-start'>
                  <div className='mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10'>
                    <XCircle
                      size={20}
                      className='text-red-600 dark:text-red-200'
                    />
                  </div>
                  <div className='mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left'>
                    <h3 className='text-lg leading-6 font-medium text-gray-900'>
                      Excluir Agendamento
                    </h3>
                    <div className='mt-2'>
                      <p className='text-sm text-gray-500'>
                        Tem certeza que deseja excluir este agendamento? Esta
                        ação não pode ser desfeita.
                      </p>
                      <div className='mt-4 p-4 bg-gray-50 rounded-lg'>
                        <div className='text-sm text-gray-700'>
                          <p>
                            <strong>Paciente:</strong>{' '}
                            {selectedAgendamento.pacientes?.nome}
                          </p>
                          <p>
                            <strong>Profissional:</strong>{' '}
                            {selectedAgendamento.profissionais?.nome}
                          </p>
                          <p>
                            <strong>Data:</strong>{' '}
                            {new Date(
                              selectedAgendamento.data
                            ).toLocaleDateString('pt-BR')}
                          </p>
                          <p>
                            <strong>Hora:</strong> {selectedAgendamento.hora}
                          </p>
                          <p>
                            <strong>Serviço:</strong>{' '}
                            {selectedAgendamento.servicos?.nome}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse'>
                <button
                  type='button'
                  className='w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm'
                  onClick={confirmDeleteAgendamento}
                  disabled={loading}
                >
                  {loading ? 'Excluindo...' : 'Excluir'}
                </button>
                <button
                  type='button'
                  className='mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm'
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Agendamento Recorrente */}
      {showRecorrenteModal && (
        <ModalAgendamentoRecorrente
          isOpen={showRecorrenteModal}
          onClose={() => setShowRecorrenteModal(false)}
          onSuccess={() => {
            setShowRecorrenteModal(false);
            loadData();
          }}
        />
      )}

      {/* Modal Editar Agendamento */}
      {showEditModal && selectedAgendamento && (
        <div className='fixed inset-0 z-50 overflow-y-auto'>
          <div className='flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0'>
            <div
              className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity'
              onClick={() => setShowEditModal(false)}
            ></div>
            <div
              className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${getCardClasses()}`}
            >
              <div className='bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4'>
                <div className='sm:flex sm:items-start'>
                  <div className='mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10'>
                    <Edit
                      size={20}
                      className='text-blue-600 dark:text-blue-200'
                    />
                  </div>
                  <div className='mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full'>
                    <h3 className='text-lg leading-6 font-medium text-gray-900 mb-4'>
                      Editar Agendamento
                    </h3>
                    <form
                      onSubmit={handleUpdateAgendamento}
                      className='space-y-4'
                    >
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Paciente
                          </label>
                          <select
                            name='paciente_id'
                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            value={formData.paciente_id}
                            onChange={handleInputChange}
                            required
                          >
                            <option value=''>Selecione um paciente</option>
                            {pacientes.map(paciente => (
                              <option key={paciente.id} value={paciente.id}>
                                {paciente.nome} - {paciente.cpf}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Profissional
                          </label>
                          <select
                            name='profissional_id'
                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            value={formData.profissional_id}
                            onChange={handleInputChange}
                            required
                          >
                            <option value=''>Selecione um profissional</option>
                            {profissionais.map(prof => (
                              <option key={prof.id} value={prof.id}>
                                {prof.nome} - {prof.especialidade}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Serviço
                          </label>
                          <select
                            name='servico_id'
                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            value={formData.servico_id}
                            onChange={handleInputChange}
                            required
                          >
                            <option value=''>Selecione um serviço</option>
                            {servicos.map(serv => (
                              <option key={serv.id} value={serv.id}>
                                {serv.nome} - R$ {serv.valor?.toFixed(2)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Data
                          </label>
                          <input
                            type='date'
                            name='data'
                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            value={formData.data}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Hora
                          </label>
                          <input
                            type='time'
                            name='hora'
                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            value={formData.hora}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Status
                          </label>
                          <select
                            name='status'
                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            value={formData.status}
                            onChange={handleInputChange}
                          >
                            <option value='agendado'>Agendado</option>
                            <option value='confirmado'>Confirmado</option>
                            <option value='realizado'>Realizado</option>
                            <option value='cancelado'>Cancelado</option>
                            <option value='ausente'>Ausente</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Observações
                        </label>
                        <textarea
                          name='observacoes'
                          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                          rows={3}
                          value={formData.observacoes}
                          onChange={handleInputChange}
                          placeholder='Digite observações sobre o agendamento...'
                        />
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className='bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse'>
                <button
                  type='submit'
                  className='w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm'
                  onClick={handleUpdateAgendamento}
                >
                  Atualizar Agendamento
                </button>
                <button
                  type='button'
                  className='mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm'
                  onClick={() => setShowEditModal(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cancelar Agendamento */}
      {showCancelModal && selectedAgendamento && (
        <div className='fixed inset-0 z-50 overflow-y-auto'>
          <div className='flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0'>
            <div
              className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity'
              onClick={() => setShowCancelModal(false)}
            ></div>
            <div
              className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${getCardClasses()}`}
            >
              <div className='bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4'>
                <div className='sm:flex sm:items-start'>
                  <div className='mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10'>
                    <XCircle
                      size={20}
                      className='text-red-600 dark:text-red-200'
                    />
                  </div>
                  <div className='mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left'>
                    <h3 className='text-lg leading-6 font-medium text-gray-900'>
                      Cancelar Agendamento
                    </h3>
                    <div className='mt-2'>
                      <p className='text-sm text-gray-500'>
                        Tem certeza que deseja cancelar este agendamento?
                      </p>
                      <div className='mt-4 p-4 bg-gray-50 rounded-lg'>
                        <div className='text-sm'>
                          <p>
                            <strong>Paciente:</strong>{' '}
                            {selectedAgendamento.pacientes?.nome}
                          </p>
                          <p>
                            <strong>Data:</strong>{' '}
                            {new Date(
                              selectedAgendamento.data
                            ).toLocaleDateString('pt-BR')}
                          </p>
                          <p>
                            <strong>Hora:</strong> {selectedAgendamento.hora}
                          </p>
                          <p>
                            <strong>Profissional:</strong>{' '}
                            {selectedAgendamento.profissionais?.nome}
                          </p>
                          <p>
                            <strong>Serviço:</strong>{' '}
                            {selectedAgendamento.servicos?.nome}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse'>
                <button
                  type='button'
                  className='w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm'
                  onClick={handleConfirmCancel}
                >
                  Sim, Cancelar
                </button>
                <button
                  type='button'
                  className='mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm'
                  onClick={() => setShowCancelModal(false)}
                >
                  Não, Manter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Agenda;
