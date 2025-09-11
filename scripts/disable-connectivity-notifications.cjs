const fs = require('fs');
const path = require('path');

console.log('🔇 Desabilitando notificações de conectividade para modo mock...');

// Atualizar o arquivo .env.local para desabilitar notificações
const envContent = `# ============================================================================
# CONFIGURAÇÃO DE AMBIENTE - SISTEMA CLÍNICO
# ============================================================================
# Configuração para desenvolvimento com fallback para dados mock
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
# Comentado para forçar uso de dados mock em caso de problemas de conectividade
# VITE_SUPABASE_URL=https://xvjjgeoxsvzwcvjihjih.supabase.co
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

# ============================================================================
# CONFIGURAÇÕES DE NOTIFICAÇÕES
# ============================================================================
# Desabilitar notificações de conectividade quando usando dados mock
VITE_DISABLE_CONNECTIVITY_NOTIFICATIONS=true
`;

const envPath = path.join(__dirname, '..', '.env.local');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Arquivo .env.local atualizado com sucesso!');
  console.log('📋 Configurações aplicadas:');
  console.log('   - VITE_ENABLE_MOCK_DATA=true');
  console.log('   - VITE_DISABLE_CONNECTIVITY_NOTIFICATIONS=true');
  console.log('   - Supabase desabilitado (comentado)');
  console.log('');
  console.log('🚀 Reinicie o servidor de desenvolvimento para aplicar as mudanças.');
  console.log('💡 As notificações de conectividade não aparecerão mais quando usando dados mock.');
} catch (error) {
  console.error('❌ Erro ao atualizar arquivo .env.local:', error.message);
  process.exit(1);
}
