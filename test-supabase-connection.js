#!/usr/bin/env node

/**
 * Script para testar a conexão com o Supabase
 * Execute: node test-supabase-connection.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente do .env.local
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env.local');
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ Arquivo .env.local não encontrado!');
    console.log('📝 Crie o arquivo .env.local baseado no env.local.example');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      if (value && !value.startsWith('#')) {
        envVars[key.trim()] = value;
      }
    }
  });

  return envVars;
}

async function testSupabaseConnection() {
  console.log('🔍 Testando conexão com Supabase...\n');

  try {
    // Carregar variáveis de ambiente
    const env = loadEnvFile();
    
    const supabaseUrl = env.VITE_SUPABASE_URL;
    const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

    // Verificar se as credenciais estão configuradas
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Credenciais do Supabase não configuradas!');
      console.log('📝 Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env.local');
      return false;
    }

    // Verificar se não são valores padrão
    if (supabaseUrl === 'https://seu-projeto.supabase.co' || 
        supabaseKey === 'sua_chave_anonima_aqui') {
      console.error('❌ Credenciais do Supabase não foram personalizadas!');
      console.log('📝 Substitua os valores padrão pelas suas credenciais reais');
      return false;
    }

    console.log('✅ Credenciais encontradas');
    console.log(`🔗 URL: ${supabaseUrl}`);
    console.log(`🔑 Key: ${supabaseKey.substring(0, 20)}...`);

    // Criar cliente Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Testar conexão básica
    console.log('\n🔍 Testando conectividade...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('usuarios')
      .select('id')
      .limit(1);

    if (healthError) {
      console.error('❌ Erro na conexão:', healthError.message);
      
      if (healthError.message.includes('relation "usuarios" does not exist')) {
        console.log('📝 Tabela "usuarios" não existe. Execute o schema do banco de dados.');
        console.log('📋 Consulte o arquivo CONFIGURACAO_SUPABASE.md para instruções.');
      }
      
      return false;
    }

    console.log('✅ Conexão estabelecida com sucesso!');

    // Testar outras tabelas principais
    const tables = ['pacientes', 'profissionais', 'servicos', 'agendamentos'];
    
    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('id')
          .limit(1);
        
        if (error) {
          console.log(`⚠️  Tabela "${table}": ${error.message}`);
        } else {
          console.log(`✅ Tabela "${table}": OK`);
        }
      } catch (err) {
        console.log(`❌ Tabela "${table}": Erro - ${err.message}`);
      }
    }

    // Testar autenticação
    console.log('\n🔐 Testando autenticação...');
    try {
      const { data: authTest, error: authError } = await supabase.auth.getSession();
      
      if (authError) {
        console.log(`⚠️  Auth: ${authError.message}`);
      } else {
        console.log('✅ Sistema de autenticação: OK');
      }
    } catch (err) {
      console.log(`❌ Auth: Erro - ${err.message}`);
    }

    console.log('\n🎉 Teste de conexão concluído!');
    console.log('📋 Se houver erros, consulte CONFIGURACAO_SUPABASE.md');
    
    return true;

  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
    return false;
  }
}

// Executar teste
testSupabaseConnection()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });

export { testSupabaseConnection };
