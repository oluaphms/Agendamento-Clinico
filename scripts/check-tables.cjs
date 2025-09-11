const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = 'https://xvjjgeoxsvzwcvjihjia.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2ampnZW94c3Z6d2N2amloamlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5ODYwNjQsImV4cCI6MjA3MTU2MjA2NH0.4FRJOc0pk--OnqdJyQDTXGn87doooRKJC7hYELy5sKs';

// Tabelas que o projeto precisa (baseado na análise do código)
const tabelasNecessarias = [
  'usuarios',
  'pacientes', 
  'profissionais',
  'servicos',
  'agendamentos',
  'pagamentos',
  'configuracoes',
  'notificacoes',
  'audit_log',
  'backups',
  'permissions',
  'roles',
  'user_roles',
  'notification_templates',
  'relatorios_config',
  'relatorios_gerados',
  'feedback',
  'logs_alteracoes'
];

// Função para verificar se uma tabela existe
async function checkTableExists(supabase, tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        return { exists: false, error: null };
      }
      return { exists: false, error: error.message };
    }
    
    return { exists: true, error: null, count: data ? data.length : 0 };
  } catch (error) {
    return { exists: false, error: error.message };
  }
}

// Função para listar todas as tabelas do schema public
async function listAllTables(supabase) {
  try {
    const { data, error } = await supabase
      .rpc('get_table_names');
    
    if (error) {
      console.log('❌ Erro ao listar tabelas via RPC:', error.message);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.log('❌ Erro ao listar tabelas:', error.message);
    return [];
  }
}

// Função principal
async function main() {
  console.log('🔍 Verificando tabelas do Supabase...');
  console.log(`📡 Conectando em: ${supabaseUrl}`);
  
  // Criar cliente Supabase
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Testar conexão
  try {
    const { data, error } = await supabase.from('pacientes').select('count').limit(1);
    if (error) {
      console.error('❌ Erro de conexão:', error.message);
      return;
    }
    console.log('✅ Conexão com Supabase estabelecida');
  } catch (error) {
    console.error('❌ Erro de conexão:', error.message);
    return;
  }
  
  console.log('\n📊 Verificando tabelas necessárias...');
  console.log('=' .repeat(60));
  
  let tabelasExistentes = 0;
  let tabelasFaltando = 0;
  
  for (const tabela of tabelasNecessarias) {
    const resultado = await checkTableExists(supabase, tabela);
    
    if (resultado.exists) {
      console.log(`✅ ${tabela.padEnd(25)} - Existe (${resultado.count} registros)`);
      tabelasExistentes++;
    } else {
      console.log(`❌ ${tabela.padEnd(25)} - Não existe`);
      if (resultado.error) {
        console.log(`   Erro: ${resultado.error}`);
      }
      tabelasFaltando++;
    }
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log(`📈 Resumo:`);
  console.log(`   ✅ Tabelas existentes: ${tabelasExistentes}`);
  console.log(`   ❌ Tabelas faltando: ${tabelasFaltando}`);
  console.log(`   📊 Total necessário: ${tabelasNecessarias.length}`);
  
  if (tabelasFaltando > 0) {
    console.log('\n⚠️  ATENÇÃO: Algumas tabelas estão faltando!');
    console.log('💡 Recomendação: Execute o script create-tables-simple.sql no Supabase Dashboard');
  } else {
    console.log('\n🎉 Todas as tabelas necessárias estão presentes!');
  }
  
  // Tentar listar todas as tabelas do schema
  console.log('\n🔍 Tentando listar todas as tabelas do schema...');
  const todasTabelas = await listAllTables(supabase);
  
  if (todasTabelas.length > 0) {
    console.log('📋 Tabelas encontradas no schema:');
    todasTabelas.forEach(tabela => {
      console.log(`   - ${tabela}`);
    });
  } else {
    console.log('ℹ️  Não foi possível listar todas as tabelas automaticamente');
  }
}

// Executar script
main().catch(console.error);
