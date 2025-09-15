// ============================================================================
// HOOK: useReports - Gerenciamento de Relatórios
// ============================================================================
// Hook para gerenciar relatórios avançados com gráficos
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { reportService, ReportConfig, ReportData, ReportFilter } from '@/services/mockServices';
import toast from 'react-hot-toast';

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

function useReports() {
  const [reports, setReports] = useState<ReportConfig[]>([]);
  const [generatedReports, setGeneratedReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentReport, setCurrentReport] = useState<ReportData | null>(null);

  // ============================================================================
  // CARREGAR DADOS INICIAIS
  // ============================================================================

  useEffect(() => {
    loadReports();
    loadGeneratedReports();
  }, []);

  // ============================================================================
  // FUNÇÕES DE RELATÓRIOS
  // ============================================================================

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const reportList = await reportService.getReports();
      setReports(reportList);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar relatórios';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadGeneratedReports = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Implementar carregamento de relatórios gerados
      setGeneratedReports([]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar relatórios gerados';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getReport = useCallback(async (reportId: string): Promise<ReportConfig | null> => {
    setLoading(true);
    setError(null);

    try {
      const report = await reportService.getReport(reportId);
      return report;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar relatório';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveReport = useCallback(async (report: ReportConfig): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await reportService.saveReport(report);
      await loadReports();
      toast.success('Relatório salvo com sucesso!');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar relatório';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadReports]);

  const deleteReport = useCallback(async (reportId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await reportService.deleteReport(reportId);
      await loadReports();
      toast.success('Relatório deletado com sucesso!');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar relatório';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadReports]);

  // ============================================================================
  // GERAÇÃO DE RELATÓRIOS
  // ============================================================================

  const generateReport = useCallback(async (
    reportId: string,
    filters: Record<string, unknown> = {},
    userId: string = 'system'
  ): Promise<ReportData | null> => {
    setLoading(true);
    setError(null);

    try {
      const reportData = await reportService.generateReport(reportId, Object.values(filters), userId);
      setCurrentReport(reportData);
      setGeneratedReports(prev => [reportData, ...prev]);
      toast.success('Relatório gerado com sucesso!');
      return reportData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao gerar relatório';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportReport = useCallback(async (
    reportData: ReportData,
    format: 'pdf' | 'excel' | 'csv' | 'json'
  ): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // Implementar exportação baseada no formato
      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: 'application/json',
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio_${reportData.id}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Relatório exportado com sucesso!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao exportar relatório';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================================
  // FILTROS E CONFIGURAÇÕES
  // ============================================================================

  const getAvailableFilters = useCallback((reportType: string): ReportFilter[] => {
    const commonFilters: ReportFilter[] = [
      {
        field: 'created_at',
        operator: 'between',
        value: [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()],
        label: 'Período',
      },
      {
        field: 'status',
        operator: 'in',
        value: ['ativo', 'inativo'],
        label: 'Status',
      },
    ];

    switch (reportType) {
      case 'financial':
        return [
          ...commonFilters,
          {
            field: 'valor',
            operator: 'gte',
            value: 0,
            label: 'Valor Mínimo',
          },
          {
            field: 'forma_pagamento',
            operator: 'in',
            value: ['dinheiro', 'cartao', 'pix'],
            label: 'Forma de Pagamento',
          },
        ];
      
      case 'operational':
        return [
          ...commonFilters,
          {
            field: 'profissional_id',
            operator: 'in',
            value: [],
            label: 'Profissional',
          },
          {
            field: 'servico_id',
            operator: 'in',
            value: [],
            label: 'Serviço',
          },
        ];
      
      default:
        return commonFilters;
    }
  }, []);

  const applyFilters = useCallback((
    filters: ReportFilter[]
  ): Record<string, unknown> => {
    const appliedFilters: Record<string, unknown> = {};

    filters.forEach(filter => {
      switch (filter.operator) {
        case 'between':
          appliedFilters.startDate = (filter.value as any)[0];
          appliedFilters.endDate = (filter.value as any)[1];
          break;
        case 'in':
          appliedFilters[filter.field] = filter.value;
          break;
        default:
          appliedFilters[filter.field] = filter.value;
      }
    });

    return appliedFilters;
  }, []);

  // ============================================================================
  // UTILITÁRIOS
  // ============================================================================

  const formatDate = useCallback((dateString: string): string => {
    return new Date(dateString).toLocaleString('pt-BR');
  }, []);

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const getReportTypeLabel = useCallback((type: string): string => {
    const labels: Record<string, string> = {
      dashboard: 'Dashboard',
      financial: 'Financeiro',
      operational: 'Operacional',
      custom: 'Personalizado',
    };
    return labels[type] || type;
  }, []);

  const getChartTypeLabel = useCallback((type: string): string => {
    const labels: Record<string, string> = {
      line: 'Linha',
      bar: 'Barras',
      pie: 'Pizza',
      area: 'Área',
      scatter: 'Dispersão',
      table: 'Tabela',
    };
    return labels[type] || type;
  }, []);

  // ============================================================================
  // RETORNO
  // ============================================================================

  return {
    // Estado
    reports,
    generatedReports,
    currentReport,
    loading,
    error,
    
    // Ações
    loadReports,
    loadGeneratedReports,
    getReport,
    saveReport,
    deleteReport,
    generateReport,
    exportReport,
    
    // Filtros
    getAvailableFilters,
    applyFilters,
    
    // Utilitários
    formatDate,
    formatFileSize,
    getReportTypeLabel,
    getChartTypeLabel,
  };
}

// ============================================================================
// HOOKS ESPECÍFICOS
// ============================================================================

/**
 * Hook para gerenciar apenas a lista de relatórios
 */
function useReportList() {
  const [reports, setReports] = useState<ReportConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const reportList = await reportService.getReports();
      setReports(reportList);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar relatórios';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  return {
    reports,
    loading,
    error,
    loadReports,
  };
}

/**
 * Hook para gerenciar um relatório específico
 */
function useReport(reportId: string) {
  const [report, setReport] = useState<ReportConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReport = useCallback(async () => {
    if (!reportId) return;

    setLoading(true);
    setError(null);

    try {
      const reportData = await reportService.getReport(reportId);
      setReport(reportData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar relatório';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  return {
    report,
    loading,
    error,
    loadReport,
  };
}

/**
 * Hook para gerenciar geração de relatórios
 */
function useReportGeneration() {
  const [currentReport, setCurrentReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReport = useCallback(async (
    reportId: string,
    filters: Record<string, unknown> = {},
    userId: string = 'system'
  ): Promise<ReportData | null> => {
    setLoading(true);
    setError(null);

    try {
      const reportData = await reportService.generateReport(reportId, Object.values(filters), userId);
      setCurrentReport(reportData);
      return reportData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao gerar relatório';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    currentReport,
    loading,
    error,
    generateReport,
  };
}

// ============================================================================
// EXPORTAÇÕES
// ============================================================================

export {
  useReports,
  useReportList,
  useReport,
  useReportGeneration,
};
