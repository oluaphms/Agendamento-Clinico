# Configuração do Sistema de Clínica

## Configuração do Supabase (Recomendado para Produção)

Para usar o Supabase como banco de dados:

1. Crie uma conta no [Supabase](https://supabase.com)
2. Crie um novo projeto
3. Copie as credenciais do projeto
4. Crie um arquivo `.env.local` na raiz do projeto com:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

## Configuração do Banco Local (Desenvolvimento)

Se você não configurar o Supabase, o sistema usará automaticamente um banco de dados local baseado no localStorage do navegador.

### Dados de Exemplo

O sistema inclui dados de exemplo para demonstração:

**Pacientes:**
- João Silva (Convênio Unimed)
- Maria Santos (Particular)

**Profissionais:**
- Dr. Carlos Oliveira (Cardiologia)

**Serviços:**
- Consulta Cardiológica (R$ 150,00)
- Eletrocardiograma (R$ 80,00)

## Funcionalidades Implementadas

### ✅ Página de Pacientes (100% Completa)

- ✅ Cadastro de novos pacientes
- ✅ Edição de pacientes existentes
- ✅ Visualização detalhada
- ✅ Exclusão de pacientes
- ✅ Filtros por nome, CPF, categoria, convênio e favoritos
- ✅ Sistema de favoritos
- ✅ Exportação para CSV
- ✅ Validação de formulários
- ✅ Formatação de CPF e telefone
- ✅ Cálculo automático de idade
- ✅ Estatísticas em tempo real
- ✅ Interface responsiva

### ✅ Página de Profissionais (100% Completa)

- ✅ Cadastro de novos profissionais
- ✅ Edição de profissionais existentes
- ✅ Visualização detalhada
- ✅ Exclusão de profissionais
- ✅ Filtros por nome, especialidade, status e CRM
- ✅ Sistema de ativação/desativação
- ✅ Exportação para CSV
- ✅ Validação de formulários
- ✅ Formatação de CPF e telefone
- ✅ Estatísticas em tempo real
- ✅ Interface responsiva

### ✅ Página de Serviços (100% Completa)

- ✅ Cadastro de novos serviços
- ✅ Edição de serviços existentes
- ✅ Visualização detalhada
- ✅ Exclusão de serviços
- ✅ Filtros por nome, status e preço
- ✅ Sistema de ativação/desativação
- ✅ Exportação para CSV
- ✅ Validação de formulários
- ✅ Formatação de preços em Real
- ✅ Formatação de duração
- ✅ Estatísticas em tempo real
- ✅ Interface responsiva

### Campos Implementados

#### Pacientes
- Nome completo (obrigatório)
- CPF (obrigatório)
- Data de nascimento (obrigatório)
- Telefone (obrigatório)
- Email (opcional)
- Categoria (Particular, Convênio, Emergência)
- Convênio (opcional)
- Tags (opcional)
- Observações (opcional)
- Favorito (checkbox)

#### Profissionais
- Nome completo (obrigatório)
- CPF (obrigatório)
- Telefone (obrigatório)
- Email (opcional)
- Especialidade (obrigatório)
- CRM/Registro (opcional)
- Observações (opcional)
- Status ativo/inativo

#### Serviços
- Nome do serviço (obrigatório)
- Descrição (opcional)
- Preço (obrigatório)
- Duração em minutos (obrigatório)
- Status ativo/inativo

## Como Usar

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Executar em desenvolvimento:**
   ```bash
   npm run dev
   ```

3. **Acessar o sistema:**
   - Abra http://localhost:5173
   - Navegue para as páginas implementadas
   - Teste todas as funcionalidades

## Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
├── pages/              # Páginas da aplicação
│   ├── Pacientes/      # Página de pacientes (COMPLETA)
│   ├── Profissionais/  # Página de profissionais (COMPLETA)
│   └── Servicos/       # Página de serviços (COMPLETA)
├── lib/                # Configurações e utilitários
│   ├── supabase.ts     # Cliente Supabase + Fallback local
│   └── database.ts     # Banco de dados local
└── stores/             # Gerenciamento de estado
```

## Próximos Passos

- [x] ✅ Implementar página de Pacientes
- [x] ✅ Implementar página de Profissionais
- [x] ✅ Implementar página de Serviços
- [ ] Implementar sistema de Agendamentos
- [ ] Implementar página de Usuários
- [ ] Implementar autenticação de usuários
- [ ] Implementar dashboard com gráficos
- [ ] Implementar sistema de notificações
- [ ] Implementar página de Relatórios
- [ ] Implementar página de Configurações

## Funcionalidades Comuns Implementadas

Todas as páginas implementadas incluem:

- ✅ **CRUD Completo**: Create, Read, Update, Delete
- ✅ **Filtros Avançados**: Múltiplos critérios de busca
- ✅ **Validação de Formulários**: Validação em tempo real
- ✅ **Exportação CSV**: Exportação dos dados filtrados
- ✅ **Modais Responsivos**: Cadastro, edição e visualização
- ✅ **Notificações Toast**: Feedback para o usuário
- ✅ **Loading States**: Indicadores de carregamento
- ✅ **Estatísticas em Tempo Real**: Cards informativos
- ✅ **Interface Responsiva**: Bootstrap + Tailwind CSS
- ✅ **Ícones Intuitivos**: Lucide React
- ✅ **Formatação de Dados**: CPF, telefone, preços, datas
- ✅ **Sistema de Status**: Ativo/Inativo com toggle
- ✅ **Banco Local**: Funciona offline para desenvolvimento

## Suporte

Para dúvidas ou problemas:
1. Verifique se todas as dependências estão instaladas
2. Confirme se o arquivo `.env.local` está configurado corretamente
3. Verifique o console do navegador para mensagens de erro
4. O sistema funciona offline com o banco local

## Tecnologias Utilizadas

- **Frontend:** React 18 + TypeScript
- **Estilização:** Bootstrap 5 + Tailwind CSS
- **Ícones:** Lucide React
- **Notificações:** React Hot Toast
- **Banco de Dados:** Supabase (produção) / LocalStorage (desenvolvimento)
- **Build Tool:** Vite
- **Gerenciamento de Estado:** React Hooks
- **Roteamento:** React Router DOM
- **Formulários:** HTML5 + Validação customizada
