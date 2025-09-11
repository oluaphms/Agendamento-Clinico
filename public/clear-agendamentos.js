
// Script para limpar agendamentos
console.log('🗑️ Iniciando limpeza de agendamentos...');

// Limpar agendamentos do localStorage
const agendamentosKeys = Object.keys(localStorage).filter(key => 
  key.includes('agendamentos') || 
  key.includes('agenda') ||
  key.startsWith('agendamento_')
);

agendamentosKeys.forEach(key => {
  localStorage.removeItem(key);
  console.log(`🧹 Removido: ${key}`);
});

// Limpar cache de agendamentos
const cacheKeys = Object.keys(localStorage).filter(key => 
  key.includes('cache') && key.includes('agendamento')
);

cacheKeys.forEach(key => {
  localStorage.removeItem(key);
  console.log(`🧹 Removido cache: ${key}`);
});

// Limpar dados de notificações de agendamentos
const notificationKeys = Object.keys(localStorage).filter(key => 
  key.includes('notification') && key.includes('agendamento')
);

notificationKeys.forEach(key => {
  localStorage.removeItem(key);
  console.log(`🧹 Removido notificação: ${key}`);
});

console.log('✅ Limpeza de agendamentos concluída!');
console.log('🔄 Recarregue a página para ver as mudanças.');
