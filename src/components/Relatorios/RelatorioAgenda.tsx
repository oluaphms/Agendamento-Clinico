// ============================================================================
// COMPONENTE: Relatório de Agenda
// ============================================================================
// Este componente gera relatórios e estatísticas da agenda
// ============================================================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from 'recharts';
import {
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Download,
  FileText,
  BarChart3,
} from 'lucide-react';
import { exportRelatorioAgendamentos } from '@/lib/exportUtils';

interface Agendamento {
  id: number;
  data: string;
  hora: string;
  status: string;
  paciente_id: number;
  profissional_id: number;
  servico_id: number;
  pacientes?: { nome: string };
  profissionais?: { nome: string; especialidade: string };
  servicos?: { nome: string; preco: number };
  pagamentos?: { status: string; valor: number }[];
}

interface RelatorioAgendaProps {
  agendamentos: Agendamento[];
  filtros: any;
  onClose: () => void;
}

const RelatorioAgenda: React.FC<RelatorioAgendaProps> = ({
  agendamentos,
  filtros,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [estatisticas, setEstatisticas] = useState({
    total: 0,
    realizados: 0,
    cancelados: 0,
    pendentes: 0,
    receitaTotal: 0,
    receitaPaga: 0,
    receitaPendente: 0,
  });

  const [dadosGraficos, setDadosGraficos] = useState<{
    agendamentosPorDia: Array<{
      dia: string;
      agendamentos: number;
      receita: number;
    }>;
    agendamentosPorStatus: Array<{
      status: string;
      count: number;
      cor: string;
    }>;
    receitaPorDia: Array<{
      dia: string;
      agendamentos: number;
      receita: number;
    }>;
    agendamentosPorProfissional: Array<{ nome: string; count: number }>;
    agendamentosPorServico: Array<{ nome: string; count: number }>;
  }>({
    agendamentosPorDia: [],
    agendamentosPorStatus: [],
    receitaPorDia: [],
    agendamentosPorProfissional: [],
    agendamentosPorServico: [],
  });

  useEffect(() => {
    calcularEstatisticas();
    gerarDadosGraficos();
  }, [agendamentos]);

  const calcularEstatisticas = () => {
    const stats = {
      total: agendamentos.length,
      realizados: 0,
      cancelados: 0,
      pendentes: 0,
      receitaTotal: 0,
      receitaPaga: 0,
      receitaPendente: 0,
    };

    agendamentos.forEach(agendamento => {
      // Contar por status
      switch (agendamento.status) {
        case 'realizado':
          stats.realizados++;
          break;
        case 'cancelado':
          stats.cancelados++;
          break;
        default:
          stats.pendentes++;
      }

      // Calcular receita
      const valor = agendamento.servicos?.preco || 0;
      stats.receitaTotal += valor;

      if (agendamento.pagamentos?.[0]?.status === 'pago') {
        stats.receitaPaga += valor;
      } else {
        stats.receitaPendente += valor;
      }
    });

    setEstatisticas(stats);
  };

  const gerarDadosGraficos = () => {
    // Agendamentos por dia (últimos 7 dias)
    const ultimos7Dias = [];
    for (let i = 6; i >= 0; i--) {
      const data = new Date();
      data.setDate(data.getDate() - i);
      const dataStr = data.toISOString().split('T')[0];

      const agendamentosDia = agendamentos.filter(ag => ag.data === dataStr);
      const receitaDia = agendamentosDia.reduce(
        (total, ag) => total + (ag.servicos?.preco || 0),
        0
      );

      ultimos7Dias.push({
        dia: data.toLocaleDateString('pt-BR', { weekday: 'short' }),
        agendamentos: agendamentosDia.length,
        receita: receitaDia,
      });
    }

    // Agendamentos por status
    const statusCount = agendamentos.reduce(
      (acc, ag) => {
        acc[ag.status] = (acc[ag.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const agendamentosPorStatus = Object.entries(statusCount).map(
      ([status, count]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        count,
        cor: getStatusColor(status),
      })
    );

    // Agendamentos por profissional
    const profissionalCount = agendamentos.reduce(
      (acc, ag) => {
        const nome = ag.profissionais?.nome || 'Não definido';
        acc[nome] = (acc[nome] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const agendamentosPorProfissional = Object.entries(profissionalCount)
      .map(([nome, count]) => ({ nome, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Agendamentos por serviço
    const servicoCount = agendamentos.reduce(
      (acc, ag) => {
        const nome = ag.servicos?.nome || 'Não definido';
        acc[nome] = (acc[nome] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const agendamentosPorServico = Object.entries(servicoCount)
      .map(([nome, count]) => ({ nome, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setDadosGraficos({
      agendamentosPorDia: ultimos7Dias,
      agendamentosPorStatus,
      receitaPorDia: ultimos7Dias,
      agendamentosPorProfissional,
      agendamentosPorServico,
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      agendado: '#3B82F6',
      confirmado: '#10B981',
      realizado: '#059669',
      cancelado: '#EF4444',
      pendente: '#F59E0B',
    };
    return colors[status as keyof typeof colors] || '#6B7280';
  };

  const handleExportar = async (tipo: 'pdf' | 'excel' | 'csv') => {
    setLoading(true);
    try {
      const resultado = await exportRelatorioAgendamentos(
        agendamentos,
        filtros,
        tipo
      );
      if (resultado.success) {
        // Toast de sucesso seria mostrado aqui
        console.log(resultado.message);
      }
    } catch (error) {
      console.error('Erro ao exportar:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className='bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden'
      >
        {/* Header */}
        <div className='bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6'>
          <div className='flex justify-between items-center'>
            <div>
              <h2 className='text-2xl font-bold flex items-center gap-2'>
                <BarChart3 size={24} />
                Relatório de Agenda
              </h2>
              <p className='text-blue-100 mt-1'>
                Estatísticas e análises dos agendamentos
              </p>
            </div>
            <button
              onClick={onClose}
              className='text-white hover:text-gray-200 transition-colors'
            >
              <XCircle size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className='p-6 overflow-y-auto max-h-[calc(90vh-120px)]'>
          {/* Estatísticas Principais */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
            <div className='bg-blue-50 rounded-lg p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-blue-600 text-sm font-medium'>Total</p>
                  <p className='text-2xl font-bold text-blue-900'>
                    {estatisticas.total}
                  </p>
                </div>
                <Calendar className='text-blue-600' size={24} />
              </div>
            </div>

            <div className='bg-green-50 rounded-lg p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-green-600 text-sm font-medium'>
                    Realizados
                  </p>
                  <p className='text-2xl font-bold text-green-900'>
                    {estatisticas.realizados}
                  </p>
                </div>
                <CheckCircle className='text-green-600' size={24} />
              </div>
            </div>

            <div className='bg-red-50 rounded-lg p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-red-600 text-sm font-medium'>Cancelados</p>
                  <p className='text-2xl font-bold text-red-900'>
                    {estatisticas.cancelados}
                  </p>
                </div>
                <XCircle className='text-red-600' size={24} />
              </div>
            </div>

            <div className='bg-yellow-50 rounded-lg p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-yellow-600 text-sm font-medium'>
                    Receita Total
                  </p>
                  <p className='text-2xl font-bold text-yellow-900'>
                    R$ {estatisticas.receitaTotal.toFixed(2)}
                  </p>
                </div>
                <DollarSign className='text-yellow-600' size={24} />
              </div>
            </div>
          </div>

          {/* Botões de Exportação */}
          <div className='flex gap-3 mb-8'>
            <button
              onClick={() => handleExportar('pdf')}
              disabled={loading}
              className='flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50'
            >
              <FileText size={16} />
              Exportar PDF
            </button>
            <button
              onClick={() => handleExportar('excel')}
              disabled={loading}
              className='flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50'
            >
              <Download size={16} />
              Exportar Excel
            </button>
            <button
              onClick={() => handleExportar('csv')}
              disabled={loading}
              className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50'
            >
              <Download size={16} />
              Exportar CSV
            </button>
          </div>

          {/* Gráficos */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Agendamentos por Dia */}
            <div className='bg-white border rounded-lg p-4'>
              <h3 className='text-lg font-semibold mb-4'>
                Agendamentos por Dia
              </h3>
              <ResponsiveContainer width='100%' height={300}>
                <AreaChart data={dadosGraficos.agendamentosPorDia}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='dia' />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type='monotone'
                    dataKey='agendamentos'
                    stroke='#3B82F6'
                    fill='#3B82F6'
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Agendamentos por Status */}
            <div className='bg-white border rounded-lg p-4'>
              <h3 className='text-lg font-semibold mb-4'>
                Distribuição por Status
              </h3>
              <ResponsiveContainer width='100%' height={300}>
                <PieChart>
                  <Pie
                    data={dadosGraficos.agendamentosPorStatus}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    label={({ status, percent }) =>
                      `${status} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill='#8884d8'
                    dataKey='count'
                  >
                    {dadosGraficos.agendamentosPorStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.cor} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Top Profissionais */}
            <div className='bg-white border rounded-lg p-4'>
              <h3 className='text-lg font-semibold mb-4'>Top Profissionais</h3>
              <ResponsiveContainer width='100%' height={300}>
                <BarChart data={dadosGraficos.agendamentosPorProfissional}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='nome' />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey='count' fill='#10B981' />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top Serviços */}
            <div className='bg-white border rounded-lg p-4'>
              <h3 className='text-lg font-semibold mb-4'>Top Serviços</h3>
              <ResponsiveContainer width='100%' height={300}>
                <BarChart data={dadosGraficos.agendamentosPorServico}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='nome' />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey='count' fill='#F59E0B' />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RelatorioAgenda;
