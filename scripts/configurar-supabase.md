# 🔧 Configuração do Supabase para o Sistema de Clínica

## 📋 Passo a Passo para Configurar o .env.local

### 1. **Acesse o Supabase Dashboard**
- Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
- Faça login na sua conta
- Crie um novo projeto ou selecione um existente

### 2. **Obtenha as Credenciais**
- No painel do projeto, vá em **Settings** > **API**
- Copie a **URL do projeto** (algo como: `https://abcdefgh.supabase.co`)
- Copie a **chave anônima** (chave pública, segura para frontend)

### 3. **Configure o arquivo .env.local**
Crie ou edite o arquivo `.env.local` na raiz do projeto com o seguinte conteúdo:

```env
# =====================================================
# CONFIGURAÇÃO DO SUPABASE
# =====================================================

# URL do seu projeto Supabase
VITE_SUPABASE_URL=https://seu-projeto-id.supabase.co

# Chave anônima do Supabase
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui

# =====================================================
# CONFIGURAÇÃO DA APLICAÇÃO
# =====================================================

VITE_APP_NAME="Sistema de Gestão de Clínica"
VITE_APP_VERSION="1.0.0"
VITE_APP_ENVIRONMENT=development

# =====================================================
# CONFIGURAÇÕES DE DESENVOLVIMENTO
# =====================================================

VITE_API_URL=http://localhost:3000
VITE_ENABLE_MOCK_DATA=false
VITE_ENABLE_DEBUG_LOGS=true
VITE_ENABLE_ERROR_REPORTING=false
```

### 4. **Execute os Scripts SQL**
No **Supabase SQL Editor**, execute os scripts na seguinte ordem:

```sql
-- 1. Primeiro, execute o sistema de permissões
\i scripts/permissoes-corrigido-final.sql

-- 2. Depois, execute o setup dos usuários padrão
\i scripts/setup-usuarios-padrao-completo.sql

-- 3. Opcionalmente, verifique se tudo está correto
\i scripts/verificar-usuarios-padrao.sql
```

**OU execute tudo de uma vez:**
```sql
\i scripts/executar-setup-completo.sql
```

### 5. **Verifique a Configuração**
Após configurar, execute o script de verificação:

```bash
node scripts/verificar-seguranca-local.cjs
```

## 🔐 Usuários Padrão Criados

Após executar os scripts, você terá os seguintes usuários:

| Usuário | CPF | Senha | Acesso |
|---------|-----|-------|--------|
| **Administrador** | 111.111.111.11 | 111 | Total |
| **Recepcionista** | 222.222.222.22 | 222 | Recepção |
| **Desenvolvedor** | 333.333.333.33 | 333 | Total |
| **Profissional** | 444.444.444.44 | 4444 | Profissional |

## 🚨 Importante

- **Nunca commite** o arquivo `.env.local` no Git
- **Mantenha as credenciais seguras**
- **Use HTTPS** em produção
- **Teste localmente** antes de fazer deploy

## 🆘 Troubleshooting

### Erro: "Invalid API key"
- Verifique se a chave anônima está correta
- Confirme se o projeto está ativo no Supabase

### Erro: "Failed to fetch"
- Verifique se a URL do Supabase está correta
- Confirme se o projeto não está pausado

### Erro: "Table doesn't exist"
- Execute primeiro o script `permissoes-corrigido-final.sql`
- Verifique se as tabelas foram criadas corretamente

## 📞 Suporte

Se tiver problemas:
1. Verifique os logs do console do navegador
2. Execute o script de verificação
3. Consulte a documentação do Supabase
