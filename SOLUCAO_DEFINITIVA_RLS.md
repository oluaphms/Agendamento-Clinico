# 🔧 Solução Definitiva - Problema RLS

## 🚨 Problema Atual

O erro **"infinite recursion detected in policy for relation 'usuarios'"** persiste mesmo com as
tabelas funcionando.

## ✅ Solução Definitiva

### 1. Execute o Script de Correção

No Supabase SQL Editor, execute o arquivo `fix-rls-policies.sql`:

1. Acesse [supabase.com](https://supabase.com)
2. Vá para seu projeto **Sistema-Agendamento-clínico-**
3. Clique em **SQL Editor**
4. Copie todo o conteúdo do arquivo `fix-rls-policies.sql`
5. Cole no editor e clique em **Run**

### 2. O que o Script Faz

- **Desabilita RLS temporariamente** em todas as tabelas
- **Remove todas as políticas problemáticas** que causam recursão
- **Mantém os dados intactos** (não afeta os registros existentes)
- **Permite acesso total** para desenvolvimento

### 3. Teste a Conexão

Após executar o script, teste no terminal:

```bash
node test-supabase-connection.js
```

### 4. Inicie o Sistema

```bash
npm run dev
```

## 🎯 Resultado Esperado

- ✅ Conexão estabelecida com sucesso
- ✅ Todas as tabelas acessíveis
- ✅ Sistema funcionando normalmente
- ✅ Dados sendo salvos no Supabase

## 📊 Dados Atuais no Supabase

- **7 usuários** (incluindo admin, recepção, desenvolvedor)
- **1 paciente** cadastrado
- **1 profissional** cadastrado
- **8 serviços** disponíveis
- **1 agendamento** existente

## 🔐 Usuários para Teste

| CPF         | Senha | Acesso        |
| ----------- | ----- | ------------- |
| 11111111111 | 111   | Admin         |
| 22222222222 | 222   | Recepção      |
| 33333333333 | 333   | Desenvolvedor |

## ⚠️ Importante

- O RLS será **desabilitado temporariamente** para desenvolvimento
- Isso permite acesso total às tabelas sem restrições
- Para produção, você pode reabilitar o RLS com políticas mais simples

---

**🎉 Após executar o script, seu sistema estará 100% funcional com Supabase!**
