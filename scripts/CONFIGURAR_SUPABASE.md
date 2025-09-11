# 🔧 CONFIGURAÇÃO DO SUPABASE - SISTEMA CLÍNICO

## ❌ **PROBLEMA IDENTIFICADO:**

O sistema está mostrando dados mockados (simulados) em vez dos dados reais do Supabase porque não há
credenciais configuradas.

## ✅ **SOLUÇÃO:**

### **1. Criar Arquivo de Configuração**

Crie um arquivo `.env.local` na raiz do projeto com o seguinte conteúdo:

```env
# ============================================================================
# CONFIGURAÇÃO DE AMBIENTE - SISTEMA CLÍNICO
# ============================================================================

# AMBIENTE DE EXECUÇÃO
VITE_APP_ENVIRONMENT=development
VITE_APP_TITLE=Sistema Clínico
VITE_APP_VERSION=1.0.0

# CONFIGURAÇÕES DO SUPABASE
# IMPORTANTE: Substitua pelas suas credenciais reais do Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui

# CONFIGURAÇÕES DA API
VITE_API_URL=http://localhost:3000/api

# CONFIGURAÇÕES DE DESENVOLVIMENTO
# DESABILITAR dados mockados para usar Supabase
VITE_ENABLE_MOCK_DATA=false

# Habilitar logs de debug
VITE_ENABLE_DEBUG_LOGS=true

# Habilitar relatório de erros
VITE_ENABLE_ERROR_REPORTING=false
```

### **2. Obter Credenciais do Supabase**

1. **Acesse o Supabase**: https://supabase.com
2. **Faça login** na sua conta
3. **Crie um novo projeto** ou acesse um existente
4. **Vá em Settings > API**
5. **Copie as credenciais**:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`

### **3. Executar Scripts SQL**

Execute os seguintes scripts no Supabase (SQL Editor):

1. **`listar_tabelas_sistema.sql`** - Para verificar a estrutura atual
2. **`diagnosticar_conexao_supabase.sql`** - Para diagnosticar problemas
3. **`inserir_dados_exemplo.sql`** - Para adicionar dados de teste

### **4. Verificar Configuração**

Após configurar, o sistema deve:

- ✅ Mostrar dados reais do Supabase
- ✅ Não mais usar dados mockados
- ✅ Funcionar com CRUD completo
- ✅ Exibir estatísticas reais

## 🔍 **DIAGNÓSTICO:**

### **Sintomas do Problema:**

- Dados aparecem nas páginas mas não existem nas tabelas
- Sistema usa dados simulados (mockados)
- Logs mostram "Usando banco de dados local (mock data)"

### **Causa:**

- Arquivo `.env.local` não existe ou está mal configurado
- Credenciais do Supabase inválidas ou vazias
- Sistema detecta configuração inválida e usa fallback

### **Verificação:**

Execute o script `diagnosticar_conexao_supabase.sql` para verificar:

- Conectividade com Supabase
- Dados existentes nas tabelas
- Estrutura das tabelas
- Views e funções criadas

## 📋 **CHECKLIST DE CONFIGURAÇÃO:**

- [ ] Criar arquivo `.env.local`
- [ ] Configurar `VITE_SUPABASE_URL`
- [ ] Configurar `VITE_SUPABASE_ANON_KEY`
- [ ] Definir `VITE_ENABLE_MOCK_DATA=false`
- [ ] Executar scripts SQL no Supabase
- [ ] Verificar se dados aparecem no sistema
- [ ] Testar CRUD em todas as páginas

## 🚀 **APÓS CONFIGURAÇÃO:**

O sistema deve funcionar completamente com:

- **Dados reais** do Supabase
- **CRUD funcional** em todas as páginas
- **Estatísticas reais** no dashboard
- **Relatórios** com dados verdadeiros
- **Integração completa** com o banco

## 📞 **SUPORTE:**

Se ainda houver problemas após a configuração:

1. Verifique os logs do console do navegador
2. Execute o script de diagnóstico
3. Verifique se as credenciais estão corretas
4. Confirme se as tabelas foram criadas no Supabase
