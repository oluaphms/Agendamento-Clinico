// ============================================================================
// SISTEMA DE TEMPLATES PARA RELATÓRIOS
// ============================================================================
// Sistema para criação e gerenciamento de templates de relatórios
// ============================================================================

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export interface TemplateField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect' | 'textarea';
  label: string;
  required: boolean;
  defaultValue?: any;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  placeholder?: string;
  helpText?: string;
}

export interface TemplateSection {
  id: string;
  name: string;
  title: string;
  description?: string;
  fields: TemplateField[];
  order: number;
  collapsible?: boolean;
  collapsed?: boolean;
}

export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  category: 'appointments' | 'patients' | 'financial' | 'reports' | 'custom';
  version: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  sections: TemplateSection[];
  settings: {
    orientation: 'portrait' | 'landscape';
    pageSize: 'A4' | 'A3' | 'Letter';
    margins: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
    header?: {
      enabled: boolean;
      content: string;
      height: number;
    };
    footer?: {
      enabled: boolean;
      content: string;
      height: number;
    };
  };
  dataSource: {
    type: 'query' | 'api' | 'static';
    query?: string;
    apiEndpoint?: string;
    staticData?: any[];
  };
  styling: {
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
    colors: {
      primary: string;
      secondary: string;
      text: string;
      background: string;
    };
  };
}

export interface TemplateInstance {
  id: string;
  templateId: string;
  name: string;
  data: Record<string, any>;
  status: 'draft' | 'ready' | 'generating' | 'completed' | 'error';
  createdAt: Date;
  updatedAt: Date;
  generatedAt?: Date;
  filePath?: string;
  error?: string;
}

export interface TemplateData {
  [key: string]: any;
}

// ============================================================================
// TEMPLATES PREDEFINIDOS
// ============================================================================

