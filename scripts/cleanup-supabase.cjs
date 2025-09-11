const fs = require('fs');
const path = require('path');

console.log('🧹 Limpando instâncias duplicadas do Supabase...');

// Criar script de limpeza para o navegador
const cleanupScript = `
// Script de limpeza para o console do navegador
console.log('🧹 Iniciando limpeza de instâncias duplicadas do Supabase...');

// Chaves comuns do Supabase no localStorage
const supabaseKeys = [
  'sb-xvjjgeoxsvzwcvjihjih-auth-token',
  'supabase.auth.token',
  'supabase.auth.refresh_token',
  'supabase.auth.user',
  'supabase.auth.session'
];

// Remover chaves duplicadas ou antigas
supabaseKeys.forEach(key => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    console.log(\`🧹 Removida chave duplicada: \${key}\`);
  }
});

// Limpar chaves que começam com 'sb-'
const allKeys = Object.keys(localStorage);
allKeys.forEach(key => {
  if (key.startsWith('sb-') && key.includes('auth')) {
    localStorage.removeItem(key);
    console.log(\`🧹 Removida chave de auth antiga: \${key}\`);
  }
});

console.log('✅ Limpeza concluída! Recarregue a página para aplicar as mudanças.');
`;

// Salvar script de limpeza
const scriptPath = path.join(__dirname, '..', 'public', 'cleanup-supabase.js');
fs.writeFileSync(scriptPath, cleanupScript);

console.log('✅ Script de limpeza criado em:', scriptPath);
console.log('');
console.log('📋 Para usar:');
console.log('1. Abra o console do navegador (F12)');
console.log('2. Cole e execute o script de limpeza');
console.log('3. Recarregue a página');
console.log('');
console.log('🔗 Ou acesse: http://localhost:3004/cleanup-supabase.js');
