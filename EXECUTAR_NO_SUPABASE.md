# 🚀 Executar no Supabase - Passo a Passo

## ⚠️ Problema Detectado
O erro "infinite recursion detected in policy" indica que as políticas RLS têm referências circulares.

## 🔧 Solução Rápida

### 1. Acesse o Supabase
- Vá para [supabase.com](https://supabase.com)
- Acesse seu projeto: **Sistema-Agendamento-clínico-**

### 2. Execute o Script de Correção
1. No painel do Supabase, vá para **SQL Editor**
2. Copie todo o conteúdo do arquivo `fix-supabase-policies.sql`
3. Cole no editor SQL
4. Clique em **Run** para executar

### 3. Execute o Schema Principal
1. Ainda no **SQL Editor**
2. Copie todo o conteúdo do arquivo `supabase_schema.sql`
3. Cole no editor SQL
4. Clique em **Run** para executar

### 4. Testar a Conexão
Execute no terminal do seu projeto:
```bash
node test-supabase-connection.js
```

## ✅ Resultado Esperado
Após executar os scripts, você deve ver:
- ✅ Conexão estabelecida com sucesso!
- ✅ Todas as tabelas acessíveis
- ✅ Sistema funcionando com Supabase

## 🔄 Se Ainda Houver Problemas
1. **Limpe o banco**: No Supabase, vá para **Database** → **Reset**
2. **Execute apenas o schema principal**: `supabase_schema.sql`
3. **Teste novamente**: `node test-supabase-connection.js`

## 📞 Próximos Passos
Após a correção:
1. Inicie o projeto: `npm run dev`
2. Faça login com: CPF `11111111111`, Senha `111`
3. Teste criando um paciente ou agendamento
4. Verifique se os dados aparecem no Supabase

---

**🎯 Objetivo**: Corrigir as políticas RLS e conectar o sistema ao Supabase com sucesso!
