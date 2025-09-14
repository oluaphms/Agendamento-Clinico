import React, { useEffect, useState } from 'react';
import { useTemplateStore } from '@/stores/templateStore';
import { Template, TemplateType } from '@/types/global';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  DocumentDuplicateIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';
import { TemplateEditor } from './TemplateEditor';
import { TemplatePreview } from './TemplatePreview';
import { TemplateInstanceModal } from './TemplateInstanceModal';

interface TemplateManagerProps {
  className?: string;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({ className = '' }) => {
  const {
    templates,
    instances,
    loading,
    error,
    searchQuery,
    selectedCategory,
    selectedType,
    loadTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    setSearchQuery,
    setSelectedCategory,
    setSelectedType,
    getFilteredTemplates,
    getCategories,
    getTypes,
    exportTemplate,
    importTemplate
  } = useTemplateStore();

  const [activeTab, setActiveTab] = useState<'templates' | 'instances'>('templates');
  const [showEditor, setShowEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [showInstanceModal, setShowInstanceModal] = useState(false);
  const [instanceTemplate, setInstanceTemplate] = useState<Template | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState('');

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const filteredTemplates = getFilteredTemplates();
  const categories = getCategories();
  const types = getTypes();

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setShowEditor(true);
  };

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setShowEditor(true);
  };

  const handleDuplicateTemplate = async (template: Template) => {
    try {
      await duplicateTemplate(template.id);
    } catch (error) {
      console.error('Erro ao duplicar template:', error);
    }
  };

  const handleDeleteTemplate = async (template: Template) => {
    if (window.confirm(`Tem certeza que deseja excluir o template "${template.name}"?`)) {
      try {
        await deleteTemplate(template.id);
      } catch (error) {
        console.error('Erro ao excluir template:', error);
      }
    }
  };

  const handlePreviewTemplate = (template: Template) => {
    setPreviewTemplate(template);
    setShowPreview(true);
  };

  const handleCreateInstance = (template: Template) => {
    setInstanceTemplate(template);
    setShowInstanceModal(true);
  };

  const handleExportTemplate = (template: Template) => {
    try {
      const data = exportTemplate(template.id);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `template_${template.name.replace(/\s+/g, '_')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao exportar template:', error);
    }
  };

  const handleImportTemplate = async () => {
    try {
      await importTemplate(importData);
      setShowImportModal(false);
      setImportData('');
    } catch (error) {
      console.error('Erro ao importar template:', error);
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-gray-200 h-64 rounded-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <p className="text-red-600">Erro ao carregar templates: {error}</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Gerenciador de Templates</h2>
            <p className="text-sm text-gray-600">Crie e gerencie templates personalizados</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <ArrowUpTrayIcon className="h-4 w-4" />
              <span>Importar</span>
            </button>
            <button
              onClick={handleCreateTemplate}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Novo Template</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 py-3 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'templates'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Templates ({templates.length})
          </button>
          <button
            onClick={() => setActiveTab('instances')}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'instances'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Instâncias ({instances.length})
          </button>
        </nav>
      </div>

      {/* Filters */}
      {activeTab === 'templates' && (
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todas as categorias</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as TemplateType | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos os tipos</option>
              {types.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {activeTab === 'templates' && (
          <div className="space-y-4">
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-12">
                <DocumentDuplicateIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum template encontrado</h3>
                <p className="text-gray-600 mb-4">
                  {searchQuery || selectedCategory !== 'all' || selectedType !== 'all'
                    ? 'Tente ajustar os filtros de busca.'
                    : 'Crie seu primeiro template para começar.'
                  }
                </p>
                <button
                  onClick={handleCreateTemplate}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Criar Template
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                  <div key={template.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900 mb-1">{template.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {template.type}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {template.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span>{template.usageCount} usos</span>
                        <span>{template.fields.length} campos</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handlePreviewTemplate(template)}
                            className="p-2 text-gray-400 hover:text-gray-600"
                            title="Visualizar"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditTemplate(template)}
                            className="p-2 text-gray-400 hover:text-blue-600"
                            title="Editar"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDuplicateTemplate(template)}
                            className="p-2 text-gray-400 hover:text-green-600"
                            title="Duplicar"
                          >
                            <DocumentDuplicateIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleExportTemplate(template)}
                            className="p-2 text-gray-400 hover:text-purple-600"
                            title="Exportar"
                          >
                            <ArrowDownTrayIcon className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleCreateInstance(template)}
                            className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                          >
                            Usar
                          </button>
                          <button
                            onClick={() => handleDeleteTemplate(template)}
                            className="p-2 text-gray-400 hover:text-red-600"
                            title="Excluir"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'instances' && (
          <div className="space-y-4">
            {instances.length === 0 ? (
              <div className="text-center py-12">
                <DocumentDuplicateIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma instância criada</h3>
                <p className="text-gray-600">Use um template para criar sua primeira instância.</p>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Template
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Criado em
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {instances.map((instance) => {
                      const template = templates.find(t => t.id === instance.templateId);
                      return (
                        <tr key={instance.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{instance.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{template?.name || 'Template não encontrado'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(instance.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => {
                                setPreviewTemplate(template!);
                                setShowPreview(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              Visualizar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showEditor && (
        <TemplateEditor
          template={editingTemplate}
          onClose={() => {
            setShowEditor(false);
            setEditingTemplate(null);
          }}
          onSave={(template) => {
            setShowEditor(false);
            setEditingTemplate(null);
            if (editingTemplate) {
              updateTemplate(template.id, template);
            } else {
              createTemplate(template);
            }
          }}
        />
      )}

      {showPreview && previewTemplate && (
        <TemplatePreview
          template={previewTemplate}
          onClose={() => {
            setShowPreview(false);
            setPreviewTemplate(null);
          }}
        />
      )}

      {showInstanceModal && instanceTemplate && (
        <TemplateInstanceModal
          template={instanceTemplate}
          onClose={() => {
            setShowInstanceModal(false);
            setInstanceTemplate(null);
          }}
        />
      )}

      {showImportModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Importar Template</h3>
            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="Cole aqui o conteúdo JSON do template..."
              className="w-full h-64 p-3 border border-gray-300 rounded-md font-mono text-sm"
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportData('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleImportTemplate}
                disabled={!importData.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Importar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
