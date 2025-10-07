import express, { Response, NextFunction } from 'express';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types';
import { 
  getRecompensas, 
  getCompras, 
  comprarRecompensa,
  criarRecompensa,
  atualizarRecompensa,
  excluirRecompensa,
  toggleDisponibilidade
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

// Criar recompensa (apenas gestores)
router.post('/', (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.tipo !== 'gestor') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas gestores podem criar recompensas.'
    });
  }
  return next();
}, criarRecompensa);

// Atualizar recompensa (apenas gestores)
router.put('/:id', (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.tipo !== 'gestor') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas gestores podem editar recompensas.'
    });
  }
  return next();
}, atualizarRecompensa);

// Excluir recompensa (apenas gestores)
router.delete('/:id', (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.tipo !== 'gestor') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas gestores podem excluir recompensas.'
    });
  }
  return next();
}, excluirRecompensa);

// Toggle disponibilidade (apenas gestores)
router.patch('/:id/toggle', (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.tipo !== 'gestor') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas gestores podem alterar disponibilidade.'
    });
  }
  return next();
}, toggleDisponibilidade);

export default router;
