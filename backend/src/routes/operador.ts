import express from 'express';
import { getDashboard, updateStatus, getRanking } from '../controllers/operadorController';
import { authenticateToken, requireOnline } from '../middleware/auth';
import { cacheMiddleware, clearCacheOnWrite } from '../middleware/cache';

const router = express.Router();

// Todas as rotas precisam de autenticação
router.use(authenticateToken as any);

// Dashboard do operador (com cache de 2 minutos)
router.get('/dashboard', cacheMiddleware({ ttl: 120 }), getDashboard as any);

// Atualizar status do operador (limpa cache)
router.put('/status', requireOnline as any, clearCacheOnWrite, updateStatus as any);

// Ranking de operadores (com cache de 5 minutos)
router.get('/ranking', cacheMiddleware({ ttl: 300 }), getRanking as any);

export default router;
