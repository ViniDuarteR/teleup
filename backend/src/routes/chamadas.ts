import express from 'express';
import { iniciarChamada, finalizarChamada, getHistorico, getEstatisticas } from '../controllers/chamadaController';
import { authenticateToken, requireOnline } from '../middleware/auth';

const router = express.Router();

// Todas as rotas precisam de autenticação
router.use(authenticateToken as any);

// Iniciar nova chamada
router.post('/iniciar', requireOnline as any, iniciarChamada as any);

// Finalizar chamada
router.post('/finalizar', requireOnline as any, finalizarChamada as any);

// Histórico de chamadas
router.get('/historico', getHistorico as any);

// Estatísticas de chamadas
router.get('/estatisticas', getEstatisticas as any);

export default router;
