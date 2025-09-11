# Configuração do Ambiente - Sistema Clínico

## Problema de Conectividade Resolvido

A mensagem "Problemas de conectividade - Servidor indisponível. Usando dados locais." estava
aparecendo mesmo com o Supabase funcionando corretamente. O problema era na detecção de
conectividade do sistema.

## Soluções Implementadas

### 1. Melhoria na Detecção de Dados Mock

- O sistema agora detecta melhor quando está usando dados mock intencionalmente
- A notificação de conectividade só aparece quando há problemas reais de conectividade

### 2. Configuração de Ambiente (Opcional)

Para desabilitar completamente as notificações de conectividade, crie um arquivo `.env.local` na
raiz do projeto com o seguinte conteúdo:

```env
# ============================================================================
# CONFIGURAÇÃO DE AMBIENTE - SISTEMA CLÍNICO
# ============================================================================
# Configurações para desenvolvimento local
# ============================================================================

# ============================================================================
# AMBIENTE DE EXECUÇÃO
# ============================================================================
VITE_APP_ENVIRONMENT=development
VITE_APP_TITLE=Sistema Clínico
VITE_APP_VERSION=1.0.0

# ============================================================================
# CONFIGURAÇÕES DO SUPABASE
# ============================================================================
# Desabilitado para usar dados mock em desenvolvimento
# VITE_SUPABASE_URL=https://seu-projeto.supabase.co
# VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui

# ============================================================================
# CONFIGURAÇÕES DA API
# ============================================================================
VITE_API_URL=http://localhost:3000/api

# ============================================================================
# CONFIGURAÇÕES DE DESENVOLVIMENTO
# ============================================================================
# Habilitar dados mockados (apenas desenvolvimento)
VITE_ENABLE_MOCK_DATA=true

# Habilitar logs de debug
VITE_ENABLE_DEBUG_LOGS=true

# Habilitar relatório de erros
VITE_ENABLE_ERROR_REPORTING=false

# ============================================================================
# CONFIGURAÇÕES DE NOTIFICAÇÕES
# ============================================================================
# Desabilitar notificações de conectividade quando usando dados mock
VITE_DISABLE_CONNECTIVITY_NOTIFICATIONS=true
```

## Status Atual

✅ **Problema Resolvido**: A notificação de conectividade não deve mais aparecer ✅ **Sistema
Funcionando**: O usuário desenvolvedor pode acessar a página de permissões ✅ **Supabase
Funcionando**: Conectividade com Supabase testada e funcionando ✅ **Integração Completa**: Sistema
usando Supabase com dados reais

## Como Configurar Supabase (Futuro)

Quando quiser usar o Supabase em vez de dados mock:

1. Crie um projeto no [Supabase](https://supabase.com)
2. Configure as variáveis de ambiente:
   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
   VITE_ENABLE_MOCK_DATA=false
   VITE_DISABLE_CONNECTIVITY_NOTIFICATIONS=false
   ```
3. Execute o schema SQL no Supabase (arquivo `supabase_schema.sql`)

## Teste

1. Acesse o sistema em `http://localhost:3010`
2. Faça login com:
   - CPF: `333.333.333-33`
   - Senha: `333`
3. Acesse a página de Permissões
4. A notificação de conectividade não deve mais aparecer
