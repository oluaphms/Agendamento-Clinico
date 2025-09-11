// ============================================================================
// SISTEMA DE MÉTRICAS EM TEMPO REAL
// ============================================================================
// Sistema para coleta, processamento e exibição de métricas
// ============================================================================

import { supabase } from './supabase';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export interface MetricData {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  changePercent: number;
  timestamp: Date;
  category: 'patients' | 'appointments' | 'revenue' | 'performance' | 'system';
}

export interface DashboardMetrics {
  totalPatients: MetricData;
  activeAppointments: MetricData;
  monthlyRevenue: MetricData;
  systemUptime: MetricData;
  averageWaitTime: MetricData;
  patientSatisfaction: MetricData;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    tension?: number;
  }[];
}

export interface TimeSeriesData {
  date: string;
  value: number;
  label: string;
}

// ============================================================================
// CONFIGURAÇÕES DE MÉTRICAS
// ============================================================================

export const METRIC_CONFIG = {
  patients: {
    name: 'Total de Pacientes',
    unit: 'pacientes',
    icon: 'Users',
    color: 'blue',
  },
  appointments: {
    name: 'Consultas Ativas',
    unit: 'consultas',
    icon: 'Calendar',
    color: 'green',
  },
  revenue: {
    name: 'Receita Mensal',
    unit: 'R$',
    icon: 'DollarSign',
    color: 'purple',
  },
  uptime: {
    name: 'Tempo de Atividade',
    unit: '%',
    icon: 'Activity',
    color: 'orange',
  },
  waitTime: {
    name: 'Tempo Médio de Espera',
    unit: 'min',
    icon: 'Clock',
    color: 'red',
  },
  satisfaction: {
    name: 'Satisfação do Paciente',
    unit: '%',
    icon: 'Heart',
    color: 'pink',
  },
} as const;

// ============================================================================
// FUNÇÕES DE COLETA DE DADOS
// ============================================================================

/**
 * Coleta métricas de pacientes
 */
export async function fetchPatientMetrics(): Promise<MetricData> {
  try {
    const { data: patients, error } = await supabase
      .from('pacientes')
      .select('id, created_at')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (error) throw error;

    const totalPatients = patients?.length || 0;
    const previousMonth = await getPreviousMonthPatients();
    const change = totalPatients - previousMonth;
    const changePercent = previousMonth > 0 ? (change / previousMonth) * 100 : 0;

    return {
      id: 'total-patients',
      name: 'Total de Pacientes',
      value: totalPatients,
      unit: 'pacientes',
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      change,
      changePercent,
      timestamp: new Date(),
      category: 'patients',
    };
  } catch (error) {
    console.error('Erro ao buscar métricas de pacientes:', error);
    return createEmptyMetric('total-patients', 'Total de Pacientes', 'pacientes', 'patients');
  }
}

/**
 * Coleta métricas de consultas
 */
export async function fetchAppointmentMetrics(): Promise<MetricData> {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const { data: appointments, error } = await supabase
      .from('agendamentos')
      .select('id, status, data_agendamento')
      .gte('data_agendamento', startOfDay.toISOString())
      .lt('data_agendamento', endOfDay.toISOString())
      .in('status', ['agendado', 'confirmado', 'em_andamento']);

    if (error) throw error;

    const activeAppointments = appointments?.length || 0;
    const previousDay = await getPreviousDayAppointments();
    const change = activeAppointments - previousDay;
    const changePercent = previousDay > 0 ? (change / previousDay) * 100 : 0;

    return {
      id: 'active-appointments',
      name: 'Consultas Ativas',
      value: activeAppointments,
      unit: 'consultas',
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      change,
      changePercent,
      timestamp: new Date(),
      category: 'appointments',
    };
  } catch (error) {
    console.error('Erro ao buscar métricas de consultas:', error);
    return createEmptyMetric('active-appointments', 'Consultas Ativas', 'consultas', 'appointments');
  }
}

/**
 * Coleta métricas de receita
 */
