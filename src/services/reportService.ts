// ============================================================================
// SERVIÇO: ReportService - Sistema de Relatórios Avançados
// ============================================================================
// Serviço para geração de relatórios com gráficos e análises
// ============================================================================

import { supabase } from '@/lib/supabase';
import { config, devLog } from '@/config/environment';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export interface ReportConfig {
  id: string;
  name: string;
  description: string;
  type: 'dashboard' | 'financial' | 'operational' | 'custom';
  filters: Record<string, unknown>;
  charts: ChartConfig[];
  schedule?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
  };
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv' | 'json';
}

export interface ChartConfig {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'table';
  title: string;
  dataSource: string;
  xAxis: string;
  yAxis: string;
  groupBy?: string;
  filters?: Record<string, unknown>;
  options?: Record<string, unknown>;
}

export interface ReportData {
  id: string;
  reportId: string;
  generatedAt: string;
  data: Record<string, unknown>;
  charts: ChartData[];
  summary: ReportSummary;
  metadata: {
    generatedBy: string;
    filters: Record<string, unknown>;
    recordCount: number;
    processingTime: number;
  };
}

export interface ChartData {
  chartId: string;
  type: string;
  data: unknown[];
  labels?: string[];
  datasets?: unknown[];
}

export interface ReportSummary {
  totalRecords: number;
  totalValue: number;
  averageValue: number;
  growthRate: number;
  topItems: Array<{ label: string; value: number }>;
  trends: Array<{ period: string; value: number }>;
}

export interface ReportFilter {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'like' | 'between';
  value: unknown;
  label: string;
}

// ============================================================================
// CONFIGURAÇÕES PADRÃO
// ============================================================================

const DEFAULT_REPORTS: ReportConfig[] = [
  {
    id: 'dashboard-overview',
    name: 'Visão Geral do Dashboard',
    description: 'Relatório com métricas principais da clínica',
    type: 'dashboard',
    filters: {},
    charts: [
      {
        id: 'patients-chart',
        type: 'bar',
        title: 'Pacientes por Mês',
        dataSource: 'pacientes',
        xAxis: 'created_at',
        yAxis: 'count',
        groupBy: 'month',
      },
      {
        id: 'appointments-chart',
        type: 'line',
        title: 'Agendamentos por Dia',
        dataSource: 'agendamentos',
        xAxis: 'data',
        yAxis: 'count',
      },
      {
        id: 'revenue-chart',
        type: 'area',
        title: 'Faturamento Mensal',
        dataSource: 'pagamentos',
        xAxis: 'created_at',
        yAxis: 'valor',
        groupBy: 'month',
      },
    ],
    format: 'pdf',
    recipients: [],
  },
  {
    id: 'financial-report',
    name: 'Relatório Financeiro',
    description: 'Análise financeira detalhada da clínica',
    type: 'financial',
    filters: {},
    charts: [
      {
        id: 'revenue-by-service',
        type: 'pie',
        title: 'Faturamento por Serviço',
        dataSource: 'pagamentos',
        xAxis: 'servico_id',
        yAxis: 'valor',
        groupBy: 'servico',
      },
      {
        id: 'monthly-revenue',
        type: 'bar',
        title: 'Faturamento Mensal',
        dataSource: 'pagamentos',
        xAxis: 'created_at',
        yAxis: 'valor',
        groupBy: 'month',
      },
      {
        id: 'payment-methods',
        type: 'pie',
        title: 'Métodos de Pagamento',
        dataSource: 'pagamentos',
        xAxis: 'forma_pagamento',
        yAxis: 'count',
      },
    ],
    format: 'excel',
    recipients: [],
  },
  {
    id: 'operational-report',
    name: 'Relatório Operacional',
    description: 'Métricas operacionais e de produtividade',
    type: 'operational',
    filters: {},
    charts: [
      {
        id: 'appointments-by-professional',
        type: 'bar',
        title: 'Atendimentos por Profissional',
        dataSource: 'agendamentos',
        xAxis: 'profissional_id',
        yAxis: 'count',
        groupBy: 'profissional',
      },
      {
        id: 'appointment-status',
        type: 'pie',
        title: 'Status dos Agendamentos',
        dataSource: 'agendamentos',
        xAxis: 'status',
        yAxis: 'count',
      },
      {
        id: 'patient-satisfaction',
        type: 'line',
        title: 'Satisfação dos Pacientes',
        dataSource: 'avaliacoes',
        xAxis: 'created_at',
        yAxis: 'nota',
        groupBy: 'month',
      },
    ],
    format: 'pdf',
    recipients: [],
  },
];

// ============================================================================
// CLASSE PRINCIPAL
// ============================================================================

