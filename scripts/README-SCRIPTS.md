# Scripts SQL para Sistema Clínico

Este diretório contém scripts SQL para popular o banco de dados do Sistema Clínico com dados de
exemplo e configurações necessárias.

## 📋 Lista de Scripts

### 1. **00-setup-completo-sistema.sql** ⚙️

**Script Principal - Execute PRIMEIRO**

- Cria toda a estrutura base do sistema
- Define tabelas, tipos, índices e triggers
- Inclui dados iniciais (seeds) básicos
- Configura políticas de segurança
- **IMPORTANTE**: Execute este script antes de todos os outros

### 2. **01-dashboard-dados.sql** 📊

**Dados para página Dashboard**

- Estatísticas gerais do sistema
- Agendamentos de exemplo
- Pagamentos e receitas
- Notificações para o dashboard
- Dados para gráficos e métricas

### 3. **02-pacientes-dados.sql** 👥

**Dados para página Pacientes**

- Lista completa de pacientes
- Dados demográficos variados
- Pacientes ativos, inativos e suspensos
- Dados para testes de filtros e busca
- Estatísticas de pacientes

### 4. **03-profissionais-dados.sql** 👨‍⚕️

**Dados para página Profissionais**

- Lista completa de profissionais
- Dados profissionais variados
- Profissionais ativos e inativos
- Dados para testes de filtros e busca
- Estatísticas de profissionais

### 5. **04-servicos-dados.sql** 🏥

**Dados para página Serviços**

- Lista completa de serviços
- Dados de serviços variados
- Serviços ativos e inativos
- Dados para testes de filtros e busca
- Estatísticas de serviços

### 6. **05-agenda-dados.sql** 📅

**Dados para página Agenda**

- Agendamentos futuros (próximos 30 dias)
- Agendamentos concluídos (histórico)
- Agendamentos cancelados
- Dados para testes de filtros e busca
- Estatísticas da agenda

### 7. **06-relatorios-dados.sql** 📈

**Dados para página Relatórios**

- Agendamentos históricos (últimos 90 dias)
- Pagamentos para relatórios financeiros
- Dados para relatórios por profissional
- Dados para relatórios por serviço
- Dados para relatórios de pagamento

### 8. **07-configuracoes-dados.sql** ⚙️

**Dados para página Configurações**

- Configurações do sistema
- Configurações de notificações
- Configurações de segurança
- Configurações de interface
- Configurações de backup e integração

### 9. **08-notificacoes-dados.sql** 🔔

**Dados para página Notificações**

- Notificações para diferentes usuários
- Notificações de diferentes tipos
- Notificações lidas e não lidas
- Notificações históricas
- Estatísticas de notificações

### 10. **09-usuarios-dados.sql** 👤

**Dados para página Usuários**

- Lista completa de usuários
- Usuários de diferentes níveis de acesso
- Usuários ativos, inativos e suspensos
- Usuários com primeiro acesso
- Estatísticas de usuários

### 11. **10-permissoes-dados.sql** 🔐

**Dados para página Permissões**

- Tabela de permissões
- Permissões por nível de acesso
- Permissões específicas de usuários
- Dados para testes de filtros e busca
- Estatísticas de permissões

## 🚀 Como Executar

### Ordem de Execução

1. **Execute PRIMEIRO**: `00-setup-completo-sistema.sql`
2. **Execute os demais** na ordem que preferir (1-10)

### No Supabase

1. Acesse o Supabase Dashboard
2. Vá para SQL Editor
3. Cole o conteúdo do script
4. Execute o script
5. Verifique se não há erros

### No PostgreSQL

```bash
psql -h localhost -U usuario -d database -f 00-setup-completo-sistema.sql
psql -h localhost -U usuario -d database -f 01-dashboard-dados.sql
# ... continue com os demais scripts
```

## 📊 Dados Incluídos

### Usuários

- 3 Administradores
- 4 Recepcionistas
- 4 Profissionais
- 3 Desenvolvedores
- Usuários inativos e suspensos

### Pacientes

- 20+ Pacientes com dados completos
- Dados demográficos variados
- Histórico médico e alergias
- Convênios e contatos de emergência

### Profissionais

- 10+ Profissionais de diferentes especialidades
- Dados profissionais completos
- Horários de trabalho e disponibilidade
- Valores de consulta

### Serviços

- 50+ Serviços de diferentes categorias
- Consultas, exames, procedimentos
- Preços e durações variadas
- Serviços ativos e inativos

### Agendamentos

- Agendamentos futuros (30 dias)
- Agendamentos históricos (90 dias)
- Diferentes status e situações
- Pagamentos associados

### Configurações

- Configurações do sistema
- Configurações de notificações
- Configurações de segurança
- Configurações de interface

## 🔧 Personalização

### Modificar Dados

- Edite os scripts conforme necessário
- Ajuste quantidades e valores
- Adicione dados específicos da sua clínica

### Adicionar Novos Dados

- Crie novos scripts seguindo o padrão
- Use a mesma estrutura de comentários
- Inclua consultas úteis para a página

## ⚠️ Importante

- **Sempre execute o script principal primeiro**
- **Faça backup antes de executar em produção**
- **Verifique se não há conflitos de dados**
- **Teste em ambiente de desenvolvimento primeiro**

## 📝 Notas

- Os scripts são compatíveis com PostgreSQL e Supabase
- Incluem dados de exemplo realistas
- Possuem consultas úteis para cada página
- Seguem boas práticas de SQL
- Incluem comentários explicativos

## 🆘 Suporte

Se encontrar problemas:

1. Verifique se executou o script principal primeiro
2. Confirme se não há erros de sintaxe
3. Verifique se as tabelas foram criadas corretamente
4. Consulte os logs do banco de dados
