# 📱 Sistema de Mensagens WhatsApp para Pacientes

## 🔍 **Como Funciona**

O sistema de mensagens WhatsApp do seu projeto funciona através de **integração com WhatsApp Web**,
enviando mensagens personalizadas para pacientes baseadas no status dos agendamentos.

## 🏗️ **Arquitetura do Sistema**

### **1. Arquivo Principal: `src/lib/whatsappUtils.ts`**

Contém todas as funções para integração com WhatsApp:

```typescript
// Funções principais
-enviarLembreteWhatsApp() -
  enviarConfirmacaoWhatsApp() -
  enviarCancelamentoWhatsApp() -
  enviarLembretesEmLote() -
  validarTelefone() -
  formatarTelefone();
```

### **2. Integração na Agenda: `src/pages/Agenda/Agenda.tsx`**

Botões de WhatsApp aparecem na tabela de agendamentos para cada paciente.

## 📋 **Tipos de Mensagens Enviadas**

### **🏥 1. Lembrete de Consulta**

**Quando:** Enviado manualmente pelo usuário **Template:**

```
🏥 *Lembrete de Consulta*

Olá [Nome do Paciente]!

Este é um lembrete sobre sua consulta agendada:

📅 *Data:* [Data formatada]
🕐 *Horário:* [Hora]
👨‍⚕️ *Profissional:* [Nome do Profissional]
🩺 *Serviço:* [Nome do Serviço]

Por favor, chegue com 15 minutos de antecedência.

Em caso de dúvidas, entre em contato conosco.

Atenciosamente,
Equipe da Clínica
```

### **✅ 2. Confirmação de Consulta**

**Quando:** Quando agendamento é confirmado **Template:**

```
✅ *Consulta Confirmada*

Olá [Nome do Paciente]!

Sua consulta foi confirmada com sucesso:

📅 *Data:* [Data formatada]
🕐 *Horário:* [Hora]
👨‍⚕️ *Profissional:* [Nome do Profissional]
🩺 *Serviço:* [Nome do Serviço]

Aguardamos você!

Atenciosamente,
Equipe da Clínica
```

### **❌ 3. Cancelamento de Consulta**

**Quando:** Quando agendamento é cancelado **Template:**

```
❌ *Consulta Cancelada*

Olá [Nome do Paciente]!

Informamos que sua consulta foi cancelada:

📅 *Data:* [Data formatada]
🕐 *Horário:* [Hora]
👨‍⚕️ *Profissional:* [Nome do Profissional]
🩺 *Serviço:* [Nome do Serviço]

Para reagendar, entre em contato conosco.

Atenciosamente,
Equipe da Clínica
```

## 🔧 **Como o Sistema Funciona**

### **1. Processo de Envio:**

1. **Usuário clica no botão WhatsApp** na tabela de agendamentos
2. **Sistema valida** se o paciente tem telefone cadastrado
3. **Formata o telefone** (remove caracteres especiais)
4. **Cria mensagem personalizada** com dados do agendamento
5. **Gera URL do WhatsApp Web** com mensagem pré-formatada
6. **Abre nova aba** com WhatsApp Web pronto para envio

### **2. Formatação do Telefone:**

```typescript
// Remove caracteres especiais
const telefone = pacientes.telefone.replace(/\D/g, '');

// Adiciona código do país (55 = Brasil)
const url = `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`;
```

### **3. Validação de Telefone:**

```typescript
// Verifica se tem 10 ou 11 dígitos (com DDD)
const numeroLimpo = telefone.replace(/\D/g, '');
return numeroLimpo.length >= 10 && numeroLimpo.length <= 11;
```

## 🎯 **Onde Aparecem os Botões WhatsApp**

### **Na Tabela de Agendamentos:**

- **Botão Verde** 🟢 - Enviar Lembrete
- **Botão Azul** 🔵 - Confirmar via WhatsApp
- **Botão Vermelho** 🔴 - Notificar Cancelamento

### **Condições para Aparecer:**

- ✅ Paciente deve ter telefone cadastrado
- ✅ Usuário deve ter permissão (admin, gerente, recepção, desenvolvedor)
- ✅ Agendamento deve estar em status apropriado

## 📱 **Interface do Usuário**

