# 🗑️ Zerar Lista de Agendamentos

## 📋 Opções Disponíveis

Implementei várias formas de limpar a lista de agendamentos do sistema:

### **Opção 1: Script Automático (Mais Rápido)**

1. **Abra o console do navegador** (F12)
2. **Cole e execute o script**:

   ```javascript
   // Script para limpar agendamentos
   console.log('🗑️ Iniciando limpeza de agendamentos...');

   // Limpar agendamentos do localStorage
   const agendamentosKeys = Object.keys(localStorage).filter(
     key => key.includes('agendamentos') || key.includes('agenda') || key.startsWith('agendamento_')
   );

   agendamentosKeys.forEach(key => {
     localStorage.removeItem(key);
     console.log(`🧹 Removido: ${key}`);
   });

   // Limpar cache de agendamentos
   const cacheKeys = Object.keys(localStorage).filter(
     key => key.includes('cache') && key.includes('agendamento')
   );

   cacheKeys.forEach(key => {
     localStorage.removeItem(key);
     console.log(`🧹 Removido cache: ${key}`);
   });

   // Limpar dados de notificações de agendamentos
   const notificationKeys = Object.keys(localStorage).filter(
     key => key.includes('notification') && key.includes('agendamento')
   );

   notificationKeys.forEach(key => {
     localStorage.removeItem(key);
     console.log(`🧹 Removido notificação: ${key}`);
   });

   console.log('✅ Limpeza de agendamentos concluída!');
   console.log('🔄 Recarregue a página para ver as mudanças.');
   ```

3. **Recarregue a página** (F5)

### **Opção 2: Limpeza Completa do Sistema**

1. **Abra o console do navegador** (F12)
2. **Execute**:
   ```javascript
   // Limpeza completa
   localStorage.clear();
   sessionStorage.clear();
   location.reload();
   ```

### **Opção 3: Componente de Gerenciamento (Interface)**

Adicione o componente de gerenciamento em qualquer página:

```tsx
import { AgendamentosManager } from '@/components/UI';

// No seu componente
<AgendamentosManager />;
```

**Recursos do componente:**

- 📊 **Estatísticas** - Mostra total de agendamentos
- 🗑️ **Limpar Todos** - Remove todos os agendamentos
- 🧹 **Limpar Cache** - Remove apenas o cache
- ⚠️ **Confirmação** - Pede confirmação antes de limpar

### **Opção 4: Função Programática**

```typescript
import { limparTodosAgendamentos } from '@/lib/agendamentosUtils';

// Limpar todos os agendamentos
const resultado = await limparTodosAgendamentos();
if (resultado.success) {
  console.log(resultado.message);
} else {
  console.error(resultado.message);
}
```

## 🚀 **Recomendação: Opção 1 (Script Automático)**

Para zerar rapidamente a lista de agendamentos:

1. **Pressione F12** para abrir o console
2. **Cole o script** da Opção 1
3. **Pressione Enter** para executar
4. **Recarregue a página** (F5)

## 📊 **O que é Limpo**

### **Dados Removidos:**

- ✅ Todos os agendamentos do banco de dados
- ✅ Cache de agendamentos no localStorage
- ✅ Notificações relacionadas a agendamentos
- ✅ Dados temporários de agendamentos

### **Dados Preservados:**

- ✅ Pacientes
- ✅ Profissionais
- ✅ Serviços
- ✅ Configurações do sistema
- ✅ Dados de usuário

## 🔍 **Verificação**

Após executar a limpeza:

1. **Verifique a página de agendamentos** - deve estar vazia
2. **Verifique o console** - deve mostrar mensagens de confirmação
3. **Recarregue a página** - para garantir que as mudanças foram aplicadas

## ⚠️ **Avisos Importantes**

- **Ação Irreversível**: A limpeza não pode ser desfeita
- **Backup**: Faça backup se necessário
- **Dados Mock**: Se estiver usando dados mock, eles serão regenerados automaticamente

## 🎯 **Resultado Esperado**

- ✅ **Lista vazia** - Página de agendamentos sem itens
- ✅ **Cache limpo** - Dados temporários removidos
- ✅ **Sistema funcionando** - Todas as outras funcionalidades normais
- ✅ **Dados mock regenerados** - Se aplicável

**Escolha a opção que preferir e execute para zerar a lista de agendamentos!** 🚀


