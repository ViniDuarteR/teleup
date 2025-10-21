import { Request, Response, NextFunction } from 'express';

// Cache simples em memória (para desenvolvimento)
// Em produção, considere usar Redis
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

interface CacheOptions {
  ttl?: number; // Time to live em segundos
  key?: string; // Chave customizada para o cache
}

export const cacheMiddleware = (options: CacheOptions = {}) => {
  const { ttl = 300, key } = options; // 5 minutos por padrão

  return (req: Request, res: Response, next: NextFunction): void => {
    // Gerar chave do cache
    const cacheKey = key || `${req.method}:${req.originalUrl}:${JSON.stringify(req.query)}`;
    
    // Verificar se existe no cache
    const cached = cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < cached.ttl * 1000) {
      console.log(`🚀 [CACHE] Hit para: ${cacheKey}`);
      res.json(cached.data);
      return;
    }

    // Interceptar a resposta para salvar no cache
    const originalJson = res.json;
    res.json = function(data: any) {
      // Salvar no cache apenas se for sucesso
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log(`💾 [CACHE] Salvando no cache: ${cacheKey}`);
        cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          ttl
        });
      }
      return originalJson.call(this, data);
    };

    next();
  };
};

// Função para limpar cache
export const clearCache = (pattern?: string) => {
  if (pattern) {
    const regex = new RegExp(pattern);
    for (const key of cache.keys()) {
      if (regex.test(key)) {
        cache.delete(key);
      }
    }
  } else {
    cache.clear();
  }
};

// Função para limpar cache de um usuário específico
export const clearUserCache = (userId: number, userType: string) => {
  const pattern = `.*${userType}.*${userId}.*`;
  clearCache(pattern);
};

// Middleware para limpar cache em operações de escrita
export const clearCacheOnWrite = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;
  res.json = function(data: any) {
    // Limpar cache relacionado ao usuário após operações de escrita
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const userId = (req as any).operador?.id || (req as any).user?.id;
      const userType = (req as any).operador?.tipo || (req as any).user?.tipo;
      
      if (userId && userType) {
        clearUserCache(userId, userType);
      }
    }
    return originalJson.call(this, data);
  };
  next();
};
