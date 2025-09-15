// ============================================================================
// COMPONENTE: AdvancedReports - Relatórios Avançados
// ============================================================================
// Interface para gerenciar relatórios com gráficos e análises
// ============================================================================

import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Filter,
  Plus,
  Settings,
  Trash2,
  Eye,
  // Calendar,
  AlertCircle,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
} from 'lucide-react';
import { useReports } from '@/hooks/useReports';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Alert,
  AlertDescription,
} from '@/design-system';
import { LoadingSpinner } from '@/components/LazyLoading/LazyWrapper';
import { ReportData, ReportFilter } from '@/services/mockServices';

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export const AdvancedReports: React.FC = () => {
  const {
    reports,
    // generatedReports,
    currentReport,
    loading,
    error,
    loadReports,
    generateReport,
    exportReport,
    deleteReport,
    // getAvailableFilters,
    applyFilters,
    formatDate,
    getReportTypeLabel,
    getChartTypeLabel,
  } = useReports();

  // const [selectedReport, setSelectedReport] = useState<ReportConfig | null>(
  //   null
  // );
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ReportFilter[]>([]);
  const [showGeneratedReport, setShowGeneratedReport] = useState(false);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleGenerateReport = async (reportId: string) => {
    const appliedFilters = applyFilters(filters);
    await generateReport(reportId, appliedFilters);
    setShowGeneratedReport(true);
  };

  const handleExportReport = async (
    reportData: ReportData,
    format: 'pdf' | 'excel' | 'csv' | 'json'
  ) => {
    await exportReport(reportData, format);
  };

  const handleDeleteReport = async (reportId: string) => {
    if (window.confirm('Tem certeza que deseja deletar este relatório?')) {
      await deleteReport(reportId);
    }
  };

  const handleFilterChange = (index: number, field: string, value: unknown) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], [field]: value };
    setFilters(newFilters);
  };

  const handleAddFilter = () => {
    const newFilter: ReportFilter = {
      field: 'created_at',
      operator: 'between',
      value: [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()],
      label: 'Período',
    };
    setFilters([...filters, newFilter]);
  };

  const handleRemoveFilter = (index: number) => {
    const newFilters = filters.filter((_, i) => i !== index);
    setFilters(newFilters);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
            Relatórios Avançados
          </h2>
          <p className='text-gray-600 dark:text-gray-400'>
            Gere relatórios com gráficos e análises detalhadas
          </p>
        </div>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} className='mr-2' />
            Filtros
          </Button>
          <Button variant='outline' onClick={loadReports} disabled={loading}>
            <BarChart3 size={16} className='mr-2' />
            Atualizar
          </Button>
          <Button>
            <Plus size={16} className='mr-2' />
            Novo Relatório
          </Button>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {filters.map((filter, index) => (
              <div
                key={index}
                className='flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg'
              >
                <div className='flex-1'>
                  <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                    {filter.label}
                  </label>
                  <div className='flex gap-2'>
                    <select
                      value={filter.operator}
                      onChange={e =>
                        handleFilterChange(index, 'operator', e.target.value)
                      }
                      className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    >
                      <option value='eq'>Igual a</option>
                      <option value='neq'>Diferente de</option>
                      <option value='gt'>Maior que</option>
                      <option value='gte'>Maior ou igual</option>
                      <option value='lt'>Menor que</option>
                      <option value='lte'>Menor ou igual</option>
                      <option value='in'>Contém</option>
                      <option value='like'>Contém texto</option>
                      <option value='between'>Entre</option>
                    </select>
                    <input
                      type='text'
                      value={String(filter.value)}
                      onChange={e =>
                        handleFilterChange(index, 'value', e.target.value)
                      }
                      className='flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleRemoveFilter(index)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
            <Button variant='outline' onClick={handleAddFilter}>
              <Plus size={16} className='mr-2' />
              Adicionar Filtro
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Lista de Relatórios */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {reports.map(report => (
          <Card key={report.id} className='hover:shadow-lg transition-shadow'>
            <CardHeader>
              <div className='flex justify-between items-start'>
                <div>
                  <CardTitle className='text-lg'>{report.name}</CardTitle>
                  <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
                    {report.description}
                  </p>
                </div>
                <Badge variant='secondary'>
                  {getReportTypeLabel(report.type || '')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {/* Gráficos */}
                <div>
                  <h4 className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                    Gráficos ({report.charts?.length || 0})
                  </h4>
                  <div className='flex flex-wrap gap-1'>
                    {report.charts?.map((chart: any) => (
                      <Badge
                        key={chart.id}
                        variant='outline'
                        className='text-xs'
                      >
                        {getChartTypeLabel(chart.type)}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Ações */}
                <div className='flex gap-2'>
                  <Button
                    size='sm'
                    onClick={() => {
                      // setSelectedReport(report);
                      handleGenerateReport(report.id);
                    }}
                    disabled={loading}
                  >
                    {loading ? (
                      <LoadingSpinner size='sm' />
                    ) : (
                      <Eye size={16} className='mr-1' />
                    )}
                    Gerar
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      /* setSelectedReport(report); */
                    }}
                  >
                    <Settings size={16} />
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleDeleteReport(report.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Relatório Gerado */}
      {showGeneratedReport && currentReport && (
        <Card>
          <CardHeader>
            <div className='flex justify-between items-center'>
              <CardTitle>Relatório Gerado</CardTitle>
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleExportReport(currentReport, 'pdf')}
                >
                  <Download size={16} className='mr-1' />
                  PDF
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleExportReport(currentReport, 'excel')}
                >
                  <Download size={16} className='mr-1' />
                  Excel
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setShowGeneratedReport(false)}
                >
                  Fechar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Resumo */}
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
              <div className='text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
                <Users className='h-8 w-8 text-blue-500 mx-auto mb-2' />
                <p className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
                  {currentReport.summary?.totalRecords || 0}
                </p>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  Total de Registros
                </p>
              </div>
              <div className='text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg'>
                <DollarSign className='h-8 w-8 text-green-500 mx-auto mb-2' />
                <p className='text-2xl font-bold text-green-600 dark:text-green-400'>
                  R$ {(currentReport.summary?.totalValue || 0).toLocaleString()}
                </p>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  Valor Total
                </p>
              </div>
              <div className='text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg'>
                <TrendingUp className='h-8 w-8 text-yellow-500 mx-auto mb-2' />
                <p className='text-2xl font-bold text-yellow-600 dark:text-yellow-400'>
                  {currentReport.summary?.growthRate || 0}%
                </p>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  Taxa de Crescimento
                </p>
              </div>
              <div className='text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg'>
                <Activity className='h-8 w-8 text-purple-500 mx-auto mb-2' />
                <p className='text-2xl font-bold text-purple-600 dark:text-purple-400'>
                  {(currentReport.summary?.averageValue || 0).toFixed(2)}
                </p>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  Valor Médio
                </p>
              </div>
            </div>

            {/* Gráficos */}
            <div className='space-y-6'>
              {currentReport.charts?.map((chart: any) => (
                <div
                  key={chart.chartId}
                  className='border border-gray-200 dark:border-gray-700 rounded-lg p-4'
                >
                  <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
                    {chart.type === 'line' && '📈'}{' '}
                    {chart.type === 'bar' && '📊'}{' '}
                    {chart.type === 'pie' && '🥧'}{' '}
                    {chart.type === 'area' && '📊'}{' '}
                    {chart.type === 'scatter' && '🔍'}{' '}
                    {chart.type === 'table' && '📋'}
                    Gráfico {getChartTypeLabel(chart.type)}
                  </h3>
                  <div className='h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg'>
                    <div className='text-center'>
                      <BarChart3 className='h-12 w-12 text-gray-400 mx-auto mb-2' />
                      <p className='text-gray-500'>
                        Gráfico será renderizado aqui
                      </p>
                      <p className='text-sm text-gray-400'>
                        Dados:{' '}
                        {Array.isArray(chart.data) ? chart.data.length : 0}{' '}
                        registros
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Metadados */}
            <div className='mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'>
              <h4 className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Informações do Relatório
              </h4>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
                <div>
                  <span className='text-gray-600 dark:text-gray-400'>
                    Gerado em:
                  </span>
                  <p className='font-medium'>
                    {formatDate(currentReport.generatedAt?.toString() || '')}
                  </p>
                </div>
                <div>
                  <span className='text-gray-600 dark:text-gray-400'>
                    Processamento:
                  </span>
                  <p className='font-medium'>
                    {currentReport.metadata?.processingTime || 0}ms
                  </p>
                </div>
                <div>
                  <span className='text-gray-600 dark:text-gray-400'>
                    Registros:
                  </span>
                  <p className='font-medium'>
                    {currentReport.metadata?.recordCount || 0}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Erro */}
      {error && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

// ============================================================================
// EXPORTAÇÕES
// ============================================================================

export default AdvancedReports;
