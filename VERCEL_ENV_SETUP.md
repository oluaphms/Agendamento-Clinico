# 🔧 Configuração de Variáveis de Ambiente no Vercel

## ❌ Erro Atual
```
Falha na implantação — A variável de ambiente "VITE_SUPABASE_URL" faz referência ao segredo "vite_supabase_url", que não existe.
```

## ✅ Solução Rápida

### 1. Acesse o Painel do Vercel
1. Vá para [vercel.com](https://vercel.com)
2. Faça login e selecione seu projeto
3. Vá para **Settings** → **Environment Variables**

### 2. Adicione as Variáveis Obrigatórias

| Nome | Valor | Ambiente |
|------|-------|----------|
| `VITE_SUPABASE_URL` | `https://seu-projeto.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `sua_chave_anonima_aqui` | Production, Preview, Development |
| `VITE_APP_ENVIRONMENT` | `production` | Production |
| `VITE_ENABLE_MOCK_DATA` | `false` | Production |
| `VITE_ENABLE_DEBUG_LOGS` | `false` | Production |

### 3. Obter Credenciais do Supabase

#### Se você tem um projeto Supabase:
1. Acesse [supabase.com](https://supabase.com)
2. Vá para **Settings** → **API**
3. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

#### Se precisa criar um projeto:
1. Acesse [supabase.com](https://supabase.com)
2. Clique em **New Project**
3. Configure:
   - **Name**: `sistema-clinico`
   - **Database Password**: (escolha uma senha forte)
   - **Region**: (escolha a mais próxima)
4. Aguarde a criação (2-3 minutos)
5. Vá para **Settings** → **API** e copie as credenciais

### 4. Configurar Banco de Dados

No Supabase, vá para **SQL Editor** e execute:

```sql
-- 1. Schema principal (copie o conteúdo de database/schema.sql)
-- 2. Dados básicos (copie o conteúdo de scripts/01-dados-basicos.sql)
-- 3. Permissões (copie o conteúdo de scripts/10-permissoes-dados.sql)
```

### 5. Fazer Novo Deploy

```bash
# Fazer push das alterações
git add .
git commit -m "fix: Remover referências a segredos inexistentes do Vercel"
git push origin main
```

## 🚨 Valores de Exemplo para Teste

Se você quiser testar rapidamente, pode usar estes valores temporários:

```env
VITE_SUPABASE_URL=https://exemplo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.exemplo
VITE_APP_ENVIRONMENT=production
VITE_ENABLE_MOCK_DATA=true
VITE_ENABLE_DEBUG_LOGS=false
```

**⚠️ IMPORTANTE**: Use `VITE_ENABLE_MOCK_DATA=true` temporariamente para testar sem banco de dados.

## ✅ Verificação

Após configurar:
1. Acesse o link do deploy no Vercel
2. Verifique se a aplicação carrega
3. Teste o login (admin / admin123)
4. Se usar mock data, os dados aparecerão automaticamente

---

**🎯 Após seguir estes passos, o erro será resolvido e o sistema funcionará no Vercel!**
