const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = 'https://xvjjgeoxsvzwcvjihjia.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2ampnZW94c3Z6d2N2amloamlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5ODYwNjQsImV4cCI6MjA3MTU2MjA2NH0.4FRJOc0pk--OnqdJyQDTXGn87doooRKJC7hYELy5sKs';

// Função para limpar uma tabela
async function clearTable(supabase, tableName) {
  console.log(`\n🗑️  Limpando tabela: ${tableName}`);
  
  try {
    // Deletar todos os registros da tabela
    const { error } = await supabase
      .from(tableName)
      .delete()
      .neq('id', 0); // Deletar todos os registros
    
    if (error) {
      console.error(`❌ Erro ao limpar ${tableName}:`, error.message);
      return false;
    } else {
      console.log(`✅ Tabela ${tableName} limpa com sucesso`);
      return true;
    }
  } catch (error) {
    console.error(`❌ Erro geral em ${tableName}:`, error.message);
    return false;
  }
}

// Função para verificar se as tabelas estão vazias
async function verifyEmptyTables(supabase) {
  console.log('\n📊 Verificando se as tabelas estão vazias...');
  
  const tables = ['pacientes', 'profissionais', 'servicos', 'agendamentos'];
  
  for (const tableName of tables) {
    try {
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ Erro ao verificar ${tableName}:`, error.message);
      } else {
        console.log(`✅ ${tableName}: ${count} registros`);
      }
    } catch (error) {
      console.log(`❌ Erro ao verificar ${tableName}:`, error.message);
    }
  }
}

// Função principal
async function main() {
  console.log('🚀 Iniciando limpeza do Supabase...');
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
  
  // Limpar tabelas (ordem importante devido às foreign keys)
  const tables = ['agendamentos', 'pacientes', 'profissionais', 'servicos'];
  let successCount = 0;
  
  for (const tableName of tables) {
    const success = await clearTable(supabase, tableName);
    if (success) successCount++;
  }
  
  console.log(`\n🎉 Limpeza concluída! ${successCount}/${tables.length} tabelas limpas com sucesso`);
  
  // Verificar se as tabelas estão vazias
  await verifyEmptyTables(supabase);
  
  console.log('\n✨ Sistema zerado! Agora você pode começar do zero.');
  console.log('💡 O dashboard deve mostrar todos os valores como 0.');
}

// Executar script
main().catch(console.error);
