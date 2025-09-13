import express from 'express';
import { getMissoes, getConquistas, verificarConquistas, getRankingGeral, getEstatisticasGamificacao } from '../controllers/gamificacaoController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Todas as rotas precisam de autenticação
router.use(authenticateToken as any);

// Missões do operador
router.get('/missoes', getMissoes as any);

// Conquistas do operador
router.get('/conquistas', getConquistas as any);

// Verificar e desbloquear conquistas
router.post('/verificar-conquistas', verificarConquistas as any);

// Ranking geral
router.get('/ranking', getRankingGeral as any);

// Estatísticas de gamificação
router.get('/estatisticas', getEstatisticasGamificacao as any);

export default router;
