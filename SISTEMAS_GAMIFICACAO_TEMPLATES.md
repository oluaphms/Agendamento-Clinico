# Sistemas de Gamificação e Templates

## 📋 Visão Geral

Este documento descreve os dois sistemas implementados no projeto:

1. **Sistema de Gamificação** - Engajamento e motivação do usuário
2. **Sistema de Templates** - Personalização de relatórios e formulários

## 🏆 Sistema de Gamificação

### Funcionalidades

- **Pontuação**: Usuários ganham pontos por ações realizadas
- **Níveis**: Sistema de progressão baseado em experiência
- **Conquistas**: Desbloqueio de conquistas por metas específicas
- **Ranking**: Leaderboard de usuários
- **Sequência**: Contador de dias consecutivos de uso

### Conquistas Disponíveis

#### Agendamentos

- 🏅 **Primeiro Agendamento** - Crie seu primeiro agendamento (+10 pts)
- 🎯 **Mestre dos Agendamentos** - Crie 100 agendamentos (+100 pts)
- 🔥 **Sequência de Sucesso** - Crie agendamentos por 7 dias consecutivos (+50 pts)

#### Pacientes

- 👤 **Primeiro Paciente** - Cadastre seu primeiro paciente (+15 pts)
- 👥 **Coletor de Pacientes** - Cadastre 50 pacientes (+75 pts)

#### Profissionais

- 👨‍⚕️ **Primeiro Profissional** - Cadastre seu primeiro profissional (+20 pts)
- 🏥 **Construtor de Equipe** - Cadastre 10 profissionais (+80 pts)

#### Sistema

- 🌅 **Madrugador** - Acesse o sistema antes das 7h (+25 pts)
- 🦉 **Coruja Noturna** - Acesse o sistema após as 22h (+25 pts)
- ⚡ **Usuário Poderoso** - Acesse o sistema por 30 dias consecutivos (+150 pts)

### Como Usar

```typescript
import { useGamification } from '@/hooks/useGamification';

const { trackAppointmentCreated, trackPatientCreated } = useGamification();

// Rastrear criação de agendamento
await trackAppointmentCreated({
  count: 1,
  totalValue: 150,
  professionalId: 'prof_1',
});

// Rastrear criação de paciente
await trackPatientCreated({
  count: 1,
  isNewPatient: true,
});
```

### Componentes

- `GamificationDashboard` - Dashboard completo com todas as funcionalidades
- `GamificationWidget` - Widget compacto para uso em outras páginas

## 📄 Sistema de Templates

### Funcionalidades

- **Criação de Templates**: Editor visual para criar templates personalizados
- **Tipos Suportados**: Relatórios, Formulários, E-mails, WhatsApp, SMS, Documentos
- **Campos Dinâmicos**: Definição de campos com validação
- **Preview em Tempo Real**: Visualização do template com dados de exemplo
- **Instâncias**: Criação de instâncias específicas dos templates
- **Importação/Exportação**: Compartilhamento de templates

### Tipos de Template

#### Relatórios

- Templates HTML para relatórios formatados
- Suporte a loops e condicionais
- Variáveis dinâmicas
- Estilização CSS integrada

#### Formulários

- Formulários HTML com validação
- Campos tipados (texto, número, data, seleção, etc.)
- Validação personalizada
- Valores padrão

#### Mensagens

- Templates para WhatsApp, SMS e E-mail
- Variáveis de substituição
- Formatação específica por tipo

### Como Usar

```typescript
import { useTemplates } from '@/hooks/useTemplates';

const {
  createReportTemplate,
  generateAppointmentsReport,
  getTemplatesByType
} = useTemplates();

// Criar template de relatório
await createReportTemplate({
  name: 'Relatório de Agendamentos',
  description: 'Relatório padrão para agendamentos',
  category: 'Agendamentos',
  content: '<h1>{{titulo}}</h1><p>{{data}}</p>',
  fields: [
    {
      name: 'titulo',
      label: 'Título',
      type: 'text',
      required: true
    },
    {
      name: 'data',
      label: 'Data',
      type: 'date',
      required: true
    }
  ]
});

// Gerar relatório
const report = await generateAppointmentsReport({
  dataInicio: '2024-01-01',
  dataFim: '2024-01-31',
  agendamentos: [...]
});
```

### Componentes

