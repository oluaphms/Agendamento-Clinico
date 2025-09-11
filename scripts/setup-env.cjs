const fs = require('fs');
const path = require('path');

console.log('🔧 Configurando ambiente de desenvolvimento...');

const envContent = `# ============================================================================
# CONFIGURAÇÃO DE AMBIENTE - SISTEMA CLÍNICO
# ============================================================================
# Configuração para desenvolvimento com dados mock
# ============================================================================

# ============================================================================
# AMBIENTE DE EXECUÇÃO
# ============================================================================
VITE_APP_ENVIRONMENT=development
VITE_APP_TITLE=Sistema Clínico
VITE_APP_VERSION=1.0.0

# ============================================================================
# CONFIGURAÇÕES DO SUPABASE
# ============================================================================
# Comentado para forçar uso de dados mock
# VITE_SUPABASE_URL=https://seu-projeto.supabase.co
# VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui

# ============================================================================
# CONFIGURAÇÕES DA API
# ============================================================================
VITE_API_URL=http://localhost:3000/api

# ============================================================================
# CONFIGURAÇÕES DE DESENVOLVIMENTO
# ============================================================================
# Habilitar dados mockados (apenas desenvolvimento)
VITE_ENABLE_MOCK_DATA=true

# Habilitar logs de debug
VITE_ENABLE_DEBUG_LOGS=true

# Habilitar relatório de erros
VITE_ENABLE_ERROR_REPORTING=false

# Desabilitar notificações de conectividade quando usando dados mock
VITE_DISABLE_CONNECTIVITY_NOTIFICATIONS=true
`;

try {
  fs.writeFileSync('.env.local', envContent);
  console.log('✅ Arquivo .env.local criado com sucesso!');
  console.log('📋 Configurações aplicadas:');
  console.log('   - Dados mock habilitados');
  console.log('   - Logs de debug habilitados');
  console.log('   - Notificações de conectividade desabilitadas');
  console.log('');
  console.log('🔄 Reinicie o servidor de desenvolvimento para aplicar as mudanças.');
} catch (error) {
  console.error('❌ Erro ao criar arquivo .env.local:', error.message);
}
