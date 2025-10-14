import express, { Response, NextFunction } from 'express';
import multer from 'multer';
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
} from '../controllers/recompensaController';

const router = express.Router();

// ========================================
// ROTAS PÚBLICAS
// ========================================

// Listar recompensas disponíveis
router.get('/', getRecompensas);

// ========================================
// ROTAS AUTENTICADAS
// ========================================
router.use(authenticateToken);

// Buscar compras do operador
router.get('/compras', getCompras);

// Comprar recompensa
router.post('/comprar', comprarRecompensa);

// ========================================
// ROTAS DE GESTÃO (APENAS GESTORES)
// ========================================

// Criar nova recompensa
router.post('/', (req: AuthRequest, res: Response, next: NextFunction) => {
  console.log('🔍 [ROUTE] POST / - Rota de criação de recompensa chamada!');
  console.log('🔍 [ROUTE] POST / - Verificando permissões');
  console.log('🔍 [ROUTE] User:', req.user);
  console.log('🔍 [ROUTE] User tipo:', req.user?.tipo);
  console.log('🔍 [ROUTE] Headers recebidos:', req.headers);
  console.log('🔍 [ROUTE] Body recebido:', req.body);
  console.log('🔍 [ROUTE] File recebido:', req.file);
  
  if (req.user?.tipo !== 'gestor') {
    console.log('❌ [ROUTE] Acesso negado - não é gestor');
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas gestores podem criar recompensas.'
    });
  }
  console.log('✅ [ROUTE] Permissão concedida, prosseguindo...');
  return next();
}, uploadImagem.single('imagem'), (error: any, req: AuthRequest, res: Response, next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    console.log('❌ [UPLOAD ERROR] Erro do Multer:', error.message);
    return res.status(400).json({
      success: false,
      message: `Erro no upload: ${error.message}`
    });
  } else if (error) {
    console.log('❌ [UPLOAD ERROR] Erro geral:', error.message);
    return res.status(400).json({
      success: false,
      message: `Erro no upload: ${error.message}`
    });
  }
  return next();
}, criarRecompensa);

// Atualizar recompensa existente
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

// Excluir recompensa
router.delete('/:id', (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.tipo !== 'gestor') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas gestores podem excluir recompensas.'
    });
  }
  return next();
}, excluirRecompensa);

// Alternar disponibilidade da recompensa
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