class ReportService {
  private reports: ReportConfig[] = [...DEFAULT_REPORTS];

  // ============================================================================
  // CONFIGURAÇÃO DE RELATÓRIOS
  // ============================================================================

  async getReports(): Promise<ReportConfig[]> {
    try {
      if (config.mockDataEnabled) {
        return this.reports;
      }

      const { data, error } = await supabase
        .from('relatorios_config')
        .select('*')
        .order('name');

      if (error) {
        console.error('Erro ao carregar relatórios:', error);
        return this.reports;
      }

      return (data || []).map((item: any) => item.config as ReportConfig);

    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
      return this.reports;
    }
  }

  async getReport(reportId: string): Promise<ReportConfig | null> {
    try {
      const reports = await this.getReports();
      return reports.find(r => r.id === reportId) || null;
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
      return null;
    }
  }

  async saveReport(report: ReportConfig): Promise<void> {
    try {
      if (config.mockDataEnabled) {
        const index = this.reports.findIndex(r => r.id === report.id);
        if (index >= 0) {
          this.reports[index] = report;
        } else {
          this.reports.push(report);
        }
        devLog('Relatório salvo (mock):', report);
        return;
      }

      await supabase
        .from('relatorios_config')
        .upsert({
          id: report.id,
          config: report,
          updated_at: new Date().toISOString(),
        });

      devLog('Relatório salvo no banco:', report);

    } catch (error) {
      console.error('Erro ao salvar relatório:', error);
      throw error;
    }
  }

  async deleteReport(reportId: string): Promise<void> {
    try {
      if (config.mockDataEnabled) {
        this.reports = this.reports.filter(r => r.id !== reportId);
        devLog('Relatório deletado (mock):', reportId);
        return;
      }

      await supabase
        .from('relatorios_config')
        .delete()
        .eq('id', reportId);

      devLog('Relatório deletado:', reportId);

    } catch (error) {
      console.error('Erro ao deletar relatório:', error);
      throw error;
    }
  }

  // ============================================================================
  // GERAÇÃO DE RELATÓRIOS
  // ============================================================================

  async generateReport(
    reportId: string,
    filters: Record<string, unknown> = {},
    userId: string = 'system'
  ): Promise<ReportData> {
    const startTime = Date.now();
    
    try {
      devLog(`Gerando relatório ${reportId}...`);
      
      const reportConfig = await this.getReport(reportId);
      if (!reportConfig) {
        throw new Error('Relatório não encontrado');
      }

      const reportData: ReportData = {
        id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        reportId,
        generatedAt: new Date().toISOString(),
        data: {},
        charts: [],
        summary: {
          totalRecords: 0,
          totalValue: 0,
          averageValue: 0,
          growthRate: 0,
          topItems: [],
          trends: [],
        },
        metadata: {
          generatedBy: userId,
          filters: { ...reportConfig.filters, ...filters },
          recordCount: 0,
          processingTime: 0,
        },
      };

      // Gerar dados para cada gráfico
      for (const chart of reportConfig.charts) {
        const chartData = await this.generateChartData(chart, filters);
        reportData.charts.push(chartData);
      }

      // Gerar resumo
      reportData.summary = await this.generateSummary(reportConfig, filters);

      // Calcular metadados
      reportData.metadata.recordCount = reportData.summary.totalRecords;
      reportData.metadata.processingTime = Date.now() - startTime;

      // Salvar relatório gerado
      await this.saveGeneratedReport(reportData);

      devLog(`Relatório ${reportId} gerado em ${reportData.metadata.processingTime}ms`);
      return reportData;

    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      throw error;
    }
  }

  // ============================================================================
  // GERAÇÃO DE DADOS DE GRÁFICOS
  // ============================================================================

  private async generateChartData(
    chart: ChartConfig,
    filters: Record<string, unknown>
  ): Promise<ChartData> {
    try {
      let data: unknown[] = [];
      let labels: string[] = [];
      let datasets: unknown[] = [];

      switch (chart.type) {
        case 'bar':
        case 'line':
        case 'area':
          const timeSeriesData = await this.getTimeSeriesData(chart, filters);
          data = timeSeriesData.data;
          labels = timeSeriesData.labels;
          break;

        case 'pie':
          const pieData = await this.getPieData(chart, filters);
          data = pieData.data;
          labels = pieData.labels;
          break;

        case 'scatter':
          const scatterData = await this.getScatterData(chart, filters);
          data = scatterData.data;
          break;

        case 'table':
          const tableData = await this.getTableData(chart, filters);
          data = tableData.data;
          break;

        default:
          data = [];
      }

      return {
        chartId: chart.id,
        type: chart.type,
        data,
        labels,
        datasets,
      };

    } catch (error) {
      console.error('Erro ao gerar dados do gráfico:', error);
      return {
        chartId: chart.id,
        type: chart.type,
        data: [],
        labels: [],
        datasets: [],
      };
    }
  }

