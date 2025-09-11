# Sistema de Permissões - Sistema de Gestão de Clínica

## 📋 Visão Geral

Este documento descreve o sistema de permissões implementado para o Sistema de Gestão de Clínica,
incluindo as tabelas do banco de dados, funcionalidades e como utilizá-las.

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

#### 1. `permissions` - Permissões do Sistema

```sql
- id (UUID, PK)
- name (VARCHAR) - Nome da permissão
- description (TEXT) - Descrição da permissão
- resource (VARCHAR) - Recurso do sistema (ex: patients, schedule)
- action (VARCHAR) - Ação permitida (ex: read, create, update, delete)
- created_at, updated_at (TIMESTAMP)
```

#### 2. `roles` - Papéis/Funções

```sql
- id (UUID, PK)
- name (VARCHAR) - Nome do role
- description (TEXT) - Descrição do role
- is_system_role (BOOLEAN) - Se é um role do sistema
- created_at, updated_at (TIMESTAMP)
```

#### 3. `role_permissions` - Relacionamento Roles-Permissões

```sql
- id (UUID, PK)
- role_id (UUID, FK) - Referência ao role
- permission_id (UUID, FK) - Referência à permissão
- created_at (TIMESTAMP)
```

#### 4. `user_roles` - Relacionamento Usuários-Roles

```sql
- id (UUID, PK)
- user_id (UUID, FK) - Referência ao usuário
- role_id (UUID, FK) - Referência ao role
- assigned_by (UUID, FK) - Quem atribuiu o role
- created_at, updated_at (TIMESTAMP)
```

## 🚀 Scripts Disponíveis

### 1. `11-permissoes-tabelas.sql`

- Cria todas as tabelas de permissões
- Configura índices para performance
- Implementa Row Level Security (RLS)
- Cria triggers para auditoria
- Insere dados iniciais (permissões e roles básicos)

### 2. `12-permissoes-dados-exemplo.sql`

- Insere dados de exemplo
- Atribui roles aos usuários existentes
- Cria usuários de exemplo
- Cria roles customizados

### 3. `13-verificar-permissoes.sql`

- Verifica se as tabelas foram criadas corretamente
- Testa relacionamentos
- Valida constraints
- Gera relatório de status

### 4. `executar-permissoes-completo.sql`

- Executa todos os scripts em sequência
- Gera relatório final

## 🔐 Permissões Disponíveis

### Recursos do Sistema

- **patients** - Gestão de pacientes
- **professionals** - Gestão de profissionais
- **schedule** - Gestão da agenda
- **services** - Gestão de serviços
- **reports** - Relatórios
- **users** - Gestão de usuários
- **settings** - Configurações
- **backup** - Backup e restauração
- **permissions** - Gestão de permissões
- **notifications** - Notificações

### Ações Disponíveis

- **read** - Visualizar
- **create** - Criar
- **update** - Editar
- **delete** - Excluir
- **manage** - Gerenciar (todas as ações)
- **export** - Exportar
- **cancel** - Cancelar

## 👥 Roles Predefinidos

### 1. Administrador

- **Acesso**: Completo ao sistema
- **Permissões**: Todas as permissões disponíveis
- **Uso**: Gestores do sistema

### 2. Gerente

- **Acesso**: Gerenciamento (exceto permissões e backup)
- **Permissões**: Todas exceto permissões e backup
- **Uso**: Gerentes de clínica

### 3. Recepcionista

- **Acesso**: Recepção e atendimento
- **Permissões**:
  - Pacientes (read, create, update)
  - Agenda (read, create, update, cancel)
  - Serviços (read)
  - Relatórios (read)
  - Notificações (read)

### 4. Profissional de Saúde

- **Acesso**: Atendimento médico
- **Permissões**:
  - Pacientes (read, update)
  - Agenda (read, update)
  - Serviços (read)
  - Relatórios (read, export)
  - Notificações (read)

### 5. Usuário

- **Acesso**: Básico
- **Permissões**:
  - Pacientes (read)
  - Agenda (read)
  - Serviços (read)
  - Notificações (read)

## 🛠️ Como Executar

### Opção 1: Execução Completa

```sql
-- No Supabase SQL Editor, execute:
\i scripts/executar-permissoes-completo.sql
```

### Opção 2: Execução Individual

```sql
-- 1. Criar tabelas
\i scripts/11-permissoes-tabelas.sql

-- 2. Inserir dados de exemplo
\i scripts/12-permissoes-dados-exemplo.sql

-- 3. Verificar implementação
\i scripts/13-verificar-permissoes.sql
```

## 🔍 Verificações de Segurança

### Row Level Security (RLS)

- **permissions**: Todos podem visualizar, apenas admins podem gerenciar
- **roles**: Todos podem visualizar, apenas admins podem gerenciar
- **role_permissions**: Todos podem visualizar, apenas admins podem gerenciar
- **user_roles**: Usuários veem seus próprios roles, apenas admins podem gerenciar

### Constraints

- **unique_resource_action**: Evita permissões duplicadas
- **unique_role_permission**: Evita relacionamentos duplicados
- **unique_user_role**: Evita roles duplicados por usuário

## 📊 Consultas Úteis

### Verificar permissões de um usuário

```sql
SELECT
    u.nome,
    r.name as role_name,
    p.name as permission_name,
    p.resource,
    p.action
FROM usuarios u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE u.email = 'usuario@exemplo.com'
ORDER BY p.resource, p.action;
```

### Verificar roles de um usuário

```sql
SELECT
    u.nome,
    r.name as role_name,
    r.description
FROM usuarios u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE u.email = 'usuario@exemplo.com';
```

### Listar todas as permissões por recurso

```sql
SELECT
    resource,
    action,
    name,
    description
FROM permissions
ORDER BY resource, action;
```

## 🔧 Integração com Frontend

O sistema de permissões está integrado com o `permissionService.ts` que fornece:

- **getPermissions()** - Listar todas as permissões
- **getRoles()** - Listar todos os roles
- **getUserRoles(userId)** - Roles de um usuário
- **assignRoleToUser(userId, roleId)** - Atribuir role
- **checkPermission(userId, resource, action)** - Verificar permissão

## ⚠️ Considerações Importantes

1. **Backup**: Sempre faça backup antes de executar os scripts
2. **Testes**: Execute em ambiente de desenvolvimento primeiro
3. **Permissões**: Apenas usuários com nível 'admin' podem gerenciar permissões
4. **Roles do Sistema**: Roles marcados como `is_system_role = true` não devem ser excluídos
5. **Performance**: Os índices foram criados para otimizar consultas frequentes

## 🐛 Troubleshooting

### Erro: "Tabela não existe"

- Execute primeiro o script `11-permissoes-tabelas.sql`

### Erro: "Constraint violation"

- Verifique se não está tentando inserir dados duplicados

### Erro: "Permission denied"

- Verifique se o usuário tem permissões de administrador

### Performance lenta

- Verifique se os índices foram criados corretamente
- Use `EXPLAIN ANALYZE` para analisar consultas

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique os logs do Supabase
2. Execute o script de verificação
3. Consulte a documentação do Supabase
4. Verifique as políticas de RLS

---

**Sistema de Gestão de Clínica** - Sistema de Permissões v1.0
