import { useTemplateStore } from '@/stores/templateStore';
import { Template, TemplateInstance, TemplateType } from '@/types/global';

/**
 * Hook para facilitar o uso de templates no sistema
 */
export const useTemplates = () => {
  const {
    templates,
    instances,
    loading,
    error,
    loadTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    createInstance,
    updateInstance,
    deleteInstance,
    getTemplateById,
    getInstancesByTemplate,
    generateContent,
    validateTemplateData,
    exportTemplate,
    importTemplate,
  } = useTemplateStore();

  /**
   * Busca templates por tipo
   */
  const getTemplatesByType = (type: TemplateType): Template[] => {
    return templates.filter(
      template => template.type === type && template.isActive
    );
  };

  /**
   * Busca templates por categoria
   */
  const getTemplatesByCategory = (category: string): Template[] => {
    return templates.filter(
      template => template.category === category && template.isActive
    );
  };

  /**
   * Busca templates públicos
   */
  const getPublicTemplates = (): Template[] => {
    return templates.filter(template => template.isPublic && template.isActive);
  };

  /**
   * Busca templates do usuário atual
   */
  const getUserTemplates = (): Template[] => {
    return templates.filter(
      template => template.createdBy === 'current_user' && template.isActive
    );
  };

  /**
   * Cria um template de relatório padrão
   */
  const createReportTemplate = async (data: {
    name: string;
    description: string;
    category: string;
    content: string;
    fields: Array<{
      name: string;
      label: string;
      type: 'text' | 'number' | 'date' | 'select' | 'textarea';
      required?: boolean;
      defaultValue?: unknown;
      options?: Array<{ value: string; label: string }>;
    }>;
    tags?: string[];
  }): Promise<void> => {
    const template = {
      name: data.name,
      description: data.description,
      type: 'relatorio' as TemplateType,
      category: data.category,
      content: data.content,
      fields: data.fields.map(field => ({
        id: `field_${Date.now()}_${Math.random()}`,
        name: field.name,
        label: field.label,
        type: field.type,
        required: field.required || false,
        defaultValue: field.defaultValue,
        options: field.options,
        validation: undefined,
      })),
      variables: extractVariables(data.content),
      isActive: true,
      isPublic: false,
      createdBy: 'current_user',
      tags: data.tags || [],
    };

    await createTemplate(template);
  };

  /**
   * Cria um template de formulário padrão
   */
  const createFormTemplate = async (data: {
    name: string;
    description: string;
    category: string;
    content: string;
    fields: Array<{
      name: string;
      label: string;
      type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'boolean';
      required?: boolean;
      defaultValue?: unknown;
      options?: Array<{ value: string; label: string }>;
      validation?: {
        min?: number;
        max?: number;
        pattern?: string;
        message?: string;
      };
    }>;
    tags?: string[];
  }): Promise<void> => {
    const template = {
      name: data.name,
      description: data.description,
      type: 'formulario' as TemplateType,
      category: data.category,
      content: data.content,
      fields: data.fields.map(field => ({
        id: `field_${Date.now()}_${Math.random()}`,
        name: field.name,
        label: field.label,
        type: field.type,
        required: field.required || false,
        defaultValue: field.defaultValue,
        options: field.options,
        validation: field.validation,
      })),
      variables: extractVariables(data.content),
      isActive: true,
      isPublic: false,
      createdBy: 'current_user',
      tags: data.tags || [],
    };

    await createTemplate(template);
  };

  /**
   * Cria um template de mensagem (WhatsApp, SMS, Email)
   */
  const createMessageTemplate = async (data: {
    name: string;
    description: string;
    type: 'whatsapp' | 'sms' | 'email';
    category: string;
    content: string;
    fields: Array<{
      name: string;
      label: string;
      type: 'text' | 'number' | 'date' | 'select';
      required?: boolean;
      defaultValue?: unknown;
      options?: Array<{ value: string; label: string }>;
    }>;
    tags?: string[];
  }): Promise<void> => {
    const template = {
      name: data.name,
      description: data.description,
      type: data.type as TemplateType,
      category: data.category,
      content: data.content,
      fields: data.fields.map(field => ({
        id: `field_${Date.now()}_${Math.random()}`,
        name: field.name,
        label: field.label,
        type: field.type,
        required: field.required || false,
        defaultValue: field.defaultValue,
        options: field.options,
        validation: undefined,
      })),
      variables: extractVariables(data.content),
      isActive: true,
      isPublic: false,
      createdBy: 'current_user',
      tags: data.tags || [],
    };

    await createTemplate(template);
  };

  /**
   * Gera uma instância de template com dados específicos
   */
  const generateTemplateInstance = async (
    templateId: string,
    data: Record<string, unknown>,
    instanceName?: string
  ): Promise<TemplateInstance> => {
    const template = getTemplateById(templateId);
    if (!template) {
      throw new Error('Template não encontrado');
    }

    // Validar dados
    const validation = validateTemplateData(template, data);
    if (!validation.isValid) {
      throw new Error(`Dados inválidos: ${validation.errors.join(', ')}`);
    }

    // Gerar conteúdo
    const generatedContent = generateContent(template, data);

    // Criar instância
    await createInstance(templateId, data);

    // Retornar a instância criada (simulado)
    return {
      id: `instance_${Date.now()}`,
      templateId,
      name:
        instanceName || `${template.name} - ${new Date().toLocaleDateString()}`,
      data,
      generatedContent,
      createdBy: 'current_user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  /**
   * Gera relatório de agendamentos
   */
  const generateAppointmentsReport = async (data: {
    dataInicio: string;
    dataFim: string;
    profissionalId?: string;
    status?: string;
    agendamentos: Array<{
      id: number;
      data: string;
      hora: string;
      pacienteNome: string;
      profissionalNome: string;
      servicoNome: string;
      status: string;
      valor: number;
    }>;
  }): Promise<string> => {
    const reportTemplate = getTemplatesByType('relatorio').find(
      t => t.category === 'Agendamentos' && t.name.includes('Agendamentos')
    );

    if (!reportTemplate) {
      throw new Error('Template de relatório de agendamentos não encontrado');
    }

    const reportData = {
      dataGeracao: new Date().toLocaleString(),
      usuarioNome: 'Usuário Atual', // Em produção, usar nome do usuário logado
      dataInicio: data.dataInicio,
      dataFim: data.dataFim,
      totalAgendamentos: data.agendamentos.length,
      agendados: data.agendamentos.filter(a => a.status === 'Agendado').length,
      confirmados: data.agendamentos.filter(a => a.status === 'Confirmado')
        .length,
      realizados: data.agendamentos.filter(a => a.status === 'Realizado')
        .length,
      cancelados: data.agendamentos.filter(a => a.status === 'Cancelado')
        .length,
      agendamentos: data.agendamentos,
    };

    return generateContent(reportTemplate, reportData);
  };

  /**
   * Gera mensagem de lembrete de agendamento
   */
  const generateAppointmentReminder = async (data: {
    pacienteNome: string;
    dataAgendamento: string;
    horaAgendamento: string;
    profissionalNome: string;
    servicoNome: string;
    telefoneClinica?: string;
    siteClinica?: string;
  }): Promise<string> => {
    const messageTemplate = getTemplatesByType('whatsapp').find(
      t => t.name.includes('Lembrete') || t.category === 'Comunicação'
    );

    if (!messageTemplate) {
      throw new Error('Template de lembrete não encontrado');
    }

    const messageData = {
      clinicaNome: 'Sistema de Gestão de Clínica',
      pacienteNome: data.pacienteNome,
      dataAgendamento: data.dataAgendamento,
      horaAgendamento: data.horaAgendamento,
      profissionalNome: data.profissionalNome,
      servicoNome: data.servicoNome,
      telefoneClinica: data.telefoneClinica || '(11) 99999-9999',
      siteClinica: data.siteClinica || 'www.clinica.com.br',
    };

    return generateContent(messageTemplate, messageData);
  };

  /**
   * Exporta template como arquivo
   */
  const exportTemplateToFile = (templateId: string, filename?: string) => {
    try {
      const data = exportTemplate(templateId);
      const template = getTemplateById(templateId);
      const fileName =
        filename ||
        `template_${template?.name.replace(/\s+/g, '_') || templateId}.json`;

      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar template:', error);
      throw error;
    }
  };

  /**
   * Importa template de arquivo
   */
  const importTemplateFromFile = async (file: File): Promise<void> => {
    try {
      const text = await file.text();
      await importTemplate(text);
    } catch (error) {
      console.error('Erro ao importar template:', error);
      throw error;
    }
  };

  /**
   * Extrai variáveis de um conteúdo de template
   */
  const extractVariables = (content: string): string[] => {
    const variables = new Set<string>();
    const regex = /\{\{([^}]+)\}\}/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
      const variable = match[1].trim();
      // Ignorar helpers do Handlebars como #each, #if, etc.
      if (!variable.startsWith('#') && !variable.startsWith('/')) {
        variables.add(variable);
      }
    }

    return Array.from(variables);
  };

  return {
    // Estado
    templates,
    instances,
    loading,
    error,

    // Métodos básicos
    loadTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    createInstance,
    updateInstance,
    deleteInstance,
    getTemplateById,
    getInstancesByTemplate,
    generateContent,
    validateTemplateData,
    exportTemplate,
    importTemplate,

    // Métodos de busca
    getTemplatesByType,
    getTemplatesByCategory,
    getPublicTemplates,
    getUserTemplates,

    // Métodos de criação específicos
    createReportTemplate,
    createFormTemplate,
    createMessageTemplate,

    // Métodos de geração
    generateTemplateInstance,
    generateAppointmentsReport,
    generateAppointmentReminder,

    // Métodos de importação/exportação
    exportTemplateToFile,
    importTemplateFromFile,

    // Utilitários
    extractVariables,

    // Estatísticas
    totalTemplates: templates.length,
    totalInstances: instances.length,
    activeTemplates: templates.filter(t => t.isActive).length,
    publicTemplates: templates.filter(t => t.isPublic).length,
  };
};