export const PREDEFINED_TEMPLATES: TemplateConfig[] = [
  {
    id: 'appointment-report',
    name: 'Relatório de Consultas',
    description: 'Relatório detalhado de consultas por período',
    category: 'appointments',
    version: '1.0.0',
    author: 'Sistema Clínico',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    sections: [
      {
        id: 'filters',
        name: 'Filtros',
        title: 'Filtros do Relatório',
        description: 'Configure os filtros para o relatório',
        order: 1,
        fields: [
          {
            id: 'date_range',
            name: 'dateRange',
            type: 'select',
            label: 'Período',
            required: true,
            options: [
              { value: 'today', label: 'Hoje' },
              { value: 'week', label: 'Esta Semana' },
              { value: 'month', label: 'Este Mês' },
              { value: 'quarter', label: 'Este Trimestre' },
              { value: 'year', label: 'Este Ano' },
              { value: 'custom', label: 'Período Personalizado' },
            ],
          },
          {
            id: 'start_date',
            name: 'startDate',
            type: 'date',
            label: 'Data Inicial',
            required: false,
          },
          {
            id: 'end_date',
            name: 'endDate',
            type: 'date',
            label: 'Data Final',
            required: false,
          },
          {
            id: 'professional',
            name: 'professional',
            type: 'select',
            label: 'Profissional',
            required: false,
            options: [],
          },
          {
            id: 'status',
            name: 'status',
            type: 'multiselect',
            label: 'Status da Consulta',
            required: false,
            options: [
              { value: 'agendado', label: 'Agendado' },
              { value: 'confirmado', label: 'Confirmado' },
              { value: 'em_andamento', label: 'Em Andamento' },
              { value: 'concluido', label: 'Concluído' },
              { value: 'cancelado', label: 'Cancelado' },
            ],
          },
        ],
      },
      {
        id: 'display_options',
        name: 'displayOptions',
        title: 'Opções de Exibição',
        description: 'Configure como os dados serão exibidos',
        order: 2,
        fields: [
          {
            id: 'group_by',
            name: 'groupBy',
            type: 'select',
            label: 'Agrupar por',
            required: false,
            options: [
              { value: 'none', label: 'Não agrupar' },
              { value: 'professional', label: 'Profissional' },
              { value: 'date', label: 'Data' },
              { value: 'status', label: 'Status' },
            ],
          },
          {
            id: 'include_patient_details',
            name: 'includePatientDetails',
            type: 'boolean',
            label: 'Incluir detalhes do paciente',
            required: false,
            defaultValue: true,
          },
          {
            id: 'include_notes',
            name: 'includeNotes',
            type: 'boolean',
            label: 'Incluir observações',
            required: false,
            defaultValue: false,
          },
        ],
      },
    ],
    settings: {
      orientation: 'portrait',
      pageSize: 'A4',
      margins: { top: 20, right: 20, bottom: 20, left: 20 },
      header: {
        enabled: true,
        content: 'Relatório de Consultas - {{clinicName}}',
        height: 30,
      },
      footer: {
        enabled: true,
        content: 'Página {{page}} de {{totalPages}} - Gerado em {{generatedAt}}',
        height: 20,
      },
    },
    dataSource: {
      type: 'query',
      query: `
        SELECT 
          a.id,
          a.data_agendamento,
          a.hora_inicio,
          a.hora_fim,
          a.status,
          a.observacoes,
          p.nome as paciente_nome,
          p.cpf as paciente_cpf,
          p.telefone as paciente_telefone,
          pr.nome as profissional_nome,
          pr.especialidade as profissional_especialidade
        FROM agendamentos a
        LEFT JOIN pacientes p ON a.paciente_id = p.id
        LEFT JOIN profissionais pr ON a.profissional_id = pr.id
        WHERE a.data_agendamento BETWEEN :startDate AND :endDate
        ORDER BY a.data_agendamento, a.hora_inicio
      `,
    },
    styling: {
      fontFamily: 'Arial',
      fontSize: 12,
      lineHeight: 1.5,
      colors: {
        primary: '#2563eb',
        secondary: '#64748b',
        text: '#1f2937',
        background: '#ffffff',
      },
    },
  },
  {
    id: 'patient-report',
    name: 'Relatório de Pacientes',
    description: 'Relatório de cadastro e informações dos pacientes',
    category: 'patients',
    version: '1.0.0',
    author: 'Sistema Clínico',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    sections: [
      {
        id: 'filters',
        name: 'filters',
        title: 'Filtros do Relatório',
        order: 1,
        fields: [
          {
            id: 'age_range',
            name: 'ageRange',
            type: 'select',
            label: 'Faixa Etária',
            required: false,
            options: [
              { value: 'all', label: 'Todas as idades' },
              { value: '0-17', label: '0-17 anos' },
              { value: '18-30', label: '18-30 anos' },
              { value: '31-50', label: '31-50 anos' },
              { value: '51-70', label: '51-70 anos' },
              { value: '70+', label: '70+ anos' },
            ],
          },
          {
            id: 'gender',
            name: 'gender',
            type: 'select',
            label: 'Gênero',
            required: false,
            options: [
              { value: 'all', label: 'Todos' },
              { value: 'M', label: 'Masculino' },
              { value: 'F', label: 'Feminino' },
              { value: 'O', label: 'Outro' },
            ],
          },
          {
            id: 'registration_date',
            name: 'registrationDate',
            type: 'date',
            label: 'Data de Cadastro',
            required: false,
          },
        ],
      },
    ],
    settings: {
      orientation: 'portrait',
      pageSize: 'A4',
      margins: { top: 20, right: 20, bottom: 20, left: 20 },
    },
    dataSource: {
      type: 'query',
      query: `
        SELECT 
          p.id,
          p.nome,
          p.cpf,
          p.rg,
          p.data_nascimento,
          p.sexo,
          p.telefone,
          p.email,
          p.endereco,
          p.cidade,
          p.estado,
          p.cep,
          p.created_at as data_cadastro
        FROM pacientes p
        ORDER BY p.nome
      `,
    },
    styling: {
      fontFamily: 'Arial',
      fontSize: 12,
      lineHeight: 1.5,
      colors: {
        primary: '#2563eb',
        secondary: '#64748b',
        text: '#1f2937',
        background: '#ffffff',
      },
    },
  },
  {
    id: 'financial-report',
    name: 'Relatório Financeiro',
    description: 'Relatório de receitas e despesas',
    category: 'financial',
    version: '1.0.0',
    author: 'Sistema Clínico',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    sections: [
      {
        id: 'filters',
        name: 'filters',
        title: 'Filtros do Relatório',
        order: 1,
        fields: [
          {
            id: 'period',
            name: 'period',
            type: 'select',
            label: 'Período',
            required: true,
            options: [
              { value: 'month', label: 'Mensal' },
              { value: 'quarter', label: 'Trimestral' },
              { value: 'year', label: 'Anual' },
            ],
          },
          {
            id: 'include_charts',
            name: 'includeCharts',
            type: 'boolean',
            label: 'Incluir gráficos',
            required: false,
            defaultValue: true,
          },
        ],
      },
    ],
    settings: {
      orientation: 'landscape',
      pageSize: 'A4',
      margins: { top: 20, right: 20, bottom: 20, left: 20 },
    },
    dataSource: {
      type: 'query',
      query: `
        SELECT 
          DATE_TRUNC('month', data_pagamento) as mes,
          SUM(valor) as total_receita,
          COUNT(*) as total_pagamentos,
          AVG(valor) as ticket_medio
        FROM pagamentos
        WHERE status = 'pago'
        GROUP BY DATE_TRUNC('month', data_pagamento)
        ORDER BY mes
      `,
    },
    styling: {
      fontFamily: 'Arial',
      fontSize: 12,
      lineHeight: 1.5,
      colors: {
        primary: '#2563eb',
        secondary: '#64748b',
        text: '#1f2937',
        background: '#ffffff',
      },
    },
  },
];

