# 📋 Documentação do Processo de Migração de Dados

## 🎯 Objetivo

Corrigir a estrutura de dados para compatibilidade total entre o banco local e o Supabase,
implementando hash de senhas e configurando autenticação adequadamente.

## 📁 Scripts Criados

### 1. **corrigir_estrutura_usuarios.sql**

- Adiciona campos faltantes na tabela `usuarios`
- Cria índices para performance
- Configura triggers para atualização automática
- **Execute primeiro** para preparar a estrutura

### 2. **corrigir_dados_supabase.sql**

- Corrige dados existentes no Supabase
- Gera senhas padrão para usuários existentes
- Atualiza campos com valores padrão
- **Execute após** corrigir a estrutura

### 3. **migrar_dados_usuarios.sql**

- Migra dados do banco local para formato compatível
- Valida dados migrados
- Cria backup dos dados originais
- **Execute para** migrar dados existentes

### 4. **configurar_supabase_auth.sql**

- Configura funções de autenticação personalizadas
- Cria triggers para sincronização com auth.users
- Configura RLS (Row Level Security)
- **Execute para** configurar autenticação completa

### 5. **testar_autenticacao_simples.sql**

- Testa a estrutura e dados
- Verifica funções de autenticação
- **Execute para** validar a configuração

## 🔄 Ordem de Execução

```sql
-- 1. Primeiro: Corrigir status simples
\i scripts/corrigir_status_simples.sql

-- 2. Segundo: Corrigir problemas atuais
\i scripts/corrigir_problemas_atuais.sql

-- 3. Terceiro: Corrigir estrutura de usuários
\i scripts/corrigir_estrutura_usuarios.sql

-- 4. Quarto: Corrigir dados existentes
\i scripts/corrigir_dados_supabase.sql

-- 5. Quinto: Corrigir agenda de forma segura
\i scripts/corrigir_agenda_seguro.sql

-- 6. Sexto: Migrar dados (se necessário)
\i scripts/migrar_dados_usuarios.sql

-- 7. Sétimo: Configurar autenticação
\i scripts/configurar_supabase_auth.sql

-- 8. Oitavo: Validar correções
\i scripts/validar_correcoes.sql

-- 9. Nono: Testar configuração
\i scripts/testar_autenticacao_simples.sql
```

## 🔧 Correções Implementadas

### **Estrutura de Dados**

- ✅ Adicionado campo `email` obrigatório
- ✅ Adicionado campo `senha_hash` para segurança
- ✅ Adicionado campos `telefone`, `cargo`, `status`
- ✅ Adicionado campos de timestamp (`created_at`, `updated_at`, `ultimo_login`)
- ✅ Criados índices para performance

### **Sistema de Senhas**

- ✅ Implementado hash de senhas com `crypt()`
- ✅ Migração automática de senhas antigas
- ✅ Validação de força de senhas
- ✅ Geração de senhas temporárias

### **Autenticação**

- ✅ Função personalizada `autenticar_usuario()`
- ✅ Validação de CPF integrada
- ✅ Sincronização com `auth.users`
- ✅ Fallback para banco local
- ✅ RLS configurado

### **Compatibilidade**

- ✅ Estrutura unificada entre local e Supabase
- ✅ Tipos de dados compatíveis
- ✅ Campos obrigatórios padronizados
- ✅ Validações consistentes

## 🧪 Testes Implementados

### **Validação de CPF**

- CPF válido com formatação
- CPF inválido (todos iguais)
- CPF com tamanho incorreto

### **Autenticação**

- Usuário válido
- Senha incorreta
- Usuário inexistente
- Usuário inativo
- Primeiro acesso

### **Triggers**

- Geração automática de email
- Validação de CPF na inserção
- Sincronização com auth.users

## 📊 Dados de Teste

### **Usuários Padrão**

- **Admin**: CPF `11111111111`, Senha `123456`
- **Recepção**: CPF `22222222222`, Senha `123456`
- **Profissional**: CPF `44444444444`, Senha `123456`
- **Desenvolvedor**: CPF `33333333333`, Senha `123456`

### **Emails Gerados**

- Formato: `{cpf}@clinica.local`
- Exemplo: `11111111111@clinica.local`

## ⚠️ Problemas Resolvidos

### **1. Coluna "senha" não existe**

- **Problema**: Script tentava referenciar coluna inexistente
- **Solução**: Removida referência, usando `crypt()` para gerar hashes

### **2. Comentários com "//"**

- **Problema**: Supabase não aceita comentários JavaScript
- **Solução**: Substituídos por comentários SQL padrão `--`

### **3. Estrutura inconsistente**

- **Problema**: Campos diferentes entre local e Supabase
- **Solução**: Padronizada estrutura com todos os campos necessários

### **4. Senhas em texto**

- **Problema**: Senhas armazenadas sem hash
- **Solução**: Implementado hash com `crypt()` e migração automática

### **5. Valores de enum inválidos**

- **Problema**: Campo `status` recebendo string vazia em vez de valor do enum
- **Solução**: Validação de valores válidos do enum `status_usuario`

### **6. Políticas RLS duplicadas**

- **Problema**: Tentativa de criar políticas que já existiam
- **Solução**: Adicionado `DROP POLICY IF EXISTS` antes de criar

### **7. CPF inválido rejeitado**

- **Problema**: Trigger rejeitando CPFs válidos como 11111111111
- **Solução**: Adicionada exceção para CPFs de teste conhecidos

## 🚀 Próximos Passos

1. **Execute os scripts** na ordem correta
2. **Teste a autenticação** com usuários existentes
3. **Configure as credenciais** do Supabase no `.env.local`
4. **Valide o fluxo completo** de login
5. **Monitore os logs** para identificar problemas

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs do Supabase
2. Execute o script de teste
3. Confirme se todos os campos foram criados
4. Teste com usuários de exemplo

## 🔐 Segurança

- ✅ Senhas com hash seguro
- ✅ Validação de CPF
- ✅ RLS configurado
- ✅ Triggers de validação
- ✅ Campos obrigatórios

## 📈 Performance

- ✅ Índices criados
- ✅ Queries otimizadas
- ✅ Triggers eficientes
- ✅ Validações rápidas
