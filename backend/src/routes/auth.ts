import express from 'express';
import { login, logout } from '../controllers/operadorController';

const router = express.Router();

// Rota de login
router.post('/login', login as any);

// Rota de logout
router.post('/logout', logout as any);

export default router;
