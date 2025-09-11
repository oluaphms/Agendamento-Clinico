import { supabase } from './supabase';

export interface HealthCheckResult {
  isHealthy: boolean;
  error?: string;
  responseTime?: number;
}

/**
 * Verifica a saúde da conexão com o Supabase
 */
export async function checkSupabaseHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  try {
    // Fazer uma consulta simples para testar a conectividade
    const { error } = await supabase
      .from('usuarios')
      .select('id')
      .limit(1);
    
    const responseTime = Date.now() - startTime;
    
    if (error) {
      return {
        isHealthy: false,
        error: error.message,
        responseTime
      };
    }
    
    return {
      isHealthy: true,
      responseTime
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return {
      isHealthy: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      responseTime
    };
  }
}

/**
 * Tenta executar uma operação com retry automático
 */
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 2000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Tentativa ${attempt}/${maxRetries}...`);
      const result = await operation();
      console.log(`✅ Operação bem-sucedida na tentativa ${attempt}`);
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Erro desconhecido');
      console.error(`❌ Tentativa ${attempt} falhou:`, lastError.message);
      
      // Se não é a última tentativa, aguardar antes de tentar novamente
      if (attempt < maxRetries) {
        console.log(`⏳ Aguardando ${delayMs}ms antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  
  throw lastError || new Error('Todas as tentativas falharam');
}

/**
 * Verifica se o erro é temporário e pode ser tentado novamente
 */
export function isRetryableError(error: any): boolean {
  if (!error) return false;
  
  const errorCode = error.code || error.status;
  const errorMessage = error.message || '';
  
  // Códigos de erro que indicam problemas temporários
  const retryableCodes = ['503', '502', '504', '429', '408'];
  const retryableMessages = ['timeout', 'network', 'connection', 'unavailable'];
  
  return (
    retryableCodes.includes(errorCode) ||
    retryableMessages.some(msg => errorMessage.toLowerCase().includes(msg))
  );
}
