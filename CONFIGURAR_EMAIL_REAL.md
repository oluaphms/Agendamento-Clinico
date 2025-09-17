# 📧 Como Configurar Email Real

## 🎯 Objetivo

Configurar o sistema para enviar emails reais de recuperação de senha em vez de simulação.

## 🔧 Passo a Passo

### **1. Criar Conta no EmailJS**

1. Acesse: https://emailjs.com
2. Clique em **"Sign Up"**
3. Crie uma conta gratuita
4. Confirme seu email

### **2. Configurar Serviço de Email**

1. No dashboard, clique em **"Email Services"**
2. Clique em **"Add New Service"**
3. Escolha seu provedor:
   - **Gmail** (recomendado)
   - **Outlook**
   - **Yahoo**
   - **Outros**
4. Siga as instruções para conectar sua conta
5. **Anote o Service ID** gerado

### **3. Criar Template de Email**

1. Clique em **"Email Templates"**
2. Clique em **"Create New Template"**
3. Use este template:

```
Assunto: Recuperação de Senha - {{app_name}}

Olá {{to_name}},

Recebemos uma solicitação para redefinir a senha da sua conta no {{app_name}}.

Clique no link abaixo para criar uma nova senha:
{{reset_url}}

IMPORTANTE:
- Este link expira em 1 hora por motivos de segurança
- Se você não solicitou a redefinição de senha, ignore este email

Atenciosamente,
Equipe {{app_name}}

---
Este email foi enviado automaticamente. Não responda a este email.
```

4. **Anote o Template ID** gerado

### **4. Obter Public Key**

1. No dashboard, clique em **"Account"**
2. Vá para **"General"**
3. **Anote a Public Key**

### **5. Atualizar Configurações no Código**

1. Abra o arquivo: `src/services/realEmailService.ts`
2. Substitua as configurações:

```typescript
const EMAILJS_CONFIG = {
  serviceId: 'service_1234567', // ← Substitua pelo seu Service ID
  templateId: 'template_1234567', // ← Substitua pelo seu Template ID
  publicKey: 'your_public_key_here', // ← Substitua pela sua Public Key
};
```

**Exemplo:**

```typescript
const EMAILJS_CONFIG = {
  serviceId: 'service_abc123',
  templateId: 'template_xyz789',
  publicKey: 'user_1234567890abcdef',
};
```

### **6. Reiniciar o Servidor**

```bash
npm run dev
```

## ✅ Verificar se Funcionou

### **Teste 1: Status na Tela**

- Acesse `/forgot-password`
- Deve aparecer: **"✅ Email Real Configurado"**

### **Teste 2: Enviar Email**

1. Digite um email válido
2. Clique em "Enviar Link de Recuperação"
3. Verifique se o email chegou na caixa de entrada

### **Teste 3: Console do Navegador**

- Deve aparecer: **"📧 Usando serviço de email real..."**

## 🚨 Solução de Problemas

### **Erro: "EmailJS não configurado"**

- Verifique se as configurações estão corretas
- Reinicie o servidor após alterar o arquivo

### **Erro: "Service not found"**

- Verifique se o Service ID está correto
- Confirme se o serviço está ativo no EmailJS

### **Erro: "Template not found"**

- Verifique se o Template ID está correto
- Confirme se o template está publicado

### **Erro: "Invalid public key"**

- Verifique se a Public Key está correta
- Confirme se a conta está ativa

## 📊 Limites do Plano Gratuito

- **200 emails/mês**
- **2 serviços de email**
- **2 templates**
- **Suporte por email**

## 🚀 Próximos Passos

1. **Teste completo** da funcionalidade
2. **Monitoramento** dos emails enviados
3. **Configuração** de domínio personalizado (opcional)
4. **Upgrade** para plano pago (se necessário)

## ✅ Resultado Final

Após a configuração:

- ✅ Emails reais enviados
- ✅ Links funcionais
- ✅ Interface atualizada
- ✅ Status visual claro

**A funcionalidade estará 100% operacional!** 🎉


