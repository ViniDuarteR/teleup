import express from 'express';
import { authenticateToken, requireGestor } from '../middleware/auth';

const router = express.Router();

// Todas as rotas precisam de autenticação e nível de gestor
router.use(authenticateToken as any);
router.use(requireGestor as any);

// Rota temporária para teste
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Gestor route working' });
});

export default router;
