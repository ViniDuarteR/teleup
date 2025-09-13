import express from 'express';
import { getMetricasEquipe, getRankingOperadores, getDesempenhoDetalhado, criarMissao, atribuirMissao, getOperadores } from '../controllers/gestorController';
import { authenticateToken, requireGestor } from '../middleware/auth';

const router = express.Router();

// Todas as rotas precisam de autenticação e nível de gestor
router.use(authenticateToken as any);
router.use(requireGestor as any);

// Métricas gerais da equipe
router.get('/metricas-equipe', getMetricasEquipe as any);

// Ranking de operadores
router.get('/ranking-operadores', getRankingOperadores as any);

// Desempenho detalhado
router.get('/desempenho-detalhado', getDesempenhoDetalhado as any);

// Lista de operadores
router.get('/operadores', getOperadores as any);

// Criar nova missão
router.post('/missoes', criarMissao as any);

// Atribuir missão a operador
router.post('/atribuir-missao', atribuirMissao as any);

export default router;
