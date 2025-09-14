// ============================================================================
// SCRIPT DE LIMPEZA PARA DESENVOLVIMENTO
// ============================================================================
// Execute este script no console do navegador para limpar cache e dados
// ============================================================================

console.log('🧹 Limpando cache e dados de desenvolvimento...');

// Função para limpar cache do Service Worker
async function clearServiceWorkerCache() {
  console.log('📦 Limpando cache do Service Worker...');
  
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    console.log('Caches encontrados:', cacheNames);
    
    for (const cacheName of cacheNames) {
      if (cacheName.includes('sistema-clinico') || cacheName.includes('vite')) {
        await caches.delete(cacheName);
        console.log(`✅ Cache removido: ${cacheName}`);
      }
    }
  }
}

// Função para limpar localStorage
function clearLocalStorage() {
  console.log('🗄️ Limpando localStorage...');
  
  const keys = Object.keys(localStorage);
  let removedCount = 0;
  
  for (const key of keys) {
    if (
      key.includes('sistema-clinico') || 
      key.includes('supabase') ||
      key.includes('vite') ||
      key.includes('react') ||
      key.includes('dev')
    ) {
      localStorage.removeItem(key);
      console.log(`✅ Removido: ${key}`);
      removedCount++;
    }
  }
  
  console.log(`Total de itens removidos: ${removedCount}`);
}

// Função para limpar sessionStorage
function clearSessionStorage() {
  console.log('📋 Limpando sessionStorage...');
  
  const keys = Object.keys(sessionStorage);
  let removedCount = 0;
  
  for (const key of keys) {
    if (
      key.includes('sistema-clinico') || 
      key.includes('supabase') ||
      key.includes('vite') ||
      key.includes('react') ||
      key.includes('dev')
    ) {
      sessionStorage.removeItem(key);
      console.log(`✅ Removido: ${key}`);
      removedCount++;
    }
  }
  
  console.log(`Total de itens removidos: ${removedCount}`);
}

// Função para recarregar Service Worker
async function reloadServiceWorker() {
  console.log('🔄 Recarregando Service Worker...');
  
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    
    for (const registration of registrations) {
      await registration.unregister();
      console.log('✅ Service Worker desregistrado');
    }
    
    // Recarregar a página para registrar novamente
    console.log('🔄 Recarregando página para registrar novo Service Worker...');
    window.location.reload();
  }
}

// Função para limpar tudo
async function clearAll() {
  try {
    await clearServiceWorkerCache();
    clearLocalStorage();
    clearSessionStorage();
    
    console.log('\n✅ Limpeza concluída!');
    console.log('💡 Dica: Execute reloadServiceWorker() para recarregar o Service Worker');
    
  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error);
  }
}

// Executar limpeza automática
clearAll();

// Expor funções globalmente
window.clearServiceWorkerCache = clearServiceWorkerCache;
window.clearLocalStorage = clearLocalStorage;
window.clearSessionStorage = clearSessionStorage;
window.reloadServiceWorker = reloadServiceWorker;
window.clearAll = clearAll;

console.log('\n🛠️ Funções disponíveis:');
console.log('   - clearAll() - Limpar tudo');
console.log('   - clearServiceWorkerCache() - Limpar apenas cache');
console.log('   - clearLocalStorage() - Limpar apenas localStorage');
console.log('   - clearSessionStorage() - Limpar apenas sessionStorage');
console.log('   - reloadServiceWorker() - Recarregar Service Worker');
