// ============================================================================
// COMPONENTE: TemplateBuilder - Construtor de Templates
// ============================================================================
// Interface para criar e editar templates de relatórios
// ============================================================================

import React, { useState, useCallback } from 'react';
// import { motion } from 'framer-motion';
import { Card, CardHeader, CardBody, Button, Input } from '@/components/UI';
import { Container, Grid, Flex } from '@/components/UI';
import { useForm } from '@/hooks';
import { TemplateConfig, TemplateSection } from '@/lib/templates';

// Definindo tipo local para TemplateField
interface TemplateField {
  id: string;
  name: string;
  type:
    | 'text'
    | 'number'
    | 'boolean'
    | 'select'
    | 'textarea'
    | 'image'
    | 'date';
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  label: string;
  defaultValue?: unknown;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}
import { Plus, Trash2, Edit, Save, Eye } from 'lucide-react';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

interface TemplateBuilderProps {
  template?: TemplateConfig;
  onSave?: (template: TemplateConfig) => void;
  onCancel?: () => void;
  className?: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const TemplateBuilder: React.FC<TemplateBuilderProps> = ({
  template,
  onSave,
  onCancel,
  className = '',
}) => {
  // ============================================================================
  // ESTADO LOCAL
  // ============================================================================

  const [sections, setSections] = useState<TemplateSection[]>(
    template?.sections || [
      {
        id: 'section_1',
        name: 'section1',
        title: 'Seção 1',
        description: '',
        fields: [],
        order: 1,
        collapsible: false,
        collapsed: false,
      },
    ]
  );

  const [activeSection, setActiveSection] = useState<string>('section_1');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // ============================================================================
  // FORMULÁRIO PRINCIPAL
  // ============================================================================

  const { values, errors, handleChange, handleBlur, handleSubmit } = useForm({
    initialValues: {
      name: template?.name || '',
      description: template?.description || '',
      category: template?.category || 'custom',
    },
    validationRules: {
      name: { required: true, minLength: 3 },
      description: { required: true, minLength: 10 },
    },
    onSubmit: async values => {
      const templateConfig: TemplateConfig = {
        id: template?.id || `template_${Date.now()}`,
        name: values.name,
        description: values.description,
        category: values.category as TemplateConfig['category'],
        version: template?.version || '1.0.0',
        author: template?.author || 'Usuário',
        createdAt: template?.createdAt || new Date(),
        updatedAt: new Date(),
        sections: sections.sort((a, b) => a.order - b.order),
        settings: template?.settings || {
          orientation: 'portrait',
          pageSize: 'A4',
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
        },
        dataSource: template?.dataSource || {
          type: 'static',
          staticData: [],
        },
        styling: template?.styling || {
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

      onSave?.(templateConfig);
    },
  });

  // ============================================================================
  // HANDLERS DE SEÇÕES
  // ============================================================================

  const addSection = useCallback(() => {
    const newSection: TemplateSection = {
      id: `section_${Date.now()}`,
      name: `section${sections.length + 1}`,
      title: `Seção ${sections.length + 1}`,
      description: '',
      fields: [],
      order: sections.length + 1,
      collapsible: false,
      collapsed: false,
    };

    setSections(prev => [...prev, newSection]);
    setActiveSection(newSection.id);
  }, [sections.length]);

  const updateSection = useCallback(
    (sectionId: string, updates: Partial<TemplateSection>) => {
      setSections(prev =>
        prev.map(section =>
          section.id === sectionId ? { ...section, ...updates } : section
        )
      );
    },
    []
  );

  const deleteSection = useCallback(
    (sectionId: string) => {
      setSections(prev => {
        const newSections = prev.filter(section => section.id !== sectionId);
        if (activeSection === sectionId && newSections.length > 0) {
          setActiveSection(newSections[0].id);
        }
        return newSections;
      });
    },
    [activeSection]
  );

  // const moveSection = useCallback(
  //   (sectionId: string, direction: 'up' | 'down') => {
  //     setSections(prev => {
  //       const index = prev.findIndex(section => section.id === sectionId);
  //       if (index === -1) return prev;

  //       const newSections = [...prev];
  //       const targetIndex = direction === 'up' ? index - 1 : index + 1;

  //       if (targetIndex >= 0 && targetIndex < newSections.length) {
  //         [newSections[index], newSections[targetIndex]] = [
  //           newSections[targetIndex],
  //           newSections[index],
  //         ];
  //         newSections[index].order = index + 1;
  //         newSections[targetIndex].order = targetIndex + 1;
  //       }

  //       return newSections;
  //     });
  //   },
  //   []
  // );

  // ============================================================================
  // HANDLERS DE CAMPOS
  // ============================================================================

  const addField = useCallback(
    (sectionId: string) => {
      const section = sections.find(s => s.id === sectionId);
      if (!section) return;

      const newField: TemplateField = {
        id: `field_${Date.now()}`,
        name: `field${section.fields.length + 1}`,
        type: 'text',
        label: `Campo ${section.fields.length + 1}`,
        required: false,
      };

      updateSection(sectionId, {
        fields: [...section.fields, newField],
      });
    },
    [sections, updateSection]
  );

  const updateField = useCallback(
    (sectionId: string, fieldId: string, updates: Partial<TemplateField>) => {
      updateSection(sectionId, {
        fields:
          sections
            .find(s => s.id === sectionId)
            ?.fields.map(field =>
              field.id === fieldId ? { ...field, ...updates } : field
            ) || [],
      });
    },
    [sections, updateSection]
  );

  const deleteField = useCallback(
    (sectionId: string, fieldId: string) => {
      updateSection(sectionId, {
        fields:
          sections
            .find(s => s.id === sectionId)
            ?.fields.filter(field => field.id !== fieldId) || [],
      });
    },
    [sections, updateSection]
  );

  // ============================================================================
  // RENDERIZAÇÃO DE CAMPOS
  // ============================================================================

  const renderFieldEditor = (
    section: TemplateSection,
    field: TemplateField
  ) => (
    <Card key={field.id} className='mb-4'>
      <CardBody>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Input
            label='Nome do Campo'
            value={field.name}
            onChange={e =>
              updateField(section.id, field.id, { name: e.target.value })
            }
            placeholder='Ex: nome, email, telefone'
          />

          <Input
            label='Label'
            value={field.label}
            onChange={e =>
              updateField(section.id, field.id, { label: e.target.value })
            }
            placeholder='Ex: Nome Completo'
          />

          <div>
            <label className='block text-sm font-medium mb-2'>Tipo</label>
            <select
              value={field.type}
              onChange={e =>
                updateField(section.id, field.id, {
                  type: e.target.value as TemplateField['type'],
                })
              }
              className='w-full p-2 border border-gray-300 rounded-md'
            >
              <option value='text'>Texto</option>
              <option value='number'>Número</option>
              <option value='date'>Data</option>
              <option value='boolean'>Sim/Não</option>
              <option value='select'>Seleção</option>
              <option value='multiselect'>Múltipla Seleção</option>
              <option value='textarea'>Área de Texto</option>
            </select>
          </div>

          <div className='flex items-center'>
            <input
              type='checkbox'
              checked={field.required}
              onChange={e =>
                updateField(section.id, field.id, {
                  required: e.target.checked,
                })
              }
              className='mr-2'
            />
            <label>Campo obrigatório</label>
          </div>
        </div>

        <div className='flex justify-end mt-4'>
          <Button
            variant='danger'
            size='sm'
            onClick={() => deleteField(section.id, field.id)}
          >
            <Trash2 className='w-4 h-4 mr-2' />
            Remover Campo
          </Button>
        </div>
      </CardBody>
    </Card>
  );

  // ============================================================================
  // RENDERIZAÇÃO
  // ============================================================================

  // const activeSectionData = sections.find(s => s.id === activeSection);

  return (
    <div className={className}>
      <Container size='xl'>
        <Card>
          <CardHeader>
            <Flex justify='between' align='center'>
              <h2 className='text-2xl font-bold'>
                {template ? 'Editar Template' : 'Criar Template'}
              </h2>

              <Flex gap='md'>
                <Button
                  variant='outline'
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                >
                  <Eye className='w-4 h-4 mr-2' />
                  {isPreviewMode ? 'Editar' : 'Visualizar'}
                </Button>

                <Button variant='outline' onClick={onCancel}>
                  Cancelar
                </Button>

                <Button variant='primary' onClick={handleSubmit}>
                  <Save className='w-4 h-4 mr-2' />
                  Salvar
                </Button>
              </Flex>
            </Flex>
          </CardHeader>

          <CardBody>
            {!isPreviewMode ? (
              <div className='space-y-6'>
                {/* Informações Básicas */}
                <Card>
                  <CardHeader>
                    <h3 className='text-lg font-semibold'>
                      Informações Básicas
                    </h3>
                  </CardHeader>
                  <CardBody>
                    <Grid cols={2} gap='md'>
                      <Input
                        label='Nome do Template'
                        value={values.name}
                        onChange={handleChange('name')}
                        onBlur={handleBlur('name')}
                        error={errors.name}
                        placeholder='Ex: Relatório de Consultas'
                      />

                      <div>
                        <label className='block text-sm font-medium mb-2'>
                          Categoria
                        </label>
                        <select
                          value={values.category}
                          onChange={handleChange('category')}
                          className='w-full p-2 border border-gray-300 rounded-md'
                        >
                          <option value='appointments'>Consultas</option>
                          <option value='patients'>Pacientes</option>
                          <option value='financial'>Financeiro</option>
                          <option value='reports'>Relatórios</option>
                          <option value='custom'>Personalizado</option>
                        </select>
                      </div>
                    </Grid>

                    <div className='mt-4'>
                      <Input
                        label='Descrição'
                        value={values.description}
                        onChange={handleChange('description')}
                        onBlur={handleBlur('description')}
                        error={errors.description}
                        placeholder='Descreva o propósito deste template'
                      />
                    </div>
                  </CardBody>
                </Card>

                {/* Seções */}
                <Card>
                  <CardHeader>
                    <Flex justify='between' align='center'>
                      <h3 className='text-lg font-semibold'>
                        Seções do Template
                      </h3>
                      <Button onClick={addSection}>
                        <Plus className='w-4 h-4 mr-2' />
                        Adicionar Seção
                      </Button>
                    </Flex>
                  </CardHeader>
                  <CardBody>
                    <div className='space-y-4'>
                      {sections.map(section => (
                        <Card
                          key={section.id}
                          className='border-2 border-gray-200'
                        >
                          <CardHeader>
                            <Flex justify='between' align='center'>
                              <div className='flex-1'>
                                <Input
                                  value={section.title}
                                  onChange={e =>
                                    updateSection(section.id, {
                                      title: e.target.value,
                                    })
                                  }
                                  placeholder='Título da seção'
                                  className='mb-2'
                                />
                                <Input
                                  value={section.description}
                                  onChange={e =>
                                    updateSection(section.id, {
                                      description: e.target.value,
                                    })
                                  }
                                  placeholder='Descrição da seção'
                                />
                              </div>

                              <Flex gap='sm'>
                                <Button
                                  size='sm'
                                  variant='outline'
                                  onClick={() => setActiveSection(section.id)}
                                >
                                  <Edit className='w-4 h-4' />
                                </Button>

                                <Button
                                  size='sm'
                                  variant='danger'
                                  onClick={() => deleteSection(section.id)}
                                >
                                  <Trash2 className='w-4 h-4' />
                                </Button>
                              </Flex>
                            </Flex>
                          </CardHeader>

                          {activeSection === section.id && (
                            <CardBody>
                              <div className='mb-4'>
                                <Button
                                  onClick={() => addField(section.id)}
                                  size='sm'
                                >
                                  <Plus className='w-4 h-4 mr-2' />
                                  Adicionar Campo
                                </Button>
                              </div>

                              {section.fields.map(field =>
                                renderFieldEditor(section, field)
                              )}
                            </CardBody>
                          )}
                        </Card>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </div>
            ) : (
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold'>
                  Visualização do Template
                </h3>
                <div className='border border-gray-300 rounded-lg p-6 bg-gray-50'>
                  <h2 className='text-2xl font-bold mb-4'>{values.name}</h2>
                  <p className='text-gray-600 mb-6'>{values.description}</p>

                  {sections.map(section => (
                    <div key={section.id} className='mb-6'>
                      <h3 className='text-lg font-semibold mb-2'>
                        {section.title}
                      </h3>
                      {section.description && (
                        <p className='text-sm text-gray-600 mb-4'>
                          {section.description}
                        </p>
                      )}

                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        {section.fields.map(field => (
                          <div key={field.id} className='space-y-2'>
                            <label className='block text-sm font-medium'>
                              {field.label}
                              {field.required && (
                                <span className='text-red-500 ml-1'>*</span>
                              )}
                            </label>

                            {field.type === 'text' && (
                              <input
                                type='text'
                                className='w-full p-2 border border-gray-300 rounded-md'
                                placeholder={(field as any).placeholder}
                                disabled
                              />
                            )}

                            {field.type === 'number' && (
                              <input
                                type='number'
                                className='w-full p-2 border border-gray-300 rounded-md'
                                disabled
                              />
                            )}

                            {field.type === 'date' && (
                              <input
                                type='date'
                                className='w-full p-2 border border-gray-300 rounded-md'
                                disabled
                              />
                            )}

                            {field.type === 'boolean' && (
                              <div className='flex items-center'>
                                <input
                                  type='checkbox'
                                  className='mr-2'
                                  disabled
                                />
                                <span>Sim</span>
                              </div>
                            )}

                            {field.type === 'select' && (
                              <select
                                className='w-full p-2 border border-gray-300 rounded-md'
                                disabled
                              >
                                <option>Selecione uma opção</option>
                              </select>
                            )}

                            {field.type === 'textarea' && (
                              <textarea
                                className='w-full p-2 border border-gray-300 rounded-md'
                                rows={3}
                                disabled
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </Container>
    </div>
  );
};

export default TemplateBuilder;