  private async getTimeSeriesData(
    chart: ChartConfig,
    filters: Record<string, unknown>
  ): Promise<{ data: number[]; labels: string[] }> {
    try {
      if (config.mockDataEnabled) {
        return this.getMockTimeSeriesData(chart);
      }

      // Implementar consulta real ao banco
      const { data, error } = await supabase
        .from(chart.dataSource)
        .select('*')
        .gte('created_at', this.getDateFilter(filters, 'start'))
        .lte('created_at', this.getDateFilter(filters, 'end'));

      if (error) {
        console.error('Erro ao buscar dados:', error);
        return { data: [], labels: [] };
      }

      // Processar dados para série temporal
      const processedData = this.processTimeSeriesData(data || [], chart);
      return processedData;

    } catch (error) {
      console.error('Erro ao buscar dados de série temporal:', error);
      return { data: [], labels: [] };
    }
  }

  private async getPieData(
    chart: ChartConfig,
    filters: Record<string, unknown>
  ): Promise<{ data: number[]; labels: string[] }> {
    try {
      if (config.mockDataEnabled) {
        return this.getMockPieData(chart);
      }

      // Implementar consulta real ao banco
      const { data, error } = await supabase
        .from(chart.dataSource)
        .select('*')
        .gte('created_at', this.getDateFilter(filters, 'start'))
        .lte('created_at', this.getDateFilter(filters, 'end'));

      if (error) {
        console.error('Erro ao buscar dados:', error);
        return { data: [], labels: [] };
      }

      // Processar dados para gráfico de pizza
      const processedData = this.processPieData(data || [], chart);
      return processedData;

    } catch (error) {
      console.error('Erro ao buscar dados de pizza:', error);
      return { data: [], labels: [] };
    }
  }

  private async getScatterData(
    chart: ChartConfig,
    filters: Record<string, unknown>
  ): Promise<{ data: Array<{ x: number; y: number }> }> {
    try {
      if (config.mockDataEnabled) {
        return this.getMockScatterData(chart);
      }

      // Implementar consulta real ao banco
      const { data, error } = await supabase
        .from(chart.dataSource)
        .select('*')
        .gte('created_at', this.getDateFilter(filters, 'start'))
        .lte('created_at', this.getDateFilter(filters, 'end'));

      if (error) {
        console.error('Erro ao buscar dados:', error);
        return { data: [] };
      }

      // Processar dados para gráfico de dispersão
      const processedData = this.processScatterData(data || [], chart);
      return processedData;

    } catch (error) {
      console.error('Erro ao buscar dados de dispersão:', error);
      return { data: [] };
    }
  }

  private async getTableData(
    chart: ChartConfig,
    filters: Record<string, unknown>
  ): Promise<{ data: Record<string, unknown>[] }> {
    try {
      if (config.mockDataEnabled) {
        return this.getMockTableData(chart);
      }

      // Implementar consulta real ao banco
      const { data, error } = await supabase
        .from(chart.dataSource)
        .select('*')
        .gte('created_at', this.getDateFilter(filters, 'start'))
        .lte('created_at', this.getDateFilter(filters, 'end'));

      if (error) {
        console.error('Erro ao buscar dados:', error);
        return { data: [] };
      }

      return { data: data || [] };

    } catch (error) {
      console.error('Erro ao buscar dados de tabela:', error);
      return { data: [] };
    }
  }

  // ============================================================================
  // PROCESSAMENTO DE DADOS
  // ============================================================================

  private processTimeSeriesData(
    data: Record<string, unknown>[],
    chart: ChartConfig
  ): { data: number[]; labels: string[] } {
    // Implementar lógica de processamento de série temporal
    const groupedData = this.groupDataByTime(data, chart.groupBy || 'day');
    const labels = Object.keys(groupedData).sort();
    const values = labels.map(label => groupedData[label] || 0);

    return { data: values, labels };
  }

  private processPieData(
    data: Record<string, unknown>[],
    chart: ChartConfig
  ): { data: number[]; labels: string[] } {
    // Implementar lógica de processamento de pizza
    const groupedData = this.groupDataByField(data, chart.xAxis);
    const labels = Object.keys(groupedData);
    const values = labels.map(label => groupedData[label] || 0);

    return { data: values, labels };
  }

  private processScatterData(
    data: Record<string, unknown>[],
    chart: ChartConfig
  ): { data: Array<{ x: number; y: number }> } {
    // Implementar lógica de processamento de dispersão
    const scatterData = data.map(item => ({
      x: Number(item[chart.xAxis]) || 0,
      y: Number(item[chart.yAxis]) || 0,
    }));

    return { data: scatterData };
  }

