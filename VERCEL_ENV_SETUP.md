# 🔧 Configuração de Variáveis de Ambiente no Vercel

## Problema Identificado
O projeto no Vercel está mostrando apenas "Carregando sistema clínico..." porque as variáveis de ambiente do Supabase não estão configuradas.

## Solução

### 1. Configurar Variáveis de Ambiente no Vercel

Acesse o painel do Vercel e configure as seguintes variáveis de ambiente:

```
VITE_APP_ENVIRONMENT=production
VITE_APP_TITLE=Sistema Clínico
VITE_APP_VERSION=1.0.0
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
VITE_API_URL=https://sistema-agendamento-clinico-appverc.vercel.app/api
VITE_ENABLE_MOCK_DATA=false
VITE_ENABLE_DEBUG_LOGS=false
VITE_ENABLE_ERROR_REPORTING=true
```

### 2. Como Configurar no Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Vá para o seu projeto
3. Clique em "Settings"
4. Clique em "Environment Variables"
5. Adicione cada variável acima
6. Faça um novo deploy

### 3. Configuração Local

Para desenvolvimento local, crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_APP_ENVIRONMENT=development
VITE_APP_TITLE=Sistema Clínico
VITE_APP_VERSION=1.0.0
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
VITE_API_URL=http://localhost:3000/api
VITE_ENABLE_MOCK_DATA=true
VITE_ENABLE_DEBUG_LOGS=true
VITE_ENABLE_ERROR_REPORTING=false
```

### 4. Credenciais do Supabase

Para obter as credenciais do Supabase:

1. Acesse [supabase.com](https://supabase.com)
2. Vá para o seu projeto
3. Clique em "Settings" > "API"
4. Copie:
   - Project URL (VITE_SUPABASE_URL)
   - Project API keys > anon public (VITE_SUPABASE_ANON_KEY)

### 5. Teste de Login

Após configurar as variáveis:

1. **Local**: Use as credenciais do banco local (CPF: 333.333.333-33, Senha: 333)
2. **Vercel**: Use as credenciais do Supabase configuradas

## Status Atual

- ✅ Build funcionando (0 erros TypeScript)
- ✅ Deploy no Vercel funcionando
- ❌ Variáveis de ambiente não configuradas
- ❌ Login não funcionando (sem credenciais)

## Próximos Passos

1. Configure as variáveis de ambiente no Vercel
2. Faça um novo deploy
3. Teste o login com as credenciais do Supabase
4. Verifique se a interface carrega completamente