interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

interface CacheOptions {
  ttl?: number // Time to live em milissegundos
  maxSize?: number // Tamanho máximo do cache
}

class Cache {
  private cache = new Map<string, CacheItem<any>>()
  private readonly defaultTTL: number
  private readonly maxSize: number

  constructor(options: CacheOptions = {}) {
    this.defaultTTL = options.ttl || 5 * 60 * 1000 // 5 minutos padrão
    this.maxSize = options.maxSize || 100 // 100 itens padrão
  }

  /**
   * Define um item no cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    }

    // Se o cache está cheio, remover o item mais antigo
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }

    this.cache.set(key, item)
  }

  /**
   * Obtém um item do cache
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }

    // Verificar se o item expirou
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  /**
   * Verifica se uma chave existe no cache e não expirou
   */
  has(key: string): boolean {
    const item = this.cache.get(key)
    
    if (!item) {
      return false
    }

    // Verificar se o item expirou
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  /**
   * Remove um item específico do cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Obtém o tamanho atual do cache
   */
  size(): number {
    return this.cache.size
  }

  /**
   * Remove todos os itens expirados
   */
  cleanup(): void {
    const now = Date.now()
    
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Obtém estatísticas do cache
   */
  getStats() {
    const now = Date.now()
    let expiredCount = 0
    let validCount = 0

    for (const item of this.cache.values()) {
      if (now - item.timestamp > item.ttl) {
        expiredCount++
      } else {
        validCount++
      }
    }

    return {
      total: this.cache.size,
      valid: validCount,
      expired: expiredCount,
      maxSize: this.maxSize
    }
  }
}

// Instâncias de cache para diferentes tipos de dados
export const dataCache = new Cache({ ttl: 10 * 60 * 1000, maxSize: 200 }) // 10 minutos para dados
export const userCache = new Cache({ ttl: 30 * 60 * 1000, maxSize: 50 }) // 30 minutos para usuários
export const configCache = new Cache({ ttl: 60 * 60 * 1000, maxSize: 20 }) // 1 hora para configurações

// Cache para queries do Supabase
export const queryCache = new Cache({ ttl: 5 * 60 * 1000, maxSize: 100 }) // 5 minutos para queries

// Função para gerar chaves de cache baseadas em parâmetros
export function generateCacheKey(prefix: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join('|')
  
  return `${prefix}:${sortedParams}`
}

// Função para invalidar cache baseado em padrões
export function invalidateCachePattern(pattern: string): void {
  for (const key of dataCache.cache.keys()) {
    if (key.includes(pattern)) {
      dataCache.delete(key)
    }
  }
}

// Função para cache com fallback para API
export async function cachedFetch<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  cache: Cache = dataCache,
  ttl?: number
): Promise<T> {
  // Tentar obter do cache primeiro
  const cached = cache.get<T>(cacheKey)
  if (cached !== null) {
    return cached
  }

  // Se não estiver no cache, buscar da API
  try {
    const data = await fetchFn()
    cache.set(cacheKey, data, ttl)
    return data
  } catch (error) {
    console.error('Erro ao buscar dados:', error)
    throw error
  }
}

// Função para cache condicional (só cache se não houver erro)
export async function conditionalCache<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  cache: Cache = dataCache,
  ttl?: number
): Promise<T> {
  try {
    const data = await fetchFn()
    cache.set(cacheKey, data, ttl)
    return data
  } catch (error) {
    // Se houver erro, tentar obter do cache como fallback
    const cached = cache.get<T>(cacheKey)
    if (cached !== null) {
      console.warn('Usando dados em cache devido a erro na API:', error)
      return cached
    }
    throw error
  }
}

// Limpeza automática do cache a cada 5 minutos
setInterval(() => {
  dataCache.cleanup()
  userCache.cleanup()
  configCache.cleanup()
  queryCache.cleanup()
}, 5 * 60 * 1000)

export default Cache
