import express from 'express';
import { loginGestor, logoutGestor, getOperadoresGerenciados, atribuirOperador, removerOperador } from '../controllers/gestorController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Rota de login para gestores
router.post('/login', loginGestor as any);

// Rota de logout para gestores
router.post('/logout', authenticateToken as any, logoutGestor as any);

// Obter operadores gerenciados pelo gestor
router.get('/operadores', authenticateToken as any, getOperadoresGerenciados as any);

// Atribuir operador ao gestor
router.post('/operadores/atribuir', authenticateToken as any, atribuirOperador as any);

// Remover operador do gestor
router.post('/operadores/remover', authenticateToken as any, removerOperador as any);

export default router;
