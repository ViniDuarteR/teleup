import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { criarContato, listarContatosDiscador } from '../controllers/contatoController';

const router = express.Router();

router.use(authenticateToken as any);

router.get('/discador', listarContatosDiscador as any);
router.post('/', criarContato as any);

export default router;


