import express, { Response, NextFunction } from 'express';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types';
import { uploadImagem } from '../middleware/upload';
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
}, uploadImagem.single('imagem'), criarRecompensa);

// Atualizar recompensa (apenas gestores)
router.put('/:id', (req: AuthRequest, res: Response, next: NextFunction) => {
  console.log('🔍 [ROUTE] PUT /:id - Rota chamada');
  console.log('🔍 [ROUTE] PUT /:id - Verificando permissões');
  console.log('🔍 [ROUTE] User:', req.user);
  console.log('🔍 [ROUTE] User tipo:', req.user?.tipo);
  
  if (req.user?.tipo !== 'gestor') {
    console.log('❌ [ROUTE] Acesso negado - não é gestor');
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas gestores podem editar recompensas.'
    });
  }
  console.log('✅ [ROUTE] Permissão concedida, prosseguindo...');
  return next();
}, uploadImagem.single('imagem'), atualizarRecompensa);

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
