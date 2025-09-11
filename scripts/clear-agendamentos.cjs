const fs = require('fs');
const path = require('path');

console.log('🗑️ Limpando lista de agendamentos...');

// Script para limpar agendamentos no console do navegador
const clearAgendamentosScript = `
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
  console.log(\`🧹 Removido: \${key}\`);
});

// Limpar cache de agendamentos
const cacheKeys = Object.keys(localStorage).filter(key => 
  key.includes('cache') && key.includes('agendamento')
);

cacheKeys.forEach(key => {
  localStorage.removeItem(key);
  console.log(\`🧹 Removido cache: \${key}\`);
});

// Limpar dados de notificações de agendamentos
const notificationKeys = Object.keys(localStorage).filter(key => 
  key.includes('notification') && key.includes('agendamento')
);

notificationKeys.forEach(key => {
  localStorage.removeItem(key);
  console.log(\`🧹 Removido notificação: \${key}\`);
});

console.log('✅ Limpeza de agendamentos concluída!');
console.log('🔄 Recarregue a página para ver as mudanças.');
`;

// Salvar script de limpeza
const scriptPath = path.join(__dirname, '..', 'public', 'clear-agendamentos.js');
fs.writeFileSync(scriptPath, clearAgendamentosScript);

console.log('✅ Script de limpeza criado em:', scriptPath);
console.log('');
console.log('📋 Para usar:');
console.log('1. Abra o console do navegador (F12)');
console.log('2. Cole e execute o script de limpeza');
console.log('3. Recarregue a página');
console.log('');
console.log('🔗 Ou acesse: http://localhost:3004/clear-agendamentos.js');
