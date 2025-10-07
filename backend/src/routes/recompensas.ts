import express, { Response, NextFunction } from 'express';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types';
import { 
  getRecompensas, 
  getCompras, 
  comprarRecompensa
} from '../controllers/lojaController';

const router = express.Router();

// Rotas públicas
router.get('/', getRecompensas);

// Rotas autenticadas
router.use(authenticateToken);

// Buscar compras do operador
router.get('/compras', getCompras);

// Comprar recompensa
router.post('/comprar', comprarRecompensa);

// Criar recompensa (apenas gestores) - Desabilitado por enquanto
// router.post('/criar', (req: AuthRequest, res: Response, next: NextFunction) => {
//   if (req.user?.tipo !== 'gestor') {
//     return res.status(403).json({
//       success: false,
//       message: 'Acesso negado. Apenas gestores podem criar recompensas.'
//     });
//   }
//   return next();
// }, criarRecompensa);

export default router;
