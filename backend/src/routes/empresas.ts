import express from 'express';
import { 
  listarGestoresEmpresa, 
  criarGestorEmpresa, 
  atualizarGestorEmpresa,
  excluirGestorEmpresa,
  listarOperadoresEmpresa, 
  getDashboardEmpresa,
  atualizarAvatarEmpresa
} from '../controllers/empresaController';
import { authenticateEmpresa, requireEmpresa } from '../middleware/empresaAuth';

const router = express.Router();

// Middleware de autenticação para todas as rotas
router.use(authenticateEmpresa as any);
router.use(requireEmpresa as any);

// Dashboard da empresa
router.get('/dashboard', getDashboardEmpresa as any);

// Avatar da empresa
router.put('/avatar', atualizarAvatarEmpresa as any);

// Gerenciar gestores
router.get('/gestores', listarGestoresEmpresa as any);
router.post('/gestores', criarGestorEmpresa as any);
router.put('/gestores/:id', atualizarGestorEmpresa as any);
router.delete('/gestores/:id', excluirGestorEmpresa as any);

// Visualizar operadores
router.get('/operadores', listarOperadoresEmpresa as any);

export default router;
