import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Template, TemplateInstance, TemplateType } from '@/types/global';
import toast from 'react-hot-toast';

interface TemplateState {
  // Estado dos templates
  templates: Template[];
  instances: TemplateInstance[];

  // Estados de loading
  loading: boolean;
  error: string | null;

  // Filtros e busca
  searchQuery: string;
  selectedCategory: string;
  selectedType: TemplateType | 'all';

  // Métodos de templates
  loadTemplates: () => Promise<void>;
  createTemplate: (
    template: Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>
  ) => Promise<void>;
  updateTemplate: (id: string, updates: Partial<Template>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  duplicateTemplate: (id: string) => Promise<void>;

  // Métodos de instâncias
  createInstance: (
    templateId: string,
    data: Record<string, unknown>
  ) => Promise<void>;
  updateInstance: (
    id: string,
    updates: Partial<TemplateInstance>
  ) => Promise<void>;
  deleteInstance: (id: string) => Promise<void>;

  // Métodos de busca e filtro
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedType: (type: TemplateType | 'all') => void;
  getFilteredTemplates: () => Template[];

  // Métodos de categorias
  getCategories: () => string[];
  getTypes: () => TemplateType[];

  // Métodos de template específicos
  getTemplateById: (id: string) => Template | undefined;
  getInstancesByTemplate: (templateId: string) => TemplateInstance[];

  // Métodos de geração de conteúdo
  generateContent: (
    template: Template,
    data: Record<string, unknown>
  ) => string;
  validateTemplateData: (
    template: Template,
    data: Record<string, unknown>
  ) => { isValid: boolean; errors: string[] };

  // Métodos de importação/exportação
  exportTemplate: (id: string) => string;
  importTemplate: (templateData: string) => Promise<void>;

  // Reset
  resetTemplates: () => void;
}

// Templates padrão do sistema
const DEFAULT_TEMPLATES: Omit<
  Template,
  'id' | 'createdAt' | 'updatedAt' | 'usageCount'
>[] = [
  {
    name: 'Relatório de Agendamentos',
    description: 'Relatório padrão para agendamentos do dia',
    type: 'relatorio',
    category: 'Agendamentos',
    content: `
      <div class="relatorio">
        <h1>📋 Relatório de Agendamentos</h1>
        <p>Sistema de Gestão de Clínica</p>
        <p>Relatório gerado em: {{dataGeracao}}</p>
        <p>Usuário: {{usuarioNome}}</p>
        
        <div class="resumo">
          <h2>Resumo</h2>
          <p>Total de agendamentos: {{totalAgendamentos}}</p>
          <p>Agendados: {{agendados}}</p>
          <p>Confirmados: {{confirmados}}</p>
          <p>Realizados: {{realizados}}</p>
          <p>Cancelados: {{cancelados}}</p>
        </div>
        
        <table class="tabela-agendamentos">
          <thead>
            <tr>
              <th>Data</th>
              <th>Hora</th>
              <th>Paciente</th>
              <th>Profissional</th>
              <th>Serviço</th>
              <th>Status</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            {{#each agendamentos}}
            <tr>
              <td>{{data}}</td>
              <td>{{hora}}</td>
              <td>{{pacienteNome}}</td>
              <td>{{profissionalNome}}</td>
              <td>{{servicoNome}}</td>
              <td>{{status}}</td>
              <td>R$ {{valor}}</td>
            </tr>
            {{/each}}
          </tbody>
        </table>
        
        <div class="rodape">
          <p>Sistema de Gestão de Clínica - Relatório de Agendamentos</p>
          <p>Gerado em: {{dataGeracao}}</p>
          <p>Total de registros: {{totalAgendamentos}} itens</p>
        </div>
      </div>
    `,
    fields: [
      {
        id: 'dataGeracao',
        name: 'dataGeracao',
        label: 'Data de Geração',
        type: 'date',
        required: true,
        defaultValue: new Date().toISOString().split('T')[0],
      },
      {
        id: 'usuarioNome',
        name: 'usuarioNome',
        label: 'Nome do Usuário',
        type: 'text',
        required: true,
      },
      {
        id: 'totalAgendamentos',
        name: 'totalAgendamentos',
        label: 'Total de Agendamentos',
        type: 'number',
        required: true,
        defaultValue: 0,
      },
      {
        id: 'agendados',
        name: 'agendados',
        label: 'Agendados',
        type: 'number',
        required: true,
        defaultValue: 0,
      },
      {
        id: 'confirmados',
        name: 'confirmados',
        label: 'Confirmados',
        type: 'number',
        required: true,
        defaultValue: 0,
      },
      {
        id: 'realizados',
        name: 'realizados',
        label: 'Realizados',
        type: 'number',
        required: true,
        defaultValue: 0,
      },
      {
        id: 'cancelados',
        name: 'cancelados',
        label: 'Cancelados',
        type: 'number',
        required: true,
        defaultValue: 0,
      },
    ],
    variables: [
      'dataGeracao',
      'usuarioNome',
      'totalAgendamentos',
      'agendados',
      'confirmados',
      'realizados',
      'cancelados',
      'agendamentos',
    ],
    isActive: true,
    isPublic: true,
    createdBy: 'system',
    tags: ['relatório', 'agendamentos', 'padrão'],
  },
  {
    name: 'Formulário de Paciente',
    description: 'Formulário para cadastro de novos pacientes',
    type: 'formulario',
    category: 'Pacientes',
    content: `
      <form class="formulario-paciente">
        <h2>📝 Cadastro de Paciente</h2>
        
        <div class="campo">
          <label for="nome">Nome Completo *</label>
          <input type="text" id="nome" name="nome" value="{{nome}}" required>
        </div>
        
        <div class="campo">
          <label for="cpf">CPF *</label>
          <input type="text" id="cpf" name="cpf" value="{{cpf}}" required>
        </div>
        
        <div class="campo">
          <label for="telefone">Telefone *</label>
          <input type="tel" id="telefone" name="telefone" value="{{telefone}}" required>
        </div>
        
        <div class="campo">
          <label for="email">E-mail</label>
          <input type="email" id="email" name="email" value="{{email}}">
        </div>
        
        <div class="campo">
          <label for="dataNascimento">Data de Nascimento *</label>
          <input type="date" id="dataNascimento" name="dataNascimento" value="{{dataNascimento}}" required>
        </div>
        
        <div class="campo">
          <label for="genero">Gênero *</label>
          <select id="genero" name="genero" required>
            <option value="">Selecione</option>
            <option value="masculino" {{#if (eq genero "masculino")}}selected{{/if}}>Masculino</option>
            <option value="feminino" {{#if (eq genero "feminino")}}selected{{/if}}>Feminino</option>
            <option value="outro" {{#if (eq genero "outro")}}selected{{/if}}>Outro</option>
          </select>
        </div>
        
        <div class="campo">
          <label for="endereco">Endereço</label>
          <input type="text" id="endereco" name="endereco" value="{{endereco}}">
        </div>
        
        <div class="campo">
          <label for="observacoes">Observações</label>
          <textarea id="observacoes" name="observacoes" rows="3">{{observacoes}}</textarea>
        </div>
        
        <div class="acoes">
          <button type="submit">Salvar</button>
          <button type="button" onclick="limparFormulario()">Limpar</button>
        </div>
      </form>
    `,
    fields: [
      {
        id: 'nome',
        name: 'nome',
        label: 'Nome Completo',
        type: 'text',
        required: true,
        validation: { min: 3, max: 100 },
      },
      {
        id: 'cpf',
        name: 'cpf',
        label: 'CPF',
        type: 'text',
        required: true,
        validation: { pattern: '\\d{11}', message: 'CPF deve ter 11 dígitos' },
      },
      {
        id: 'telefone',
        name: 'telefone',
        label: 'Telefone',
        type: 'text',
        required: true,
      },
      {
        id: 'email',
        name: 'email',
        label: 'E-mail',
        type: 'text',
        required: false,
      },
      {
        id: 'dataNascimento',
        name: 'dataNascimento',
        label: 'Data de Nascimento',
        type: 'date',
        required: true,
      },
      {
        id: 'genero',
        name: 'genero',
        label: 'Gênero',
        type: 'select',
        required: true,
        options: [
          { value: 'masculino', label: 'Masculino' },
          { value: 'feminino', label: 'Feminino' },
          { value: 'outro', label: 'Outro' },
        ],
      },
      {
        id: 'endereco',
        name: 'endereco',
        label: 'Endereço',
        type: 'text',
        required: false,
      },
      {
        id: 'observacoes',
        name: 'observacoes',
        label: 'Observações',
        type: 'textarea',
        required: false,
      },
    ],
    variables: [
      'nome',
      'cpf',
      'telefone',
      'email',
      'dataNascimento',
      'genero',
      'endereco',
      'observacoes',
    ],
    isActive: true,
    isPublic: true,
    createdBy: 'system',
    tags: ['formulário', 'paciente', 'cadastro'],
  },
  {
    name: 'Mensagem WhatsApp - Lembrete',
    description: 'Template para lembrete de agendamento via WhatsApp',
    type: 'whatsapp',
    category: 'Comunicação',
    content: `
      🏥 *{{clinicaNome}}*
      
      Olá {{pacienteNome}}! 👋
      
      Este é um lembrete do seu agendamento:
      
      📅 *Data:* {{dataAgendamento}}
      🕐 *Horário:* {{horaAgendamento}}
      👨‍⚕️ *Profissional:* {{profissionalNome}}
      🏥 *Serviço:* {{servicoNome}}
      
      Por favor, confirme sua presença respondendo esta mensagem.
      
      Caso precise reagendar, entre em contato conosco.
      
      Obrigado pela confiança! 🙏
      
      📞 {{telefoneClinica}}
      🌐 {{siteClinica}}
    `,
    fields: [
      {
        id: 'clinicaNome',
        name: 'clinicaNome',
        label: 'Nome da Clínica',
        type: 'text',
        required: true,
        defaultValue: 'Sistema de Gestão de Clínica',
      },
      {
        id: 'pacienteNome',
        name: 'pacienteNome',
        label: 'Nome do Paciente',
        type: 'text',
        required: true,
      },
      {
        id: 'dataAgendamento',
        name: 'dataAgendamento',
        label: 'Data do Agendamento',
        type: 'date',
        required: true,
      },
      {
        id: 'horaAgendamento',
        name: 'horaAgendamento',
        label: 'Hora do Agendamento',
        type: 'text',
        required: true,
      },
      {
        id: 'profissionalNome',
        name: 'profissionalNome',
        label: 'Nome do Profissional',
        type: 'text',
        required: true,
      },
      {
        id: 'servicoNome',
        name: 'servicoNome',
        label: 'Nome do Serviço',
        type: 'text',
        required: true,
      },
      {
        id: 'telefoneClinica',
        name: 'telefoneClinica',
        label: 'Telefone da Clínica',
        type: 'text',
        required: false,
        defaultValue: '(11) 99999-9999',
      },
      {
        id: 'siteClinica',
        name: 'siteClinica',
        label: 'Site da Clínica',
        type: 'text',
        required: false,
        defaultValue: 'www.clinica.com.br',
      },
    ],
    variables: [
      'clinicaNome',
      'pacienteNome',
      'dataAgendamento',
      'horaAgendamento',
      'profissionalNome',
      'servicoNome',
      'telefoneClinica',
      'siteClinica',
    ],
    isActive: true,
    isPublic: true,
    createdBy: 'system',
    tags: ['whatsapp', 'lembrete', 'agendamento'],
  },
];

export const useTemplateStore = create<TemplateState>()(
  persist(
    (set, get) => ({
      templates: [],
      instances: [],
      loading: false,
      error: null,
      searchQuery: '',
      selectedCategory: 'all',
      selectedType: 'all',

      loadTemplates: async () => {
        try {
          set({ loading: true, error: null });

          // Carregar templates do localStorage
          const storedTemplates = localStorage.getItem('templates');
          const storedInstances = localStorage.getItem('template_instances');

          let templates: Template[];
          let instances: TemplateInstance[];

          if (storedTemplates) {
            templates = JSON.parse(storedTemplates);
          } else {
            // Inicializar com templates padrão
            templates = DEFAULT_TEMPLATES.map((template, index) => ({
              ...template,
              id: `template_${index + 1}`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              usageCount: 0,
            }));

            // Salvar templates padrão
            localStorage.setItem('templates', JSON.stringify(templates));
          }

          if (storedInstances) {
            instances = JSON.parse(storedInstances);
          } else {
            instances = [];
          }

          set({
            templates,
            instances,
            loading: false,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Erro ao carregar templates';
          set({ error: errorMessage, loading: false });
          console.error('Erro ao carregar templates:', error);
        }
      },

      createTemplate: async templateData => {
        try {
          const { templates } = get();

          const newTemplate: Template = {
            ...templateData,
            id: `template_${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            usageCount: 0,
          };

          const updatedTemplates = [...templates, newTemplate];
          set({ templates: updatedTemplates });
          localStorage.setItem('templates', JSON.stringify(updatedTemplates));

          toast.success('Template criado com sucesso!');
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Erro ao criar template';
          set({ error: errorMessage });
          toast.error(errorMessage);
        }
      },

      updateTemplate: async (id, updates) => {
        try {
          const { templates } = get();

          const updatedTemplates = templates.map(template =>
            template.id === id
              ? { ...template, ...updates, updatedAt: new Date().toISOString() }
              : template
          );

          set({ templates: updatedTemplates });
          localStorage.setItem('templates', JSON.stringify(updatedTemplates));

          toast.success('Template atualizado com sucesso!');
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Erro ao atualizar template';
          set({ error: errorMessage });
          toast.error(errorMessage);
        }
      },

      deleteTemplate: async id => {
        try {
          const { templates } = get();

          const updatedTemplates = templates.filter(
            template => template.id !== id
          );
          set({ templates: updatedTemplates });
          localStorage.setItem('templates', JSON.stringify(updatedTemplates));

          toast.success('Template excluído com sucesso!');
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Erro ao excluir template';
          set({ error: errorMessage });
          toast.error(errorMessage);
        }
      },

      duplicateTemplate: async id => {
        try {
          const { templates } = get();
          const originalTemplate = templates.find(t => t.id === id);

          if (!originalTemplate) {
            throw new Error('Template não encontrado');
          }

          const duplicatedTemplate: Template = {
            ...originalTemplate,
            id: `template_${Date.now()}`,
            name: `${originalTemplate.name} (Cópia)`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            usageCount: 0,
          };

          const updatedTemplates = [...templates, duplicatedTemplate];
          set({ templates: updatedTemplates });
          localStorage.setItem('templates', JSON.stringify(updatedTemplates));

          toast.success('Template duplicado com sucesso!');
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Erro ao duplicar template';
          set({ error: errorMessage });
          toast.error(errorMessage);
        }
      },

      createInstance: async (templateId, data) => {
        try {
          const { instances, templates } = get();
          const template = templates.find(t => t.id === templateId);

          if (!template) {
            throw new Error('Template não encontrado');
          }

          // Validar dados
          const validation = get().validateTemplateData(template, data);
          if (!validation.isValid) {
            throw new Error(`Dados inválidos: ${validation.errors.join(', ')}`);
          }

          // Gerar conteúdo
          const generatedContent = get().generateContent(template, data);

          const newInstance: TemplateInstance = {
            id: `instance_${Date.now()}`,
            templateId,
            name: `${template.name} - ${new Date().toLocaleDateString()}`,
            data,
            generatedContent,
            createdBy: 'current_user', // Em produção, usar ID do usuário logado
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const updatedInstances = [...instances, newInstance];
          set({ instances: updatedInstances });
          localStorage.setItem(
            'template_instances',
            JSON.stringify(updatedInstances)
          );

          // Incrementar contador de uso
          await get().updateTemplate(templateId, {
            usageCount: template.usageCount + 1,
          });

          toast.success('Instância criada com sucesso!');
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Erro ao criar instância';
          set({ error: errorMessage });
          toast.error(errorMessage);
        }
      },

      updateInstance: async (id, updates) => {
        try {
          const { instances } = get();

          const updatedInstances = instances.map(instance =>
            instance.id === id
              ? { ...instance, ...updates, updatedAt: new Date().toISOString() }
              : instance
          );

          set({ instances: updatedInstances });
          localStorage.setItem(
            'template_instances',
            JSON.stringify(updatedInstances)
          );

          toast.success('Instância atualizada com sucesso!');
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Erro ao atualizar instância';
          set({ error: errorMessage });
          toast.error(errorMessage);
        }
      },

      deleteInstance: async id => {
        try {
          const { instances } = get();

          const updatedInstances = instances.filter(
            instance => instance.id !== id
          );
          set({ instances: updatedInstances });
          localStorage.setItem(
            'template_instances',
            JSON.stringify(updatedInstances)
          );

          toast.success('Instância excluída com sucesso!');
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Erro ao excluir instância';
          set({ error: errorMessage });
          toast.error(errorMessage);
        }
      },

      setSearchQuery: query => set({ searchQuery: query }),
      setSelectedCategory: category => set({ selectedCategory: category }),
      setSelectedType: type => set({ selectedType: type }),

      getFilteredTemplates: () => {
        const { templates, searchQuery, selectedCategory, selectedType } =
          get();

        return templates.filter(template => {
          const matchesSearch =
            !searchQuery ||
            template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            template.tags.some(tag =>
              tag.toLowerCase().includes(searchQuery.toLowerCase())
            );

          const matchesCategory =
            selectedCategory === 'all' ||
            template.category === selectedCategory;
          const matchesType =
            selectedType === 'all' || template.type === selectedType;

          return matchesSearch && matchesCategory && matchesType;
        });
      },

      getCategories: () => {
        const { templates } = get();
        const categories = [...new Set(templates.map(t => t.category))];
        return categories.sort();
      },

      getTypes: () => {
        const { templates } = get();
        const types = [...new Set(templates.map(t => t.type))];
        return types.sort();
      },

      getTemplateById: id => {
        const { templates } = get();
        return templates.find(t => t.id === id);
      },

      getInstancesByTemplate: templateId => {
        const { instances } = get();
        return instances.filter(i => i.templateId === templateId);
      },

      generateContent: (template, data) => {
        let content = template.content;

        // Substituir variáveis simples {{variavel}}
        template.variables.forEach(variable => {
          const value = data[variable] || '';
          const regex = new RegExp(`{{${variable}}}`, 'g');
          content = content.replace(regex, String(value));
        });

        // Processar loops {{#each array}}...{{/each}}
        content = content.replace(
          /\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g,
          (_, arrayName, loopContent) => {
            const array = data[arrayName] as unknown[];
            if (!Array.isArray(array)) return '';

            return array
              .map(item => {
                let itemContent = loopContent;
                if (typeof item === 'object' && item !== null) {
                  Object.entries(item).forEach(([key, value]) => {
                    const regex = new RegExp(`{{${key}}}`, 'g');
                    itemContent = itemContent.replace(regex, String(value));
                  });
                }
                return itemContent;
              })
              .join('');
          }
        );

        // Processar condicionais {{#if condition}}...{{/if}}
        content = content.replace(
          /\{\{#if\s+\(eq\s+(\w+)\s+"([^"]+)"\)\s*\}\}([\s\S]*?)\{\{\/if\}\}/g,
          (_, variable, expectedValue, conditionalContent) => {
            const actualValue = data[variable];
            return actualValue === expectedValue ? conditionalContent : '';
          }
        );

        return content;
      },

      validateTemplateData: (template, data) => {
        const errors: string[] = [];

        template.fields.forEach(field => {
          const value = data[field.name];

          if (field.required && (!value || String(value).trim() === '')) {
            errors.push(`${field.label} é obrigatório`);
            return;
          }

          if (value && field.validation) {
            const stringValue = String(value);

            if (
              field.validation.min &&
              stringValue.length < field.validation.min
            ) {
              errors.push(
                `${field.label} deve ter pelo menos ${field.validation.min} caracteres`
              );
            }

            if (
              field.validation.max &&
              stringValue.length > field.validation.max
            ) {
              errors.push(
                `${field.label} deve ter no máximo ${field.validation.max} caracteres`
              );
            }

            if (field.validation.pattern) {
              const regex = new RegExp(field.validation.pattern);
              if (!regex.test(stringValue)) {
                errors.push(
                  field.validation.message ||
                    `${field.label} tem formato inválido`
                );
              }
            }
          }
        });

        return {
          isValid: errors.length === 0,
          errors,
        };
      },

      exportTemplate: id => {
        const { templates } = get();
        const template = templates.find(t => t.id === id);

        if (!template) {
          throw new Error('Template não encontrado');
        }

        return JSON.stringify(template, null, 2);
      },

      importTemplate: async templateData => {
        try {
          const template = JSON.parse(templateData) as Template;

          // Validar estrutura do template
          if (!template.name || !template.type || !template.content) {
            throw new Error('Template inválido: campos obrigatórios ausentes');
          }

          // Gerar novo ID
          template.id = `template_${Date.now()}`;
          template.createdAt = new Date().toISOString();
          template.updatedAt = new Date().toISOString();
          template.usageCount = 0;

          await get().createTemplate(template);
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Erro ao importar template';
          set({ error: errorMessage });
          toast.error(errorMessage);
        }
      },

      resetTemplates: () => {
        set({
          templates: [],
          instances: [],
          loading: false,
          error: null,
          searchQuery: '',
          selectedCategory: 'all',
          selectedType: 'all',
        });
      },
    }),
    {
      name: 'template-storage',
      partialize: () => ({
        // Não persistir estados temporários
      }),
    }
  )
);