- `TemplateManager` - Gerenciador principal de templates
- `TemplateEditor` - Editor visual de templates
- `TemplatePreview` - Preview com dados de exemplo
- `TemplateInstanceModal` - Modal para criar instâncias

## 🔧 Integração

### Hook de Gamificação

O hook `useGamification` fornece métodos para rastrear ações:

```typescript
const {
  trackAppointmentCreated,
  trackPatientCreated,
  trackProfessionalCreated,
  trackLogin,
  trackReportGenerated,
  trackTemplateUsed,
  userStats,
  currentLevel,
  currentPoints,
} = useGamification();
```

### Hook de Templates

O hook `useTemplates` fornece métodos para gerenciar templates:

```typescript
const {
  createTemplate,
  generateContent,
  getTemplatesByType,
  generateAppointmentsReport,
  generateAppointmentReminder,
  exportTemplateToFile,
} = useTemplates();
```

## 📊 Persistência de Dados

### Gamificação

- Dados salvos no localStorage
- Chave: `gamification_${userId}`
- Conquistas: `achievements_${userId}`
- Eventos: `events_${userId}`

### Templates

- Templates: `templates`
- Instâncias: `template_instances`

## 🎯 Exemplo de Integração

```typescript
// Exemplo completo de integração
const ExampleComponent = () => {
  const { trackAppointmentCreated } = useGamification();
  const { generateAppointmentsReport } = useTemplates();

  const handleCreateAppointment = async (appointmentData) => {
    // Criar agendamento...

    // Rastrear para gamificação
    await trackAppointmentCreated({
      count: 1,
      totalValue: appointmentData.valor,
      professionalId: appointmentData.profissionalId
    });
  };

  const handleGenerateReport = async () => {
    // Gerar relatório...
    const report = await generateAppointmentsReport(data);

    // Rastrear geração de relatório
    await trackReportGenerated({
      reportType: 'agendamentos',
      recordCount: data.agendamentos.length
    });
  };

  return (
    <div>
      {/* Componentes da interface */}
    </div>
  );
};
```

## 📁 Estrutura de Arquivos

```
src/
├── stores/
│   ├── gamificationStore.ts      # Store da gamificação
│   └── templateStore.ts          # Store dos templates
├── components/
│   ├── Gamification/
│   │   ├── GamificationDashboard.tsx
│   │   ├── GamificationWidget.tsx
│   │   └── index.ts
│   └── Templates/
│       ├── TemplateManager.tsx
│       ├── TemplateEditor.tsx
│       ├── TemplatePreview.tsx
│       ├── TemplateInstanceModal.tsx
│       └── index.ts
├── hooks/
│   ├── useGamification.ts        # Hook da gamificação
│   └── useTemplates.ts           # Hook dos templates
├── pages/
│   ├── Gamification/
│   │   └── GamificationPage.tsx
│   └── Templates/
│       └── TemplatesPage.tsx
├── types/
│   └── global.ts                 # Tipos dos sistemas
└── examples/
    └── SystemsIntegrationExample.tsx
```

## 🚀 Próximos Passos

### Melhorias Sugeridas

1. **Gamificação**
   - Conquistas sazonais
   - Badges especiais
   - Recompensas por níveis
   - Desafios diários/semanais

2. **Templates**
   - Editor WYSIWYG
   - Biblioteca de templates
   - Versionamento
   - Colaboração em tempo real

3. **Integração**
   - Notificações push
   - Relatórios de progresso
   - Análise de uso
   - Personalização avançada

## 📝 Notas Técnicas

- **Zustand**: Usado para gerenciamento de estado
- **LocalStorage**: Persistência de dados (para demonstração)
- **TypeScript**: Tipagem completa dos sistemas
- **Tailwind CSS**: Estilização dos componentes
- **Heroicons**: Ícones utilizados

## 🎉 Conclusão

Os sistemas de Gamificação e Templates foram implementados com sucesso, oferecendo:

- **Engajamento**: Sistema de pontos e conquistas motiva o uso
- **Personalização**: Templates permitem adaptar o sistema às necessidades
- **Flexibilidade**: APIs extensíveis para futuras funcionalidades
- **Usabilidade**: Interfaces intuitivas e responsivas

Ambos os sistemas estão prontos para uso e podem ser facilmente integrados em outras partes do
projeto.
