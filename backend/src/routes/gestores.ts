import express from 'express';
import { 
  listarGestores, 
  criarGestor, 
  atualizarGestor, 
  excluirGestor 
} from '../controllers/gestorController';
import { authenticateToken, requireGestor } from '../middleware/auth';

const router = express.Router();

// Todas as rotas precisam de autenticação e nível de gestor
router.use(authenticateToken as any);
router.use(requireGestor as any);

// Listar gestores da empresa
router.get('/', listarGestores as any);

// Criar novo gestor
router.post('/', criarGestor as any);

// Atualizar gestor
router.put('/:id', atualizarGestor as any);

// Excluir gestor
router.delete('/:id', excluirGestor as any);

export default router;