// ============================================================================
// CLASSE DE GERENCIAMENTO DE TEMPLATES
// ============================================================================

export class TemplateManager {
  private templates: Map<string, TemplateConfig> = new Map();
  private instances: Map<string, TemplateInstance> = new Map();

  constructor() {
    this.initializePredefinedTemplates();
  }

  // ============================================================================
  // INICIALIZAÇÃO
  // ============================================================================
  
  private initializePredefinedTemplates(): void {
    PREDEFINED_TEMPLATES.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  // ============================================================================
  // GERENCIAMENTO DE TEMPLATES
  // ============================================================================
  
  getTemplate(id: string): TemplateConfig | undefined {
    return this.templates.get(id);
  }

  getAllTemplates(): TemplateConfig[] {
    return Array.from(this.templates.values());
  }

  getTemplatesByCategory(category: string): TemplateConfig[] {
    return this.getAllTemplates().filter(template => template.category === category);
  }

  createTemplate(template: TemplateConfig): void {
    this.templates.set(template.id, template);
  }

  updateTemplate(id: string, updates: Partial<TemplateConfig>): boolean {
    const template = this.templates.get(id);
    if (!template) return false;

    const updatedTemplate = {
      ...template,
      ...updates,
      updatedAt: new Date(),
    };

    this.templates.set(id, updatedTemplate);
    return true;
  }

  deleteTemplate(id: string): boolean {
    return this.templates.delete(id);
  }

  // ============================================================================
  // GERENCIAMENTO DE INSTÂNCIAS
  // ============================================================================
  
  createInstance(templateId: string, name: string, data: TemplateData): string {
    const instanceId = `instance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const instance: TemplateInstance = {
      id: instanceId,
      templateId,
      name,
      data,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.instances.set(instanceId, instance);
    return instanceId;
  }

  getInstance(id: string): TemplateInstance | undefined {
    return this.instances.get(id);
  }

  getAllInstances(): TemplateInstance[] {
    return Array.from(this.instances.values());
  }

  updateInstance(id: string, updates: Partial<TemplateInstance>): boolean {
    const instance = this.instances.get(id);
    if (!instance) return false;

    const updatedInstance = {
      ...instance,
      ...updates,
      updatedAt: new Date(),
    };

    this.instances.set(id, updatedInstance);
    return true;
  }

  deleteInstance(id: string): boolean {
    return this.instances.delete(id);
  }

  // ============================================================================
  // GERAÇÃO DE RELATÓRIOS
  // ============================================================================
  
  async generateReport(instanceId: string): Promise<{ success: boolean; filePath?: string; error?: string }> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      return { success: false, error: 'Instância não encontrada' };
    }

    const template = this.templates.get(instance.templateId);
    if (!template) {
      return { success: false, error: 'Template não encontrado' };
    }

    try {
      // Atualizar status para gerando
      this.updateInstance(instanceId, { status: 'generating' });

      // Buscar dados baseado na configuração do template
      const data = await this.fetchTemplateData(template, instance.data);

      // Gerar o relatório
      const filePath = await this.renderTemplate(template, data, instance.data);

      // Atualizar instância com sucesso
      this.updateInstance(instanceId, {
        status: 'completed',
        generatedAt: new Date(),
        filePath,
      });

      return { success: true, filePath };
    } catch (error) {
      // Atualizar instância com erro
      this.updateInstance(instanceId, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });

      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }

  // ============================================================================
  // MÉTODOS AUXILIARES
  // ============================================================================
  
  private async fetchTemplateData(template: TemplateConfig, instanceData: TemplateData): Promise<any[]> {
    switch (template.dataSource.type) {
      case 'query':
        // Em produção, executaria a query no banco de dados
        return this.executeQuery(template.dataSource.query!, instanceData);
      case 'api':
        // Em produção, faria uma chamada para a API
        return this.callAPI(template.dataSource.apiEndpoint!, instanceData);
      case 'static':
        return template.dataSource.staticData || [];
      default:
        return [];
    }
  }

  private async executeQuery(query: string, params: Record<string, any>): Promise<any[]> {
    // Simular execução de query
    // Em produção, isso seria executado no banco de dados
    console.log('Executando query:', query, 'com parâmetros:', params);
    return [];
  }

  private async callAPI(endpoint: string, params: Record<string, any>): Promise<any[]> {
    // Simular chamada para API
    // Em produção, isso faria uma requisição HTTP
    console.log('Chamando API:', endpoint, 'com parâmetros:', params);
    return [];
  }

  private async renderTemplate(template: TemplateConfig, data: any[], instanceData: TemplateData): Promise<string> {
    // Simular renderização do template
    // Em produção, isso usaria uma biblioteca como Handlebars ou similar
    console.log('Renderizando template:', template.name, 'com dados:', data);
    
    // Gerar nome do arquivo
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${template.name}_${timestamp}.pdf`;
    
    return `/reports/${fileName}`;
  }

  // ============================================================================
  // VALIDAÇÃO DE DADOS
  // ============================================================================
  
  validateTemplateData(template: TemplateConfig, data: TemplateData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    template.sections.forEach(section => {
      section.fields.forEach(field => {
        const value = data[field.name];

        // Verificar campos obrigatórios
        if (field.required && (value === undefined || value === null || value === '')) {
          errors.push(`Campo '${field.label}' é obrigatório`);
          return;
        }

        // Verificar validações específicas
        if (value !== undefined && value !== null && value !== '') {
          if (field.validation) {
            if (field.type === 'number') {
              const numValue = Number(value);
              if (field.validation.min !== undefined && numValue < field.validation.min) {
                errors.push(`Campo '${field.label}' deve ser maior ou igual a ${field.validation.min}`);
              }
              if (field.validation.max !== undefined && numValue > field.validation.max) {
                errors.push(`Campo '${field.label}' deve ser menor ou igual a ${field.validation.max}`);
              }
            }

            if (field.validation.pattern) {
              const regex = new RegExp(field.validation.pattern);
              if (!regex.test(String(value))) {
                errors.push(field.validation.message || `Campo '${field.label}' tem formato inválido`);
              }
            }
          }
        }
      });
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// ============================================================================
// INSTÂNCIA GLOBAL
// ============================================================================

export const templateManager = new TemplateManager();

// ============================================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================================

/**
 * Cria um novo template personalizado
 */
export function createCustomTemplate(
  name: string,
  description: string,
  category: TemplateConfig['category'],
  sections: TemplateSection[]
): TemplateConfig {
  const id = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id,
    name,
    description,
    category,
    version: '1.0.0',
    author: 'Usuário',
    createdAt: new Date(),
    updatedAt: new Date(),
    sections,
    settings: {
      orientation: 'portrait',
      pageSize: 'A4',
      margins: { top: 20, right: 20, bottom: 20, left: 20 },
    },
    dataSource: {
      type: 'static',
      staticData: [],
    },
    styling: {
      fontFamily: 'Arial',
      fontSize: 12,
      lineHeight: 1.5,
      colors: {
        primary: '#2563eb',
        secondary: '#64748b',
        text: '#1f2937',
        background: '#ffffff',
      },
    },
  };
}

/**
 * Exporta um template para JSON
 */
export function exportTemplate(template: TemplateConfig): string {
  return JSON.stringify(template, null, 2);
}

/**
 * Importa um template de JSON
 */
export function importTemplate(json: string): TemplateConfig | null {
  try {
    const template = JSON.parse(json);
    
    // Validar estrutura básica
    if (!template.id || !template.name || !template.sections) {
      return null;
    }

    return template;
  } catch {
    return null;
  }
}
