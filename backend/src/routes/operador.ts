import express from 'express';
import { getDashboard, updateStatus, getRanking } from '../controllers/operadorController';
import { authenticateToken, requireOnline } from '../middleware/auth';

const router = express.Router();

// Todas as rotas precisam de autenticação
router.use(authenticateToken as any);

// Dashboard do operador
router.get('/dashboard', getDashboard as any);

// Atualizar status do operador
router.put('/status', requireOnline as any, updateStatus as any);

// Ranking de operadores
router.get('/ranking', getRanking as any);

export default router;
