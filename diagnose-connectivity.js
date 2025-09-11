import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xvjjgeoxsvzwcvjihjia.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2ampnZW94c3Z6d2N2amloamlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5ODYwNjQsImV4cCI6MjA3MTU2MjA2NH0.4FRJOc0pk--OnqdJyQDTXGn87doooRKJC7hYELy5sKs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseConnectivity() {
  console.log('🔍 Diagnosticando conectividade com Supabase...');
  console.log('📊 URL:', supabaseUrl);
  console.log('🔑 Key:', supabaseKey.substring(0, 20) + '...');
  
  try {
    // 1. Teste básico de conectividade
    console.log('\n📋 Teste 1: Conectividade básica');
    const startTime = Date.now();
    
    const { data, error } = await supabase
      .from('usuarios')
      .select('id')
      .limit(1);
      
    const responseTime = Date.now() - startTime;
    
    if (error) {
      console.error('❌ Erro na conectividade:', error);
      console.error('📋 Código do erro:', error.code);
      console.error('📋 Mensagem:', error.message);
      console.error('📋 Detalhes:', error.details);
      console.error('📋 Hint:', error.hint);
    } else {
      console.log('✅ Conectividade OK');
      console.log('⏱️ Tempo de resposta:', responseTime + 'ms');
      console.log('📊 Dados recebidos:', data);
    }
    
    // 2. Teste de diferentes tabelas
    console.log('\n📋 Teste 2: Acessando diferentes tabelas');
    
    const tabelas = ['usuarios', 'pacientes', 'profissionais', 'servicos', 'agendamentos'];
    
    for (const tabela of tabelas) {
      try {
        const { data, error } = await supabase
          .from(tabela)
          .select('id')
          .limit(1);
          
        if (error) {
          console.log(`❌ ${tabela}:`, error.message);
        } else {
          console.log(`✅ ${tabela}: OK`);
        }
      } catch (err) {
        console.log(`❌ ${tabela}:`, err.message);
      }
    }
    
    // 3. Teste de RPC
    console.log('\n📋 Teste 3: Testando RPC');
    try {
      const { data, error } = await supabase.rpc('autenticar_usuario', {
        cpf_busca: '12345678901',
        senha_fornecida: '123'
      });
      
      if (error) {
        console.log('❌ RPC autenticar_usuario:', error.message);
      } else {
        console.log('✅ RPC autenticar_usuario: OK');
      }
    } catch (err) {
      console.log('❌ RPC autenticar_usuario:', err.message);
    }
    
    // 4. Verificar status do Supabase
    console.log('\n📋 Teste 4: Verificando status do Supabase');
    try {
      const response = await fetch('https://status.supabase.com/api/v2/status.json');
      const status = await response.json();
      
      console.log('📊 Status do Supabase:', status.status?.description || 'Desconhecido');
      
      if (status.status?.indicator === 'operational') {
        console.log('✅ Supabase operacional');
      } else {
        console.log('⚠️ Supabase pode ter problemas:', status.status?.description);
      }
    } catch (err) {
      console.log('❌ Não foi possível verificar status:', err.message);
    }
    
  } catch (error) {
    console.error('❌ Erro geral na conectividade:', error);
  }
}

diagnoseConnectivity().catch(console.error);