export async function fetchRevenueMetrics(): Promise<MetricData> {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: payments, error } = await supabase
      .from('pagamentos')
      .select('valor, status, data_pagamento')
      .gte('data_pagamento', startOfMonth.toISOString())
      .eq('status', 'pago');

    if (error) throw error;

    const monthlyRevenue = payments?.reduce((sum: any, payment: any) => sum + payment.valor, 0) || 0;
    const previousMonth = await getPreviousMonthRevenue();
    const change = monthlyRevenue - previousMonth;
    const changePercent = previousMonth > 0 ? (change / previousMonth) * 100 : 0;

    return {
      id: 'monthly-revenue',
      name: 'Receita Mensal',
      value: monthlyRevenue,
      unit: 'R$',
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      change,
      changePercent,
      timestamp: new Date(),
      category: 'revenue',
    };
  } catch (error) {
    console.error('Erro ao buscar métricas de receita:', error);
    return createEmptyMetric('monthly-revenue', 'Receita Mensal', 'R$', 'revenue');
  }
}

/**
 * Coleta métricas de sistema
 */
export async function fetchSystemMetrics(): Promise<MetricData> {
  try {
    // Simular métricas de sistema (em produção, viria de um serviço de monitoramento)
    const uptime = 99.9;
    const previousUptime = 99.8;
    const change = uptime - previousUptime;
    const changePercent = (change / previousUptime) * 100;

    return {
      id: 'system-uptime',
      name: 'Tempo de Atividade',
      value: uptime,
      unit: '%',
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      change,
      changePercent,
      timestamp: new Date(),
      category: 'system',
    };
  } catch (error) {
    console.error('Erro ao buscar métricas de sistema:', error);
    return createEmptyMetric('system-uptime', 'Tempo de Atividade', '%', 'system');
  }
}

/**
 * Coleta métricas de tempo de espera
 */
export async function fetchWaitTimeMetrics(): Promise<MetricData> {
  try {
    const { data: appointments, error } = await supabase
      .from('agendamentos')
      .select('data_agendamento, data_inicio, status')
      .eq('status', 'concluido')
      .gte('data_agendamento', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (error) throw error;

    const waitTimes = appointments?.map((apt: any) => {
      const scheduled = new Date(apt.data_agendamento);
      const started = new Date(apt.data_inicio);
      return (started.getTime() - scheduled.getTime()) / (1000 * 60); // em minutos
    }) || [];

    const averageWaitTime = waitTimes.length > 0 
      ? waitTimes.reduce((sum: any, time: any) => sum + time, 0) / waitTimes.length 
      : 0;

    const previousWeek = await getPreviousWeekWaitTime();
    const change = averageWaitTime - previousWeek;
    const changePercent = previousWeek > 0 ? (change / previousWeek) * 100 : 0;

    return {
      id: 'average-wait-time',
      name: 'Tempo Médio de Espera',
      value: Math.round(averageWaitTime),
      unit: 'min',
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      change: Math.round(change),
      changePercent,
      timestamp: new Date(),
      category: 'performance',
    };
  } catch (error) {
    console.error('Erro ao buscar métricas de tempo de espera:', error);
    return createEmptyMetric('average-wait-time', 'Tempo Médio de Espera', 'min', 'performance');
  }
}

/**
 * Coleta métricas de satisfação
 */
export async function fetchSatisfactionMetrics(): Promise<MetricData> {
  try {
    const { data: feedback, error } = await supabase
      .from('feedback')
      .select('nota')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (error) throw error;

    const satisfaction = feedback?.length > 0 
      ? (feedback.reduce((sum: any, f: any) => sum + f.nota, 0) / feedback.length) * 20 // converter para porcentagem
      : 0;

    const previousMonth = await getPreviousMonthSatisfaction();
    const change = satisfaction - previousMonth;
    const changePercent = previousMonth > 0 ? (change / previousMonth) * 100 : 0;

    return {
      id: 'patient-satisfaction',
      name: 'Satisfação do Paciente',
      value: Math.round(satisfaction),
      unit: '%',
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      change: Math.round(change),
      changePercent,
      timestamp: new Date(),
      category: 'performance',
    };
  } catch (error) {
    console.error('Erro ao buscar métricas de satisfação:', error);
    return createEmptyMetric('patient-satisfaction', 'Satisfação do Paciente', '%', 'performance');
  }
}

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Cria uma métrica vazia para casos de erro
 */
function createEmptyMetric(id: string, name: string, unit: string, category: MetricData['category']): MetricData {
  return {
    id,
    name,
    value: 0,
    unit,
    trend: 'stable',
    change: 0,
    changePercent: 0,
    timestamp: new Date(),
    category,
  };
}

/**
 * Busca dados do mês anterior para comparação
 */
async function getPreviousMonthPatients(): Promise<number> {
  try {
    const startOfPreviousMonth = new Date();
    startOfPreviousMonth.setMonth(startOfPreviousMonth.getMonth() - 1);
    startOfPreviousMonth.setDate(1);
    startOfPreviousMonth.setHours(0, 0, 0, 0);

    const endOfPreviousMonth = new Date(startOfPreviousMonth);
    endOfPreviousMonth.setMonth(endOfPreviousMonth.getMonth() + 1);

    const { data, error } = await supabase
      .from('pacientes')
      .select('id')
      .gte('created_at', startOfPreviousMonth.toISOString())
      .lt('created_at', endOfPreviousMonth.toISOString());

    if (error) throw error;
    return data?.length || 0;
  } catch {
    return 0;
  }
}

async function getPreviousDayAppointments(): Promise<number> {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const startOfDay = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    const endOfDay = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate() + 1);

    const { data, error } = await supabase
      .from('agendamentos')
      .select('id')
      .gte('data_agendamento', startOfDay.toISOString())
      .lt('data_agendamento', endOfDay.toISOString())
      .in('status', ['agendado', 'confirmado', 'em_andamento']);

    if (error) throw error;
    return data?.length || 0;
  } catch {
    return 0;
  }
}

