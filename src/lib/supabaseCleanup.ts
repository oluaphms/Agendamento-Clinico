// ============================================================================
// LIMPEZA DE INSTÂNCIAS DUPLICADAS DO SUPABASE
// ============================================================================
// Utilitário para evitar múltiplas instâncias do GoTrueClient
// ============================================================================

/**
 * Limpa instâncias duplicadas do Supabase do localStorage
 */
export const cleanupSupabaseInstances = (): void => {
  try {
    // Chaves comuns do Supabase no localStorage
    const supabaseKeys = [
      'sb-xvjjgeoxsvzwcvjihjih-auth-token',
      'supabase.auth.token',
      'supabase.auth.refresh_token',
      'supabase.auth.user',
      'supabase.auth.session'
    ];

    // Remover chaves duplicadas ou antigas
    supabaseKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`🧹 Removida chave duplicada: ${key}`);
      }
    });

    // Limpar chaves que começam com 'sb-'
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
      if (key.startsWith('sb-') && key.includes('auth')) {
        localStorage.removeItem(key);
        console.log(`🧹 Removida chave de auth antiga: ${key}`);
      }
    });

    console.log('✅ Limpeza de instâncias duplicadas concluída');
  } catch (error) {
    console.error('❌ Erro ao limpar instâncias duplicadas:', error);
  }
};

/**
 * Verifica se há instâncias duplicadas do Supabase
 */
export const checkForDuplicateInstances = (): boolean => {
  try {
    const allKeys = Object.keys(localStorage);
    const supabaseKeys = allKeys.filter(key => 
      key.startsWith('sb-') && key.includes('auth')
    );

    if (supabaseKeys.length > 1) {
      console.warn(`⚠️ Encontradas ${supabaseKeys.length} chaves de auth do Supabase:`, supabaseKeys);
      return true;
    }

    return false;
  } catch (error) {
    console.error('❌ Erro ao verificar instâncias duplicadas:', error);
    return false;
  }
};

/**
 * Inicializa limpeza automática
 */
export const initializeSupabaseCleanup = (): void => {
  // Verificar e limpar na inicialização
  if (checkForDuplicateInstances()) {
    cleanupSupabaseInstances();
  }

  // Limpar periodicamente (a cada 5 minutos)
  setInterval(() => {
    if (checkForDuplicateInstances()) {
      cleanupSupabaseInstances();
    }
  }, 5 * 60 * 1000);
};