### **Botões na Tabela:**

```tsx
{
  /* Botões WhatsApp */
}
{
  agendamento.pacientes?.telefone && (
    <>
      <button
        className='text-green-500 hover:text-green-700 p-1 rounded hover:bg-green-50'
        title='Enviar Lembrete WhatsApp'
        onClick={() => handleEnviarWhatsApp(agendamento, 'lembrete')}
      >
        <MessageCircle size={16} />
      </button>

      {agendamento.status === 'agendado' && (
        <button
          className='text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50'
          title='Confirmar via WhatsApp'
          onClick={() => handleEnviarWhatsApp(agendamento, 'confirmacao')}
        >
          <MessageCircle size={16} />
        </button>
      )}

      {agendamento.status === 'cancelado' && (
        <button
          className='text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50'
          title='Notificar Cancelamento WhatsApp'
          onClick={() => handleEnviarWhatsApp(agendamento, 'cancelamento')}
        >
          <MessageCircle size={16} />
        </button>
      )}
    </>
  );
}
```

## 🚀 **Funcionalidades Avançadas**

### **1. Envio em Lote:**

```typescript
// Enviar lembretes para múltiplos pacientes
enviarLembretesEmLote(agendamentos);

// Delay de 2 segundos entre cada envio para evitar spam
setTimeout(() => {
  enviarLembreteWhatsApp(agendamento);
}, index * 2000);
```

### **2. Formatação de Telefone:**

```typescript
// Formato: (11) 99999-9999
formatarTelefone('11999999999'); // (11) 99999-9999
formatarTelefone('1133334444'); // (11) 3333-4444
```

### **3. Validação Automática:**

```typescript
// Verifica se telefone é válido antes de enviar
if (!validarTelefone(telefone)) {
  return { success: false, message: 'Telefone inválido' };
}
```

## ⚠️ **Limitações Atuais**

### **1. WhatsApp Web:**

- ❌ **Não envia automaticamente** - apenas abre WhatsApp Web
- ❌ **Requer ação manual** do usuário para enviar
- ❌ **Não funciona offline** - precisa de conexão com internet

### **2. Dependências:**

- ✅ **WhatsApp Web** deve estar disponível
- ✅ **Paciente deve ter WhatsApp** instalado
- ✅ **Telefone deve estar cadastrado** no sistema

### **3. Segurança:**

- ✅ **Não armazena mensagens** enviadas
- ✅ **Não acessa histórico** do WhatsApp
- ✅ **Apenas gera URLs** para WhatsApp Web

## 🔮 **Possíveis Melhorias**

### **1. Integração com API WhatsApp Business:**

```typescript
// Envio automático via API
const enviarViaAPI = async (telefone, mensagem) => {
  const response = await fetch('https://api.whatsapp.com/send', {
    method: 'POST',
    headers: { Authorization: 'Bearer TOKEN' },
    body: JSON.stringify({ to: telefone, message: mensagem }),
  });
};
```

### **2. Templates Personalizáveis:**

```typescript
// Templates configuráveis pelo usuário
const templates = {
  lembrete: 'Template personalizado de lembrete...',
  confirmacao: 'Template personalizado de confirmação...',
  cancelamento: 'Template personalizado de cancelamento...',
};
```

### **3. Agendamento de Mensagens:**

```typescript
// Enviar lembretes automaticamente
const agendarLembrete = (agendamento, horasAntes) => {
  const tempoParaEnvio = calcularTempoParaEnvio(agendamento.data, horasAntes);
  setTimeout(() => {
    enviarLembreteWhatsApp(agendamento);
  }, tempoParaEnvio);
};
```

## 📊 **Resumo do Fluxo**

```
1. Usuário clica no botão WhatsApp
   ↓
2. Sistema valida telefone do paciente
   ↓
3. Cria mensagem personalizada
   ↓
4. Formata telefone (remove caracteres especiais)
   ↓
5. Gera URL do WhatsApp Web
   ↓
6. Abre nova aba com mensagem pronta
   ↓
7. Usuário envia manualmente no WhatsApp
```

**O sistema funciona como um "assistente" que prepara a mensagem e abre o WhatsApp Web para o
usuário enviar manualmente!** 📱✨