async function getPreviousMonthRevenue(): Promise<number> {
  try {
    const startOfPreviousMonth = new Date();
    startOfPreviousMonth.setMonth(startOfPreviousMonth.getMonth() - 1);
    startOfPreviousMonth.setDate(1);
    startOfPreviousMonth.setHours(0, 0, 0, 0);

    const endOfPreviousMonth = new Date(startOfPreviousMonth);
    endOfPreviousMonth.setMonth(endOfPreviousMonth.getMonth() + 1);

    const { data, error } = await supabase
      .from('pagamentos')
      .select('valor')
      .gte('data_pagamento', startOfPreviousMonth.toISOString())
      .lt('data_pagamento', endOfPreviousMonth.toISOString())
      .eq('status', 'pago');

    if (error) throw error;
    return data?.reduce((sum: any, payment: any) => sum + payment.valor, 0) || 0;
  } catch {
    return 0;
  }
}

async function getPreviousWeekWaitTime(): Promise<number> {
  try {
    const startOfPreviousWeek = new Date();
    startOfPreviousWeek.setDate(startOfPreviousWeek.getDate() - 14);
    const endOfPreviousWeek = new Date();
    endOfPreviousWeek.setDate(endOfPreviousWeek.getDate() - 7);

    const { data, error } = await supabase
      .from('agendamentos')
      .select('data_agendamento, data_inicio')
      .eq('status', 'concluido')
      .gte('data_agendamento', startOfPreviousWeek.toISOString())
      .lt('data_agendamento', endOfPreviousWeek.toISOString());

    if (error) throw error;

    const waitTimes = data?.map((apt: any) => {
      const scheduled = new Date(apt.data_agendamento);
      const started = new Date(apt.data_inicio);
      return (started.getTime() - scheduled.getTime()) / (1000 * 60);
    }) || [];

    return waitTimes.length > 0 
      ? waitTimes.reduce((sum: any, time: any) => sum + time, 0) / waitTimes.length 
      : 0;
  } catch {
    return 0;
  }
}

async function getPreviousMonthSatisfaction(): Promise<number> {
  try {
    const startOfPreviousMonth = new Date();
    startOfPreviousMonth.setMonth(startOfPreviousMonth.getMonth() - 1);
    startOfPreviousMonth.setDate(1);
    startOfPreviousMonth.setHours(0, 0, 0, 0);

    const endOfPreviousMonth = new Date(startOfPreviousMonth);
    endOfPreviousMonth.setMonth(endOfPreviousMonth.getMonth() + 1);

    const { data, error } = await supabase
      .from('feedback')
      .select('nota')
      .gte('created_at', startOfPreviousMonth.toISOString())
      .lt('created_at', endOfPreviousMonth.toISOString());

    if (error) throw error;

    return data?.length > 0 
      ? (data.reduce((sum: any, f: any) => sum + f.nota, 0) / data.length) * 20
      : 0;
  } catch {
    return 0;
  }
}

