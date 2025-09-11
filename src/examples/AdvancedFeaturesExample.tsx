// ============================================================================
// EXEMPLO DE FUNCIONALIDADES AVANÇADAS
// ============================================================================
// Demonstração das funcionalidades implementadas
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Modal,
  LoadingSpinner,
  Container,
  Grid,
  GridItem,
  Flex,
} from '@/components/UI';
import { MetricCard, ChartCard } from '@/components/Dashboard';
import { TemplateBuilder } from '@/components/Templates';
import { usePermissions } from '@/hooks/usePermissions';
import { useAsync } from '@/hooks';
import {
  fetchAllMetrics,
  fetchRevenueChartData,
  fetchAppointmentsChartData,
} from '@/lib/metrics';
import { templateManager } from '@/lib/templates';
import {
  integrationManager,
  CEPIntegrationService,
  WhatsAppIntegrationService,
} from '@/lib/integrations';
import {
  BarChart3,
  Users,
  Calendar,
  DollarSign,
  Activity,
  Clock,
  Heart,
  FileText,
  Settings,
  Zap,
  Download,
  Eye,
} from 'lucide-react';

// ============================================================================
// EXEMPLO DE DASHBOARD AVANÇADO
// ============================================================================

export function AdvancedDashboardExample() {
  const {
    data: metrics,
    loading,
    error,
    execute,
  } = useAsync(fetchAllMetrics, {
    immediate: true,
  });

  const [revenueChartData, setRevenueChartData] = useState(null);
  const [appointmentsChartData, setAppointmentsChartData] = useState(null);

  useEffect(() => {
    const loadChartData = async () => {
      const revenueData = await fetchRevenueChartData('30d');
      const appointmentsData = await fetchAppointmentsChartData('30d');
      setRevenueChartData(revenueData);
      setAppointmentsChartData(appointmentsData);
    };

    loadChartData();
  }, []);

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <LoadingSpinner text='Carregando métricas...' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='text-center text-red-600'>
        <p>Erro ao carregar métricas: {error.message}</p>
        <Button onClick={execute} className='mt-4'>
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <h2 className='text-2xl font-bold'>Dashboard Avançado</h2>

      {/* Métricas */}
      <Grid cols={1} md={2} lg={3} gap='md'>
        {metrics &&
          Object.entries(metrics).map(([key, metric]) => (
            <MetricCard key={key} metric={metric} />
          ))}
      </Grid>

      {/* Gráficos */}
      <Grid cols={1} lg={2} gap='md'>
        <ChartCard
          title='Receita por Período'
          data={revenueChartData}
          type='line'
          period='30d'
          onPeriodChange={period => {
            fetchRevenueChartData(period).then(setRevenueChartData);
          }}
        />

        <ChartCard
          title='Consultas por Período'
          data={appointmentsChartData}
          type='bar'
          period='30d'
          onPeriodChange={period => {
            fetchAppointmentsChartData(period).then(setAppointmentsChartData);
          }}
        />
      </Grid>
    </div>
  );
}

// ============================================================================
// EXEMPLO DE SISTEMA DE PERMISSÕES
// ============================================================================

