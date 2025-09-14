// ============================================================================
// TESTE DE CONECTIVIDADE COM SUPABASE
// ============================================================================

const https = require('https');

const supabaseUrl = 'https://xvjjgeoxsvzwcvjihjia.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2ampnZW94c3Z6d2N2amloamlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5ODYwNjQsImV4cCI6MjA3MTU2MjA2NH0.4FRJOc0pk--OnqdJyQDTXGn87doooRKJC7hYELy5sKs';

console.log('🔧 Testando conectividade com Supabase...');
console.log('URL:', supabaseUrl);

const options = {
  hostname: 'xvjjgeoxsvzwcvjihjia.supabase.co',
  port: 443,
  path: '/rest/v1/usuarios?select=count&limit=1',
  method: 'GET',
  headers: {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  console.log(`\n📊 Status: ${res.statusCode}`);
  console.log(`📋 Status Text: ${res.statusMessage}`);
  console.log(`🔗 Headers:`, res.headers);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`\n📄 Response Body:`, data);
    
    if (res.statusCode === 200) {
      console.log('\n✅ Supabase está funcionando corretamente!');
    } else if (res.statusCode === 503) {
      console.log('\n⚠️ Supabase retornou erro 503 (Service Unavailable)');
      console.log('Isso explica os erros que você estava vendo no navegador.');
    } else {
      console.log(`\n❌ Supabase retornou erro ${res.statusCode}`);
    }
  });
});

req.on('error', (error) => {
  console.error('\n❌ Erro na requisição:', error.message);
});

req.setTimeout(10000, () => {
  console.log('\n⏰ Timeout na requisição (10 segundos)');
  req.destroy();
});

req.end();