// ============================================================================
// FUNÇÃO PRINCIPAL PARA BUSCAR TODAS AS MÉTRICAS
// ============================================================================

/**
 * Busca todas as métricas do dashboard
 */
export async function fetchAllMetrics(): Promise<DashboardMetrics> {
  try {
    const [
      totalPatients,
      activeAppointments,
      monthlyRevenue,
      systemUptime,
      averageWaitTime,
      patientSatisfaction,
    ] = await Promise.all([
      fetchPatientMetrics(),
      fetchAppointmentMetrics(),
      fetchRevenueMetrics(),
      fetchSystemMetrics(),
      fetchWaitTimeMetrics(),
      fetchSatisfactionMetrics(),
    ]);

    return {
      totalPatients,
      activeAppointments,
      monthlyRevenue,
      systemUptime,
      averageWaitTime,
      patientSatisfaction,
    };
  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    throw error;
  }
}

// ============================================================================
// FUNÇÕES PARA DADOS DE GRÁFICOS
// ============================================================================

/**
 * Busca dados para gráfico de receita por período
 */
export async function fetchRevenueChartData(period: '7d' | '30d' | '90d' = '30d'): Promise<ChartData> {
  try {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('pagamentos')
      .select('valor, data_pagamento')
      .gte('data_pagamento', startDate.toISOString())
      .eq('status', 'pago')
      .order('data_pagamento', { ascending: true });

    if (error) throw error;

    // Agrupar por dia
    const dailyRevenue = new Map<string, number>();
    data?.forEach((payment: any) => {
      const date = new Date(payment.data_pagamento).toISOString().split('T')[0];
      const current = dailyRevenue.get(date) || 0;
      dailyRevenue.set(date, current + payment.valor);
    });

    // Criar array de labels e dados
    const labels: string[] = [];
    const values: number[] = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      const dateStr = date.toISOString().split('T')[0];
      const dayLabel = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      
      labels.push(dayLabel);
      values.push(dailyRevenue.get(dateStr) || 0);
    }

    return {
      labels,
      datasets: [{
        label: 'Receita Diária',
        data: values,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgba(59, 130, 246, 1)',
        tension: 0.4,
      }],
    };
  } catch (error) {
    console.error('Erro ao buscar dados do gráfico de receita:', error);
    return { labels: [], datasets: [] };
  }
}

/**
 * Busca dados para gráfico de consultas por período
 */
export async function fetchAppointmentsChartData(period: '7d' | '30d' | '90d' = '30d'): Promise<ChartData> {
  try {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('agendamentos')
      .select('data_agendamento, status')
      .gte('data_agendamento', startDate.toISOString())
      .order('data_agendamento', { ascending: true });

    if (error) throw error;

    // Agrupar por dia e status
    const dailyAppointments = new Map<string, { total: number; completed: number }>();
    data?.forEach((apt: any) => {
      const date = new Date(apt.data_agendamento).toISOString().split('T')[0];
      const current = dailyAppointments.get(date) || { total: 0, completed: 0 };
      current.total++;
      if (apt.status === 'concluido') current.completed++;
      dailyAppointments.set(date, current);
    });

    // Criar arrays de labels e dados
    const labels: string[] = [];
    const totalValues: number[] = [];
    const completedValues: number[] = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      const dateStr = date.toISOString().split('T')[0];
      const dayLabel = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      
      const dayData = dailyAppointments.get(dateStr) || { total: 0, completed: 0 };
      
      labels.push(dayLabel);
      totalValues.push(dayData.total);
      completedValues.push(dayData.completed);
    }

    return {
      labels,
      datasets: [
        {
          label: 'Total de Consultas',
          data: totalValues,
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderColor: 'rgba(34, 197, 94, 1)',
          tension: 0.4,
        },
        {
          label: 'Consultas Concluídas',
          data: completedValues,
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderColor: 'rgba(59, 130, 246, 1)',
          tension: 0.4,
        },
      ],
    };
  } catch (error) {
    console.error('Erro ao buscar dados do gráfico de consultas:', error);
    return { labels: [], datasets: [] };
  }
}
