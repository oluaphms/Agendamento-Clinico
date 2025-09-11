#!/usr/bin/env node

/**
 * Script para listar tabelas existentes no Supabase
 * Execute: node scripts/listar-tabelas-supabase.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: Variáveis de ambiente do Supabase não configuradas');
  console.log('Configure as variáveis no arquivo .env.local:');
  console.log('VITE_SUPABASE_URL=https://seu-projeto.supabase.co');
  console.log('VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Lista de tabelas esperadas do sistema clínico
const tabelasEsperadas = [
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
  'role_permissions',
  'user_roles'
];

async function listarTabelas() {
  try {
    console.log('🔍 Verificando tabelas no Supabase...\n');
    console.log('📊 URL:', supabaseUrl);
    console.log('🔑 Key:', supabaseKey.substring(0, 20) + '...');
    console.log('');

    // Testar conexão
    console.log('🔗 Testando conexão...');
    const { data: testData, error: testError } = await supabase
      .from('usuarios')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('❌ Erro de conexão:', testError.message);
      return;
    }

    console.log('✅ Conexão estabelecida com sucesso!\n');

    // Verificar cada tabela
    console.log('📋 VERIFICAÇÃO DE TABELAS:');
    console.log('=' .repeat(50));

    const resultados = [];

    for (const tabela of tabelasEsperadas) {
      try {
        const { data, error, count } = await supabase
          .from(tabela)
          .select('*', { count: 'exact', head: true });

        if (error) {
          resultados.push({
            tabela,
            existe: false,
            registros: 0,
            erro: error.message
          });
        } else {
          resultados.push({
            tabela,
            existe: true,
            registros: count || 0,
            erro: null
          });
        }
      } catch (err) {
        resultados.push({
          tabela,
          existe: false,
          registros: 0,
          erro: err.message
        });
      }
    }

    // Exibir resultados
    resultados.forEach(({ tabela, existe, registros, erro }) => {
      const status = existe ? '✅' : '❌';
      const registrosStr = existe ? `${registros} registros` : 'N/A';
      const erroStr = erro ? ` (${erro})` : '';
      
      console.log(`${status} ${tabela.padEnd(20)} | ${registrosStr}${erroStr}`);
    });

    // Resumo
    const existentes = resultados.filter(r => r.existe).length;
    const totalRegistros = resultados
      .filter(r => r.existe)
      .reduce((sum, r) => sum + r.registros, 0);

    console.log('\n📊 RESUMO:');
    console.log('=' .repeat(50));
    console.log(`Total de tabelas esperadas: ${tabelasEsperadas.length}`);
    console.log(`Tabelas existentes: ${existentes}`);
    console.log(`Tabelas faltando: ${tabelasEsperadas.length - existentes}`);
    console.log(`Total de registros: ${totalRegistros}`);

    // Verificar dados iniciais
    console.log('\n🌱 DADOS INICIAIS:');
    console.log('=' .repeat(50));

    // Verificar usuários iniciais
    const { data: usuarios, error: usuariosError } = await supabase
      .from('usuarios')
      .select('nome, cpf, nivel_acesso')
      .in('cpf', ['11111111111', '22222222222', '33333333333']);

    if (!usuariosError && usuarios) {
      console.log(`✅ Usuários iniciais: ${usuarios.length}/3`);
      usuarios.forEach(u => {
        console.log(`   - ${u.nome} (${u.cpf}) - ${u.nivel_acesso}`);
      });
    }

    // Verificar serviços iniciais
    const { data: servicos, error: servicosError } = await supabase
      .from('servicos')
      .select('nome, preco')
      .in('nome', ['Consulta Médica', 'Exame de Sangue', 'Ultrassom', 'Eletrocardiograma', 'Consulta de Retorno']);

    if (!servicosError && servicos) {
      console.log(`✅ Serviços iniciais: ${servicos.length}/5`);
      servicos.forEach(s => {
        console.log(`   - ${s.nome} - R$ ${s.preco}`);
      });
    }

    // Verificar configurações iniciais
    const { data: configs, error: configsError } = await supabase
      .from('configuracoes')
      .select('chave, categoria')
      .in('chave', ['sistema', 'notificacoes', 'seguranca', 'interface', 'backup']);

    if (!configsError && configs) {
      console.log(`✅ Configurações iniciais: ${configs.length}/5`);
      configs.forEach(c => {
        console.log(`   - ${c.chave} (${c.categoria})`);
      });
    }

    console.log('\n🎉 Verificação concluída!');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar o script
if (require.main === module) {
  listarTabelas();
}

module.exports = { listarTabelas };
