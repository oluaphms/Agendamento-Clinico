# 🏥 Sistema de Gestão de Clínica

Um sistema completo e moderno para gestão de clínicas médicas, desenvolvido com React, TypeScript e Supabase.

![Sistema Clínica](https://img.shields.io/badge/Status-Produção-brightgreen)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue)
![Supabase](https://img.shields.io/badge/Supabase-2.38.4-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3.0-38B2AC)

## ✨ Características Principais

- 🔐 **Autenticação Segura** - Sistema de login com Supabase Auth
- 👥 **Gestão de Usuários** - Controle de acesso baseado em roles
- 📅 **Agendamento Inteligente** - Sistema completo de marcação de consultas
- 👨‍⚕️ **Gestão de Profissionais** - Cadastro e controle de equipe médica
- 🏥 **Gestão de Pacientes** - Histórico médico completo
- 💰 **Controle Financeiro** - Gestão de serviços e valores
- 📊 **Dashboard Analítico** - Gráficos e estatísticas em tempo real
- 📋 **Relatórios Avançados** - Geração de relatórios personalizados
- 🌐 **Multi-idioma** - Suporte para Português, Inglês e Espanhol
- 📱 **Responsivo** - Interface adaptável para todos os dispositivos

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 18** - Biblioteca para interfaces de usuário
- **TypeScript** - Tipagem estática para JavaScript
- **Tailwind CSS** - Framework CSS utilitário
- **Zustand** - Gerenciamento de estado
- **React Router** - Roteamento da aplicação
- **Recharts** - Biblioteca de gráficos
- **Lucide React** - Ícones modernos

### Backend & Infraestrutura
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Banco de dados relacional
- **Row Level Security** - Segurança em nível de linha
- **Real-time** - Atualizações em tempo real

### Ferramentas de Desenvolvimento
- **Vite** - Build tool rápida
- **ESLint** - Linting de código
- **Jest** - Framework de testes
- **Testing Library** - Utilitários para testes

## 📋 Funcionalidades

### 🔐 Autenticação e Autorização
- Login/Logout seguro
- Registro de novos usuários
- Recuperação de senha
- Controle de acesso baseado em roles
- Sessões persistentes

### 📅 Sistema de Agendamento
- Marcação de consultas
- Calendário visual
- Confirmação de agendamentos
- Cancelamento e reagendamento
- Lembretes automáticos

### 👥 Gestão de Usuários
- Cadastro de usuários
- Definição de perfis e permissões
- Controle de acesso granular
- Histórico de atividades

### 🏥 Gestão de Pacientes
- Cadastro completo de pacientes
- Histórico médico
- Documentos e exames
- Contatos de emergência

### 👨‍⚕️ Gestão de Profissionais
- Cadastro de equipe médica
- Especialidades e horários
- Disponibilidade para agendamentos
- Avaliações e feedback

### 💰 Gestão Financeira
- Cadastro de serviços
- Definição de valores
- Controle de pagamentos
- Relatórios financeiros

### 📊 Dashboard e Analytics
- Visão geral da clínica
- Estatísticas em tempo real
- Gráficos interativos
- Métricas de performance

### 📋 Sistema de Relatórios
- Relatórios personalizáveis
- Exportação em múltiplos formatos
- Filtros avançados
- Agendamento de relatórios

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Conta no Supabase

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/sistema-clinica.git
cd sistema-clinica
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
```bash
cp env.example .env.local
```

Edite o arquivo `.env.local` com suas credenciais do Supabase:
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### 4. Configure o banco de dados
Execute os scripts SQL fornecidos na pasta `database/` para criar as tabelas necessárias.

### 5. Execute o projeto
```bash
npm run dev
```

O sistema estará disponível em `http://localhost:5173`

## 🧪 Testes

### Executar todos os testes
```bash
npm test
```

### Executar testes em modo watch
```bash
npm run test:watch
```

### Gerar relatório de cobertura
```bash
npm run test:coverage
```

## 🏗️ Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── Auth/           # Componentes de autenticação
│   ├── Layout/         # Componentes de layout
│   └── ErrorBoundary/  # Tratamento de erros
├── pages/              # Páginas da aplicação
│   ├── Agenda/         # Sistema de agendamento
│   ├── Dashboard/      # Painel principal
│   ├── Pacientes/      # Gestão de pacientes
│   ├── Usuarios/       # Gestão de usuários
│   └── ...             # Outras páginas
├── stores/             # Gerenciamento de estado
├── lib/                # Utilitários e configurações
│   ├── supabase.ts     # Configuração do Supabase
│   ├── cache.ts        # Sistema de cache
│   ├── validation.ts   # Validações
│   └── i18n.ts         # Internacionalização
└── tests/              # Testes unitários
```

## 🔒 Segurança

- **Autenticação JWT** com Supabase Auth
- **Row Level Security** no banco de dados
- **Validação de entrada** em todos os formulários
- **Controle de acesso** baseado em roles
- **HTTPS** obrigatório em produção
- **Sanitização** de dados de entrada

## 🌐 Internacionalização

O sistema suporta múltiplos idiomas:
- 🇧🇷 Português (Brasil) - Padrão
- 🇺🇸 Inglês (Estados Unidos)
- 🇪🇸 Espanhol

## 📱 Responsividade

Interface totalmente responsiva que funciona em:
- 📱 Smartphones
- 📱 Tablets
- 💻 Desktops
- 🖥️ Monitores grandes

## 🚀 Deploy

### Vercel (Recomendado)
```bash
npm run build
vercel --prod
```

### Netlify
```bash
npm run build
# Faça upload da pasta dist/
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Desenvolvedor

**Paulo Henrique**
- Email: paulo@exemplo.com
- LinkedIn: [Paulo Henrique](https://linkedin.com/in/paulo-henrique)
- GitHub: [@paulo-henrique](https://github.com/paulo-henrique)

## 🙏 Agradecimentos

- [Supabase](https://supabase.com) pela infraestrutura
- [Tailwind CSS](https://tailwindcss.com) pelo framework CSS
- [React](https://reactjs.org) pela biblioteca de UI
- [Vite](https://vitejs.dev) pela ferramenta de build

## 📞 Suporte

Para suporte técnico ou dúvidas:
- 📧 Email: suporte@clinica.com
- 💬 Discord: [Servidor da Clínica](https://discord.gg/clinica)
- 📖 Documentação: [docs.clinica.com](https://docs.clinica.com)

---

⭐ **Se este projeto te ajudou, considere dar uma estrela!** ⭐
