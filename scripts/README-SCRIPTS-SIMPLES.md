# Scripts SQL Simples para Sistema Clínico

Este diretório contém scripts SQL simplificados para popular o banco de dados do Sistema Clínico com
dados básicos.

## 📋 Scripts Disponíveis

### 1. **00-setup-simples.sql** ⚙️

**Script Principal - Execute PRIMEIRO**

- Cria apenas a estrutura básica necessária
- Tabelas simplificadas sem colunas complexas
- Dados iniciais básicos
- **IMPORTANTE**: Execute este script antes de todos os outros

### 2. **01-dados-basicos.sql** 📊

**Dados Básicos - Execute SEGUNDO**

- Pacientes de exemplo
- Profissionais de exemplo
- Serviços básicos
- Agendamentos de exemplo
- Pagamentos de exemplo
- Notificações de exemplo

## 🚀 Como Executar

### Ordem de Execução

1. **Execute PRIMEIRO**: `00-setup-simples.sql`
2. **Execute SEGUNDO**: `01-dados-basicos.sql`

### No Supabase

1. Acesse o Supabase Dashboard
2. Vá para SQL Editor
3. Cole o conteúdo do script
4. Execute o script
5. Verifique se não há erros

## 📊 Dados Incluídos

### Usuários

- 3 Usuários básicos (admin, recepcao, dev)

### Pacientes

- 10 Pacientes com dados básicos
- Nome, CPF, data de nascimento, telefone, email, observações

### Profissionais

- 10 Profissionais de diferentes especialidades
- Nome, CPF, CRM, especialidade, telefone, email, observações

### Serviços

- 5 Serviços básicos
- Consulta Médica, Exame de Sangue, Ultrassom, Eletrocardiograma, Consulta de Retorno

### Agendamentos

- Agendamentos de hoje, amanhã e próxima semana
- Diferentes status e situações

### Pagamentos

- Pagamentos realizados e pendentes
- Diferentes formas de pagamento

### Notificações

- Notificações para diferentes usuários
- Diferentes tipos e status

## ⚠️ Importante

- **Execute sempre o script principal primeiro**
- **Faça backup antes de executar em produção**
- **Teste em ambiente de desenvolvimento primeiro**
- **Estes scripts são simplificados e compatíveis com a estrutura atual**

## 🔧 Estrutura das Tabelas

### Tabela `usuarios`

- id (UUID)
- nome, email, cpf, telefone, cargo
- nivel_acesso, status
- senha_hash, primeiro_acesso, ultimo_login
- created_at, updated_at

### Tabela `pacientes`

- id (UUID)
- nome, cpf, data_nascimento, telefone, email
- observacoes
- created_at, updated_at

### Tabela `profissionais`

- id (INTEGER)
- nome, cpf, crm, especialidade, telefone, email
- ativo, observacoes
- data_cadastro, ultima_atualizacao

### Tabela `servicos`

- id (INTEGER)
- nome, descricao, duracao_min, preco
- ativo
- data_cadastro, ultima_atualizacao

### Tabela `agendamentos`

- id (UUID)
- paciente_id, profissional_id, servico_id
- data, hora, status, observacoes
- created_at, updated_at

### Tabela `pagamentos`

- id (UUID)
- agendamento_id, valor, forma_pagamento, status
- data_pagamento, observacoes
- created_at, updated_at

### Tabela `configuracoes`

- id (UUID)
- chave, valor (JSONB), descricao, categoria
- created_at, updated_at

### Tabela `audit_log`

- id (UUID)
- tabela, acao, dados_anteriores, dados_novos
- profissional_id, usuario_id, timestamp, ip
- created_at

### Tabela `notificacoes`

- id (UUID)
- usuario_id, titulo, mensagem, tipo, lida
- created_at

## 🆘 Suporte

Se encontrar problemas:

1. Verifique se executou o script principal primeiro
2. Confirme se não há erros de sintaxe
3. Verifique se as tabelas foram criadas corretamente
4. Consulte os logs do banco de dados

## 📝 Notas

- Os scripts são compatíveis com PostgreSQL e Supabase
- Incluem dados de exemplo realistas
- Possuem consultas úteis para cada página
- Seguem boas práticas de SQL
- Incluem comentários explicativos
- Estrutura simplificada para evitar erros de compatibilidade
