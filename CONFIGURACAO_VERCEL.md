# 🚀 Configuração do Vercel - Sistema Clínico

## ❌ Problema Atual
```
Falha na implantação — A variável de ambiente "VITE_SUPABASE_URL" faz referência ao segredo "vite_supabase_url", que não existe.
```

## ✅ Solução: Configurar Variáveis de Ambiente no Vercel

### 1. Acesse o Painel do Vercel
1. Vá para [vercel.com](https://vercel.com)
2. Faça login na sua conta
3. Selecione o projeto "Sistema-Agendamento-clinico"

### 2. Configure as Variáveis de Ambiente

#### Opção A: Via Interface Web (Recomendado)
1. No painel do projeto, vá para **Settings**
2. Clique em **Environment Variables**
3. Adicione as seguintes variáveis:

| Nome da Variável | Valor | Ambiente |
|------------------|-------|----------|
| `VITE_SUPABASE_URL` | `https://seu-projeto.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `sua_chave_anonima_aqui` | Production, Preview, Development |
| `VITE_APP_ENVIRONMENT` | `production` | Production |
| `VITE_ENABLE_MOCK_DATA` | `false` | Production |
| `VITE_ENABLE_DEBUG_LOGS` | `false` | Production |

#### Opção B: Via CLI do Vercel
```bash
# Instalar Vercel CLI (se não tiver)
npm i -g vercel

# Fazer login
vercel login

# Configurar variáveis
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_APP_ENVIRONMENT
vercel env add VITE_ENABLE_MOCK_DATA
vercel env add VITE_ENABLE_DEBUG_LOGS
```

### 3. Obter Credenciais do Supabase

#### Se você já tem um projeto Supabase:
1. Acesse [supabase.com](https://supabase.com)
2. Vá para o seu projeto
3. Clique em **Settings** → **API**
4. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

#### Se você precisa criar um projeto Supabase:
1. Acesse [supabase.com](https://supabase.com)
2. Clique em **New Project**
3. Escolha uma organização
4. Configure:
   - **Name**: `sistema-clinico`
   - **Database Password**: (escolha uma senha forte)
   - **Region**: (escolha a mais próxima)
5. Clique em **Create new project**
6. Aguarde a criação (2-3 minutos)
7. Vá para **Settings** → **API** e copie as credenciais

### 4. Configurar Banco de Dados

#### Executar Scripts SQL no Supabase:
1. No painel do Supabase, vá para **SQL Editor**
2. Execute os scripts na seguinte ordem:

```sql
-- 1. Executar o schema principal
-- (copie o conteúdo do arquivo database/schema.sql)

-- 2. Executar dados básicos
-- (copie o conteúdo do arquivo scripts/01-dados-basicos.sql)

-- 3. Executar configurações de permissões
-- (copie o conteúdo do arquivo scripts/10-permissoes-dados.sql)
```

### 5. Testar a Configuração

#### Verificar se as variáveis estão corretas:
```bash
# No terminal do projeto
vercel env ls
```

#### Fazer novo deploy:
```bash
# Fazer push das alterações
git add .
git commit -m "fix: Configurar variáveis de ambiente para Vercel"
git push origin main

# Ou fazer deploy manual
vercel --prod
```

### 6. Verificar Deploy

1. Acesse o link do deploy no Vercel
2. Verifique se a aplicação carrega sem erros
3. Teste o login (usuário padrão: admin / admin123)
4. Verifique se os dados estão sendo carregados do Supabase

## 🔧 Configurações Adicionais Recomendadas

### Variáveis de Ambiente Completas:

```env
# Ambiente
VITE_APP_ENVIRONMENT=production
VITE_APP_TITLE=Sistema Clínico
VITE_APP_VERSION=1.0.0

# Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui

# Configurações de Produção
VITE_ENABLE_MOCK_DATA=false
VITE_ENABLE_DEBUG_LOGS=false
VITE_ENABLE_ERROR_REPORTING=true

# API (se aplicável)
VITE_API_URL=https://sua-api.com/api
```

### Configurações de Domínio (Opcional):
1. No Vercel, vá para **Settings** → **Domains**
2. Adicione seu domínio personalizado
3. Configure DNS conforme instruções

## 🚨 Troubleshooting

### Erro: "Failed to fetch"
- Verifique se as credenciais do Supabase estão corretas
- Verifique se o projeto Supabase está ativo
- Verifique se as políticas RLS estão configuradas

### Erro: "Invalid API key"
- Verifique se copiou a chave correta (anon public)
- Verifique se não há espaços extras na configuração

### Erro: "Database connection failed"
- Verifique se o banco de dados foi configurado
- Execute os scripts SQL necessários
- Verifique se as tabelas foram criadas

## 📞 Suporte

Se ainda tiver problemas:
1. Verifique os logs do Vercel em **Functions** → **View Function Logs**
2. Verifique os logs do Supabase em **Logs** → **API**
3. Teste localmente com as mesmas variáveis de ambiente

---

**✅ Após seguir estes passos, seu sistema estará funcionando perfeitamente no Vercel!**