  private groupDataByTime(
    data: Record<string, unknown>[],
    groupBy: string
  ): Record<string, number> {
    const grouped: Record<string, number> = {};

    data.forEach(item => {
      const date = new Date(item.created_at as string);
      let key: string;

      switch (groupBy) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'year':
          key = String(date.getFullYear());
          break;
        default:
          key = date.toISOString().split('T')[0];
      }

      grouped[key] = (grouped[key] || 0) + 1;
    });

    return grouped;
  }

  private groupDataByField(
    data: Record<string, unknown>[],
    field: string
  ): Record<string, number> {
    const grouped: Record<string, number> = {};

    data.forEach(item => {
      const key = String(item[field] || 'N/A');
      grouped[key] = (grouped[key] || 0) + 1;
    });

    return grouped;
  }

  // ============================================================================
  // GERAÇÃO DE RESUMO
  // ============================================================================

  private async generateSummary(
    reportConfig: ReportConfig,
    filters: Record<string, unknown>
  ): Promise<ReportSummary> {
    try {
      if (config.mockDataEnabled) {
        return this.getMockSummary();
      }

      // Implementar geração de resumo real
      const summary: ReportSummary = {
        totalRecords: 0,
        totalValue: 0,
        averageValue: 0,
        growthRate: 0,
        topItems: [],
        trends: [],
      };

      // Calcular métricas básicas
      for (const chart of reportConfig.charts) {
        const { data } = await this.getTableData(chart, filters);
        summary.totalRecords += data.length;
      }

      return summary;

    } catch (error) {
      console.error('Erro ao gerar resumo:', error);
      return {
        totalRecords: 0,
        totalValue: 0,
        averageValue: 0,
        growthRate: 0,
        topItems: [],
        trends: [],
      };
    }
  }

  // ============================================================================
  // UTILITÁRIOS
  // ============================================================================

  private getDateFilter(filters: Record<string, unknown>, type: 'start' | 'end'): string {
    const now = new Date();
    const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const defaultEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    if (type === 'start') {
      return (filters.startDate as string) || defaultStart.toISOString();
    } else {
      return (filters.endDate as string) || defaultEnd.toISOString();
    }
  }

  private async saveGeneratedReport(reportData: ReportData): Promise<void> {
    try {
      if (config.mockDataEnabled) {
        devLog('Relatório gerado salvo (mock):', reportData.id);
        return;
      }

      await supabase
        .from('relatorios_gerados')
        .insert({
          id: reportData.id,
          report_id: reportData.reportId,
          data: reportData,
          generated_at: reportData.generatedAt,
        });

    } catch (error) {
      console.error('Erro ao salvar relatório gerado:', error);
    }
  }

  // ============================================================================
  // DADOS MOCK
  // ============================================================================

  private getMockTimeSeriesData(_chart: ChartConfig): { data: number[]; labels: string[] } {
    const labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    const data = [65, 59, 80, 81, 56, 55];
    return { data, labels };
  }

  private getMockPieData(_chart: ChartConfig): { data: number[]; labels: string[] } {
    const labels = ['Consulta', 'Exame', 'Procedimento', 'Outros'];
    const data = [40, 30, 20, 10];
    return { data, labels };
  }

  private getMockScatterData(_chart: ChartConfig): { data: Array<{ x: number; y: number }> } {
    const data = [
      { x: 1, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 1 },
      { x: 4, y: 4 },
      { x: 5, y: 2 },
    ];
    return { data };
  }

  private getMockTableData(_chart: ChartConfig): { data: Record<string, unknown>[] } {
    const data = [
      { id: 1, nome: 'Item 1', valor: 100 },
      { id: 2, nome: 'Item 2', valor: 200 },
      { id: 3, nome: 'Item 3', valor: 150 },
    ];
    return { data };
  }

  private getMockSummary(): ReportSummary {
    return {
      totalRecords: 150,
      totalValue: 25000,
      averageValue: 166.67,
      growthRate: 12.5,
      topItems: [
        { label: 'Consulta', value: 100 },
        { label: 'Exame', value: 80 },
        { label: 'Procedimento', value: 60 },
      ],
      trends: [
        { period: 'Jan', value: 1000 },
        { period: 'Fev', value: 1200 },
        { period: 'Mar', value: 1100 },
      ],
    };
  }
}

// ============================================================================
// INSTÂNCIA SINGLETON
// ============================================================================

export const reportService = new ReportService();

// ============================================================================
// EXPORTAÇÕES
// ============================================================================

export {
  ReportService,
  DEFAULT_REPORTS,
};
