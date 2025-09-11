
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
    console.log(`🧹 Removida chave duplicada: ${key}`);
  }
});

// Limpar chaves que começam com 'sb-'
const allKeys = Object.keys(localStorage);
allKeys.forEach(key => {
  if (key.startsWith('sb-') && key.includes('auth')) {
    localStorage.removeItem(key);
    console.log(`🧹 Removida chave de auth antiga: ${key}`);
  }
});

console.log('✅ Limpeza concluída! Recarregue a página para aplicar as mudanças.');
