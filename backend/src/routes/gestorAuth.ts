import express from 'express';
import { loginGestor, getOperadoresGerenciados } from '../controllers/gestorController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Rota de login para gestores
router.post('/login', loginGestor as any);

// Obter operadores gerenciados pelo gestor
router.get('/operadores', authenticateToken as any, getOperadoresGerenciados as any);

export default router;
