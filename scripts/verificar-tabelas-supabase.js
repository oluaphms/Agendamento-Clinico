#!/usr/bin/env node

/**
 * SCRIPT DE VERIFICAÇÃO DE TABELAS DO SUPABASE
 * ============================================
 *
 * Este script verifica quais tabelas existem no Supabase
 * e quais ainda precisam ser criadas para o sistema clínico.
 *
 * Como usar:
 * 1. Configure as variáveis de ambiente do Supabase
 * 2. Execute: node verificar-tabelas-supabase.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey =
  process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERRO: Variáveis de ambiente do Supabase não configuradas!');
  console.error(
    'Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Tabelas esperadas no sistema clínico
const TABELAS_ESPERADAS = [
  'usuarios',
  'pacientes',
  'profissionais',
  'servicos',
  'agendamentos',
  'pagamentos',
  'configuracoes',
  'audit_log',
  'notificacoes',
  'backups',
];

// Função para verificar se uma tabela existe
async function verificarTabelaExiste(nomeTabela) {
  try {
    const { data, error } = await supabase
      .from(nomeTabela)
      .select('*')
      .limit(1);

    if (error) {
      // Se o erro for "relation does not exist", a tabela não existe
      if (
        error.message.includes('relation') &&
        error.message.includes('does not exist')
      ) {
        return false;
      }
      // Outros erros podem indicar que a tabela existe mas tem problemas
      console.warn(
        `⚠️  Aviso ao verificar tabela ${nomeTabela}:`,
        error.message
      );
      return true; // Assumir que existe se houver outro tipo de erro
    }
    return true;
  } catch (err) {
    console.warn(`⚠️  Erro ao verificar tabela ${nomeTabela}:`, err.message);
    return false;
  }
}

// Função para contar registros em uma tabela
async function contarRegistros(nomeTabela) {
  try {
    const { count, error } = await supabase
      .from(nomeTabela)
      .select('*', { count: 'exact', head: true });

    if (error) {
      return 0;
    }
    return count || 0;
  } catch (err) {
    return 0;
  }
}

// Função principal
async function verificarTabelas() {
  console.log('🔍 VERIFICANDO TABELAS DO SISTEMA CLÍNICO NO SUPABASE');
  console.log('='.repeat(60));
  console.log();

  const resultados = [];
  let tabelasExistentes = 0;

  // Verificar cada tabela esperada
  for (const tabela of TABELAS_ESPERADAS) {
    const existe = await verificarTabelaExiste(tabela);
    const registros = existe ? await contarRegistros(tabela) : 0;

    resultados.push({
      tabela,
      existe,
      registros,
    });

    if (existe) {
      tabelasExistentes++;
    }

    // Mostrar status da tabela
    const status = existe ? '✅ EXISTE' : '❌ FALTA';
    const infoRegistros = existe ? ` (${registros} registros)` : '';
    console.log(`${status} ${tabela}${infoRegistros}`);
  }

  console.log();
  console.log('='.repeat(60));
  console.log('📊 RESUMO GERAL');
  console.log('='.repeat(60));
  console.log(
    `Tabelas criadas: ${tabelasExistentes}/${TABELAS_ESPERADAS.length}`
  );
  console.log(
    `Percentual completo: ${Math.round((tabelasExistentes / TABELAS_ESPERADAS.length) * 100)}%`
  );
  console.log();

  // Mostrar tabelas faltantes
  const tabelasFaltantes = resultados.filter(r => !r.existe);
  if (tabelasFaltantes.length > 0) {
    console.log('❌ TABELAS QUE PRECISAM SER CRIADAS:');
    tabelasFaltantes.forEach(t => {
      console.log(`   - ${t.tabela}`);
    });
    console.log();
    console.log('💡 Para criar as tabelas faltantes, execute:');
    console.log('   scripts/00-setup-completo-sistema-corrigido.sql');
    console.log();
  } else {
    console.log('🎉 TODAS AS TABELAS PRINCIPAIS JÁ EXISTEM!');
    console.log();
  }

  // Mostrar tabelas com dados
  const tabelasComDados = resultados.filter(r => r.existe && r.registros > 0);
  if (tabelasComDados.length > 0) {
    console.log('📋 TABELAS COM DADOS:');
    tabelasComDados.forEach(t => {
      console.log(`   - ${t.tabela}: ${t.registros} registros`);
    });
    console.log();
  }

  // Mostrar tabelas vazias
  const tabelasVazias = resultados.filter(r => r.existe && r.registros === 0);
  if (tabelasVazias.length > 0) {
    console.log('📭 TABELAS VAZIAS (sem dados):');
    tabelasVazias.forEach(t => {
      console.log(`   - ${t.tabela}`);
    });
    console.log();
  }

  return resultados;
}

// Função para verificar conexão com Supabase
async function verificarConexao() {
  try {
    console.log('🔌 Testando conexão com Supabase...');
    const { data, error } = await supabase
      .from('usuarios')
      .select('count')
      .limit(1);

    if (
      error &&
      !error.message.includes('relation') &&
      !error.message.includes('does not exist')
    ) {
      throw error;
    }

    console.log('✅ Conexão com Supabase estabelecida!');
    return true;
  } catch (err) {
    console.error('❌ Erro ao conectar com Supabase:', err.message);
    return false;
  }
}

// Executar verificação
async function main() {
  console.log('🚀 INICIANDO VERIFICAÇÃO DE TABELAS');
  console.log();

  const conectado = await verificarConexao();
  if (!conectado) {
    process.exit(1);
  }

  console.log();
  await verificarTabelas();

  console.log('✨ Verificação concluída!');
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { verificarTabelas, verificarConexao };
