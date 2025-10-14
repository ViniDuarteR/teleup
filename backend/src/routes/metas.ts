import express from 'express';
import { 
  listarMetasOperador, 
  criarMeta, 
  atualizarMeta, 
  excluirMeta, 
  listarTodasMetas 
} from '../controllers/metaController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Todas as rotas precisam de autenticação
router.use(authenticateToken as any);

// Listar todas as metas dos operadores do gestor
router.get('/', listarTodasMetas as any);

// Listar metas de um operador específico
router.get('/operador/:operadorId', listarMetasOperador as any);

// Criar nova meta
router.post('/', criarMeta as any);

// Atualizar meta
router.put('/:id', atualizarMeta as any);

// Excluir meta
router.delete('/:id', excluirMeta as any);

export default router;
