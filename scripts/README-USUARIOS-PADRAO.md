# Usuários Padrão do Sistema de Gestão de Clínica

Este documento explica como configurar os usuários padrão do sistema com suas respectivas
permissões.

## Usuários Padrão Criados

O sistema criará automaticamente os seguintes usuários padrão:

| Usuário           | CPF            | Senha | Nível de Acesso | Permissões              |
| ----------------- | -------------- | ----- | --------------- | ----------------------- |
| **Administrador** | 111.111.111.11 | 111   | admin           | Acesso total ao sistema |
| **Recepcionista** | 222.222.222.22 | 222   | recepcao        | Acesso de recepção      |
| **Desenvolvedor** | 333.333.333.33 | 333   | desenvolvedor   | Acesso total ao sistema |
| **Profissional**  | 444.444.444.44 | 4444  | profissional    | Acesso profissional     |

## Scripts Disponíveis

### 1. `setup-usuarios-padrao-completo.sql`

**Script principal** - Execute este script para configurar tudo automaticamente.

**O que faz:**

- Atualiza o schema da tabela `usuarios` se necessário
- Cria os 4 usuários padrão com suas credenciais
- Verifica se o sistema de permissões existe
- Atribui os roles apropriados a cada usuário
- Gera relatório de verificação

**Como executar:**

```sql
-- Execute no Supabase SQL Editor ou no seu cliente PostgreSQL
\i scripts/setup-usuarios-padrao-completo.sql
```

### 2. `usuarios-padrao.sql`

**Script específico** - Apenas cria os usuários padrão (requer sistema de permissões já
configurado).

**Quando usar:**

- Quando o sistema de permissões já está configurado
- Para recriar apenas os usuários padrão

### 3. `permissoes-corrigido-final.sql`

**Script de permissões** - Configura o sistema de permissões completo.

**Quando usar:**

- Primeira configuração do sistema
- Quando as permissões não estão configuradas

## Ordem de Execução Recomendada

Para uma configuração completa do sistema:

1. **Primeiro:** Execute o sistema de permissões

   ```sql
   \i scripts/permissoes-corrigido-final.sql
   ```

2. **Segundo:** Execute o setup completo dos usuários
   ```sql
   \i scripts/setup-usuarios-padrao-completo.sql
   ```

## Níveis de Acesso

### Administrador (admin)

- **Acesso:** Total ao sistema
- **Permissões:** Todas as permissões disponíveis
- **Inclui:** Gerenciamento de usuários, configurações, backup, permissões

### Desenvolvedor (desenvolvedor)

- **Acesso:** Total ao sistema (igual ao administrador)
- **Permissões:** Todas as permissões disponíveis
- **Inclui:** Gerenciamento de usuários, configurações, backup, permissões

### Recepcionista (recepcao)

- **Acesso:** Recepção e agendamentos
- **Permissões:**
  - Pacientes: visualizar, criar, editar
  - Agenda: visualizar, criar, editar, cancelar
  - Serviços: visualizar
  - Relatórios: visualizar
  - Notificações: visualizar

### Profissional (profissional)

- **Acesso:** Profissional de saúde
- **Permissões:**
  - Pacientes: visualizar, editar
  - Agenda: visualizar, editar
  - Serviços: visualizar
  - Relatórios: visualizar, exportar
  - Notificações: visualizar

## Verificação

Após executar os scripts, você pode verificar se tudo foi configurado corretamente:

```sql
-- Verificar usuários criados
SELECT nome, cpf, nivel_acesso, status FROM usuarios WHERE cpf IN ('111.111.111.11', '222.222.222.22', '333.333.333.33', '444.444.444.44');

-- Verificar roles atribuídos
SELECT u.nome, u.cpf, r.name as role_name
FROM usuarios u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE u.cpf IN ('111.111.111.11', '222.222.222.22', '333.333.333.33', '444.444.444.44');

-- Verificar permissões do administrador
SELECT p.name, p.resource, p.action
FROM usuarios u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE u.cpf = '111.111.111.11'
ORDER BY p.resource, p.action;
```

## Segurança

- As senhas são criptografadas usando bcrypt
- Os usuários padrão têm `primeiro_acesso = false`
- Todos os usuários estão com status `ativo`
- O sistema usa Row Level Security (RLS) para proteção adicional

## Troubleshooting

### Erro: "Sistema de permissões não encontrado"

**Solução:** Execute primeiro o script `permissoes-corrigido-final.sql`

### Erro: "nivel_acesso check constraint"

**Solução:** O script `setup-usuarios-padrao-completo.sql` atualiza automaticamente o schema

### Usuários não conseguem fazer login

**Verificações:**

1. Confirme se as credenciais estão corretas
2. Verifique se o usuário está ativo: `SELECT status FROM usuarios WHERE cpf = 'XXX.XXX.XXX.XX'`
3. Verifique se as permissões foram atribuídas corretamente

## Suporte

Para dúvidas ou problemas:

1. Verifique os logs do banco de dados
2. Execute as consultas de verificação
3. Consulte a documentação do sistema de permissões
