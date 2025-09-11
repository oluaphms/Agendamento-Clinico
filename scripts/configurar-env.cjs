// =====================================================
// CONFIGURADOR AUTOMÁTICO DO .env.local
// =====================================================
// Este script ajuda a configurar o arquivo .env.local

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function configurarEnv() {
  console.log('========================================');
  console.log('CONFIGURADOR DO .env.local');
  console.log('========================================');
  console.log('');
  console.log('Este script irá ajudar você a configurar o arquivo .env.local');
  console.log('com as credenciais do Supabase.');
  console.log('');
  console.log('Primeiro, você precisa:');
  console.log('1. Acessar https://supabase.com/dashboard');
  console.log('2. Criar um projeto ou selecionar um existente');
  console.log('3. Ir em Settings > API');
  console.log('4. Copiar a URL e a chave anônima');
  console.log('');
  
  const continuar = await question('Tem as credenciais do Supabase? (s/n): ');
  
  if (continuar.toLowerCase() !== 's' && continuar.toLowerCase() !== 'sim') {
    console.log('');
    console.log('Por favor, obtenha as credenciais primeiro:');
    console.log('1. Acesse https://supabase.com/dashboard');
    console.log('2. Crie um projeto');
    console.log('3. Vá em Settings > API');
    console.log('4. Copie a URL e a chave anônima');
    console.log('5. Execute este script novamente');
    rl.close();
    return;
  }
  
  console.log('');
  console.log('Agora vamos configurar o arquivo .env.local:');
  console.log('');
  
  // Solicitar URL do Supabase
  const supabaseUrl = await question('URL do Supabase (ex: https://abcdefgh.supabase.co): ');
  
  if (!supabaseUrl || !supabaseUrl.includes('supabase.co')) {
    console.log('❌ URL inválida. Deve conter "supabase.co"');
    rl.close();
    return;
  }
  
  // Solicitar chave anônima
  const supabaseKey = await question('Chave anônima do Supabase: ');
  
  if (!supabaseKey || supabaseKey.length < 50) {
    console.log('❌ Chave inválida. Deve ter pelo menos 50 caracteres');
    rl.close();
    return;
  }
  
  // Configurações adicionais
  const appName = await question('Nome da aplicação (padrão: Sistema de Gestão de Clínica): ') || 'Sistema de Gestão de Clínica';
  const enableMockData = await question('Usar dados mock? (s/n, padrão: n): ');
  const enableDebugLogs = await question('Habilitar logs de debug? (s/n, padrão: s): ');
  
  // Criar conteúdo do .env.local
  const envContent = `# =====================================================
# CONFIGURAÇÃO DO SUPABASE
# =====================================================
# Configurado automaticamente em ${new Date().toLocaleString()}

# URL do seu projeto Supabase
VITE_SUPABASE_URL=${supabaseUrl}

# Chave anônima do Supabase
VITE_SUPABASE_ANON_KEY=${supabaseKey}

# =====================================================
# CONFIGURAÇÃO DA APLICAÇÃO
# =====================================================

VITE_APP_NAME="${appName}"
VITE_APP_VERSION="1.0.0"
VITE_APP_ENVIRONMENT=development

# =====================================================
# CONFIGURAÇÕES DE DESENVOLVIMENTO
# =====================================================

VITE_API_URL=http://localhost:3000
VITE_ENABLE_MOCK_DATA=${enableMockData.toLowerCase() === 's' || enableMockData.toLowerCase() === 'sim' ? 'true' : 'false'}
VITE_ENABLE_DEBUG_LOGS=${enableDebugLogs.toLowerCase() === 's' || enableDebugLogs.toLowerCase() === 'sim' ? 'true' : 'false'}
VITE_ENABLE_ERROR_REPORTING=false

# =====================================================
# PRÓXIMOS PASSOS
# =====================================================
# 
# 1. Execute os scripts SQL no Supabase SQL Editor:
#    - scripts/permissoes-corrigido-final.sql
#    - scripts/setup-usuarios-padrao-completo.sql
#    - scripts/verificar-usuarios-padrao.sql
# 
# 2. Ou execute tudo de uma vez:
#    \\i scripts/executar-setup-completo.sql
# 
# 3. Verifique a configuração:
#    node scripts/verificar-seguranca-local.cjs
# 
# =====================================================
`;

  // Escrever arquivo
  try {
    fs.writeFileSync('.env.local', envContent);
    console.log('');
    console.log('✅ Arquivo .env.local criado com sucesso!');
    console.log('');
    console.log('========================================');
    console.log('PRÓXIMOS PASSOS');
    console.log('========================================');
    console.log('');
    console.log('1. Execute os scripts SQL no Supabase SQL Editor:');
    console.log('   - scripts/permissoes-corrigido-final.sql');
    console.log('   - scripts/setup-usuarios-padrao-completo.sql');
    console.log('   - scripts/verificar-usuarios-padrao.sql');
    console.log('');
    console.log('2. Ou execute tudo de uma vez:');
    console.log('   \\i scripts/executar-setup-completo.sql');
    console.log('');
    console.log('3. Verifique a configuração:');
    console.log('   node scripts/verificar-seguranca-local.cjs');
    console.log('');
    console.log('4. Inicie o projeto:');
    console.log('   npm run dev');
    console.log('');
    console.log('========================================');
    console.log('CONFIGURAÇÃO CONCLUÍDA!');
    console.log('========================================');
    
  } catch (error) {
    console.log('❌ Erro ao criar arquivo .env.local:', error.message);
    console.log('');
    console.log('Tente criar o arquivo manualmente com o seguinte conteúdo:');
    console.log('');
    console.log(envContent);
  }
  
  rl.close();
}

// Executar configuração
configurarEnv().catch(console.error);
