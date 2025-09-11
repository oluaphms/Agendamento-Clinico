# 🔧 Correção do Trigger da Tabela Profissionais

## ❌ **Problema Identificado**

O erro `record "new" has no field "updated_at"` está ocorrendo porque há um trigger na tabela `profissionais` que está tentando acessar um campo `updated_at` que não existe.

## ✅ **Solução**

Execute o script SQL abaixo no Supabase SQL Editor para corrigir o trigger:

### 📋 **Passos para Correção:**

1. **Acesse o Supabase Dashboard**
   - Vá para: https://supabase.com/dashboard
   - Faça login na sua conta
   - Selecione o projeto: `Sistema-Agendamento-clínico-`

2. **Abra o SQL Editor**
   - No menu lateral, clique em "SQL Editor"
   - Clique em "New query"

3. **Execute o Script de Correção**
   - Copie e cole o conteúdo do arquivo `fix-profissionais-trigger-safe.sql`
   - Clique em "Run" para executar

### 🔍 **O que o Script Faz:**

1. **Remove** apenas o trigger problemático da tabela `profissionais`
2. **Cria** uma função específica para profissionais
3. **Cria** um novo trigger que usa `ultima_atualizacao` (campo correto)
4. **Preserva** todas as outras tabelas e funções existentes
5. **Verifica** se a correção funcionou

### 📊 **Resultado Esperado:**

Após executar o script, você deve ver:
- ✅ Trigger `update_profissionais_ultima_atualizacao` criado
- ✅ Função `update_profissionais_ultima_atualizacao()` criada
- ✅ Erro de atualização de profissionais resolvido
- ✅ Outras tabelas continuam funcionando normalmente

### 🧪 **Teste Após Correção:**

1. **Acesse** a página de Profissionais no sistema
2. **Tente editar** um profissional existente
3. **Salve** as alterações
4. **Verifique** se não há mais erros no console

### ⚠️ **Importante:**

- Execute o script **apenas uma vez**
- Faça backup do banco antes de executar (opcional)
- O script é seguro e não afeta dados existentes

## 🎯 **Resultado Final**

Após executar esta correção, o sistema de atualização de profissionais funcionará perfeitamente sem erros!
