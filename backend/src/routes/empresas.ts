import express from 'express';
import { 
  listarGestoresEmpresa, 
  criarGestorEmpresa, 
  listarOperadoresEmpresa, 
  getDashboardEmpresa 
} from '../controllers/empresaController';
import { authenticateEmpresa, requireEmpresa } from '../middleware/empresaAuth';

const router = express.Router();

// Middleware de autenticação para todas as rotas
router.use(authenticateEmpresa as any);
router.use(requireEmpresa as any);

// Dashboard da empresa
router.get('/dashboard', getDashboardEmpresa as any);

// Gerenciar gestores
router.get('/gestores', listarGestoresEmpresa as any);
router.post('/gestores', criarGestorEmpresa as any);

// Visualizar operadores
router.get('/operadores', listarOperadoresEmpresa as any);

export default router;
