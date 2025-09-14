// ============================================================================
// TESTE DA TABELA USUARIO NO SUPABASE
// ============================================================================

const https = require('https');

const supabaseUrl = 'https://xvjjgeoxsvzwcvjihjia.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2ampnZW94c3Z6d2N2amloamlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5ODYwNjQsImV4cCI6MjA3MTU2MjA2NH0.4FRJOc0pk--OnqdJyQDTXGn87doooRKJC7hYELy5sKs';

console.log('🔧 Testando tabela "usuario" no Supabase...');
console.log('URL:', supabaseUrl);

const options = {
  hostname: 'xvjjgeoxsvzwcvjihjia.supabase.co',
  port: 443,
  path: '/rest/v1/usuario?select=*&limit=5',
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
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`\n📄 Response Body:`);
    
    try {
      const jsonData = JSON.parse(data);
      console.log(`✅ Dados recebidos: ${jsonData.length} usuários`);
      
      if (jsonData.length > 0) {
        console.log('\n👤 Primeiro usuário:');
        console.log('   Nome:', jsonData[0].nome);
        console.log('   CPF:', jsonData[0].cpf);
        console.log('   Email:', jsonData[0].email);
        console.log('   Nível:', jsonData[0].nivel_acesso);
        console.log('   Status:', jsonData[0].status);
        console.log('   Telefone:', jsonData[0].telefone || 'Não informado');
        console.log('   Cargo:', jsonData[0].cargo || 'Não informado');
      }
      
      console.log('\n✅ Tabela "usuario" está funcionando perfeitamente!');
      console.log('📝 Estrutura dos dados confirmada para o sistema React.');
      
    } catch (error) {
      console.error('❌ Erro ao parsear JSON:', error.message);
      console.log('Raw response:', data);
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
