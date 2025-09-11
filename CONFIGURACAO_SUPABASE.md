# 🔧 Configuração do Supabase - Sistema Clínico

## 📋 Pré-requisitos

1. **Conta no Supabase**: Crie uma conta gratuita em [supabase.com](https://supabase.com)
2. **Projeto criado**: Crie um novo projeto no Supabase

## 🚀 Passo a Passo

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "New Project"
3. Escolha sua organização
4. Digite um nome para o projeto (ex: "sistema-clinico")
5. Escolha uma senha forte para o banco de dados
6. Selecione uma região próxima (ex: South America - São Paulo)
7. Clique em "Create new project"

### 2. Obter Credenciais

1. No painel do projeto, vá para **Settings** → **API**
2. Copie a **Project URL** (ex: `https://abcdefghijklmnop.supabase.co`)
3. Copie a **anon public** key (ex: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 3. Configurar Arquivo .env.local

Edite o arquivo `.env.local` na raiz do projeto:

```env
# ============================================================================
# CONFIGURAÇÕES DO SUPABASE
# ============================================================================
VITE_SUPABASE_URL=https://SEU_PROJETO_ID.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui

# ============================================================================
# CONFIGURAÇÕES DE DESENVOLVIMENTO
# ============================================================================
VITE_ENABLE_MOCK_DATA=false
```

**Substitua:**

- `SEU_PROJETO_ID` pela URL do seu projeto
- `sua_chave_anonima_aqui` pela chave anônima

### 4. Executar Schema do Banco

1. No Supabase, vá para **SQL Editor**
2. Copie todo o conteúdo do arquivo `supabase_schema.sql`
3. Cole no editor SQL
4. Clique em **Run** para executar

### 5. Verificar Tabelas Criadas

1. Vá para **Table Editor**
2. Verifique se as seguintes tabelas foram criadas:
   - `usuarios`
   - `pacientes`
   - `profissionais`
   - `servicos`
   - `agendamentos`
   - `pagamentos`
   - `configuracoes`
   - `notificacoes`
   - `audit_log`
   - `permissions`
   - `roles`
   - `role_permissions`
   - `user_roles`

### 6. Configurar RLS (Row Level Security)

O schema já inclui políticas RLS, mas você pode ajustar conforme necessário:

1. Vá para **Authentication** → **Policies**
2. Verifique se as políticas estão ativas
3. Ajuste conforme suas necessidades de segurança

### 7. Testar Conexão

1. Inicie o projeto: `npm run dev`
2. Acesse o sistema
3. Verifique se os dados estão sendo salvos no Supabase

## 🔐 Usuários Padrão

O schema cria usuários padrão para teste:

| CPF         | Senha | Nível de Acesso |
| ----------- | ----- | --------------- |
| 11111111111 | 111   | Admin           |
| 22222222222 | 222   | Recepção        |
| 33333333333 | 333   | Desenvolvedor   |

## 📊 Dados Iniciais

O sistema já inclui:

- ✅ Serviços padrão (Consulta Médica, Exame de Sangue, etc.)
- ✅ Configurações do sistema
- ✅ Permissões e roles
- ✅ Usuários de teste

## 🛠️ Troubleshooting

### Problema: "Invalid API key"

- Verifique se a chave anônima está correta
- Certifique-se de que não há espaços extras

### Problema: "Failed to fetch"

- Verifique se a URL do projeto está correta
- Teste a conectividade com a internet

### Problema: "Table doesn't exist"

- Execute o schema completo no SQL Editor
- Verifique se todas as tabelas foram criadas

### Problema: "RLS policy violation"

- Verifique as políticas de segurança
- Ajuste as permissões conforme necessário

## 🔄 Backup e Restore

### Backup

```sql
-- No SQL Editor do Supabase
pg_dump -h db.SEU_PROJETO_ID.supabase.co -U postgres -d postgres > backup.sql
```

### Restore

```sql
-- No SQL Editor do Supabase
psql -h db.SEU_PROJETO_ID.supabase.co -U postgres -d postgres < backup.sql
```

## 📈 Monitoramento

1. **Dashboard**: Acompanhe métricas em tempo real
2. **Logs**: Verifique logs de erro em **Logs** → **API**
3. **Performance**: Monitore queries lentas em **Database** → **Logs**

## 🚨 Segurança

- ✅ RLS habilitado em todas as tabelas
- ✅ Políticas de segurança configuradas
- ✅ Auditoria automática de alterações
- ✅ Senhas criptografadas
- ✅ Tokens de autenticação seguros

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs do Supabase
2. Consulte a documentação oficial
3. Teste com dados mock primeiro
4. Verifique a conectividade de rede

---

**✅ Configuração concluída!** Seu sistema agora está usando o Supabase como banco de dados.
