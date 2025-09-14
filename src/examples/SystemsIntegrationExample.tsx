import React, { useEffect } from 'react';
import { useGamification } from '@/hooks/useGamification';
import { useTemplates } from '@/hooks/useTemplates';
import { GamificationWidget } from '@/components/Gamification';
import {
  CalendarDaysIcon,
  UserPlusIcon,
  DocumentTextIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline';

/**
 * Exemplo de integração dos sistemas de Gamificação e Templates
 * Este componente demonstra como integrar os sistemas em outras funcionalidades
 */
export const SystemsIntegrationExample: React.FC = () => {
  const {
    trackAppointmentCreated,
    trackPatientCreated,
    trackProfessionalCreated,
    trackLogin,
    trackReportGenerated,
    trackTemplateUsed,
    userStats,
    isInitialized,
  } = useGamification();

  const {
    generateAppointmentsReport,
    generateAppointmentReminder,
    // getTemplatesByType,
    createReportTemplate,
    templates,
  } = useTemplates();

  // Simular login do usuário
  useEffect(() => {
    if (isInitialized) {
      trackLogin();
    }
  }, [isInitialized, trackLogin]);

  // Exemplo: Criar agendamento
  const handleCreateAppointment = async () => {
    // Simular dados de agendamento
    const appointmentData = {
      count: 1,
      totalValue: 150,
      professionalId: 'prof_1',
    };

    await trackAppointmentCreated(appointmentData);
    alert('Agendamento criado! Pontos ganhos: +5');
  };

  // Exemplo: Cadastrar paciente
  const handleCreatePatient = async () => {
    // Simular dados de paciente
    const patientData = {
      count: 1,
      isNewPatient: true,
    };

    await trackPatientCreated(patientData);
    alert('Paciente cadastrado! Pontos ganhos: +10');
  };

  // Exemplo: Cadastrar profissional
  const handleCreateProfessional = async () => {
    // Simular dados de profissional
    const professionalData = {
      count: 1,
      specialty: 'Cardiologia',
    };

    await trackProfessionalCreated(professionalData);
    alert('Profissional cadastrado! Pontos ganhos: +15');
  };

  // Exemplo: Gerar relatório
  const handleGenerateReport = async () => {
    try {
      const reportData = {
        dataInicio: '2024-01-01',
        dataFim: '2024-01-31',
        agendamentos: [
          {
            id: 1,
            data: '2024-01-15',
            hora: '09:00',
            pacienteNome: 'João Silva',
            profissionalNome: 'Dr. Maria Santos',
            servicoNome: 'Consulta',
            status: 'Realizado',
            valor: 150,
          },
          {
            id: 2,
            data: '2024-01-16',
            hora: '14:30',
            pacienteNome: 'Ana Costa',
            profissionalNome: 'Dr. Pedro Lima',
            servicoNome: 'Exame',
            status: 'Agendado',
            valor: 200,
          },
        ],
      };

      const report = await generateAppointmentsReport(reportData);

      // Rastrear geração de relatório
      await trackReportGenerated({
        reportType: 'agendamentos',
        recordCount: reportData.agendamentos.length,
        dateRange: {
          start: reportData.dataInicio,
          end: reportData.dataFim,
        },
      });

      // Abrir relatório em nova janela
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(report);
        newWindow.document.close();
      }

      alert('Relatório gerado! Pontos ganhos: +4');
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      alert('Erro ao gerar relatório');
    }
  };

  // Exemplo: Gerar mensagem de lembrete
  const handleGenerateReminder = async () => {
    try {
      const reminderData = {
        pacienteNome: 'João Silva',
        dataAgendamento: '2024-01-20',
        horaAgendamento: '09:00',
        profissionalNome: 'Dr. Maria Santos',
        servicoNome: 'Consulta',
        telefoneClinica: '(11) 99999-9999',
        siteClinica: 'www.clinica.com.br',
      };

      const message = await generateAppointmentReminder(reminderData);

      // Rastrear uso de template
      await trackTemplateUsed({
        templateId: 'template_lembrete',
        templateType: 'whatsapp',
        isCustom: false,
      });

      alert(`Mensagem gerada:\n\n${message}`);
    } catch (error) {
      console.error('Erro ao gerar lembrete:', error);
      alert('Erro ao gerar lembrete');
    }
  };

  // Exemplo: Criar template personalizado
  const handleCreateCustomTemplate = async () => {
    try {
      await createReportTemplate({
        name: 'Relatório de Pacientes',
        description: 'Relatório personalizado para listagem de pacientes',
        category: 'Pacientes',
        content: `
          <div class="relatorio">
            <h1>📋 Relatório de Pacientes</h1>
            <p>Sistema de Gestão de Clínica</p>
            <p>Relatório gerado em: {{dataGeracao}}</p>
            <p>Usuário: {{usuarioNome}}</p>
            
            <div class="resumo">
              <h2>Resumo</h2>
              <p>Total de pacientes: {{totalPacientes}}</p>
              <p>Novos este mês: {{novosEsteMes}}</p>
              <p>Ativos: {{ativos}}</p>
            </div>
            
            <table class="tabela-pacientes">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>CPF</th>
                  <th>Telefone</th>
                  <th>Data de Cadastro</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {{#each pacientes}}
                <tr>
                  <td>{{nome}}</td>
                  <td>{{cpf}}</td>
                  <td>{{telefone}}</td>
                  <td>{{dataCadastro}}</td>
                  <td>{{status}}</td>
                </tr>
                {{/each}}
              </tbody>
            </table>
            
            <div class="rodape">
              <p>Sistema de Gestão de Clínica - Relatório de Pacientes</p>
              <p>Gerado em: {{dataGeracao}}</p>
              <p>Total de registros: {{totalPacientes}} itens</p>
            </div>
          </div>
        `,
        fields: [
          {
            name: 'dataGeracao',
            label: 'Data de Geração',
            type: 'date',
            required: true,
            defaultValue: new Date().toISOString().split('T')[0],
          },
          {
            name: 'usuarioNome',
            label: 'Nome do Usuário',
            type: 'text',
            required: true,
          },
          {
            name: 'totalPacientes',
            label: 'Total de Pacientes',
            type: 'number',
            required: true,
            defaultValue: 0,
          },
          {
            name: 'novosEsteMes',
            label: 'Novos Este Mês',
            type: 'number',
            required: true,
            defaultValue: 0,
          },
          {
            name: 'ativos',
            label: 'Ativos',
            type: 'number',
            required: true,
            defaultValue: 0,
          },
        ],
        tags: ['relatório', 'pacientes', 'personalizado'],
      });

      alert('Template personalizado criado! Pontos ganhos: +15');
    } catch (error) {
      console.error('Erro ao criar template:', error);
      alert('Erro ao criar template');
    }
  };

  return (
    <div className='max-w-6xl mx-auto p-6 space-y-8'>
      <div className='text-center'>
        <h1 className='text-3xl font-bold text-gray-900 mb-4'>
          Exemplo de Integração dos Sistemas
        </h1>
        <p className='text-gray-600 mb-8'>
          Demonstração de como integrar os sistemas de Gamificação e Templates
        </p>
      </div>

      {/* Widget de Gamificação */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center'>
          <TrophyIcon className='h-6 w-6 text-yellow-500 mr-2' />
          Sistema de Gamificação
        </h2>
        <GamificationWidget />
      </div>

      {/* Exemplos de Ações */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
          <div className='flex items-center mb-4'>
            <CalendarDaysIcon className='h-8 w-8 text-blue-500 mr-3' />
            <h3 className='text-lg font-medium text-gray-900'>Agendamentos</h3>
          </div>
          <p className='text-gray-600 mb-4'>
            Simule a criação de agendamentos e ganhe pontos de gamificação.
          </p>
          <button
            onClick={handleCreateAppointment}
            className='w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors'
          >
            Criar Agendamento (+5 pts)
          </button>
        </div>

        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
          <div className='flex items-center mb-4'>
            <UserPlusIcon className='h-8 w-8 text-green-500 mr-3' />
            <h3 className='text-lg font-medium text-gray-900'>Pacientes</h3>
          </div>
          <p className='text-gray-600 mb-4'>
            Cadastre pacientes e desbloqueie conquistas.
          </p>
          <button
            onClick={handleCreatePatient}
            className='w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors'
          >
            Cadastrar Paciente (+10 pts)
          </button>
        </div>

        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
          <div className='flex items-center mb-4'>
            <UserPlusIcon className='h-8 w-8 text-purple-500 mr-3' />
            <h3 className='text-lg font-medium text-gray-900'>Profissionais</h3>
          </div>
          <p className='text-gray-600 mb-4'>
            Cadastre profissionais e ganhe mais pontos.
          </p>
          <button
            onClick={handleCreateProfessional}
            className='w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors'
          >
            Cadastrar Profissional (+15 pts)
          </button>
        </div>
      </div>

      {/* Exemplos de Templates */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center'>
          <DocumentTextIcon className='h-6 w-6 text-blue-500 mr-2' />
          Sistema de Templates
        </h2>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <h3 className='text-lg font-medium text-gray-900 mb-3'>
              Gerar Relatório
            </h3>
            <p className='text-gray-600 mb-4'>
              Use templates para gerar relatórios personalizados.
            </p>
            <button
              onClick={handleGenerateReport}
              className='w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors'
            >
              Gerar Relatório de Agendamentos (+4 pts)
            </button>
          </div>

          <div>
            <h3 className='text-lg font-medium text-gray-900 mb-3'>
              Criar Template
            </h3>
            <p className='text-gray-600 mb-4'>
              Crie templates personalizados e ganhe pontos extras.
            </p>
            <button
              onClick={handleCreateCustomTemplate}
              className='w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors'
            >
              Criar Template Personalizado (+15 pts)
            </button>
          </div>
        </div>

        <div className='mt-6 pt-6 border-t border-gray-200'>
          <h3 className='text-lg font-medium text-gray-900 mb-3'>
            Gerar Lembrete WhatsApp
          </h3>
          <p className='text-gray-600 mb-4'>
            Use templates para gerar mensagens de lembrete.
          </p>
          <button
            onClick={handleGenerateReminder}
            className='bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors'
          >
            Gerar Lembrete WhatsApp (+3 pts)
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <h2 className='text-xl font-semibold text-gray-900 mb-4'>
          Estatísticas dos Sistemas
        </h2>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='text-center'>
            <div className='text-3xl font-bold text-blue-600 mb-2'>
              {userStats?.level || 1}
            </div>
            <div className='text-gray-600'>Nível Atual</div>
          </div>

          <div className='text-center'>
            <div className='text-3xl font-bold text-green-600 mb-2'>
              {userStats?.points || 0}
            </div>
            <div className='text-gray-600'>Pontos Totais</div>
          </div>

          <div className='text-center'>
            <div className='text-3xl font-bold text-purple-600 mb-2'>
              {templates.length}
            </div>
            <div className='text-gray-600'>Templates Disponíveis</div>
          </div>
        </div>
      </div>

      {/* Instruções */}
      <div className='bg-blue-50 border border-blue-200 rounded-lg p-6'>
        <h3 className='text-lg font-medium text-blue-900 mb-3'>
          Como Funciona a Integração
        </h3>
        <div className='space-y-2 text-blue-800'>
          <p>
            • <strong>Gamificação:</strong> Cada ação no sistema gera pontos e
            pode desbloquear conquistas
          </p>
          <p>
            • <strong>Templates:</strong> Permitem criar relatórios e
            formulários personalizados
          </p>
          <p>
            • <strong>Integração:</strong> Os dois sistemas trabalham juntos
            para melhorar a experiência do usuário
          </p>
          <p>
            • <strong>Persistência:</strong> Todos os dados são salvos no
            localStorage para demonstração
          </p>
        </div>
      </div>
    </div>
  );
};