export function PermissionsExample() {
  const {
    userPermissions,
    hasPermission,
    canAccess,
    canPerform,
    isAdmin,
    isManager,
    isLoading,
  } = usePermissions();

  if (isLoading) {
    return <LoadingSpinner text='Carregando permissões...' />;
  }

  return (
    <div className='space-y-6'>
      <h2 className='text-2xl font-bold'>Sistema de Permissões</h2>

      <Grid cols={1} md={2} gap='md'>
        <Card>
          <CardHeader>
            <h3 className='text-lg font-semibold'>Informações do Usuário</h3>
          </CardHeader>
          <CardBody>
            <div className='space-y-2'>
              <p>
                <strong>Role:</strong> {userPermissions?.role || 'N/A'}
              </p>
              <p>
                <strong>Permissões:</strong>{' '}
                {userPermissions?.permissions.length || 0}
              </p>
              <p>
                <strong>Admin:</strong> {isAdmin ? 'Sim' : 'Não'}
              </p>
              <p>
                <strong>Gerente:</strong> {isManager ? 'Sim' : 'Não'}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className='text-lg font-semibold'>Teste de Permissões</h3>
          </CardHeader>
          <CardBody>
            <div className='space-y-2'>
              <p>
                Pode ler pacientes:{' '}
                {canAccess('patients', 'read') ? '✅' : '❌'}
              </p>
              <p>
                Pode escrever pacientes:{' '}
                {canAccess('patients', 'write') ? '✅' : '❌'}
              </p>
              <p>
                Pode deletar pacientes:{' '}
                {canAccess('patients', 'delete') ? '✅' : '❌'}
              </p>
              <p>
                Pode acessar relatórios:{' '}
                {canAccess('reports', 'read') ? '✅' : '❌'}
              </p>
              <p>
                Pode gerenciar usuários:{' '}
                {canPerform('users', 'manage_roles') ? '✅' : '❌'}
              </p>
            </div>
          </CardBody>
        </Card>
      </Grid>
    </div>
  );
}

// ============================================================================
// EXEMPLO DE INTEGRAÇÕES
// ============================================================================

