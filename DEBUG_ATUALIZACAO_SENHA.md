# 🔍 Debug da Atualização de Senha

## 🔧 **Logs Adicionados para Debug**

Adicionei logs detalhados para identificar exatamente onde está ocorrendo o erro na atualização da
senha.

## 📊 **Logs que Você Verá no Console**

### **1. Busca do Usuário:**

```javascript
🔍 Buscando usuário com CPF: { cpfNumbers: "12345678901", cpf: "123.456.789-01" }
📊 Resultado busca sem formatação: { data: null, error: {...} }
🔄 Tentando busca com CPF formatado...
📊 Resultado busca formatada: { data: {...}, error: null }
✅ Usuário encontrado: { id: "...", nome: "...", email: "...", cpf: "..." }
```

### **2. Atualização da Senha:**

```javascript
🔐 Atualizando senha para usuário: 2243f2fa-da18-4c4a-9018-a7604bf5e3b8
🔑 Senha hash gerada: a1b2c3d4e5...
📝 Dados para atualização: { userId: "...", hashedPassword: "a1b2c3d4e5...", primeiro_acesso: false }
📊 Resultado da atualização: { updateData: [...], updateError: null }
✅ Senha atualizada com sucesso!
```

### **3. Se Houver Erro:**

```javascript
❌ Erro ao atualizar senha: { message: "...", details: "...", hint: "...", code: "..." }
❌ Detalhes do erro: { message: "...", details: "...", hint: "...", code: "..." }
```

## 🧪 **Como Testar e Debug**

### **Passo 1: Abrir Console**

1. **Pressione F12** no navegador
2. Vá para a aba **"Console"**
3. **Limpe o console** (Ctrl+L)

### **Passo 2: Executar o Fluxo**

1. Vá para `/login`
2. Clique em **"Esqueci minha senha"**
3. Digite um CPF válido
4. Clique em **"Verificar CPF"**
5. Digite uma nova senha
6. Clique em **"Salvar Nova Senha"**

### **Passo 3: Analisar os Logs**

**Copie e cole** todos os logs do console aqui para que eu possa identificar o problema.

## 🔍 **Possíveis Causas do Erro**

### **1. Problema de Permissão:**

- **Erro**: `permission denied for table usuarios`
- **Causa**: Usuário não tem permissão UPDATE na tabela
- **Solução**: Verificar RLS (Row Level Security) no Supabase

### **2. Problema de Campo:**

- **Erro**: `column "senha_hash" does not exist`
- **Causa**: Campo não existe na tabela
- **Solução**: Verificar schema da tabela

### **3. Problema de Tipo:**

- **Erro**: `invalid input syntax for type`
- **Causa**: Tipo de dados incompatível
- **Solução**: Verificar tipo do campo senha_hash

### **4. Problema de ID:**

- **Erro**: `no rows updated`
- **Causa**: ID do usuário não encontrado
- **Solução**: Verificar se o ID está correto

## 📋 **Informações Necessárias para Debug**

### **1. Logs do Console:**

- **Todos os logs** desde o início do teste
- **Especialmente** os logs de erro
- **Incluir** stack trace se houver

### **2. Dados do Usuário:**

- **ID do usuário** encontrado
- **Nome e email** do usuário
- **CPF** usado no teste

### **3. Erro Específico:**

- **Mensagem de erro** exata
- **Código de erro** (se houver)
- **Detalhes adicionais** (hint, details)

## 🚀 **Próximos Passos**

1. **Execute o teste** com os logs habilitados
2. **Copie todos os logs** do console
3. **Cole aqui** para análise
4. **Identificarei** a causa exata do erro
5. **Implementarei** a correção necessária

## 📞 **Como Reportar o Erro**

**Cole aqui os logs completos do console**, incluindo:

```
🔍 Buscando usuário com CPF: ...
📊 Resultado busca sem formatação: ...
🔄 Tentando busca com CPF formatado...
📊 Resultado busca formatada: ...
✅ Usuário encontrado: ...
🔐 Atualizando senha para usuário: ...
🔑 Senha hash gerada: ...
📝 Dados para atualização: ...
📊 Resultado da atualização: ...
❌ Erro ao atualizar senha: ... (se houver)
```

**Com essas informações, poderei identificar e corrigir o problema!** 🔧
