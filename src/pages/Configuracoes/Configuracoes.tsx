import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Settings,
  User,
  Bell,
  Shield,
  Database,
  Palette,
  Globe,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useThemeStore } from '@/stores/themeStore';

interface ConfiguracoesState {
  // Configurações do Sistema
  nomeClinica: string;
  endereco: string;
  telefone: string;
  email: string;

  // Configurações de Notificação
  notificacoesEmail: boolean;
  notificacoesSMS: boolean;
  lembretesAgendamento: boolean;

  // Configurações de Segurança
  tempoSessao: number;
  tentativasLogin: number;
  senhaMinima: number;

  // Configurações de Interface
  tema: 'claro' | 'escuro' | 'auto';
  idioma: 'pt' | 'en' | 'es';

  // Configurações de Backup
  backupAutomatico: boolean;
  frequenciaBackup: 'diario' | 'semanal' | 'mensal';
}

const Configuracoes: React.FC = () => {
  const { isDark } = useThemeStore();

  // Configurações padrão
  const configuracoesPadrao: ConfiguracoesState = {
    // Configurações do Sistema
    nomeClinica: 'Clínica Médica Exemplo',
    endereco: 'Rua das Flores, 123 - Centro',
    telefone: '(11) 99999-9999',
    email: 'contato@clinica.com',

    // Configurações de Notificação
    notificacoesEmail: true,
    notificacoesSMS: false,
    lembretesAgendamento: true,

    // Configurações de Segurança
    tempoSessao: 30,
    tentativasLogin: 3,
    senhaMinima: 8,

    // Configurações de Interface
    tema: 'claro',
    idioma: 'pt',

    // Configurações de Backup
    backupAutomatico: true,
    frequenciaBackup: 'diario',
  };

  // Carregar configurações salvas ou usar padrão
  const carregarConfiguracoes = (): ConfiguracoesState => {
    try {
      const configuracoesSalvas = localStorage.getItem('configuracoes_clinica');
      if (configuracoesSalvas) {
        return { ...configuracoesPadrao, ...JSON.parse(configuracoesSalvas) };
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
    return configuracoesPadrao;
  };

  const [configuracoes, setConfiguracoes] = useState<ConfiguracoesState>(
    carregarConfiguracoes()
  );

  const [salvando, setSalvando] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<
    'sistema' | 'notificacoes' | 'seguranca' | 'interface' | 'backup'
  >('sistema');

  const handleInputChange = (campo: keyof ConfiguracoesState, valor: any) => {
    setConfiguracoes(prev => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const handleSalvar = async () => {
    setSalvando(true);

    try {
      // Salvar no localStorage
      localStorage.setItem(
        'configuracoes_clinica',
        JSON.stringify(configuracoes)
      );

      // Simular salvamento no servidor
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setSalvando(false);
    }
  };

  const handleRestaurarPadrao = () => {
    if (
      window.confirm(
        'Tem certeza que deseja restaurar as configurações padrão?'
      )
    ) {
      setConfiguracoes(configuracoesPadrao);
      localStorage.removeItem('configuracoes_clinica');
      toast.success('Configurações restauradas para o padrão');
    }
  };

  const abas = [
    { id: 'sistema', label: 'Sistema', icon: Settings },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
    { id: 'seguranca', label: 'Segurança', icon: Shield },
    { id: 'interface', label: 'Interface', icon: Palette },
    { id: 'backup', label: 'Backup', icon: Database },
  ] as const;

  const renderAbaSistema = () => (
    <div className='space-y-6'>
      <div
        className={`rounded-lg shadow p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
      >
        <h3
          className={`text-lg font-semibold mb-4 flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}
        >
          <User className='mr-2' size={20} />
          Informações da Clínica
        </h3>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label
              className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
            >
              Nome da Clínica
            </label>
            <input
              type='text'
              value={configuracoes.nomeClinica}
              onChange={e => handleInputChange('nomeClinica', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
            >
              Telefone
            </label>
            <input
              type='text'
              value={configuracoes.telefone}
              onChange={e => handleInputChange('telefone', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>

          <div className='md:col-span-2'>
            <label
              className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
            >
              Endereço
            </label>
            <input
              type='text'
              value={configuracoes.endereco}
              onChange={e => handleInputChange('endereco', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>

          <div className='md:col-span-2'>
            <label
              className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
            >
              E-mail
            </label>
            <input
              type='email'
              value={configuracoes.email}
              onChange={e => handleInputChange('email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderAbaNotificacoes = () => (
    <div className='space-y-6'>
      <div
        className={`rounded-lg shadow p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
      >
        <h3
          className={`text-lg font-semibold mb-4 flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}
        >
          <Bell className='mr-2' size={20} />
          Configurações de Notificação
        </h3>

        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h4
                className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-900'}`}
              >
                Notificações por E-mail
              </h4>
              <p
                className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
              >
                Receber notificações importantes por e-mail
              </p>
            </div>
            <label className='relative inline-flex items-center cursor-pointer'>
              <input
                type='checkbox'
                checked={configuracoes.notificacoesEmail}
                onChange={e =>
                  handleInputChange('notificacoesEmail', e.target.checked)
                }
                className='sr-only peer'
              />
              <div
                className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${
                  isDark ? 'bg-gray-600' : 'bg-gray-200'
                }`}
              ></div>
            </label>
          </div>

          <div className='flex items-center justify-between'>
            <div>
              <h4
                className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-900'}`}
              >
                Notificações por SMS
              </h4>
              <p
                className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
              >
                Receber notificações por mensagem de texto
              </p>
            </div>
            <label className='relative inline-flex items-center cursor-pointer'>
              <input
                type='checkbox'
                checked={configuracoes.notificacoesSMS}
                onChange={e =>
                  handleInputChange('notificacoesSMS', e.target.checked)
                }
                className='sr-only peer'
              />
              <div
                className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${
                  isDark ? 'bg-gray-600' : 'bg-gray-200'
                }`}
              ></div>
            </label>
          </div>

          <div className='flex items-center justify-between'>
            <div>
              <h4
                className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-900'}`}
              >
                Lembretes de Agendamento
              </h4>
              <p
                className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
              >
                Enviar lembretes automáticos de consultas
              </p>
            </div>
            <label className='relative inline-flex items-center cursor-pointer'>
              <input
                type='checkbox'
                checked={configuracoes.lembretesAgendamento}
                onChange={e =>
                  handleInputChange('lembretesAgendamento', e.target.checked)
                }
                className='sr-only peer'
              />
              <div
                className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${
                  isDark ? 'bg-gray-600' : 'bg-gray-200'
                }`}
              ></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAbaSeguranca = () => (
    <div className='space-y-6'>
      <div className='bg-white rounded-lg shadow p-6'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
          <Shield className='mr-2' size={20} />
          Configurações de Segurança
        </h3>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Tempo de Sessão (minutos)
            </label>
            <input
              type='number'
              min='5'
              max='480'
              value={configuracoes.tempoSessao}
              onChange={e =>
                handleInputChange('tempoSessao', parseInt(e.target.value))
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Tentativas de Login
            </label>
            <input
              type='number'
              min='3'
              max='10'
              value={configuracoes.tentativasLogin}
              onChange={e =>
                handleInputChange('tentativasLogin', parseInt(e.target.value))
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Tamanho Mínimo da Senha
            </label>
            <input
              type='number'
              min='6'
              max='20'
              value={configuracoes.senhaMinima}
              onChange={e =>
                handleInputChange('senhaMinima', parseInt(e.target.value))
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderAbaInterface = () => (
    <div className='space-y-6'>
      <div
        className={`rounded-lg shadow p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
      >
        <h3
          className={`text-lg font-semibold mb-4 flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}
        >
          <Palette className='mr-2' size={20} />
          Configurações de Interface
        </h3>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label
              className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
            >
              Tema
            </label>
            <select
              value={configuracoes.tema}
              onChange={e =>
                handleInputChange(
                  'tema',
                  e.target.value as 'claro' | 'escuro' | 'auto'
                )
              }
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value='claro'>Claro</option>
              <option value='escuro'>Escuro</option>
              <option value='auto'>Automático</option>
            </select>
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
            >
              Idioma
            </label>
            <select
              value={configuracoes.idioma}
              onChange={e =>
                handleInputChange(
                  'idioma',
                  e.target.value as 'pt' | 'en' | 'es'
                )
              }
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value='pt'>Português</option>
              <option value='en'>English</option>
              <option value='es'>Español</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAbaBackup = () => (
    <div className='space-y-6'>
      <div className='bg-white rounded-lg shadow p-6'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
          <Database className='mr-2' size={20} />
          Configurações de Backup
        </h3>

        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h4 className='text-sm font-medium text-gray-900'>
                Backup Automático
              </h4>
              <p className='text-sm text-gray-500'>
                Realizar backup automático dos dados
              </p>
            </div>
            <label className='relative inline-flex items-center cursor-pointer'>
              <input
                type='checkbox'
                checked={configuracoes.backupAutomatico}
                onChange={e =>
                  handleInputChange('backupAutomatico', e.target.checked)
                }
                className='sr-only peer'
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Frequência do Backup
            </label>
            <select
              value={configuracoes.frequenciaBackup}
              onChange={e =>
                handleInputChange(
                  'frequenciaBackup',
                  e.target.value as 'diario' | 'semanal' | 'mensal'
                )
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='diario'>Diário</option>
              <option value='semanal'>Semanal</option>
              <option value='mensal'>Mensal</option>
            </select>
          </div>
        </div>
      </div>

      <div className='bg-white rounded-lg shadow p-6'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
          <RefreshCw className='mr-2' size={20} />
          Ações de Backup
        </h3>

        <div className='flex flex-wrap gap-3'>
          <button
            onClick={() => toast.success('Backup manual iniciado!')}
            className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center'
          >
            <Database className='mr-2' size={16} />
            Backup Manual
          </button>

          <button
            onClick={() => toast.success('Restauração iniciada!')}
            className='px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center'
          >
            <RefreshCw className='mr-2' size={16} />
            Restaurar Backup
          </button>
        </div>
      </div>
    </div>
  );

  const renderConteudoAba = () => {
    switch (abaAtiva) {
      case 'sistema':
        return renderAbaSistema();
      case 'notificacoes':
        return renderAbaNotificacoes();
      case 'seguranca':
        return renderAbaSeguranca();
      case 'interface':
        return renderAbaInterface();
      case 'backup':
        return renderAbaBackup();
      default:
        return renderAbaSistema();
    }
  };

  return (
    <>
      <Helmet>
        <title>Configurações - Sistema Clínica</title>
      </Helmet>

      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          {/* Header */}
          <div className='mb-8'>
           
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
            {/* Sidebar com abas */}
            <div className='lg:col-span-1'>
              <div
                className={`rounded-lg shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}
              >
                <nav className='p-4'>
                  <ul className='space-y-2'>
                    {abas.map(aba => {
                      const Icon = aba.icon;
                      return (
                        <li key={aba.id}>
                          <button
                            onClick={() => setAbaAtiva(aba.id)}
                            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                              abaAtiva === aba.id
                                ? isDark
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-blue-100 text-blue-700'
                                : isDark
                                  ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                          >
                            <Icon className='mr-3' size={18} />
                            {aba.label}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
              </div>
            </div>

            {/* Conteúdo principal */}
            <div className='lg:col-span-3'>{renderConteudoAba()}</div>
          </div>

          {/* Botões de ação */}
          <div className='mt-8 flex justify-end space-x-4'>
            <button
              onClick={handleRestaurarPadrao}
              className={`px-6 py-2 border rounded-md transition-colors flex items-center ${
                isDark
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <RefreshCw className='mr-2' size={16} />
              Restaurar Padrão
            </button>

            <button
              onClick={handleSalvar}
              disabled={salvando}
              className='px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center'
            >
              {salvando ? (
                <>
                  <RefreshCw className='mr-2 animate-spin' size={16} />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className='mr-2' size={16} />
                  Salvar Configurações
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Configuracoes;
