import React, { useState } from 'react';
import { Template } from '@/types/global';
import { useTemplateStore } from '@/stores/templateStore';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface TemplatePreviewProps {
  template: Template;
  onClose: () => void;
}

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({ template, onClose }) => {
  const { generateContent } = useTemplateStore();
  const [previewData, setPreviewData] = useState<Record<string, unknown>>({});
  const [generatedContent, setGeneratedContent] = useState('');

  // Inicializar dados de preview com valores padrão
  React.useEffect(() => {
    const defaultData: Record<string, unknown> = {};
    template.fields.forEach(field => {
      if (field.defaultValue !== undefined) {
        defaultData[field.name] = field.defaultValue;
      } else {
        // Valores padrão baseados no tipo
        switch (field.type) {
          case 'text':
            defaultData[field.name] = `Exemplo de ${field.label}`;
            break;
          case 'number':
            defaultData[field.name] = 100;
            break;
          case 'date':
            defaultData[field.name] = new Date().toISOString().split('T')[0];
            break;
          case 'boolean':
            defaultData[field.name] = true;
            break;
          case 'textarea':
            defaultData[field.name] = `Exemplo de texto longo para ${field.label}`;
            break;
          case 'select':
            defaultData[field.name] = field.options?.[0]?.value || '';
            break;
          default:
            defaultData[field.name] = '';
        }
      }
    });

    // Adicionar algumas variáveis comuns para demonstração
    defaultData['dataGeracao'] = new Date().toLocaleDateString();
    defaultData['usuarioNome'] = 'Usuário Exemplo';
    defaultData['totalAgendamentos'] = 25;
    defaultData['agendados'] = 10;
    defaultData['confirmados'] = 8;
    defaultData['realizados'] = 5;
    defaultData['cancelados'] = 2;
    defaultData['agendamentos'] = [
      {
        data: '2024-01-15',
        hora: '09:00',
        pacienteNome: 'João Silva',
        profissionalNome: 'Dr. Maria Santos',
        servicoNome: 'Consulta',
        status: 'Realizado',
        valor: '150.00'
      },
      {
        data: '2024-01-15',
        hora: '10:30',
        pacienteNome: 'Ana Costa',
        profissionalNome: 'Dr. Pedro Lima',
        servicoNome: 'Exame',
        status: 'Agendado',
        valor: '200.00'
      }
    ];

    setPreviewData(defaultData);
  }, [template]);

  // Gerar conteúdo quando os dados mudarem
  React.useEffect(() => {
    try {
      const content = generateContent(template, previewData);
      setGeneratedContent(content);
    } catch (error) {
      console.error('Erro ao gerar preview:', error);
      setGeneratedContent('Erro ao gerar preview do template.');
    }
  }, [template, previewData, generateContent]);

  const handleFieldChange = (fieldName: string, value: unknown) => {
    setPreviewData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex h-full">
          {/* Sidebar com campos */}
          <div className="w-1/3 bg-gray-50 border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Preview do Template</h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                {template.fields.map((field) => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    
                    {field.type === 'text' && (
                      <input
                        type="text"
                        value={String(previewData[field.name] || '')}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    )}
                    
                    {field.type === 'number' && (
                      <input
                        type="number"
                        value={String(previewData[field.name] || '')}
                        onChange={(e) => handleFieldChange(field.name, Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    )}
                    
                    {field.type === 'date' && (
                      <input
                        type="date"
                        value={String(previewData[field.name] || '')}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    )}
                    
                    {field.type === 'select' && (
                      <select
                        value={String(previewData[field.name] || '')}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {field.options?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                    
                    {field.type === 'textarea' && (
                      <textarea
                        value={String(previewData[field.name] || '')}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    )}
                    
                    {field.type === 'boolean' && (
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={Boolean(previewData[field.name])}
                          onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Ativo</span>
                      </label>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Informações do Template</h4>
                <div className="space-y-2 text-xs text-gray-600">
                  <div><strong>Tipo:</strong> {template.type}</div>
                  <div><strong>Categoria:</strong> {template.category}</div>
                  <div><strong>Campos:</strong> {template.fields.length}</div>
                  <div><strong>Variáveis:</strong> {template.variables.length}</div>
                  <div><strong>Tags:</strong> {template.tags.join(', ') || 'Nenhuma'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Área de preview */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
              <p className="text-sm text-gray-600">{template.description}</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                {template.type === 'relatorio' ? (
                  <div 
                    dangerouslySetInnerHTML={{ __html: generatedContent }}
                    className="prose max-w-none"
                    style={{
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      lineHeight: '1.6',
                      color: '#374151'
                    }}
                  />
                ) : (
                  <pre className="whitespace-pre-wrap text-sm text-gray-900 font-mono">
                    {generatedContent}
                  </pre>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
