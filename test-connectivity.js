// ============================================================================
// SCRIPT DE TESTE DE CONECTIVIDADE
// ============================================================================
// Execute este script no console do navegador para testar a conectividade
// ============================================================================

console.log('🔧 Testando conectividade do sistema...');

// Função para testar conectividade
async function testConnectivity() {
  console.log('\n📋 === TESTE DE CONECTIVIDADE ===');

  // 1. Verificar configuração do ambiente
  console.log('\n1️⃣ Verificando configuração do ambiente...');
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const mockDataEnabled = import.meta.env.VITE_ENABLE_MOCK_DATA;

  console.log('   Supabase URL:', supabaseUrl || 'Não configurado');
  console.log(
    '   Supabase Key:',
    supabaseKey ? 'Configurado' : 'Não configurado'
  );
  console.log('   Mock Data:', mockDataEnabled || 'Não configurado');

  // 2. Verificar se está online
  console.log('\n2️⃣ Verificando conectividade de rede...');
  console.log('   Status online:', navigator.onLine);

  // 3. Testar Service Worker
  console.log('\n3️⃣ Verificando Service Worker...');
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      console.log('   ✅ Service Worker registrado');
      console.log('   Estado:', registration.active ? 'Ativo' : 'Inativo');
    } else {
      console.log('   ❌ Service Worker não registrado');
    }
  } else {
    console.log('   ❌ Service Worker não suportado');
  }

  // 4. Testar cache
  console.log('\n4️⃣ Verificando cache...');
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    console.log('   Caches disponíveis:', cacheNames);

    // Verificar cache específico
    const staticCache = await caches.open('sistema-clinico-static-v1.0.0');
    const staticKeys = await staticCache.keys();
    console.log('   Items no cache estático:', staticKeys.length);

    const dynamicCache = await caches.open('sistema-clinico-dynamic-v1.0.0');
    const dynamicKeys = await dynamicCache.keys();
    console.log('   Items no cache dinâmico:', dynamicKeys.length);
  } else {
    console.log('   ❌ Cache API não suportada');
  }

  // 5. Testar conectividade com Supabase (se configurado)
  if (supabaseUrl && supabaseKey && !mockDataEnabled) {
    console.log('\n5️⃣ Testando conectividade com Supabase...');
    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/usuarios?select=count&limit=1`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        }
      );

      if (response.ok) {
        console.log('   ✅ Supabase conectado');
        console.log('   Status:', response.status);
      } else {
        console.log('   ⚠️ Supabase com problemas');
        console.log('   Status:', response.status);
        console.log('   Status Text:', response.statusText);
      }
    } catch (error) {
      console.log('   ❌ Erro ao conectar com Supabase:', error.message);
    }
  } else {
    console.log('\n5️⃣ Pulando teste do Supabase (usando dados mock)');
  }

  // 6. Testar dados mock
  console.log('\n6️⃣ Testando dados mock...');
  try {
    // Verificar se localStorage tem dados
    const hasLocalData = localStorage.getItem('sistema-clinico-data');
    if (hasLocalData) {
      const data = JSON.parse(hasLocalData);
      console.log('   ✅ Dados mock disponíveis');
      console.log('   Pacientes:', data.pacientes?.length || 0);
      console.log('   Profissionais:', data.profissionais?.length || 0);
      console.log('   Serviços:', data.servicos?.length || 0);
      console.log('   Agendamentos:', data.agendamentos?.length || 0);
    } else {
      console.log('   ⚠️ Nenhum dado mock encontrado');
    }
  } catch (error) {
    console.log('   ❌ Erro ao verificar dados mock:', error.message);
  }

  console.log('\n✅ Teste de conectividade concluído!');
}

// Função para limpar cache
async function clearCache() {
  console.log('\n🧹 Limpando cache...');

  if ('caches' in window) {
    const cacheNames = await caches.keys();
    for (const cacheName of cacheNames) {
      if (cacheName.includes('sistema-clinico')) {
        await caches.delete(cacheName);
        console.log(`   Cache removido: ${cacheName}`);
      }
    }
  }

  // Limpar localStorage
  const keys = Object.keys(localStorage);
  for (const key of keys) {
    if (key.includes('sistema-clinico') || key.includes('supabase')) {
      localStorage.removeItem(key);
      console.log(`   LocalStorage removido: ${key}`);
    }
  }

  console.log('✅ Cache limpo!');
}

// Função para forçar reload do Service Worker
async function reloadServiceWorker() {
  console.log('\n🔄 Recarregando Service Worker...');

  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.update();
      console.log('✅ Service Worker atualizado');
    }
  }
}

// Executar teste
testConnectivity();

// Expor funções globalmente para uso manual
window.testConnectivity = testConnectivity;
window.clearCache = clearCache;
window.reloadServiceWorker = reloadServiceWorker;

console.log('\n🛠️ Funções disponíveis:');
console.log('   - testConnectivity() - Executar teste completo');
console.log('   - clearCache() - Limpar cache e localStorage');
console.log('   - reloadServiceWorker() - Recarregar Service Worker');
