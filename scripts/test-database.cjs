const { createClient } = require('@supabase/supabase-js');

console.log('🧪 Testando conectividade com banco de dados...');

// Simular configuração de ambiente
process.env.VITE_ENABLE_MOCK_DATA = 'true';
process.env.VITE_ENABLE_DEBUG_LOGS = 'true';

// Importar o supabase configurado
const { supabase } = require('../src/lib/supabase.ts');

async function testDatabase() {
  try {
    console.log('🔍 Verificando instância do Supabase...');
    console.log('📊 Tipo:', typeof supabase);
    console.log('📊 Métodos disponíveis:', Object.keys(supabase));

    // Testar carregamento de pacientes
    console.log('\n🔄 Testando carregamento de pacientes...');
    const { data: pacientes, error: pacientesError } = await supabase
      .from('pacientes')
      .select('*')
      .order('nome');

    console.log('👥 Resultado pacientes:', {
      success: !pacientesError,
      count: pacientes?.length || 0,
      error: pacientesError?.message || null,
      data: pacientes?.slice(0, 3) || [], // Mostrar apenas os primeiros 3
    });

    // Testar carregamento de agendamentos
    console.log('\n🔄 Testando carregamento de agendamentos...');
    const { data: agendamentos, error: agendamentosError } = await supabase
      .from('agendamentos')
      .select('*');

    console.log('📅 Resultado agendamentos:', {
      success: !agendamentosError,
      count: agendamentos?.length || 0,
      error: agendamentosError?.message || null,
      data: agendamentos?.slice(0, 3) || [], // Mostrar apenas os primeiros 3
    });

    // Testar carregamento de profissionais
    console.log('\n🔄 Testando carregamento de profissionais...');
    const { data: profissionais, error: profissionaisError } = await supabase
      .from('profissionais')
      .select('*');

    console.log('👨‍⚕️ Resultado profissionais:', {
      success: !profissionaisError,
      count: profissionais?.length || 0,
      error: profissionaisError?.message || null,
      data: profissionais?.slice(0, 3) || [], // Mostrar apenas os primeiros 3
    });

    // Testar carregamento de serviços
    console.log('\n🔄 Testando carregamento de serviços...');
    const { data: servicos, error: servicosError } = await supabase
      .from('servicos')
      .select('*');

    console.log('🛠️ Resultado serviços:', {
      success: !servicosError,
      count: servicos?.length || 0,
      error: servicosError?.message || null,
      data: servicos?.slice(0, 3) || [], // Mostrar apenas os primeiros 3
    });

    console.log('\n📊 RESUMO FINAL:');
    console.log(`✅ Pacientes: ${pacientes?.length || 0}`);
    console.log(`✅ Agendamentos: ${agendamentos?.length || 0}`);
    console.log(`✅ Profissionais: ${profissionais?.length || 0}`);
    console.log(`✅ Serviços: ${servicos?.length || 0}`);

    if (pacientes?.length === 0) {
      console.log('\n⚠️ ATENÇÃO: Nenhum paciente encontrado!');
      console.log('🔧 Possíveis soluções:');
      console.log('   1. Verificar se dados mock estão sendo carregados');
      console.log('   2. Verificar configuração do ambiente');
      console.log('   3. Verificar se o banco local está funcionando');
    }
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
    console.error('❌ Stack trace:', error.stack);
  }
}

testDatabase();
