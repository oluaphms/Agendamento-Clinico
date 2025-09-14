import React, { useState, useEffect } from 'react';
import { Template, TemplateField, TemplateType } from '@/types/global';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Edit } from 'lucide-react';

interface TemplateEditorProps {
  template?: Template | null;
  onClose: () => void;
  onSave: (template: Template) => void;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
  template,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'relatorio' as TemplateType,
    category: '',
    content: '',
    isActive: true,
    isPublic: false,
    tags: [] as string[],
  });

  const [fields, setFields] = useState<TemplateField[]>([]);
  const [newField, setNewField] = useState<Partial<TemplateField>>({});
  const [showFieldEditor, setShowFieldEditor] = useState(false);
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(
    null
  );
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const templateTypes: { value: TemplateType; label: string }[] = [
    { value: 'relatorio', label: 'Relatório' },
    { value: 'formulario', label: 'Formulário' },
    { value: 'email', label: 'E-mail' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'sms', label: 'SMS' },
    { value: 'documento', label: 'Documento' },
  ];

  const fieldTypes = [
    { value: 'text', label: 'Texto' },
    { value: 'number', label: 'Número' },
    { value: 'date', label: 'Data' },
    { value: 'select', label: 'Seleção' },
    { value: 'textarea', label: 'Área de Texto' },
    { value: 'boolean', label: 'Sim/Não' },
    { value: 'image', label: 'Imagem' },
  ];

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        description: template.description,
        type: template.type,
        category: template.category,
        content: template.content,
        isActive: template.isActive,
        isPublic: template.isPublic,
        tags: template.tags || [],
      });
      setFields(template.fields || []);
    }
  }, [template]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Categoria é obrigatória';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Conteúdo é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const templateData: Template = {
      id: template?.id || `template_${Date.now()}`,
      name: formData.name,
      description: formData.description,
      type: formData.type,
      category: formData.category,
      content: formData.content,
      fields: fields,
      variables: extractVariables(formData.content),
      isActive: formData.isActive,
      isPublic: formData.isPublic,
      createdBy: template?.createdBy || 'current_user',
      createdAt: template?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: template?.usageCount || 0,
      tags: formData.tags,
    };

    onSave(templateData);
  };

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

  const addField = () => {
    if (!newField.name || !newField.label || !newField.type) return;

    const field: TemplateField = {
      id: `field_${Date.now()}`,
      name: newField.name,
      label: newField.label,
      type: newField.type as any,
      required: newField.required || false,
      defaultValue: newField.defaultValue,
      options: newField.options,
      validation: newField.validation,
    };

    setFields([...fields, field]);
    setNewField({});
    setShowFieldEditor(false);
  };

  const editField = (index: number) => {
    const field = fields[index];
    setNewField(field);
    setEditingFieldIndex(index);
    setShowFieldEditor(true);
  };

  const updateField = () => {
    if (
      editingFieldIndex === null ||
      !newField.name ||
      !newField.label ||
      !newField.type
    )
      return;

    const updatedFields = [...fields];
    updatedFields[editingFieldIndex] = {
      ...updatedFields[editingFieldIndex],
      ...newField,
    } as TemplateField;

    setFields(updatedFields);
    setNewField({});
    setEditingFieldIndex(null);
    setShowFieldEditor(false);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag),
    });
  };

  return (
    <div className='fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto'>
        <div className='p-6'>
          <div className='flex items-center justify-between mb-6'>
            <h3 className='text-lg font-medium text-gray-900'>
              {template ? 'Editar Template' : 'Criar Template'}
            </h3>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-gray-600'
            >
              <XMarkIcon className='h-6 w-6' />
            </button>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Formulário */}
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Nome *
                </label>
                <input
                  type='text'
                  value={formData.name}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder='Nome do template'
                />
                {errors.name && (
                  <p className='text-red-500 text-sm mt-1'>{errors.name}</p>
                )}
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Descrição *
                </label>
                <textarea
                  value={formData.description}
                  onChange={e =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                  rows={3}
                  placeholder='Descrição do template'
                />
                {errors.description && (
                  <p className='text-red-500 text-sm mt-1'>
                    {errors.description}
                  </p>
                )}
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Tipo *
                  </label>
                  <select
                    value={formData.type}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        type: e.target.value as TemplateType,
                      })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  >
                    {templateTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Categoria *
                  </label>
                  <input
                    type='text'
                    value={formData.category}
                    onChange={e =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.category ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder='Categoria'
                  />
                  {errors.category && (
                    <p className='text-red-500 text-sm mt-1'>
                      {errors.category}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Tags
                </label>
                <div className='flex flex-wrap gap-2 mb-2'>
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className='ml-1 text-blue-600 hover:text-blue-800'
                      >
                        <XMarkIcon className='h-3 w-3' />
                      </button>
                    </span>
                  ))}
                </div>
                <div className='flex'>
                  <input
                    type='text'
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && addTag()}
                    className='flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    placeholder='Adicionar tag'
                  />
                  <button
                    onClick={addTag}
                    className='px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700'
                  >
                    <PlusIcon className='h-4 w-4' />
                  </button>
                </div>
              </div>

              <div className='flex items-center space-x-4'>
                <label className='flex items-center'>
                  <input
                    type='checkbox'
                    checked={formData.isActive}
                    onChange={e =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                  />
                  <span className='ml-2 text-sm text-gray-700'>Ativo</span>
                </label>

                <label className='flex items-center'>
                  <input
                    type='checkbox'
                    checked={formData.isPublic}
                    onChange={e =>
                      setFormData({ ...formData, isPublic: e.target.checked })
                    }
                    className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                  />
                  <span className='ml-2 text-sm text-gray-700'>Público</span>
                </label>
              </div>
            </div>

            {/* Campos */}
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <h4 className='text-sm font-medium text-gray-900'>
                  Campos do Template
                </h4>
                <button
                  onClick={() => setShowFieldEditor(true)}
                  className='flex items-center space-x-1 px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700'
                >
                  <PlusIcon className='h-4 w-4' />
                  <span>Adicionar Campo</span>
                </button>
              </div>

              <div className='space-y-2 max-h-64 overflow-y-auto'>
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                  >
                    <div>
                      <div className='font-medium text-sm text-gray-900'>
                        {field.label}
                      </div>
                      <div className='text-xs text-gray-600'>
                        {field.name} • {field.type}{' '}
                        {field.required && '• Obrigatório'}
                      </div>
                    </div>
                    <div className='flex space-x-1'>
                      <button
                        onClick={() => editField(index)}
                        className='p-1 text-gray-400 hover:text-blue-600'
                      >
                        <Edit className='h-4 w-4' />
                      </button>
                      <button
                        onClick={() => removeField(index)}
                        className='p-1 text-gray-400 hover:text-red-600'
                      >
                        <TrashIcon className='h-4 w-4' />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Conteúdo */}
          <div className='mt-6'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Conteúdo do Template *
            </label>
            <textarea
              value={formData.content}
              onChange={e =>
                setFormData({ ...formData, content: e.target.value })
              }
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm ${
                errors.content ? 'border-red-300' : 'border-gray-300'
              }`}
              rows={10}
              placeholder='Conteúdo do template com variáveis {{variavel}}'
            />
            {errors.content && (
              <p className='text-red-500 text-sm mt-1'>{errors.content}</p>
            )}
            <p className='text-xs text-gray-500 mt-1'>
              Use variáveis com a sintaxe {`{{variavel}}`}. Exemplo:{' '}
              {`{{nome}}, {{data}}, {{valor}}`}
            </p>
          </div>

          {/* Actions */}
          <div className='flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200'>
            <button
              onClick={onClose}
              className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200'
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className='px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700'
            >
              {template ? 'Atualizar' : 'Criar'} Template
            </button>
          </div>
        </div>

        {/* Field Editor Modal */}
        {showFieldEditor && (
          <div className='fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-60'>
            <div className='bg-white rounded-lg p-6 w-full max-w-md mx-4'>
              <h4 className='text-lg font-medium text-gray-900 mb-4'>
                {editingFieldIndex !== null
                  ? 'Editar Campo'
                  : 'Adicionar Campo'}
              </h4>

              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Nome do Campo *
                  </label>
                  <input
                    type='text'
                    value={newField.name || ''}
                    onChange={e =>
                      setNewField({ ...newField, name: e.target.value })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    placeholder='nome'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Label *
                  </label>
                  <input
                    type='text'
                    value={newField.label || ''}
                    onChange={e =>
                      setNewField({ ...newField, label: e.target.value })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    placeholder='Nome do Campo'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Tipo *
                  </label>
                  <select
                    value={newField.type || ''}
                    onChange={e =>
                      setNewField({ ...newField, type: e.target.value as any })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  >
                    <option value=''>Selecione um tipo</option>
                    {fieldTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className='flex items-center'>
                    <input
                      type='checkbox'
                      checked={newField.required || false}
                      onChange={e =>
                        setNewField({ ...newField, required: e.target.checked })
                      }
                      className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                    />
                    <span className='ml-2 text-sm text-gray-700'>
                      Campo obrigatório
                    </span>
                  </label>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Valor Padrão
                  </label>
                  <input
                    type='text'
                    value={String(newField.defaultValue || '')}
                    onChange={e =>
                      setNewField({ ...newField, defaultValue: e.target.value })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    placeholder='Valor padrão'
                  />
                </div>
              </div>

              <div className='flex justify-end space-x-3 mt-6'>
                <button
                  onClick={() => {
                    setShowFieldEditor(false);
                    setNewField({});
                    setEditingFieldIndex(null);
                  }}
                  className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200'
                >
                  Cancelar
                </button>
                <button
                  onClick={editingFieldIndex !== null ? updateField : addField}
                  className='px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700'
                >
                  {editingFieldIndex !== null ? 'Atualizar' : 'Adicionar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