export function IntegrationsExample() {
  const [cep, setCep] = useState('');
  const [cepData, setCepData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const cepService = new CEPIntegrationService();
  const whatsappService = new WhatsAppIntegrationService('your-access-token');

  const handleCepSearch = async () => {
    if (!cep) return;

    setLoading(true);
    try {
      const response = await cepService.getCEP(cep);
      if (response.success) {
        setCepData(response.data);
      } else {
        alert('Erro ao buscar CEP: ' + response.error);
      }
    } catch (error) {
      alert('Erro ao buscar CEP: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppSend = async () => {
    if (!phoneNumber || !whatsappMessage) return;

    setLoading(true);
    try {
      const response = await whatsappService.sendMessage(
        phoneNumber,
        whatsappMessage
      );
      if (response.success) {
        alert('Mensagem enviada com sucesso!');
      } else {
        alert('Erro ao enviar mensagem: ' + response.error);
      }
    } catch (error) {
      alert('Erro ao enviar mensagem: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='space-y-6'>
      <h2 className='text-2xl font-bold'>Integrações Externas</h2>

      <Grid cols={1} md={2} gap='md'>
        <Card>
          <CardHeader>
            <h3 className='text-lg font-semibold'>API de CEP</h3>
          </CardHeader>
          <CardBody>
            <div className='space-y-4'>
              <Input
                label='CEP'
                value={cep}
                onChange={e => setCep(e.target.value)}
                placeholder='00000-000'
                maxLength={9}
              />
              <Button onClick={handleCepSearch} loading={loading}>
                Buscar CEP
              </Button>

              {cepData && (
                <div className='mt-4 p-4 bg-gray-100 rounded-lg'>
                  <h4 className='font-semibold mb-2'>Dados do CEP:</h4>
                  <p>
                    <strong>Logradouro:</strong> {cepData.logradouro}
                  </p>
                  <p>
                    <strong>Bairro:</strong> {cepData.bairro}
                  </p>
                  <p>
                    <strong>Cidade:</strong> {cepData.localidade}
                  </p>
                  <p>
                    <strong>UF:</strong> {cepData.uf}
                  </p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className='text-lg font-semibold'>WhatsApp API</h3>
          </CardHeader>
          <CardBody>
            <div className='space-y-4'>
              <Input
                label='Número do Telefone'
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                placeholder='+5511999999999'
              />
              <Input
                label='Mensagem'
                value={whatsappMessage}
                onChange={e => setWhatsappMessage(e.target.value)}
                placeholder='Digite sua mensagem'
              />
              <Button onClick={handleWhatsAppSend} loading={loading}>
                Enviar Mensagem
              </Button>
            </div>
          </CardBody>
        </Card>
      </Grid>
    </div>
  );
}

// ============================================================================
// EXEMPLO DE SISTEMA DE TEMPLATES
// ============================================================================

export function TemplatesExample() {
  const [templates, setTemplates] = useState([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    const allTemplates = templateManager.getAllTemplates();
    setTemplates(allTemplates);
  }, []);

  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setShowBuilder(true);
  };

  const handleEditTemplate = template => {
    setSelectedTemplate(template);
    setShowBuilder(true);
  };

  const handleSaveTemplate = template => {
    if (selectedTemplate) {
      templateManager.updateTemplate(template.id, template);
    } else {
      templateManager.createTemplate(template);
    }

    setTemplates(templateManager.getAllTemplates());
    setShowBuilder(false);
  };

  const handleGenerateReport = async template => {
    const instanceId = templateManager.createInstance(
      template.id,
      `Relatório ${template.name}`,
      {}
    );
    const result = await templateManager.generateReport(instanceId);

    if (result.success) {
      alert('Relatório gerado com sucesso!');
    } else {
      alert('Erro ao gerar relatório: ' + result.error);
    }
  };

  if (showBuilder) {
    return (
      <TemplateBuilder
        template={selectedTemplate}
        onSave={handleSaveTemplate}
        onCancel={() => setShowBuilder(false)}
      />
    );
  }

  return (
    <div className='space-y-6'>
      <Flex justify='between' align='center'>
        <h2 className='text-2xl font-bold'>Sistema de Templates</h2>
        <Button onClick={handleCreateTemplate}>
          <FileText className='w-4 h-4 mr-2' />
          Criar Template
        </Button>
      </Flex>

      <Grid cols={1} md={2} lg={3} gap='md'>
        {templates.map(template => (
          <Card key={template.id} className='hover:shadow-lg transition-shadow'>
            <CardHeader>
              <Flex justify='between' align='center'>
                <h3 className='text-lg font-semibold'>{template.name}</h3>
                <span className='text-sm text-gray-500'>
                  {template.category}
                </span>
              </Flex>
            </CardHeader>
            <CardBody>
              <p className='text-gray-600 mb-4'>{template.description}</p>
              <p className='text-sm text-gray-500 mb-4'>
                {template.sections.length} seções • v{template.version}
              </p>

              <Flex gap='sm'>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => handleEditTemplate(template)}
                >
                  <Settings className='w-4 h-4 mr-1' />
                  Editar
                </Button>

                <Button
                  size='sm'
                  variant='primary'
                  onClick={() => handleGenerateReport(template)}
                >
                  <Download className='w-4 h-4 mr-1' />
                  Gerar
                </Button>
              </Flex>
            </CardBody>
          </Card>
        ))}
      </Grid>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function AdvancedFeaturesExample() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'permissions', label: 'Permissões', icon: Users },
    { id: 'integrations', label: 'Integrações', icon: Zap },
    { id: 'templates', label: 'Templates', icon: FileText },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdvancedDashboardExample />;
      case 'permissions':
        return <PermissionsExample />;
      case 'integrations':
        return <IntegrationsExample />;
      case 'templates':
        return <TemplatesExample />;
      default:
        return <AdvancedDashboardExample />;
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 py-8'>
      <Container size='xl'>
        <div className='mb-8'>
          <h1 className='text-4xl font-bold text-center mb-4'>
            Funcionalidades Avançadas
          </h1>
          <p className='text-center text-gray-600 dark:text-gray-400'>
            Demonstração das funcionalidades implementadas no sistema clínico
          </p>
        </div>

        {/* Tabs */}
        <div className='mb-8'>
          <div className='border-b border-gray-200 dark:border-gray-700'>
            <nav className='-mb-px flex space-x-8'>
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className='w-4 h-4 mr-2' />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        {renderContent()}
      </Container>
    </div>
  );
}
