import React, { useState } from 'react';
import { Template } from '@/types/global';
import { useTemplateStore } from '@/stores/templateStore';
import { XMarkIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';

interface TemplateInstanceModalProps {
  template: Template;
  onClose: () => void;
}

export const TemplateInstanceModal: React.FC<TemplateInstanceModalProps> = ({
  template,
  onClose,
}) => {
  const { createInstance, generateContent } = useTemplateStore();
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [generatedContent, setGeneratedContent] = useState('');
  const [instanceName, setInstanceName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  // Inicializar dados do formulário
  React.useEffect(() => {
    const initialData: Record<string, unknown> = {};
    template.fields.forEach(field => {
      if (field.defaultValue !== undefined) {
        initialData[field.name] = field.defaultValue;
      }
    });
    setFormData(initialData);
    setInstanceName(`${template.name} - ${new Date().toLocaleDateString()}`);
  }, [template]);

  // Gerar conteúdo quando os dados mudarem
  React.useEffect(() => {
    try {
      const content = generateContent(template, formData);
      setGeneratedContent(content);
    } catch (error) {
      console.error('Erro ao gerar conteúdo:', error);
      setGeneratedContent('Erro ao gerar conteúdo do template.');
    }
  }, [template, formData, generateContent]);

  const handleFieldChange = (fieldName: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!instanceName.trim()) {
      newErrors.instanceName = 'Nome da instância é obrigatório';
    }

    template.fields.forEach(field => {
      if (
        field.required &&
        (!formData[field.name] || String(formData[field.name]).trim() === '')
      ) {
        newErrors[field.name] = `${field.label} é obrigatório`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateInstance = async () => {
    if (!validateForm()) return;

    setIsGenerating(true);
    try {
      await createInstance(template.id, formData);
      onClose();
    } catch (error) {
      console.error('Erro ao criar instância:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([generatedContent], {
      type: template.type === 'relatorio' ? 'text/html' : 'text/plain',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${instanceName.replace(/\s+/g, '_')}.${template.type === 'relatorio' ? 'html' : 'txt'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className='fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden'>
        <div className='flex h-full'>
          {/* Formulário */}
          <div className='w-1/2 bg-gray-50 border-r border-gray-200 overflow-y-auto'>
            <div className='p-6'>
              <div className='flex items-center justify-between mb-6'>
                <div>
                  <h3 className='text-lg font-medium text-gray-900'>
                    Criar Instância
                  </h3>
                  <p className='text-sm text-gray-600'>{template.name}</p>
                </div>
                <button
                  onClick={onClose}
                  className='text-gray-400 hover:text-gray-600'
                >
                  <XMarkIcon className='h-6 w-6' />
                </button>
              </div>

              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Nome da Instância *
                  </label>
                  <input
                    type='text'
                    value={instanceName}
                    onChange={e => setInstanceName(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.instanceName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder='Nome da instância'
                  />
                  {errors.instanceName && (
                    <p className='text-red-500 text-sm mt-1'>
                      {errors.instanceName}
                    </p>
                  )}
                </div>

                {template.fields.map(field => (
                  <div key={field.id}>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      {field.label}
                      {field.required && (
                        <span className='text-red-500 ml-1'>*</span>
                      )}
                    </label>

                    {field.type === 'text' && (
                      <input
                        type='text'
                        value={String(formData[field.name] || '')}
                        onChange={e =>
                          handleFieldChange(field.name, e.target.value)
                        }
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors[field.name]
                            ? 'border-red-300'
                            : 'border-gray-300'
                        }`}
                        placeholder={field.label}
                      />
                    )}

                    {field.type === 'number' && (
                      <input
                        type='number'
                        value={String(formData[field.name] || '')}
                        onChange={e =>
                          handleFieldChange(field.name, Number(e.target.value))
                        }
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors[field.name]
                            ? 'border-red-300'
                            : 'border-gray-300'
                        }`}
                        placeholder={field.label}
                      />
                    )}

                    {field.type === 'date' && (
                      <input
                        type='date'
                        value={String(formData[field.name] || '')}
                        onChange={e =>
                          handleFieldChange(field.name, e.target.value)
                        }
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors[field.name]
                            ? 'border-red-300'
                            : 'border-gray-300'
                        }`}
                      />
                    )}

                    {field.type === 'select' && (
                      <select
                        value={String(formData[field.name] || '')}
                        onChange={e =>
                          handleFieldChange(field.name, e.target.value)
                        }
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors[field.name]
                            ? 'border-red-300'
                            : 'border-gray-300'
                        }`}
                      >
                        <option value=''>Selecione...</option>
                        {field.options?.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}

                    {field.type === 'textarea' && (
                      <textarea
                        value={String(formData[field.name] || '')}
                        onChange={e =>
                          handleFieldChange(field.name, e.target.value)
                        }
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors[field.name]
                            ? 'border-red-300'
                            : 'border-gray-300'
                        }`}
                        placeholder={field.label}
                      />
                    )}

                    {field.type === 'boolean' && (
                      <label className='flex items-center'>
                        <input
                          type='checkbox'
                          checked={Boolean(formData[field.name])}
                          onChange={e =>
                            handleFieldChange(field.name, e.target.checked)
                          }
                          className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                        />
                        <span className='ml-2 text-sm text-gray-700'>
                          {field.label}
                        </span>
                      </label>
                    )}

                    {errors[field.name] && (
                      <p className='text-red-500 text-sm mt-1'>
                        {errors[field.name]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className='w-1/2 flex flex-col'>
            <div className='p-4 border-b border-gray-200'>
              <div className='flex items-center justify-between'>
                <h3 className='text-lg font-medium text-gray-900'>Preview</h3>
                <button
                  onClick={handleDownload}
                  className='flex items-center space-x-2 px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700'
                >
                  <DocumentArrowDownIcon className='h-4 w-4' />
                  <span>Baixar</span>
                </button>
              </div>
            </div>

            <div className='flex-1 overflow-y-auto p-4'>
              <div className='bg-white border border-gray-200 rounded-lg p-4'>
                {template.type === 'relatorio' ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: generatedContent }}
                    className='prose max-w-none'
                    style={{
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      lineHeight: '1.6',
                      color: '#374151',
                    }}
                  />
                ) : (
                  <pre className='whitespace-pre-wrap text-sm text-gray-900 font-mono'>
                    {generatedContent}
                  </pre>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className='p-4 border-t border-gray-200'>
              <div className='flex justify-end space-x-3'>
                <button
                  onClick={onClose}
                  className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200'
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateInstance}
                  disabled={isGenerating}
                  className='px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {isGenerating ? 'Criando...' : 'Criar Instância'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
